import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiRefreshCw, FiGrid, FiList, FiShoppingBag } from 'react-icons/fi';
import useProduct from '../../hooks/useProduct';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSorting from '../../components/products/ProductSorting';
import ProductPagination from '../../components/products/ProductPagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const initialLoadComplete = useRef(false);
    const lastSearchParams = useRef('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        products,
        loading,
        totalProducts,
        error,
        currentPage,
        pageSize,
        totalPages,
        searchTerm,
        selectedCategory,
        selectedBrand,
        priceRange,
        sortBy,
        sortDir,
        updatePage,
        updatePageSize,
        resetFilters,
        applyFilters,
        categories,
        brands
    } = useProduct();

    useEffect(() => {
        const currentSearchString = searchParams.toString();
        if (currentSearchString === lastSearchParams.current && initialLoadComplete.current) {
            return;
        }

        lastSearchParams.current = currentSearchString;

        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category') || '0') : null;
        const brandId = searchParams.get('brand') ? parseInt(searchParams.get('brand') || '0') : null;
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') || '0') : null;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') || '0') : null;
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : 0;
        const urlSortBy = searchParams.get('sortBy') || 'createdAt';
        const urlSortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

        applyFilters({
            searchTerm: search || undefined,
            categoryId,
            brandId,
            minPrice,
            maxPrice,
            page,
            sortBy: urlSortBy,
            sortDir: urlSortDir,
        }).then(() => {
            initialLoadComplete.current = true;
        }).catch((err) => {
            console.error('Error applying filters:', err);
            toast.error('Đã xảy ra lỗi khi tải sản phẩm');
        });
    }, [searchParams, applyFilters]);

    useEffect(() => {
        if (!initialLoadComplete.current) return;

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
    }, [currentPage, pageSize, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, sortDir, navigate, searchParams]);

    const handlePageChange = (page: number) => {
        updatePage(page);

        // Scroll to top of product section with smooth animation
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handlePageSizeChange = (size: number) => {
        updatePageSize(size);
        updatePage(0); // Reset to first page when changing page size
    };

    const handleFilterReset = () => {
        resetFilters();
        lastSearchParams.current = '';
        navigate('/products', { replace: true });
        toast.success('Đã xóa tất cả bộ lọc');
    };

    const handleFilterChange = (filters: {
        categoryId?: number | null;
        brandId?: number | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        searchTerm?: string;
    }) => {
        applyFilters({ ...filters, sortBy, sortDir, page: 0 }).catch((err) => {
            console.error('Error applying filters:', err);
            toast.error('Đã xảy ra lỗi khi lọc sản phẩm');
        });
    };

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

    // Find category and brand names
    const categoryName = categories?.find(c => c.categoryId === selectedCategory)?.name;
    const brandName = brands?.find(b => b.brandId === selectedBrand)?.name;

    // Format price range for display
    const formatPrice = (price: number | null) => {
        if (price === null) return '';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-secondary transition-colors duration-300"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Main Content with Enhanced Background */}
            <div className="container mx-auto px-4 py-6">
                <motion.div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    variants={contentVariants}
                    ref={scrollRef}
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <FiShoppingBag className="mr-2" />
                            {categoryName ? categoryName : 'Tất cả sản phẩm'}
                            {brandName && ` - ${brandName}`}
                        </h1>

                        {/* Applied filters summary */}
                        <div className="mt-2 flex flex-wrap gap-2">
                            {searchTerm && (
                                <div className="inline-flex items-center px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent text-xs rounded-md">
                                    <span>Tìm kiếm: {searchTerm}</span>
                                    <button
                                        className="ml-1.5 text-gray-500 hover:text-primary"
                                        onClick={() => handleFilterChange({ searchTerm: '' })}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}

                            {categoryName && (
                                <div className="inline-flex items-center px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent text-xs rounded-md">
                                    <span>Danh mục: {categoryName}</span>
                                    <button
                                        className="ml-1.5 text-gray-500 hover:text-primary"
                                        onClick={() => handleFilterChange({ categoryId: null })}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}

                            {brandName && (
                                <div className="inline-flex items-center px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent text-xs rounded-md">
                                    <span>Thương hiệu: {brandName}</span>
                                    <button
                                        className="ml-1.5 text-gray-500 hover:text-primary"
                                        onClick={() => handleFilterChange({ brandId: null })}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}

                            {(priceRange.min !== null || priceRange.max !== null) && (
                                <div className="inline-flex items-center px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent text-xs rounded-md">
                                    <span>
                                        Giá: {priceRange.min !== null ? formatPrice(priceRange.min) : 'Min'} - {priceRange.max !== null ? formatPrice(priceRange.max) : 'Max'}
                                    </span>
                                    <button
                                        className="ml-1.5 text-gray-500 hover:text-primary"
                                        onClick={() => handleFilterChange({ minPrice: null, maxPrice: null })}
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}

                            {(searchTerm || categoryName || brandName || priceRange.min !== null || priceRange.max !== null) && (
                                <button
                                    className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                    onClick={handleFilterReset}
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 p-6">
                        {/* Filters - Desktop */}
                        <motion.div
                            className="hidden lg:block w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-5 shadow-inner"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <ProductFilters
                                selectedCategory={selectedCategory}
                                selectedBrand={selectedBrand}
                                priceRange={priceRange}
                                onFilterChange={handleFilterChange}
                                onResetFilters={handleFilterReset}
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
                                                selectedCategory={selectedCategory}
                                                selectedBrand={selectedBrand}
                                                priceRange={priceRange}
                                                onFilterChange={handleFilterChange}
                                                onResetFilters={handleFilterReset}
                                                isMobile
                                                onClose={() => setMobileFiltersOpen(false)}
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Filter and Sort Controls */}
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <motion.button
                                        type="button"
                                        className="lg:hidden inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-all duration-200"
                                        onClick={() => setMobileFiltersOpen(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiFilter className="mr-2 h-5 w-5" />
                                        Bộ lọc
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        onClick={handleFilterReset}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Đặt lại bộ lọc"
                                    >
                                        <FiRefreshCw className="h-5 w-5" />
                                    </motion.button>

                                    {/* View mode toggle */}
                                    <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            className={`p-2 ${
                                                viewMode === 'grid'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                            } transition-colors duration-200`}
                                            onClick={() => setViewMode('grid')}
                                            title="Chế độ lưới"
                                        >
                                            <FiGrid className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`p-2 ${
                                                viewMode === 'list'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                            } transition-colors duration-200`}
                                            onClick={() => setViewMode('list')}
                                            title="Chế độ danh sách"
                                        >
                                            <FiList className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sorting */}
                                <div className="w-full sm:w-64">
                                    <ProductSorting />
                                </div>
                            </div>

                            {/* Product results information */}
                            {!loading && products.length > 0 && (
                                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                                    <div>
                                        Hiển thị {products.length} sản phẩm {totalPages > 1 ? `(trang ${currentPage + 1}/${totalPages})` : ''}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="pageSize" className="text-sm text-gray-500 dark:text-gray-400">
                                            Hiển thị:
                                        </label>
                                        <select
                                            id="pageSize"
                                            className="text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-accent"
                                            value={pageSize}
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        >
                                            <option value={12}>12</option>
                                            <option value={24}>24</option>
                                            <option value={36}>36</option>
                                            <option value={48}>48</option>
                                        </select>
                                    </div>
                                </div>
                            )}

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
                                    <div className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner transition-all duration-300 ${loading ? 'opacity-70' : 'opacity-100'}`}>
                                        <ProductGrid products={products} loading={loading} viewMode={viewMode} />
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