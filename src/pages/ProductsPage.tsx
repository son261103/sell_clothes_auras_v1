import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useProduct from '../hooks/useProduct';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import ProductSorting from '../components/products/ProductSorting';
import ProductPagination from '../components/products/ProductPagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { FiFilter } from 'react-icons/fi';

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const initialLoadComplete = useRef(false);
    const lastSearchParams = useRef('');

    const {
        products,
        loading,
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
        resetFilters,
        applyFilters,
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterReset = () => {
        resetFilters();
        lastSearchParams.current = '';
        navigate('/products', { replace: true });
    };

    const handleFilterChange = (filters: {
        categoryId?: number | null;
        brandId?: number | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        searchTerm?: string;
    }) => {
        applyFilters({ ...filters, sortBy, sortDir }).catch((err) => {
            console.error('Error applying filters:', err);
            toast.error('Đã xảy ra lỗi khi lọc sản phẩm');
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Main Content with Enhanced Background */}
            <div className="container mx-auto px-4 py-4">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-8 p-6">
                        {/* Filters - Desktop */}
                        <div className="hidden lg:block w-60 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-inner">
                            <ProductFilters
                                selectedCategory={selectedCategory}
                                selectedBrand={selectedBrand}
                                priceRange={priceRange}
                                onFilterChange={handleFilterChange}
                                onResetFilters={handleFilterReset}
                            />
                        </div>

                        {/* Filters - Mobile */}
                        <div
                            className={`lg:hidden fixed inset-0 z-50 transform ${
                                mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
                            } transition-transform duration-300 ease-in-out`}
                        >
                            <div className="relative w-full max-w-sm h-full bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto border-r border-gray-200 dark:border-gray-700">
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
                                <div className="p-6">
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
                            </div>
                            <div
                                className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
                                onClick={() => setMobileFiltersOpen(false)}
                            ></div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Mobile Filter Button */}
                                <button
                                    type="button"
                                    className="lg:hidden inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-all duration-200"
                                    onClick={() => setMobileFiltersOpen(true)}
                                >
                                    <FiFilter className="mr-2 h-5 w-5" />
                                    Bộ lọc sản phẩm
                                </button>

                                {/* Sorting */}
                                <div className="w-full sm:w-64">
                                    <ProductSorting />
                                </div>
                            </div>

                            {/* Product Content */}
                            {loading && products.length === 0 ? (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner transition-all duration-300">
                                        <ProductGrid products={products} loading={loading} />
                                    </div>
                                    <div className="mt-8">
                                        <ProductPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    title="Không tìm thấy sản phẩm"
                                    description="Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn."
                                    action={{ label: 'Xóa bộ lọc', onClick: handleFilterReset }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;