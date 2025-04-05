import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
    fetchProductDetailStart,
    fetchProductDetailSuccess,
    fetchProductImagesSuccess,
    fetchProductVariantsSuccess,
    fetchRelatedProductsSuccess,
    fetchFeaturedProductsSuccess,
    fetchLatestProductsSuccess,
    fetchOnSaleProductsSuccess,
    setSearchTerm,
    setCategoryIds,
    setBrandIds,
    addCategoryId,
    removeCategoryId,
    addBrandId,
    removeBrandId,
    setSelectedCategory,
    setSelectedBrand,
    setPriceRange,
    setCurrentPage,
    setPageSize,
    clearFilters,
    clearProductDetail,
    setSortBy,
    setSortDir,
    setSorting
} from '../redux/slices/productSlice';
import {
    selectProducts,
    selectTotalProducts,
    selectProductLoading,
    selectProductError,
    selectSelectedProduct,
    selectProductImages,
    selectProductVariants,
    selectRelatedProducts,
    selectFeaturedProducts,
    selectLatestProducts,
    selectOnSaleProducts,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectSearchTerm,
    selectSelectedCategories,
    selectSelectedBrands,
    selectSelectedCategory,
    selectSelectedBrand,
    selectPriceRange,
    selectAvailableSizes,
    selectAvailableColors,
    selectPrimaryProductImage,
    selectCategories,
    selectBrands,
    selectSortBy,
    selectSortDir,
    selectSelectedCategoryNames,
    selectSelectedBrandNames
} from '../redux/selectors/productSelectors';
import ProductService from '../services/product.service';
import {
    ProductFilterParams,
    ProductResponseDTO,
    ProductSearchRequest,
    VariantAvailabilityRequest,
    PageResponse
} from '../types/product.types';
import { useRef, useCallback } from 'react';

