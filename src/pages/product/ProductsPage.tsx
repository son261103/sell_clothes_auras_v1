import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiRefreshCw, FiChevronRight, FiGrid, FiList } from 'react-icons/fi';
import useProduct from '../../hooks/useProduct';
import useBrandCategory from '../../hooks/useBrandCategory';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSorting from '../../components/products/ProductSorting';
import ProductPagination from '../../components/products/ProductPagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ProductFilterParams } from '../../types/product.types';
import {BrandDTO} from "../../types/brand.types.tsx";
import {CategoryDTO} from "../../types/category.types.tsx";

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const { categorySlug, brandSlug } = useParams<{ categorySlug?: string; brandSlug?: string }>();
    const [searchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const initialLoadComplete = useRef(false);
    const lastSearchParams = useRef('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevCategorySlug = useRef<string | undefined>(categorySlug);
    const prevBrandSlug = useRef<string | undefined>(brandSlug);
    const [allCategories, setAllCategories] = useState<CategoryDTO[]>([]);

    const {
        products,
        loading,
        totalProducts,
        error,
        currentPage,
        pageSize,
        totalPages,
        searchTerm,
        // Original single selection properties
        selectedCategory,
        selectedBrand,
        // New array properties (may be undefined if not supported yet)
        selectedCategories = [],
        selectedBrands = [],
        priceRange,
        sortBy,
        sortDir,
        updatePage,
        resetFilters,
        applyFilters,
    } = useProduct();

    // Get category and brand information
    const {
        getCategoryBySlug,
        getBrandBySlug,
        selectedCategory: categoryDetail,
        selectedBrand: brandDetail,
        getCategoryBreadcrumb,
        activeParentCategories,
        activeBrands,
        loadInitialData,
        // Use this to get all categories including subcategories
        getCategoryWithSubcategories
    } = useBrandCategory();

    // Handle URL params change
    useEffect(() => {
        // Only trigger this effect if URL params actually changed
        if (categorySlug === prevCategorySlug.current && brandSlug === prevBrandSlug.current) {
            return;
        }

        // Track the current slugs for the next render
        prevCategorySlug.current = categorySlug;
        prevBrandSlug.current = brandSlug;

        const initFromUrl = async () => {
            try {
                // If we're accessing a category page
                if (categorySlug) {
                    const category = await getCategoryBySlug(categorySlug) as CategoryDTO | null;
                    if (category) {
                        await getCategoryBreadcrumb(category.categoryId);

                        // Create a filter params object (properly typed)
                        const filterParams: ProductFilterParams = {
                            categoryId: category.categoryId,
                            page: 0
                        };

                        applyFilters(filterParams);
                    }
                }
                // If we're accessing a brand page
                else if (brandSlug) {
                    const brand = await getBrandBySlug(brandSlug) as BrandDTO | null;
                    if (brand) {
                        // Create a filter params object (properly typed)
                        const filterParams: ProductFilterParams = {
                            brandId: brand.brandId,
                            page: 0
                        };

                        applyFilters(filterParams);
                    }
                }
                // Reset when no slug is present (going to /products)
                else if (!searchParams.toString()) {
                    resetFilters();
                }
            } catch (error) {
                console.error('Error initializing from URL:', error);
                toast.error('Đã xảy ra lỗi khi tải dữ liệu');
            }
        };

        initFromUrl();
    }, [categorySlug, brandSlug, getCategoryBySlug, getBrandBySlug, getCategoryBreadcrumb, applyFilters, resetFilters, searchParams]);

    // Initial data load - updated to fetch all categories and subcategories
    useEffect(() => {
        const loadInitialDataOnce = async () => {
            if (!activeParentCategories?.length || !activeBrands?.length) {
                try {
                    console.log('Loading initial category and brand data...');
                    const { categories } = await loadInitialData();
                    console.log('Initial data loaded successfully');

                    // Create a flattened array of all categories, including subcategories
                    const fetchSubcategories = async () => {
                        const allCategoriesArray: CategoryDTO[] = [...(categories || [])];

                        // Fetch subcategories for each parent category
                        if (categories && categories.length > 0) {
                            for (const category of categories) {
                                try {
                                    // Fetch subcategories hierarchy for this parent category
                                    const hierarchy = await getCategoryWithSubcategories(category.categoryId);
                                    if (hierarchy && hierarchy.subcategories) {
                                        // Add all subcategories to our flattened array
                                        allCategoriesArray.push(...hierarchy.subcategories);
                                    }
                                } catch (err) {
                                    console.error(`Error loading subcategories for ${category.name}:`, err);
                                }
                            }
                        }

                        console.log(`Loaded ${allCategoriesArray.length} total categories`);
                        setAllCategories(allCategoriesArray);
                    };

                    fetchSubcategories();
                } catch (error) {
                    console.error('Error loading initial data:', error);
                    toast.error('Đã xảy ra lỗi khi tải dữ liệu danh mục và thương hiệu');
                }
            } else {
                console.log('Using cached category and brand data');

                // Even with cached parent categories, ensure we have all subcategories
                const fetchSubcategoriesForCached = async () => {
                    const allCategoriesArray: CategoryDTO[] = [...(activeParentCategories || [])];

                    if (activeParentCategories && activeParentCategories.length > 0) {
                        for (const category of activeParentCategories) {
                            try {
                                const hierarchy = await getCategoryWithSubcategories(category.categoryId);
                                if (hierarchy && hierarchy.subcategories) {
                                    allCategoriesArray.push(...hierarchy.subcategories);
                                }
                            } catch (err) {
                                console.error(`Error loading subcategories for ${category.name}:`, err);
                            }
                        }
                    }

                    setAllCategories(allCategoriesArray);
                };

                fetchSubcategoriesForCached();
            }
        };

        loadInitialDataOnce();
    }, [loadInitialData, activeParentCategories, activeBrands, getCategoryWithSubcategories]);

    // Handle search params update
    useEffect(() => {
        const currentSearchString = searchParams.toString();
        if (currentSearchString === lastSearchParams.current && initialLoadComplete.current) {
            return;
        }

        lastSearchParams.current = currentSearchString;

        // Skip if we're on a category or brand page
        if (categorySlug || brandSlug) {
            initialLoadComplete.current = true;
            return;
        }

        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category') || '0') : undefined;
        const brandId = searchParams.get('brand') ? parseInt(searchParams.get('brand') || '0') : undefined;
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') || '0') : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') || '0') : undefined;
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : 0;
        const urlSortBy = searchParams.get('sortBy') || 'createdAt';
        const urlSortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

        // Create a properly typed filter params object
        const filterParams: ProductFilterParams = {
            page,
            sortBy: urlSortBy,
            sortDir: urlSortDir,
        };

        if (search) filterParams.search = search;
        if (categoryId) filterParams.categoryId = categoryId;
        if (brandId) filterParams.brandId = brandId;
        if (minPrice) filterParams.minPrice = minPrice;
        if (maxPrice) filterParams.maxPrice = maxPrice;

        applyFilters(filterParams)
            .then(() => {
                initialLoadComplete.current = true;
            })
            .catch((err) => {
                console.error('Error applying filters from search params:', err);
                toast.error('Đã xảy ra lỗi khi tải sản phẩm');
            });
    }, [searchParams, applyFilters, categorySlug, brandSlug]);

    // Update URL based on filters
    useEffect(() => {
        if (!initialLoadComplete.current) return;

        // Skip URL updates if we're on a category or brand page
        if (categorySlug || brandSlug) return;

        const params = new URLSearchParams();
        if (currentPage > 0) params.set('page', currentPage.toString());
        if (pageSize !== 12) params.set('size', pageSize.toString());
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory.toString());
        if (selectedBrand) params.set('brand', selectedBrand.toString());
        if (priceRange.min) params.set('minPrice', priceRange.min.toString());
        if (priceRange.max) params.set('maxPrice', priceRange.max.toString());
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortDir !== 'desc') params.set('sortDir', sortDir);

        const currentSearch = searchParams.toString();
        const newSearch = params.toString();
        if (currentSearch !== newSearch) {
            lastSearchParams.current = newSearch;
            navigate({ search: newSearch }, { replace: true });
        }
    }, [currentPage, pageSize, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, sortDir, navigate, searchParams, categorySlug, brandSlug]);

    // Scroll to top when changing page
    const handlePageChange = useCallback((page: number) => {
        updatePage(page);

        // Scroll to top of product section with smooth animation
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [updatePage]);

    // Reset all filters
    const handleFilterReset = useCallback(() => {
        resetFilters();
        lastSearchParams.current = '';

        // If we're on a category or brand page, navigate to products page
        if (categorySlug || brandSlug) {
            navigate('/products', { replace: true });
        } else {
            navigate('/products', { replace: true });
        }

        toast.success('Đã xóa tất cả bộ lọc');
    }, [resetFilters, navigate, categorySlug, brandSlug]);

    // Handle filter changes
    const handleFilterChange = useCallback((filters: {
        categoryId?: number | null;
        brandId?: number | null;
        categoryIds?: number[] | null;  // Support for multiple categories
        brandIds?: number[] | null;     // Support for multiple brands
        minPrice?: number | null;
        maxPrice?: number | null;
        searchTerm?: string;
    }) => {
        // Type-safe filter application
        const filterParams: ProductFilterParams = { page: 0 };

        // Handle search term
        if (filters.searchTerm !== undefined) {
            filterParams.search = filters.searchTerm;
        }

        // Handle categories - support both single and multiple
        if (filters.categoryIds !== undefined) {
            filterParams.categoryIds = filters.categoryIds;
        } else if (filters.categoryId !== undefined) {
            filterParams.categoryId = filters.categoryId !== null ? filters.categoryId : undefined;
        }

        // Handle brands - support both single and multiple
        if (filters.brandIds !== undefined) {
            filterParams.brandIds = filters.brandIds;
        } else if (filters.brandId !== undefined) {
            filterParams.brandId = filters.brandId !== null ? filters.brandId : undefined;
        }

        // Handle price range
        if (filters.minPrice !== undefined) {
            filterParams.minPrice = filters.minPrice !== null ? filters.minPrice : undefined;
        }
        if (filters.maxPrice !== undefined) {
            filterParams.maxPrice = filters.maxPrice !== null ? filters.maxPrice : undefined;
        }

        // Include sort settings
        if (sortBy) filterParams.sortBy = sortBy;
        if (sortDir) filterParams.sortDir = sortDir;

        applyFilters(filterParams).catch((err) => {
            console.error('Error applying filters:', err);
            toast.error('Đã xảy ra lỗi khi lọc sản phẩm');
        });
    }, [applyFilters, sortBy, sortDir]);

    // Handle view mode change
    const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
    }, []);

    // Animation variants
    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };


    return (
        <motion.div
            className="min-h-screen transition-colors duration-300"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Main Content with Enhanced Background */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <motion.div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    variants={contentVariants}
                    ref={scrollRef}
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        {/* Breadcrumb */}
                        {(categoryDetail || brandDetail) && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 overflow-x-auto whitespace-nowrap py-1">
                                <button
                                    className="hover:text-primary dark:hover:text-accent transition-colors duration-200"
                                    onClick={() => navigate('/')}
                                >
                                    Trang chủ
                                </button>
                                <FiChevronRight className="mx-2" />

                                <button
                                    className="hover:text-primary dark:hover:text-accent transition-colors duration-200"
                                    onClick={() => navigate('/products')}
                                >
                                    Sản phẩm
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 p-6">
                        {/* Filters - Desktop */}
                        <motion.div
                            className="hidden lg:block w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-5 shadow-inner"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <ProductFilters
                                selectedCategories={selectedCategory ? [selectedCategory] : selectedCategories}
                                selectedBrands={selectedBrand ? [selectedBrand] : selectedBrands}
                                priceRange={priceRange}
                                onFilterChange={handleFilterChange}
                                onResetFilters={handleFilterReset}
                                categories={activeParentCategories || []}
                                brands={activeBrands || []}
                                allCategories={allCategories}
                            />
                        </motion.div>

                        {/* Filters - Mobile */}
                        <AnimatePresence>
                            {mobileFiltersOpen && (
                                <>
                                    <motion.div
                                        className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-60"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        onClick={() => setMobileFiltersOpen(false)}
                                    />
                                    <motion.div
                                        className="lg:hidden fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl"
                                        initial={{ x: "-100%" }}
                                        animate={{ x: 0 }}
                                        exit={{ x: "-100%" }}
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    >
                                        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bộ lọc sản phẩm</h2>
                                            <button
                                                type="button"
                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
                                                onClick={() => setMobileFiltersOpen(false)}
                                            >
                                                <svg
                                                    className="h-6 w-6"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
                                            <ProductFilters
                                                selectedCategories={selectedCategory ? [selectedCategory] : selectedCategories}
                                                selectedBrands={selectedBrand ? [selectedBrand] : selectedBrands}
                                                priceRange={priceRange}
                                                onFilterChange={handleFilterChange}
                                                onResetFilters={handleFilterReset}
                                                isMobile
                                                onClose={() => setMobileFiltersOpen(false)}
                                                categories={activeParentCategories || []}
                                                brands={activeBrands || []}
                                                allCategories={allCategories}
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Mobile filter button */}
                                <div className="lg:hidden">
                                    <motion.button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-all duration-200"
                                        onClick={() => setMobileFiltersOpen(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiFilter className="mr-2 h-5 w-5" />
                                        Bộ lọc
                                    </motion.button>
                                </div>

                                {/* Controls: View Mode Toggle + Reset Filters */}
                                <div className="flex items-center space-x-2">
                                    {/* View mode toggle - UPDATED TO BE SMALLER */}
                                    <div className="flex shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            className={`p-1.5 ${
                                                viewMode === 'grid'
                                                    ? 'bg-primary text-white shadow-inner'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } transition-all duration-200 ease-in-out`}
                                            onClick={() => handleViewModeChange('grid')}
                                            title="Chế độ lưới"
                                        >
                                            <FiGrid className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`p-1.5 ${
                                                viewMode === 'list'
                                                    ? 'bg-primary text-white shadow-inner'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } transition-all duration-200 ease-in-out`}
                                            onClick={() => handleViewModeChange('list')}
                                            title="Chế độ danh sách"
                                        >
                                            <FiList className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Reset filters button - UPDATED TO BE SMALLER */}
                                    <motion.button
                                        type="button"
                                        className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        onClick={handleFilterReset}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Đặt lại bộ lọc"
                                    >
                                        <FiRefreshCw className="h-4 w-4" />
                                    </motion.button>
                                </div>

                                {/* Sorting */}
                                <div className="w-full sm:w-64">
                                    <ProductSorting />
                                </div>
                            </div>

                            {/* Top Pagination for many products */}
                            {!loading && products.length > 0 && totalPages > 1 && (
                                <div className="mb-6">
                                    <ProductPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}

                            {/* Product Content */}
                            {loading && products.length === 0 ? (
                                <div className="flex justify-center items-center py-16">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <LoadingSpinner />
                                        <p className="mt-4 text-gray-500 dark:text-gray-400 text-center">Đang tải sản phẩm...</p>
                                    </motion.div>
                                </div>
                            ) : error ? (
                                <EmptyState
                                    title="Đã xảy ra lỗi"
                                    description="Không thể tải sản phẩm. Vui lòng thử lại sau."
                                    action={{ label: 'Thử lại', onClick: () => window.location.reload() }}
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    }
                                />
                            ) : products.length > 0 ? (
                                <>
                                    <div className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner duration-300 ${loading ? 'opacity-70' : 'opacity-100'}`}>
                                        <ProductGrid
                                            products={products}
                                            loading={loading}
                                            viewMode={viewMode}
                                            onViewModeChange={handleViewModeChange}
                                            categories={activeParentCategories || []}
                                            brands={activeBrands || []}
                                        />
                                    </div>

                                    {/* Bottom Pagination */}
                                    <div className="mt-8">
                                        <ProductPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>

                                    {/* Products count summary */}
                                    {totalProducts > 0 && (
                                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Hiển thị {Math.min(currentPage * pageSize + 1, totalProducts)} - {Math.min((currentPage + 1) * pageSize, totalProducts)} trên tổng số {totalProducts} sản phẩm
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyState
                                    title="Không tìm thấy sản phẩm"
                                    description="Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn."
                                    action={{ label: 'Xóa bộ lọc', onClick: handleFilterReset }}
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            <path d="M15 15l-4-4" />
                                        </svg>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProductsPage;