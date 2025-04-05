import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useRef, useEffect } from 'react';
import { AppDispatch } from '../redux/store';
import BrandCategoryService from '../services/brand.category.service';
import {
    fetchStart,
    fetchFailure,
    fetchBrandsSuccess,
    fetchBrandDetailSuccess,
    fetchParentCategoriesSuccess,
    fetchSubCategoriesSuccess,
    fetchCategoryDetailSuccess,
    fetchCategoryHierarchySuccess,
    fetchCategoryBreadcrumbSuccess,
    setBrandSearchTerm,
    setCategorySearchTerm,
    setSelectedCategoryId,
    setSelectedBrandId,
    setShowActiveOnly,
    clearFilters,
    clearSelectedBrand,
    clearSelectedCategory
} from '../redux/slices/brandCategorySlice';
import {
    selectBrands,
    selectActiveBrands,
    selectSelectedBrand,
    selectBrandHierarchy,
    selectBrandStatistics,
    selectParentCategories,
    selectActiveParentCategories,
    selectSubCategories,
    selectActiveSubCategories,
    selectSelectedCategory,
    selectCategoryHierarchy,
    selectCategoryBreadcrumb,
    selectBrandCategoryLoading,
    selectBrandCategoryError,
    selectBrandSearchTerm,
    selectCategorySearchTerm,
    selectSelectedCategoryId,
    selectSelectedBrandId,
    selectShowActiveOnly,
    selectFilteredBrands,
    selectFilteredCategories,
    selectFilteredSubCategories,
    selectCategoriesWithSubcategories
} from '../redux/selectors/brandCategorySelectors';
import { BrandFilterParams, BrandResponseDTO } from '../types/brand.types';
import { CategoryFilterParams, CategoryHierarchyDTO, CategoryResponseDTO } from '../types/category.types';

// Cache expiry constants
const CACHE_EXPIRY_SHORT = 30000; // 30 seconds
const CACHE_EXPIRY_LONG = 300000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Define types for the promises to avoid using 'any'
type BrandPromise = Promise<BrandResponseDTO | BrandResponseDTO[]>;
type CategoryPromise = Promise<CategoryResponseDTO | CategoryResponseDTO[] | CategoryHierarchyDTO>;
type InitialDataPromise = Promise<{
    categories: CategoryResponseDTO[];
    brands: BrandResponseDTO[];
}>;

// Union type for all promise types
type PendingRequestPromise = BrandPromise | CategoryPromise | InitialDataPromise;

// Type for the pending requests map to allow for undefined values
type PendingRequestsMap = { [key: string]: PendingRequestPromise | undefined };

