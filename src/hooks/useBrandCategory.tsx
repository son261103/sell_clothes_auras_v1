import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useRef } from 'react';
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
import { BrandFilterParams } from '../types/brand.types';
import { CategoryFilterParams, CategoryHierarchyDTO } from '../types/category.types';

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

    // Refs for tracking requests - sử dụng để tránh duplicate request
    const lastBrandRequestRef = useRef({
        timestamp: 0,
        inProgress: false,
        params: {} as BrandFilterParams
    });

    const lastCategoryRequestRef = useRef({
        timestamp: 0,
        inProgress: false,
        params: {} as CategoryFilterParams
    });

    const lastSlugRequestRef = useRef({
        slug: '',
        timestamp: 0,
        inProgress: false
    });

    /**
     * Get all active brands
     */
    const getActiveBrands = useCallback(async () => {
        const currentTime = Date.now();

        // Kiểm tra cache để tránh gọi API không cần thiết
        if (
            activeBrands &&
            activeBrands.length > 0 &&
            currentTime - lastBrandRequestRef.current.timestamp < 30000 && // 30s cache
            !lastBrandRequestRef.current.inProgress
        ) {
            console.log('Using cached active brands data');
            return activeBrands;
        }

        lastBrandRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: { status: true }
        };

        dispatch(fetchStart());
        try {
            console.log('Fetching active brands');
            const response = await BrandCategoryService.getActiveBrands();
            // Đảm bảo tạo bản sao của các đối tượng để tránh lỗi "object is not extensible"
            const copiedResponse = response.map(brand => ({ ...brand }));
            dispatch(fetchBrandsSuccess(copiedResponse));
            lastBrandRequestRef.current.inProgress = false;
            return copiedResponse;
        } catch (error) {
            lastBrandRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch brands';
            console.error('Brand fetch error:', error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [activeBrands, dispatch]);

    /**
     * Get all brands (including inactive)
     */
    const getAllBrands = useCallback(async () => {
        const currentTime = Date.now();

        // Kiểm tra cache để tránh gọi API không cần thiết
        if (
            brands &&
            brands.length > 0 &&
            currentTime - lastBrandRequestRef.current.timestamp < 30000 && // 30s cache
            !lastBrandRequestRef.current.inProgress
        ) {
            console.log('Using cached all brands data');
            return brands;
        }

        lastBrandRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: {}
        };

        dispatch(fetchStart());
        try {
            console.log('Fetching all brands');
            const response = await BrandCategoryService.getFilteredBrands({});
            // Đảm bảo tạo bản sao của các đối tượng để tránh lỗi "object is not extensible"
            const copiedResponse = response.map(brand => ({ ...brand }));
            dispatch(fetchBrandsSuccess(copiedResponse));
            lastBrandRequestRef.current.inProgress = false;
            return copiedResponse;
        } catch (error) {
            lastBrandRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch all brands';
            console.error('Brand fetch error:', error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [brands, dispatch]);

    /**
     * Get brand by ID
     */
    const getBrandById = useCallback(async (brandId: number) => {
        // Nếu chúng ta đã có thương hiệu này, trả về từ cache
        if (selectedBrand && selectedBrand.brandId === brandId) {
            return { ...selectedBrand }; // Trả về bản sao để tránh lỗi "object is not extensible"
        }

        dispatch(fetchStart());
        try {
            const brand = await BrandCategoryService.getBrandById(brandId);
            const copiedBrand = { ...brand }; // Tạo bản sao
            dispatch(fetchBrandDetailSuccess(copiedBrand));
            return copiedBrand;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch brand ${brandId}`;
            console.error(`Brand ${brandId} fetch error:`, error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [dispatch, selectedBrand]);

    /**
     * Get brand by slug
     */
    const getBrandBySlug = useCallback(async (slug: string) => {
        const currentTime = Date.now();
        const isSameRequest = slug === lastSlugRequestRef.current.slug;
        const isRecentRequest = currentTime - lastSlugRequestRef.current.timestamp < 30000; // 30s cache
        const isRequestInProgress = lastSlugRequestRef.current.inProgress;

        // Nếu thương hiệu đã được chọn có slug này, trả về nó
        if (selectedBrand && selectedBrand.slug === slug) {
            return { ...selectedBrand }; // Trả về bản sao để tránh lỗi "object is not extensible"
        }

        // Bỏ qua các request trùng lặp đang xử lý hoặc gần đây
        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate brand request for slug:', slug);

            // Trả về promise chờ request hiện tại hoàn thành
            return new Promise((resolve) => {
                const checkData = setInterval(() => {
                    if (selectedBrand && selectedBrand.slug === slug) {
                        clearInterval(checkData);
                        resolve({ ...selectedBrand }); // Trả về bản sao
                    }
                }, 100);

                // Sau 2s, thử lại nếu vẫn chưa có dữ liệu
                setTimeout(() => {
                    clearInterval(checkData);
                    if (!selectedBrand || selectedBrand.slug !== slug) {
                        resolve(getBrandBySlug(slug));
                    }
                }, 2000);
            });
        }

        lastSlugRequestRef.current = {
            slug,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchStart());
        try {
            // Tìm kiếm thương hiệu theo tên/slug
            const searchResult = await BrandCategoryService.searchBrands(slug);

            // Tìm kết quả chính xác theo slug
            const exactMatch = searchResult.find(b => b.slug === slug);

            if (exactMatch) {
                const copiedBrand = { ...exactMatch }; // Tạo bản sao
                dispatch(fetchBrandDetailSuccess(copiedBrand));
                lastSlugRequestRef.current.inProgress = false;
                return copiedBrand;
            }

            // Nếu không tìm thấy kết quả chính xác, trả về lỗi
            lastSlugRequestRef.current.inProgress = false;
            throw new Error(`Brand with slug ${slug} not found`);
        } catch (error) {
            lastSlugRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch brand by slug ${slug}`;
            console.error(`Brand slug ${slug} fetch error:`, error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [dispatch, selectedBrand]);

    /**
     * Search brands
     */
    const searchBrands = useCallback(async (keyword: string) => {
        if (!keyword || keyword.trim() === '') {
            return activeBrands && activeBrands.length > 0
                ? activeBrands.map(brand => ({ ...brand })) // Trả về bản sao
                : await getActiveBrands();
        }

        dispatch(setBrandSearchTerm(keyword));
        dispatch(fetchStart());
        try {
            const response = await BrandCategoryService.searchBrands(keyword);
            // Trả về bản sao của các đối tượng
            return response.map(brand => ({ ...brand }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to search brands';
            console.error('Brand search error:', error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [activeBrands, getActiveBrands, dispatch]);

    /**
     * Get all active parent categories
     */
    const getActiveParentCategories = useCallback(async () => {
        const currentTime = Date.now();

        // Kiểm tra cache để tránh gọi API không cần thiết
        if (
            activeParentCategories &&
            activeParentCategories.length > 0 &&
            currentTime - lastCategoryRequestRef.current.timestamp < 30000 && // 30s cache
            !lastCategoryRequestRef.current.inProgress
        ) {
            console.log('Using cached active parent categories data');
            // Trả về bản sao của các đối tượng
            return activeParentCategories.map(category => ({ ...category }));
        }

        lastCategoryRequestRef.current = {
            timestamp: currentTime,
            inProgress: true,
            params: { status: true }
        };

        dispatch(fetchStart());
        try {
            console.log('Fetching active parent categories');
            const response = await BrandCategoryService.getAllActiveParentCategories();
            // Tạo bản sao của các đối tượng
            const copiedResponse = response.map(category => ({ ...category }));
            dispatch(fetchParentCategoriesSuccess(copiedResponse));
            lastCategoryRequestRef.current.inProgress = false;
            return copiedResponse;
        } catch (error) {
            lastCategoryRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch parent categories';
            console.error('Category fetch error:', error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [activeParentCategories, dispatch]);

    /**
     * Get category with subcategories
     * Cập nhật để xử lý định dạng API mới
     */
    const getCategoryWithSubcategories = useCallback(async (categoryId: number): Promise<CategoryHierarchyDTO> => {
        // Nếu đã có dữ liệu và categoryId khớp, trả về từ cache
        if (categoryHierarchy && categoryHierarchy.category && categoryHierarchy.category.categoryId === categoryId) {
            // Tạo bản sao sâu để tránh lỗi "object is not extensible"
            return {
                category: categoryHierarchy.category ? { ...categoryHierarchy.category } : null,
                subcategories: categoryHierarchy.subcategories.map(sub => ({ ...sub }))
            };
        }

        dispatch(fetchStart());
        try {
            console.log(`Fetching category with subcategories for ID: ${categoryId}`);
            const response = await BrandCategoryService.getCategoryWithSubcategories(categoryId);

            // Đảm bảo response đã là bản sao sâu
            const copiedResponse: CategoryHierarchyDTO = {
                category: response.category ? { ...response.category } : null,
                subcategories: response.subcategories.map(sub => ({ ...sub }))
            };

            dispatch(fetchCategoryHierarchySuccess(copiedResponse));

            // Cập nhật danh mục đã chọn nếu có
            if (copiedResponse.category) {
                dispatch(fetchCategoryDetailSuccess({ ...copiedResponse.category }));
            }

            return copiedResponse;
        } catch (error) {
            console.error(`Category hierarchy ${categoryId} fetch error:`, error);

            // Trả về cấu trúc rỗng khi có lỗi thay vì throw
            const emptyResponse: CategoryHierarchyDTO = {
                category: null,
                subcategories: []
            };

            // Chỉ dispatch failure nếu là lỗi thực sự, không phải trường hợp không tìm thấy
            if (!(error instanceof Error && error.message.includes('not found'))) {
                const errorMessage = error instanceof Error ? error.message : `Failed to fetch category hierarchy for ${categoryId}`;
                dispatch(fetchFailure(errorMessage));
            }

            return emptyResponse;
        }
    }, [categoryHierarchy, dispatch]);

    /**
     * Get category by slug
     */
    const getCategoryBySlug = useCallback(async (slug: string) => {
        const currentTime = Date.now();
        const isSameRequest = slug === lastSlugRequestRef.current.slug;
        const isRecentRequest = currentTime - lastSlugRequestRef.current.timestamp < 30000; // 30s cache
        const isRequestInProgress = lastSlugRequestRef.current.inProgress;

        // Nếu danh mục đã được chọn có slug này, trả về nó
        if (selectedCategory && selectedCategory.slug === slug) {
            return { ...selectedCategory }; // Trả về bản sao
        }

        // Bỏ qua các request trùng lặp đang xử lý hoặc gần đây
        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate category request for slug:', slug);

            // Trả về promise chờ request hiện tại hoàn thành
            return new Promise((resolve) => {
                const checkData = setInterval(() => {
                    if (selectedCategory && selectedCategory.slug === slug) {
                        clearInterval(checkData);
                        resolve({ ...selectedCategory }); // Trả về bản sao
                    }
                }, 100);

                // Sau 2s, thử lại nếu vẫn chưa có dữ liệu
                setTimeout(() => {
                    clearInterval(checkData);
                    if (!selectedCategory || selectedCategory.slug !== slug) {
                        resolve(getCategoryBySlug(slug));
                    }
                }, 2000);
            });
        }

        lastSlugRequestRef.current = {
            slug,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchStart());
        try {
            const category = await BrandCategoryService.getCategoryBySlug(slug);
            // Tạo bản sao
            const copiedCategory = { ...category };
            dispatch(fetchCategoryDetailSuccess(copiedCategory));

            // Nếu là danh mục cha, lấy thêm danh mục con
            if (copiedCategory.level === 0) {
                await getCategoryWithSubcategories(copiedCategory.categoryId);
            }

            // Lấy breadcrumb
            await getCategoryBreadcrumb(copiedCategory.categoryId);

            lastSlugRequestRef.current.inProgress = false;
            return copiedCategory;
        } catch (error) {
            lastSlugRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch category by slug ${slug}`;
            console.error(`Category slug ${slug} fetch error:`, error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [dispatch, selectedCategory, getCategoryWithSubcategories]);

    /**
     * Get subcategories by parent ID
     */
    const getSubcategoriesByParent = useCallback(async (parentId: number) => {
        // Kiểm tra xem đã có subcategories cho parent này chưa
        const existingSubcategories = subCategories?.filter(c => c.parentId === parentId);
        if (existingSubcategories && existingSubcategories.length > 0) {
            // Trả về bản sao
            return existingSubcategories.map(category => ({ ...category }));
        }

        dispatch(fetchStart());
        try {
            const response = await BrandCategoryService.getActiveSubCategories(parentId);
            // Tạo bản sao
            const copiedResponse = response.map(category => ({ ...category }));
            dispatch(fetchSubCategoriesSuccess(copiedResponse));
            return copiedResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch subcategories for parent ${parentId}`;
            console.error(`Subcategories for parent ${parentId} fetch error:`, error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [subCategories, dispatch]);

    /**
     * Get category breadcrumb
     */
    const getCategoryBreadcrumb = useCallback(async (categoryId: number) => {
        // Nếu đã có breadcrumb cho danh mục này, trả về từ cache
        if (categoryBreadcrumb && categoryBreadcrumb.length > 0 &&
            categoryBreadcrumb[categoryBreadcrumb.length - 1].categoryId === categoryId) {
            // Trả về bản sao
            return categoryBreadcrumb.map(category => ({ ...category }));
        }

        try {
            const response = await BrandCategoryService.getCategoryBreadcrumb(categoryId);
            // Tạo bản sao
            const copiedResponse = response.map(category => ({ ...category }));
            dispatch(fetchCategoryBreadcrumbSuccess(copiedResponse));
            return copiedResponse;
        } catch (error) {
            console.error(`Failed to fetch breadcrumb for category ${categoryId}:`, error);
            // Không đưa vào failure vì breadcrumb không quan trọng
            return [];
        }
    }, [categoryBreadcrumb, dispatch]);

    /**
     * Load initial data for the application
     */
    const loadInitialData = useCallback(async () => {
        try {
            dispatch(fetchStart());

            // Kiểm tra xem đã có dữ liệu chưa trước khi gọi API
            const needCategories = !activeParentCategories || activeParentCategories.length === 0;
            const needBrands = !activeBrands || activeBrands.length === 0;

            if (!needCategories && !needBrands) {
                console.log('Using cached initial data');
                return {
                    // Trả về bản sao
                    categories: activeParentCategories.map(category => ({ ...category })),
                    brands: activeBrands.map(brand => ({ ...brand }))
                };
            }

            // Lấy cả danh mục và thương hiệu trong song song
            const [categories, brands] = await Promise.all([
                needCategories ? BrandCategoryService.getAllActiveParentCategories() : activeParentCategories,
                needBrands ? BrandCategoryService.getActiveBrands() : activeBrands
            ]);

            // Tạo bản sao
            const copiedCategories = categories.map(category => ({ ...category }));
            const copiedBrands = brands.map(brand => ({ ...brand }));

            if (needCategories) {
                dispatch(fetchParentCategoriesSuccess(copiedCategories));
            }

            if (needBrands) {
                dispatch(fetchBrandsSuccess(copiedBrands));
            }

            return { categories: copiedCategories, brands: copiedBrands };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load initial data';
            console.error('Initial data load error:', error);
            dispatch(fetchFailure(errorMessage));
            throw error;
        }
    }, [activeParentCategories, activeBrands, dispatch]);

    // Filter update functions - không cần thay đổi
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