const useProduct = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Set default page size to 15 instead of 12
    const DEFAULT_PAGE_SIZE = 15;

    const products = useSelector(selectProducts);
    const totalProducts = useSelector(selectTotalProducts);
    const loading = useSelector(selectProductLoading);
    const error = useSelector(selectProductError);
    const selectedProduct = useSelector(selectSelectedProduct);
    const productImages = useSelector(selectProductImages);
    const productVariants = useSelector(selectProductVariants);
    const relatedProducts = useSelector(selectRelatedProducts);
    const featuredProducts = useSelector(selectFeaturedProducts);
    const latestProducts = useSelector(selectLatestProducts);
    const onSaleProducts = useSelector(selectOnSaleProducts);
    const currentPage = useSelector(selectCurrentPage);
    const pageSize = useSelector(selectPageSize);
    const totalPages = useSelector(selectTotalPages);
    const searchTerm = useSelector(selectSearchTerm);

    // Use array-based selectors for multi-selection
    const selectedCategories = useSelector(selectSelectedCategories);
    const selectedBrands = useSelector(selectSelectedBrands);

    // Maintain backward compatibility
    const selectedCategory = useSelector(selectSelectedCategory);
    const selectedBrand = useSelector(selectSelectedBrand);

    // Display names for selected filters
    const selectedCategoryNames = useSelector(selectSelectedCategoryNames);
    const selectedBrandNames = useSelector(selectSelectedBrandNames);

    const priceRange = useSelector(selectPriceRange);
    const availableSizes = useSelector(selectAvailableSizes);
    const availableColors = useSelector(selectAvailableColors);
    const primaryImage = useSelector(selectPrimaryProductImage);
    const categories = useSelector(selectCategories);
    const brands = useSelector(selectBrands);
    const sortBy = useSelector(selectSortBy);
    const sortDir = useSelector(selectSortDir);

    const lastRequestRef = useRef({
        params: {} as ProductFilterParams,
        timestamp: 0,
        inProgress: false,
        signature: ""
    });

    const lastSlugRequestRef = useRef({
        slug: '',
        timestamp: 0,
        inProgress: false
    });

    const nullifyUndefined = <T,>(value: T | undefined | null): T | null => {
        return value === undefined ? null : value;
    };

    const getParamsSignature = (params: ProductFilterParams): string => {
        return JSON.stringify(params, Object.keys(params).sort());
    };

    // Initialize page size on hook initialization
    useCallback(() => {
        // Only set if different from default to avoid unnecessary state updates
        if (pageSize !== DEFAULT_PAGE_SIZE) {
            dispatch(setPageSize(DEFAULT_PAGE_SIZE));
        }
    }, [dispatch, pageSize]);

    const getProducts = async (params: ProductFilterParams = {}): Promise<PageResponse<ProductResponseDTO>> => {
        const paramSignature = getParamsSignature(params);
        const currentTime = Date.now();
        const isSameRequest = paramSignature === lastRequestRef.current.signature;
        const isRecentRequest = currentTime - lastRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastRequestRef.current.inProgress;

        // Always ensure page size is set correctly
        if (!params.size) {
            params.size = DEFAULT_PAGE_SIZE;
        }

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate request with signature:', paramSignature);
            return new Promise((resolve) => {
                const mockResponse: PageResponse<ProductResponseDTO> = {
                    content: products,
                    totalElements: totalProducts,
                    number: currentPage,
                    size: pageSize,
                    totalPages,
                    pageable: {
                        pageNumber: currentPage,
                        pageSize,
                        sort: { sorted: true, unsorted: false, empty: false },
                        offset: currentPage * pageSize,
                        paged: true,
                        unpaged: false
                    },
                    last: currentPage === totalPages - 1,
                    first: currentPage === 0,
                    sort: { sorted: true, unsorted: false, empty: false },
                    numberOfElements: products.length,
                    empty: products.length === 0
                };
                resolve(mockResponse);
            });
        }

        lastRequestRef.current = {
            params: { ...params },
            timestamp: currentTime,
            inProgress: true,
            signature: paramSignature
        };

        dispatch(fetchProductsStart());
        try {
            // Prepare filter parameters
            const finalParams: ProductFilterParams = {
                ...params,
                size: params.size || DEFAULT_PAGE_SIZE,
                sortBy: params.sortBy || sortBy || 'createdAt',
                sortDir: params.sortDir || sortDir || 'desc'
            };

            // Implement AND logic between different attributes and OR logic within the same attribute
            // If we have selected categories in state but none in params, use the ones from state
            if (!params.categoryIds && !params.categoryId && selectedCategories.length > 0) {
                finalParams.categoryIds = selectedCategories;
            }

            // If we have selected brands in state but none in params, use the ones from state
            if (!params.brandIds && !params.brandId && selectedBrands.length > 0) {
                finalParams.brandIds = selectedBrands;
            }

            console.log('Fetching products with params:', finalParams);
            const response = await ProductService.getProducts(finalParams);

            lastRequestRef.current.inProgress = false;

            if (!response.content) {
                console.error('Invalid response structure:', response);
                throw new Error('Invalid API response structure');
            }

            // Ensure all products have default category and brand objects if missing
            response.content = response.content.map(product => {
                if (!product.category) {
                    product.category = { categoryId: 0, name: 'Uncategorized', slug: 'uncategorized', status: true, level: 0 };
                }
                if (!product.brand) {
                    product.brand = { brandId: 0, name: 'Unknown Brand', slug: 'unknown-brand', status: true };
                }
                return product;
            });

            // Log sample product for debugging
            if (response.content.length > 0) {
                const sample = response.content[0];
                console.log('Sample product:', {
                    id: sample.productId,
                    name: sample.name,
                    categoryExists: !!sample.category,
                    categoryId: sample.category?.categoryId,
                    categoryName: sample.category?.name,
                    brandExists: !!sample.brand,
                    brandId: sample.brand?.brandId,
                    brandName: sample.brand?.name
                });
            }

            console.log(`Received ${response.content.length} products from API`);
            dispatch(fetchProductsSuccess(response));
            return response;
        } catch (error) {
            lastRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch products';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Product fetch error:', error);
            dispatch(fetchProductsFailure(errorMessage));
            throw error;
        }
    };

    const getProductBySlug = useCallback(async (slug: string): Promise<ProductResponseDTO> => {
        const currentTime = Date.now();
        const isSameRequest = slug === lastSlugRequestRef.current.slug;
        const isRecentRequest = currentTime - lastSlugRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastSlugRequestRef.current.inProgress;

        // If we already have this product with complete data, return from cache
        if (selectedProduct && selectedProduct.slug === slug && productImages.length > 0 && productVariants.length > 0 && relatedProducts.length > 0) {
            console.log('Using fully cached product for slug:', slug);
            return selectedProduct;
        }

        // If duplicate request, wait for the original request to complete
        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate request for slug:', slug);
            if (selectedProduct && selectedProduct.slug === slug) {
                return selectedProduct; // Return current data if available
            }

            // Wait for data from the in-progress request
            return new Promise((resolve) => {
                const checkData = setInterval(() => {
                    if (selectedProduct && selectedProduct.slug === slug) {
                        clearInterval(checkData);
                        resolve(selectedProduct);
                    }
                }, 100);

                // Retry after timeout if necessary
                setTimeout(() => {
                    clearInterval(checkData);
                    if (!selectedProduct || selectedProduct.slug !== slug) {
                        resolve(getProductBySlug(slug)); // Retry if no data after 2s
                    }
                }, 2000);
            });
        }

        lastSlugRequestRef.current = {
            slug,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchProductDetailStart());
        try {
            console.log('Fetching product by slug:', slug);
            const product = await ProductService.getProductBySlug(slug);

            // Ensure product has category and brand objects
            if (!product.category) {
                product.category = { categoryId: 0, name: 'Uncategorized', slug: 'uncategorized', status: true, level: 0 };
            }
            if (!product.brand) {
                product.brand = { brandId: 0, name: 'Unknown Brand', slug: 'unknown-brand', status: true };
            }

            dispatch(fetchProductDetailSuccess(product));

            // Fetch additional product data in parallel
            const productId = product.productId;
            const [images, variants, related] = await Promise.all([
                ProductService.getProductImages(productId),
                ProductService.getActiveVariants(productId),
                ProductService.getRelatedProducts({ productId, limit: 4 })
            ]);

            dispatch(fetchProductImagesSuccess(images));
            dispatch(fetchProductVariantsSuccess(variants));
            dispatch(fetchRelatedProductsSuccess(related));

            lastSlugRequestRef.current.inProgress = false;
            return product;
        } catch (error) {
            lastSlugRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch product details';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Product slug fetch error:', error);
            dispatch(fetchProductsFailure(errorMessage));
            throw error;
        }
    }, [dispatch, selectedProduct, productImages, productVariants, relatedProducts]);

    const getProductById = async (productId: number): Promise<ProductResponseDTO> => {
        dispatch(fetchProductDetailStart());
        try {
            const product = await ProductService.getProductById(productId);
            if (!product.category) {
                product.category = { categoryId: 0, name: 'Uncategorized', slug: 'uncategorized', status: true, level: 0 };
            }
            if (!product.brand) {
                product.brand = { brandId: 0, name: 'Unknown Brand', slug: 'unknown-brand', status: true };
            }
            dispatch(fetchProductDetailSuccess(product));
            const [images, variants, related] = await Promise.all([
                ProductService.getProductImages(productId),
                ProductService.getActiveVariants(productId),
                ProductService.getRelatedProducts({ productId, limit: 4 })
            ]);
            dispatch(fetchProductImagesSuccess(images));
            dispatch(fetchProductVariantsSuccess(variants));
            dispatch(fetchRelatedProductsSuccess(related));
            return product;
        } catch (error) {
            let errorMessage = 'Failed to fetch product details';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Product detail fetch error:', error);
            dispatch(fetchProductsFailure(errorMessage));
            throw error;
        }
    };

    // Updated to work with multiple categories as OR logic
    const getProductsByCategories = async (categoryIds: number[]): Promise<PageResponse<ProductResponseDTO>> => {
        dispatch(setCategoryIds(categoryIds));
        return getProducts({ categoryIds, page: 0, size: DEFAULT_PAGE_SIZE, sortBy, sortDir });
    };

    // Maintained for backward compatibility
    const getProductsByCategory = async (categoryId: number): Promise<PageResponse<ProductResponseDTO>> => {
        dispatch(setSelectedCategory(categoryId));
        return getProducts({ categoryId, page: 0, size: DEFAULT_PAGE_SIZE, sortBy, sortDir });
    };

    // Updated to work with multiple brands as OR logic
    const getProductsByBrands = async (brandIds: number[]): Promise<PageResponse<ProductResponseDTO>> => {
        dispatch(setBrandIds(brandIds));
        return getProducts({ brandIds, page: 0, size: DEFAULT_PAGE_SIZE, sortBy, sortDir });
    };

    // Maintained for backward compatibility
    const getProductsByBrand = async (brandId: number): Promise<PageResponse<ProductResponseDTO>> => {
        dispatch(setSelectedBrand(brandId));
        return getProducts({ brandId, page: 0, size: DEFAULT_PAGE_SIZE, sortBy, sortDir });
    };

    // Updated to support multi-selection with appropriate logic
    const searchProducts = async (params: ProductSearchRequest): Promise<PageResponse<ProductResponseDTO>> => {
        dispatch(fetchProductsStart());
        try {
            console.log('Searching products with params:', params);
            // Ensure consistent page size
            if (!params.size) {
                params.size = DEFAULT_PAGE_SIZE;
            }
            const response = await ProductService.searchProducts(params);
            dispatch(fetchProductsSuccess(response));
            return response;
        } catch (error) {
            let errorMessage = 'Failed to search products';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Product search error:', error);
            dispatch(fetchProductsFailure(errorMessage));
            throw error;
        }
    };

    const getFeaturedProducts = async (limit: number = 8): Promise<ProductResponseDTO[]> => {
        try {
            const response = await ProductService.getFeaturedProducts({ limit });
            dispatch(fetchFeaturedProductsSuccess(response));
            return response;
        } catch (error) {
            console.error('Failed to fetch featured products:', error);
            throw error;
        }
    };

    const getLatestProducts = async (limit: number = 8): Promise<PageResponse<ProductResponseDTO>> => {
        try {
            const response = await ProductService.getLatestProducts({ limit });
            dispatch(fetchLatestProductsSuccess(response.content));
            return response;
        } catch (error) {
            console.error('Failed to fetch latest products:', error);
            throw error;
        }
    };

    const getProductsOnSale = async (page: number = 0, size: number = DEFAULT_PAGE_SIZE): Promise<PageResponse<ProductResponseDTO>> => {
        try {
            const response = await ProductService.getProductsOnSale(page, size);
            dispatch(fetchOnSaleProductsSuccess(response));
            return response;
        } catch (error) {
            console.error('Failed to fetch sale products:', error);
            throw error;
        }
    };

    const checkVariantAvailability = async (params: VariantAvailabilityRequest): Promise<boolean> => {
        try {
            const response = await ProductService.checkVariantAvailability(params);
            return response.available;
        } catch (error) {
            console.error('Failed to check variant availability:', error);
            return false;
        }
    };

    const loadHomepageData = async (): Promise<boolean> => {
        try {
            await Promise.all([
                getFeaturedProducts(8),
                getLatestProducts(8),
                getProductsOnSale(0, 8)
            ]);
            return true;
        } catch (error) {
            console.error('Failed to load homepage data:', error);
            return false;
        }
    };

    // Helper functions for multi-selection
    const addCategory = (categoryId: number) => dispatch(addCategoryId(categoryId));
    const removeCategory = (categoryId: number) => dispatch(removeCategoryId(categoryId));
    const setCategories = (categoryIds: number[] | null | undefined) =>
        dispatch(setCategoryIds(categoryIds || null));

    const addBrand = (brandId: number) => dispatch(addBrandId(brandId));
    const removeBrand = (brandId: number) => dispatch(removeBrandId(brandId));
    const setBrands = (brandIds: number[] | null | undefined) =>
        dispatch(setBrandIds(brandIds || null));

    // State update functions
    const updateSearchTerm = (term: string) => dispatch(setSearchTerm(term));
    const updateSelectedCategory = (categoryId: number | null) => dispatch(setSelectedCategory(categoryId));
    const updateSelectedBrand = (brandId: number | null) => dispatch(setSelectedBrand(brandId));
    const updatePriceRange = (min: number | null, max: number | null) => {
        dispatch(setPriceRange({ min, max }));
    };
    const updateSortBy = (sortByValue: string) => dispatch(setSortBy(sortByValue));
    const updateSortDir = (sortDirValue: 'asc' | 'desc') => dispatch(setSortDir(sortDirValue));
    const updateSorting = (sortByValue: string, sortDirValue: 'asc' | 'desc') =>
        dispatch(setSorting({ sortBy: sortByValue, sortDir: sortDirValue }));
    const updatePage = (page: number) => dispatch(setCurrentPage(page));
    const updatePageSize = (size: number) => dispatch(setPageSize(size));
    const resetFilters = () => dispatch(clearFilters());
    const resetProductDetail = () => dispatch(clearProductDetail());

    // Navigation helpers
    const loadNextPage = async (): Promise<PageResponse<ProductResponseDTO> | null> => {
        if (currentPage < totalPages - 1) {
            const nextPage = currentPage + 1;
            dispatch(setCurrentPage(nextPage));

            // Use the multi-selection arrays for categories and brands
            return getProducts({
                page: nextPage,
                size: DEFAULT_PAGE_SIZE,
                search: searchTerm,
                categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
                brandIds: selectedBrands.length > 0 ? selectedBrands : null,
                minPrice: priceRange.min !== null ? priceRange.min : null,
                maxPrice: priceRange.max !== null ? priceRange.max : null,
                sortBy,
                sortDir
            });
        }
        return null;
    };

    const loadPreviousPage = async (): Promise<PageResponse<ProductResponseDTO> | null> => {
        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            dispatch(setCurrentPage(prevPage));

            // Use the multi-selection arrays for categories and brands
            return getProducts({
                page: prevPage,
                size: DEFAULT_PAGE_SIZE,
                search: searchTerm,
                categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
                brandIds: selectedBrands.length > 0 ? selectedBrands : null,
                minPrice: priceRange.min !== null ? priceRange.min : null,
                maxPrice: priceRange.max !== null ? priceRange.max : null,
                sortBy,
                sortDir
            });
        }
        return null;
    };

    // Enhanced debounced filter application with better type safety
    const applyFilters = async (filters: ProductFilterParams): Promise<PageResponse<ProductResponseDTO>> => {
        const stateUpdates: Array<() => void> = [];

        // Handle search term
        if (filters.search !== undefined && filters.search !== searchTerm) {
            stateUpdates.push(() => dispatch(setSearchTerm(filters.search!)));
        }

        // Handle category selection - prioritize arrays over single values
        if (filters.categoryIds !== undefined) {
            stateUpdates.push(() => dispatch(setCategoryIds(filters.categoryIds || null)));
        } else if (filters.categoryId !== undefined && filters.categoryId !== selectedCategory) {
            stateUpdates.push(() => dispatch(setSelectedCategory(nullifyUndefined(filters.categoryId))));
        }

        // Handle brand selection - prioritize arrays over single values
        if (filters.brandIds !== undefined) {
            stateUpdates.push(() => dispatch(setBrandIds(filters.brandIds || null)));
        } else if (filters.brandId !== undefined && filters.brandId !== selectedBrand) {
            stateUpdates.push(() => dispatch(setSelectedBrand(nullifyUndefined(filters.brandId))));
        }

        // Handle price range
        if ((filters.minPrice !== undefined && filters.minPrice !== priceRange.min) ||
            (filters.maxPrice !== undefined && filters.maxPrice !== priceRange.max)) {
            const newMin = nullifyUndefined(filters.minPrice !== undefined ? filters.minPrice : priceRange.min);
            const newMax = nullifyUndefined(filters.maxPrice !== undefined ? filters.maxPrice : priceRange.max);
            stateUpdates.push(() => dispatch(setPriceRange({ min: newMin, max: newMax })));
        }

        // Handle pagination
        const page = filters.page !== undefined ? filters.page : 0;
        if (page !== currentPage) {
            stateUpdates.push(() => dispatch(setCurrentPage(page)));
        }

        // Handle sorting
        if (filters.sortBy !== undefined && filters.sortBy !== sortBy) {
            stateUpdates.push(() => dispatch(setSortBy(filters.sortBy || 'createdAt')));
        }
        if (filters.sortDir !== undefined && filters.sortDir !== sortDir) {
            stateUpdates.push(() => dispatch(setSortDir(filters.sortDir || 'desc')));
        }

        // Apply all state updates
        stateUpdates.forEach(update => update());

        // Build final filter parameters - using AND logic between different attributes
        // and OR logic within the same attribute
        const appliedFilters: ProductFilterParams = {
            page,
            size: filters.size || DEFAULT_PAGE_SIZE,
            search: filters.search !== undefined ? filters.search : searchTerm,
            sortBy: filters.sortBy !== undefined ? filters.sortBy : sortBy,
            sortDir: filters.sortDir !== undefined ? filters.sortDir : sortDir
        };

        // Handle category selection with proper priority
        if (filters.categoryIds !== undefined) {
            appliedFilters.categoryIds = filters.categoryIds && filters.categoryIds.length > 0 ?
                filters.categoryIds : null;
        } else if (filters.categoryId !== undefined) {
            appliedFilters.categoryId = filters.categoryId || null;
        } else if (selectedCategories.length > 0) {
            appliedFilters.categoryIds = selectedCategories;
        } else if (selectedCategory) {
            appliedFilters.categoryId = selectedCategory;
        }

        // Handle brand selection with proper priority
        if (filters.brandIds !== undefined) {
            appliedFilters.brandIds = filters.brandIds && filters.brandIds.length > 0 ?
                filters.brandIds : null;
        } else if (filters.brandId !== undefined) {
            appliedFilters.brandId = filters.brandId || null;
        } else if (selectedBrands.length > 0) {
            appliedFilters.brandIds = selectedBrands;
        } else if (selectedBrand) {
            appliedFilters.brandId = selectedBrand;
        }

        // Handle price range
        if (filters.minPrice !== undefined) {
            appliedFilters.minPrice = filters.minPrice;
        } else if (priceRange.min !== null) {
            appliedFilters.minPrice = priceRange.min;
        }

        if (filters.maxPrice !== undefined) {
            appliedFilters.maxPrice = filters.maxPrice;
        } else if (priceRange.max !== null) {
            appliedFilters.maxPrice = priceRange.max;
        }

        // Remove undefined/null properties
        Object.keys(appliedFilters).forEach(key => {
            const k = key as keyof ProductFilterParams;
            if (appliedFilters[k] === undefined || appliedFilters[k] === null) {
                delete appliedFilters[k];
            }
        });

        console.log('Applying filters:', appliedFilters);
        return getProducts(appliedFilters);
    };

    // Set 15 product page size on hook initialization
    useCallback(() => {
        if (pageSize !== DEFAULT_PAGE_SIZE) {
            dispatch(setPageSize(DEFAULT_PAGE_SIZE));
        }
    }, [dispatch, pageSize]);

    return {
        // Constants
        DEFAULT_PAGE_SIZE,

        // Data selectors
        products,
        totalProducts,
        loading,
        error,
        selectedProduct,
        productImages,
        productVariants,
        relatedProducts,
        featuredProducts,
        latestProducts,
        onSaleProducts,
        currentPage,
        pageSize,
        totalPages,
        searchTerm,

        // Multi-selection arrays
        selectedCategories,
        selectedBrands,
        selectedCategoryNames,
        selectedBrandNames,

        // Backward compatibility
        selectedCategory,
        selectedBrand,

        // Other filter state
        priceRange,
        availableSizes,
        availableColors,
        primaryImage,
        categories,
        brands,
        sortBy,
        sortDir,

        // Product fetching methods
        getProducts,
        getProductById,
        getProductBySlug,

        // Multi-selection methods
        getProductsByCategories,
        getProductsByBrands,

        // Backward compatibility
        getProductsByCategory,
        getProductsByBrand,

        // Other product fetching methods
        searchProducts,
        getFeaturedProducts,
        getLatestProducts,
        getProductsOnSale,
        checkVariantAvailability,
        loadHomepageData,

        // Category/brand selection helpers
        addCategory,
        removeCategory,
        setCategories,
        addBrand,
        removeBrand,
        setBrands,

        // Filter state manipulation
        updateSearchTerm,
        updateSelectedCategory,
        updateSelectedBrand,
        updatePriceRange,
        updateSortBy,
        updateSortDir,
        updateSorting,
        updatePage,
        updatePageSize,
        resetFilters,
        resetProductDetail,
        loadNextPage,
        loadPreviousPage,
        applyFilters
    };
};

export default useProduct;