const useBrandCategory = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Brands selectors
    const brands = useSelector(selectBrands);
    const activeBrands = useSelector(selectActiveBrands);
    const selectedBrand = useSelector(selectSelectedBrand);
    const brandHierarchy = useSelector(selectBrandHierarchy);
    const brandStatistics = useSelector(selectBrandStatistics);
    const filteredBrands = useSelector(selectFilteredBrands);

    // Categories selectors
    const parentCategories = useSelector(selectParentCategories);
    const activeParentCategories = useSelector(selectActiveParentCategories);
    const subCategories = useSelector(selectSubCategories);
    const activeSubCategories = useSelector(selectActiveSubCategories);
    const selectedCategory = useSelector(selectSelectedCategory);
    const categoryHierarchy = useSelector(selectCategoryHierarchy);
    const categoryBreadcrumb = useSelector(selectCategoryBreadcrumb);
    const filteredCategories = useSelector(selectFilteredCategories);
    const filteredSubCategories = useSelector(selectFilteredSubCategories);
    const categoriesWithSubcategories = useSelector(selectCategoriesWithSubcategories);

    // UI state selectors
    const loading = useSelector(selectBrandCategoryLoading);
    const error = useSelector(selectBrandCategoryError);

    // Filter state selectors
    const brandSearchTerm = useSelector(selectBrandSearchTerm);
    const categorySearchTerm = useSelector(selectCategorySearchTerm);
    const selectedCategoryId = useSelector(selectSelectedCategoryId);
    const selectedBrandId = useSelector(selectSelectedBrandId);
    const showActiveOnly = useSelector(selectShowActiveOnly);

    // Refs for tracking and caching requests
    const lastBrandRequestRef = useRef<{
        timestamp: number;
        inProgress: boolean;
        params: BrandFilterParams;
    }>({
        timestamp: 0,
        inProgress: false,
        params: {} as BrandFilterParams
    });

    const lastCategoryRequestRef = useRef<{
        timestamp: number;
        inProgress: boolean;
        params: CategoryFilterParams;
    }>({
        timestamp: 0,
        inProgress: false,
        params: {} as CategoryFilterParams
    });

    const lastSlugRequestRef = useRef<{
        slug: string;
        timestamp: number;
        inProgress: boolean;
    }>({
        slug: '',
        timestamp: 0,
        inProgress: false
    });

    // Add refs for caching and request deduplication - fixed with proper type
    const pendingRequestsRef = useRef<PendingRequestsMap>({});
    const categoryDataCacheRef = useRef<Record<number, CacheEntry<CategoryHierarchyDTO>>>({});
    const brandDataCacheRef = useRef<Record<number, CacheEntry<BrandResponseDTO>>>({});
    const categoryBySlugCacheRef = useRef<Record<string, CacheEntry<CategoryResponseDTO>>>({});
    const brandBySlugCacheRef = useRef<Record<string, CacheEntry<BrandResponseDTO>>>({});

    // Helper function to create default objects - defined early to avoid circular references
    const createDefaultBrand = useCallback((brandId: number, slug: string = ''): BrandResponseDTO => {
        return {
            brandId: brandId,
            name: `Unknown Brand ${brandId}`,
            slug: slug || `unknown-brand-${brandId}`,
            status: true,
            description: '',
            logo: ''
        };
    }, []);

    const createDefaultCategory = useCallback((categoryId: number, slug: string = ''): CategoryResponseDTO => {
        return {
            categoryId: categoryId,
            name: `Unknown Category ${categoryId}`,
            slug: slug || `unknown-category-${categoryId}`,
            status: true,
            level: 0,
            description: '',
            parentId: null
        };
    }, []);

    /**
     * Get category breadcrumb - Defined early to avoid circular references
     */
    const getCategoryBreadcrumb = useCallback(async (categoryId: number): Promise<CategoryResponseDTO[]> => {
        const requestKey = `breadcrumb_${categoryId}`;

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending breadcrumb request for category ${categoryId}`);
            return pendingRequest as Promise<CategoryResponseDTO[]>;
        }

        // If we already have this breadcrumb cached in state
        if (categoryBreadcrumb && categoryBreadcrumb.length > 0 &&
            categoryBreadcrumb[categoryBreadcrumb.length - 1].categoryId === categoryId) {
            return categoryBreadcrumb.map(category => ({ ...category }));
        }

        // Create and store the promise
        const requestPromise = BrandCategoryService.getCategoryBreadcrumb(categoryId)
            .then(response => {
                // Validation
                if (!Array.isArray(response)) {
                    console.warn(`Invalid breadcrumb response for category ID ${categoryId}`);
                    return [];
                }

                // Create deep copies
                const copiedResponse = response.map(category => ({ ...category }));
                dispatch(fetchCategoryBreadcrumbSuccess(copiedResponse));

                // Clean up
                delete pendingRequestsRef.current[requestKey];

                return copiedResponse;
            })
            .catch(() => {
                delete pendingRequestsRef.current[requestKey];

                console.error(`Failed to fetch breadcrumb for category ${categoryId}`);
                // Don't dispatch failure for breadcrumb issues as they're not critical
                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [categoryBreadcrumb, dispatch]);

    /**
     * Get category with subcategories - Improved to prevent duplicate requests
     */
    const getCategoryWithSubcategories = useCallback(async (categoryId: number): Promise<CategoryHierarchyDTO> => {
        const requestKey = `category_hierarchy_${categoryId}`;
        const currentTime = Date.now();

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending request for category hierarchy ${categoryId}`);
            return pendingRequest as Promise<CategoryHierarchyDTO>;
        }

        // Check cache
        const cachedData = categoryDataCacheRef.current[categoryId];
        if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRY_LONG)) {
            console.log(`Using cached data for category hierarchy ${categoryId}`);
            return {
                category: cachedData.data.category ? { ...cachedData.data.category } : null,
                subcategories: Array.isArray(cachedData.data.subcategories)
                    ? cachedData.data.subcategories.map(sub => ({ ...sub }))
                    : []
            };
        }

        // If we already have this hierarchy in state and it matches the requested categoryId
        if (categoryHierarchy && categoryHierarchy.category && categoryHierarchy.category.categoryId === categoryId) {
            // Create deep copy
            return {
                category: categoryHierarchy.category ? { ...categoryHierarchy.category } : null,
                subcategories: Array.isArray(categoryHierarchy.subcategories)
                    ? categoryHierarchy.subcategories.map(sub => ({ ...sub }))
                    : []
            };
        }

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getCategoryWithSubcategories(categoryId)
            .then(response => {
                // Validation
                if (!response || typeof response !== 'object') {
                    console.warn(`Invalid category hierarchy response for ID ${categoryId}`);
                    const emptyHierarchy: CategoryHierarchyDTO = {
                        category: null,
                        subcategories: []
                    };
                    dispatch(fetchCategoryHierarchySuccess(emptyHierarchy));
                    return emptyHierarchy;
                }

                // Create deep copy
                const copiedResponse: CategoryHierarchyDTO = {
                    category: response.category ? { ...response.category } : null,
                    subcategories: Array.isArray(response.subcategories)
                        ? response.subcategories.map(sub => ({ ...sub }))
                        : []
                };

                // Cache the result
                categoryDataCacheRef.current[categoryId] = {
                    data: copiedResponse,
                    timestamp: currentTime
                };

                dispatch(fetchCategoryHierarchySuccess(copiedResponse));

                // Update selected category if available
                if (copiedResponse.category) {
                    dispatch(fetchCategoryDetailSuccess({ ...copiedResponse.category }));
                }

                // Clean up
                delete pendingRequestsRef.current[requestKey];

                return copiedResponse;
            })
            .catch(err => {
                delete pendingRequestsRef.current[requestKey];

                console.error(`Category hierarchy ${categoryId} fetch error:`, err);

                // Return empty structure for errors
                const emptyResponse: CategoryHierarchyDTO = {
                    category: null,
                    subcategories: []
                };

                // Only dispatch failure for serious errors
                if (!(err instanceof Error && err.message.includes('not found'))) {
                    const errorMessage = err instanceof Error ? err.message : `Failed to fetch category hierarchy for ${categoryId}`;
                    dispatch(fetchFailure(errorMessage));
                }

                dispatch(fetchCategoryHierarchySuccess(emptyResponse));
                return emptyResponse;
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [categoryHierarchy, dispatch]);

    /**
     * Get category by slug
     */
    const getCategoryBySlug = useCallback(async (slug: string): Promise<CategoryResponseDTO> => {
        const currentTime = Date.now();
        const requestKey = `category_slug_${slug}`;
        const isSameRequest = slug === lastSlugRequestRef.current.slug;
        const isRecentRequest = currentTime - lastSlugRequestRef.current.timestamp < CACHE_EXPIRY_SHORT;
        const isRequestInProgress = lastSlugRequestRef.current.inProgress;

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending request for category slug ${slug}`);
            return pendingRequest as Promise<CategoryResponseDTO>;
        }

        // Check cache
        const cachedData = categoryBySlugCacheRef.current[slug];
        if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRY_LONG)) {
            console.log(`Using cached data for category slug ${slug}`);

            // If we have a cached category with parent info, also fetch subcategories
            const category = cachedData.data;
            if (category.level === 0 || !category.parentId) {
                // This is non-blocking - just trigger the fetch in the background
                void getCategoryWithSubcategories(category.categoryId).catch(() => {
                    console.warn(`Background fetch of subcategories failed for ${category.categoryId}`);
                });
            }

            return { ...cachedData.data };
        }

        // If we already have this category in state
        if (selectedCategory && selectedCategory.slug === slug) {
            return { ...selectedCategory };
        }

        // Skip duplicate requests
        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate category request for slug:', slug);

            // Wait for existing data using an async approach instead of checking promise existence
            const checkDataPromise = new Promise<CategoryResponseDTO>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (selectedCategory && selectedCategory.slug === slug) {
                        clearInterval(checkInterval);
                        resolve({ ...selectedCategory });
                    } else if (categoryBySlugCacheRef.current[slug]) {
                        clearInterval(checkInterval);
                        resolve({ ...categoryBySlugCacheRef.current[slug].data });
                    }
                }, 100);

                // After 2s, retry if still nothing
                setTimeout(() => {
                    clearInterval(checkInterval);
                    // Only retry if we don't have the data yet
                    resolve(getCategoryBySlug(slug));
                }, 2000);
            });

            return checkDataPromise;
        }

        lastSlugRequestRef.current = {
            slug,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getCategoryBySlug(slug)
            .then(async (category) => {
                // Validation
                if (!category || typeof category !== 'object') {
                    console.warn(`Invalid category response for slug ${slug}`);
                    lastSlugRequestRef.current.inProgress = false;

                    const defaultCategory = createDefaultCategory(0, slug);
                    dispatch(fetchCategoryDetailSuccess(defaultCategory));

                    // Cache the default result
                    categoryBySlugCacheRef.current[slug] = {
                        data: defaultCategory,
                        timestamp: currentTime
                    };

                    return defaultCategory;
                }

                // Create deep copy
                const copiedCategory = { ...category };
                dispatch(fetchCategoryDetailSuccess(copiedCategory));

                // Cache the result
                categoryBySlugCacheRef.current[slug] = {
                    data: copiedCategory,
                    timestamp: currentTime
                };

                // If parent category, fetch subcategories in the background
                if (copiedCategory.level === 0 || !copiedCategory.parentId) {
                    try {
                        await getCategoryWithSubcategories(copiedCategory.categoryId);
                    } catch {
                        console.warn(`Failed to fetch subcategories for ${copiedCategory.categoryId}`);
                    }
                }

                // Get breadcrumb in the background
                try {
                    await getCategoryBreadcrumb(copiedCategory.categoryId);
                } catch {
                    console.warn(`Failed to fetch breadcrumb for ${copiedCategory.categoryId}`);
                }

                lastSlugRequestRef.current.inProgress = false;
                return copiedCategory;
            })
            .catch(err => {
                lastSlugRequestRef.current.inProgress = false;

                const errorMessage = err instanceof Error ? err.message : `Failed to fetch category by slug ${slug}`;
                console.error(`Category slug ${slug} fetch error:`, err);
                dispatch(fetchFailure(errorMessage));

                const defaultCategory = createDefaultCategory(0, slug);
                dispatch(fetchCategoryDetailSuccess(defaultCategory));

                // Cache the default result for errors too
                categoryBySlugCacheRef.current[slug] = {
                    data: defaultCategory,
                    timestamp: currentTime
                };

                return defaultCategory;
            })
            .finally(() => {
                delete pendingRequestsRef.current[requestKey];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [dispatch, selectedCategory, createDefaultCategory, getCategoryWithSubcategories, getCategoryBreadcrumb]);

    /**
     * Get all active brands
     */
    const getActiveBrands = useCallback(async (): Promise<BrandResponseDTO[]> => {
        const currentTime = Date.now();
        const requestKey = 'active_brands';

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log('Reusing pending active brands request');
            return pendingRequest as Promise<BrandResponseDTO[]>;
        }

        // Check cache to avoid unnecessary API calls
        if (
            activeBrands &&
            activeBrands.length > 0 &&
            currentTime - lastBrandRequestRef.current.timestamp < CACHE_EXPIRY_SHORT &&
            !lastBrandRequestRef.current.inProgress
        ) {
            console.log('Using cached active brands data');
            return activeBrands.map(brand => ({ ...brand }));
        }

        lastBrandRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: { status: true }
        };

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getActiveBrands()
            .then(response => {
                // Validation and safeguards
                if (!Array.isArray(response)) {
                    console.warn('Invalid active brands response, returning empty array');
                    dispatch(fetchBrandsSuccess([]));
                    return [];
                }

                // Create deep copies to avoid "object is not extensible" errors
                const copiedResponse = response.map(brand => ({ ...brand }));
                dispatch(fetchBrandsSuccess(copiedResponse));

                // Clean up
                delete pendingRequestsRef.current[requestKey];
                lastBrandRequestRef.current.inProgress = false;

                return copiedResponse;
            })
            .catch(err => {
                lastBrandRequestRef.current.inProgress = false;
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch brands';
                console.error('Brand fetch error:', err);
                dispatch(fetchFailure(errorMessage));

                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [activeBrands, dispatch]);

    /**
     * Get all brands (including inactive)
     */
    const getAllBrands = useCallback(async (): Promise<BrandResponseDTO[]> => {
        const currentTime = Date.now();
        const requestKey = 'all_brands';

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log('Reusing pending all brands request');
            return pendingRequest as Promise<BrandResponseDTO[]>;
        }

        // Check cache to avoid unnecessary API calls
        if (
            brands &&
            brands.length > 0 &&
            currentTime - lastBrandRequestRef.current.timestamp < CACHE_EXPIRY_SHORT &&
            !lastBrandRequestRef.current.inProgress
        ) {
            console.log('Using cached all brands data');
            return brands.map(brand => ({ ...brand }));
        }

        lastBrandRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: {}
        };

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getFilteredBrands({})
            .then(response => {
                // Validation and safeguards
                if (!Array.isArray(response)) {
                    console.warn('Invalid brands response, returning empty array');
                    dispatch(fetchBrandsSuccess([]));
                    return [];
                }

                // Create deep copies to avoid "object is not extensible" errors
                const copiedResponse = response.map(brand => ({ ...brand }));
                dispatch(fetchBrandsSuccess(copiedResponse));

                // Clean up
                delete pendingRequestsRef.current[requestKey];
                lastBrandRequestRef.current.inProgress = false;

                return copiedResponse;
            })
            .catch(err => {
                lastBrandRequestRef.current.inProgress = false;
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all brands';
                console.error('Brand fetch error:', err);
                dispatch(fetchFailure(errorMessage));

                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [brands, dispatch]);

    /**
     * Get brand by ID
     */
    const getBrandById = useCallback(async (brandId: number): Promise<BrandResponseDTO> => {
        const requestKey = `brand_${brandId}`;
        const currentTime = Date.now();

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending request for brand ${brandId}`);
            return pendingRequest as Promise<BrandResponseDTO>;
        }

        // Check cache
        const cachedData = brandDataCacheRef.current[brandId];
        if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRY_LONG)) {
            console.log(`Using cached data for brand ${brandId}`);
            return { ...cachedData.data };
        }

        // If we already have this brand in the selected state
        if (selectedBrand && selectedBrand.brandId === brandId) {
            return { ...selectedBrand };
        }

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getBrandById(brandId)
            .then(brand => {
                // Validation
                if (!brand || typeof brand !== 'object') {
                    console.warn(`Invalid brand response for ID ${brandId}`);
                    const defaultBrand = createDefaultBrand(brandId);
                    dispatch(fetchBrandDetailSuccess(defaultBrand));
                    return defaultBrand;
                }

                const copiedBrand = { ...brand };

                // Cache the result
                brandDataCacheRef.current[brandId] = {
                    data: copiedBrand,
                    timestamp: currentTime
                };

                dispatch(fetchBrandDetailSuccess(copiedBrand));

                // Clean up
                delete pendingRequestsRef.current[requestKey];

                return copiedBrand;
            })
            .catch(err => {
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : `Failed to fetch brand ${brandId}`;
                console.error(`Brand ${brandId} fetch error:`, err);
                dispatch(fetchFailure(errorMessage));

                const defaultBrand = createDefaultBrand(brandId);
                dispatch(fetchBrandDetailSuccess(defaultBrand));
                return defaultBrand;
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [dispatch, selectedBrand, createDefaultBrand]);

    /**
     * Get brand by slug
     */
    const getBrandBySlug = useCallback(async (slug: string): Promise<BrandResponseDTO> => {
        const currentTime = Date.now();
        const requestKey = `brand_slug_${slug}`;
        const isSameRequest = slug === lastSlugRequestRef.current.slug;
        const isRecentRequest = currentTime - lastSlugRequestRef.current.timestamp < CACHE_EXPIRY_SHORT;
        const isRequestInProgress = lastSlugRequestRef.current.inProgress;

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending request for brand slug ${slug}`);
            return pendingRequest as Promise<BrandResponseDTO>;
        }

        // Check cache
        const cachedData = brandBySlugCacheRef.current[slug];
        if (cachedData && (currentTime - cachedData.timestamp < CACHE_EXPIRY_LONG)) {
            console.log(`Using cached data for brand slug ${slug}`);
            return { ...cachedData.data };
        }

        // If we already have this brand in state
        if (selectedBrand && selectedBrand.slug === slug) {
            return { ...selectedBrand };
        }

        // Skip duplicate requests
        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate brand request for slug:', slug);

            // Wait for existing data using an async approach instead of checking promise existence
            const checkDataPromise = new Promise<BrandResponseDTO>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (selectedBrand && selectedBrand.slug === slug) {
                        clearInterval(checkInterval);
                        resolve({ ...selectedBrand });
                    } else if (brandBySlugCacheRef.current[slug]) {
                        clearInterval(checkInterval);
                        resolve({ ...brandBySlugCacheRef.current[slug].data });
                    }
                }, 100);

                // After 2s, retry if still nothing
                setTimeout(() => {
                    clearInterval(checkInterval);
                    // Only retry if we don't have the data yet
                    resolve(getBrandBySlug(slug));
                }, 2000);
            });

            return checkDataPromise;
        }

        lastSlugRequestRef.current = {
            slug,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.searchBrands(slug)
            .then(searchResult => {
                // Validation
                if (!Array.isArray(searchResult)) {
                    console.warn(`Invalid search results for brand slug ${slug}`);
                    lastSlugRequestRef.current.inProgress = false;

                    const defaultBrand = createDefaultBrand(0, slug);
                    dispatch(fetchBrandDetailSuccess(defaultBrand));

                    // Cache the default result
                    brandBySlugCacheRef.current[slug] = {
                        data: defaultBrand,
                        timestamp: currentTime
                    };

                    return defaultBrand;
                }

                // Find exact match by slug
                const exactMatch = searchResult.find(b => b.slug === slug);

                if (exactMatch) {
                    const copiedBrand = { ...exactMatch };
                    dispatch(fetchBrandDetailSuccess(copiedBrand));

                    // Cache the result
                    brandBySlugCacheRef.current[slug] = {
                        data: copiedBrand,
                        timestamp: currentTime
                    };

                    lastSlugRequestRef.current.inProgress = false;
                    return copiedBrand;
                }

                // Default brand if not found
                lastSlugRequestRef.current.inProgress = false;
                const defaultBrand = createDefaultBrand(0, slug);
                dispatch(fetchBrandDetailSuccess(defaultBrand));

                // Cache the default result
                brandBySlugCacheRef.current[slug] = {
                    data: defaultBrand,
                    timestamp: currentTime
                };

                return defaultBrand;
            })
            .catch(err => {
                lastSlugRequestRef.current.inProgress = false;

                const errorMessage = err instanceof Error ? err.message : `Failed to fetch brand by slug ${slug}`;
                console.error(`Brand slug ${slug} fetch error:`, err);
                dispatch(fetchFailure(errorMessage));

                const defaultBrand = createDefaultBrand(0, slug);
                dispatch(fetchBrandDetailSuccess(defaultBrand));

                // Cache the default result for errors too
                brandBySlugCacheRef.current[slug] = {
                    data: defaultBrand,
                    timestamp: currentTime
                };

                return defaultBrand;
            })
            .finally(() => {
                delete pendingRequestsRef.current[requestKey];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [dispatch, selectedBrand, createDefaultBrand]);

    /**
     * Search brands
     */
    const searchBrands = useCallback(async (keyword: string): Promise<BrandResponseDTO[]> => {
        if (!keyword || keyword.trim() === '') {
            return activeBrands && activeBrands.length > 0
                ? activeBrands.map(brand => ({ ...brand }))
                : await getActiveBrands();
        }

        const requestKey = `search_brands_${keyword}`;

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending search request for "${keyword}"`);
            return pendingRequest as Promise<BrandResponseDTO[]>;
        }

        dispatch(setBrandSearchTerm(keyword));
        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.searchBrands(keyword)
            .then(response => {
                // Validation
                if (!Array.isArray(response)) {
                    console.warn(`Invalid search results for brand keyword ${keyword}`);
                    return [];
                }

                // Return deep copies
                const results = response.map(brand => ({ ...brand }));

                // Clean up
                delete pendingRequestsRef.current[requestKey];

                return results;
            })
            .catch(err => {
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : 'Failed to search brands';
                console.error('Brand search error:', err);
                dispatch(fetchFailure(errorMessage));

                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [activeBrands, getActiveBrands, dispatch]);

    /**
     * Get all active parent categories
     */
    const getActiveParentCategories = useCallback(async (): Promise<CategoryResponseDTO[]> => {
        const currentTime = Date.now();
        const requestKey = 'active_parent_categories';

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log('Reusing pending parent categories request');
            return pendingRequest as Promise<CategoryResponseDTO[]>;
        }

        // Check cache to avoid unnecessary API calls
        if (
            activeParentCategories &&
            activeParentCategories.length > 0 &&
            currentTime - lastCategoryRequestRef.current.timestamp < CACHE_EXPIRY_SHORT &&
            !lastCategoryRequestRef.current.inProgress
        ) {
            console.log('Using cached active parent categories data');
            return activeParentCategories.map(category => ({ ...category }));
        }

        lastCategoryRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: { status: true }
        };

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getAllActiveParentCategories()
            .then(response => {
                // Validation
                if (!Array.isArray(response)) {
                    console.warn('Invalid parent categories response');
                    lastCategoryRequestRef.current.inProgress = false;
                    dispatch(fetchParentCategoriesSuccess([]));
                    return [];
                }

                // Create deep copies
                const copiedResponse = response.map(category => ({ ...category }));
                dispatch(fetchParentCategoriesSuccess(copiedResponse));

                // Clean up
                lastCategoryRequestRef.current.inProgress = false;
                delete pendingRequestsRef.current[requestKey];

                return copiedResponse;
            })
            .catch(err => {
                lastCategoryRequestRef.current.inProgress = false;
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parent categories';
                console.error('Category fetch error:', err);
                dispatch(fetchFailure(errorMessage));

                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [activeParentCategories, dispatch]);

    /**
     * Get subcategories by parent ID
     */
    const getSubcategoriesByParent = useCallback(async (parentId: number): Promise<CategoryResponseDTO[]> => {
        const requestKey = `subcategories_${parentId}`;

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log(`Reusing pending subcategories request for parent ${parentId}`);
            return pendingRequest as Promise<CategoryResponseDTO[]>;
        }

        // Check if we already have subcategories for this parent
        const existingSubcategories = subCategories?.filter(c => c.parentId === parentId);
        if (existingSubcategories && existingSubcategories.length > 0) {
            return existingSubcategories.map(category => ({ ...category }));
        }

        dispatch(fetchStart());

        // Create and store the promise
        const requestPromise = BrandCategoryService.getActiveSubCategories(parentId)
            .then(response => {
                // Validation
                if (!Array.isArray(response)) {
                    console.warn(`Invalid subcategories response for parent ID ${parentId}`);
                    dispatch(fetchSubCategoriesSuccess([]));
                    return [];
                }

                // Create deep copies
                const copiedResponse = response.map(category => ({ ...category }));
                dispatch(fetchSubCategoriesSuccess(copiedResponse));

                // Clean up
                delete pendingRequestsRef.current[requestKey];

                return copiedResponse;
            })
            .catch(err => {
                delete pendingRequestsRef.current[requestKey];

                const errorMessage = err instanceof Error ? err.message : `Failed to fetch subcategories for parent ${parentId}`;
                console.error(`Subcategories for parent ${parentId} fetch error:`, err);
                dispatch(fetchFailure(errorMessage));

                return [];
            });

        // Store the pending request
        pendingRequestsRef.current[requestKey] = requestPromise;

        return requestPromise;
    }, [subCategories, dispatch]);

    /**
     * Load initial data for the application
     */
    const loadInitialData = useCallback(async () => {
        const requestKey = 'initial_data';

        // Check if there's a pending request
        const pendingRequest = pendingRequestsRef.current[requestKey];
        if (pendingRequest) {
            console.log('Reusing pending initial data request');
            return pendingRequest as InitialDataPromise;
        }

        try {
            dispatch(fetchStart());

            // Check if we already have data
            const needCategories = !activeParentCategories || activeParentCategories.length === 0;
            const needBrands = !activeBrands || activeBrands.length === 0;

            if (!needCategories && !needBrands) {
                console.log('Using cached initial data');
                return {
                    categories: activeParentCategories.map(category => ({ ...category })),
                    brands: activeBrands.map(brand => ({ ...brand }))
                };
            }

            // Create and store the promise
            const requestPromise = Promise.all([
                needCategories ? BrandCategoryService.getAllActiveParentCategories() : activeParentCategories,
                needBrands ? BrandCategoryService.getActiveBrands() : activeBrands
            ])
                .then(([categoriesResponse, brandsResponse]) => {
                    // Validate responses
                    const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
                    const brands = Array.isArray(brandsResponse) ? brandsResponse : [];

                    console.log(`Loaded initial data: ${categories.length} categories, ${brands.length} brands`);

                    // Create deep copies
                    const copiedCategories = categories.map(category => ({ ...category }));
                    const copiedBrands = brands.map(brand => ({ ...brand }));

                    if (needCategories) {
                        dispatch(fetchParentCategoriesSuccess(copiedCategories));
                    }

                    if (needBrands) {
                        dispatch(fetchBrandsSuccess(copiedBrands));
                    }

                    // Clean up
                    delete pendingRequestsRef.current[requestKey];

                    return { categories: copiedCategories, brands: copiedBrands };
                })
                .catch(err => {
                    delete pendingRequestsRef.current[requestKey];

                    console.error('Error during initial data fetch:', err);

                    // Return default empty structures
                    const emptyCategories: CategoryResponseDTO[] = [];
                    const emptyBrands: BrandResponseDTO[] = [];

                    if (needCategories) {
                        dispatch(fetchParentCategoriesSuccess(emptyCategories));
                    }

                    if (needBrands) {
                        dispatch(fetchBrandsSuccess(emptyBrands));
                    }

                    return { categories: emptyCategories, brands: emptyBrands };
                });

            // Store the pending request
            pendingRequestsRef.current[requestKey] = requestPromise;

            return requestPromise;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load initial data';
            console.error('Initial data load error:', err);
            dispatch(fetchFailure(errorMessage));

            // Return empty data instead of throwing
            return {
                categories: [],
                brands: []
            };
        }
    }, [activeParentCategories, activeBrands, dispatch]);

    // Filter update functions
    const updateBrandSearchTerm = useCallback((term: string) => {
        dispatch(setBrandSearchTerm(term));
    }, [dispatch]);

    const updateCategorySearchTerm = useCallback((term: string) => {
        dispatch(setCategorySearchTerm(term));
    }, [dispatch]);

    const updateSelectedCategoryId = useCallback((id: number | null) => {
        dispatch(setSelectedCategoryId(id));
    }, [dispatch]);

    const updateSelectedBrandId = useCallback((id: number | null) => {
        dispatch(setSelectedBrandId(id));
    }, [dispatch]);

    const updateShowActiveOnly = useCallback((show: boolean) => {
        dispatch(setShowActiveOnly(show));
    }, [dispatch]);

    const resetFilters = useCallback(() => {
        dispatch(clearFilters());
    }, [dispatch]);

    const resetSelectedBrand = useCallback(() => {
        dispatch(clearSelectedBrand());
    }, [dispatch]);

    const resetSelectedCategory = useCallback(() => {
        dispatch(clearSelectedCategory());
    }, [dispatch]);

    // Cleanup on component unmount - fixed the exhaustive deps warning
    useEffect(() => {
        // Capture the current reference to avoid stale value issues in cleanup
        const currentPendingRequests = pendingRequestsRef.current;

        return () => {
            // Clear any pending requests using the captured reference
            Object.keys(currentPendingRequests).forEach(key => {
                delete currentPendingRequests[key];
            });
        };
    }, []);

    return {
        // Brand data
        brands,
        activeBrands,
        selectedBrand,
        brandHierarchy,
        brandStatistics,
        filteredBrands,

        // Category data
        parentCategories,
        activeParentCategories,
        subCategories,
        activeSubCategories,
        selectedCategory,
        categoryHierarchy,
        categoryBreadcrumb,
        filteredCategories,
        filteredSubCategories,
        categoriesWithSubcategories,

        // UI state
        loading,
        error,

        // Filter state
        brandSearchTerm,
        categorySearchTerm,
        selectedCategoryId,
        selectedBrandId,
        showActiveOnly,

        // Brand actions
        getActiveBrands,
        getAllBrands,
        getBrandById,
        getBrandBySlug,
        searchBrands,

        // Category actions
        getActiveParentCategories,
        getCategoryWithSubcategories,
        getCategoryBySlug,
        getSubcategoriesByParent,
        getCategoryBreadcrumb,

        // Combined actions
        loadInitialData,

        // Filter actions
        updateBrandSearchTerm,
        updateCategorySearchTerm,
        updateSelectedCategoryId,
        updateSelectedBrandId,
        updateShowActiveOnly,
        resetFilters,
        resetSelectedBrand,
        resetSelectedCategory
    };
};

export default useBrandCategory;