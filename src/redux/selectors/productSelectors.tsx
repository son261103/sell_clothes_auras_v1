import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Selectors cơ bản không thay đổi
export const selectProducts = (state: RootState) => state.product.products;
export const selectTotalProducts = (state: RootState) => state.product.totalProducts;
export const selectProductLoading = (state: RootState) => state.product.loading;
export const selectProductError = (state: RootState) => state.product.error;

export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct;
export const selectProductImages = (state: RootState) => state.product.productImages;
export const selectProductVariants = (state: RootState) => state.product.productVariants;
export const selectRelatedProducts = (state: RootState) => state.product.relatedProducts;

export const selectFeaturedProducts = (state: RootState) => state.product.featuredProducts;
export const selectLatestProducts = (state: RootState) => state.product.latestProducts;
export const selectOnSaleProducts = (state: RootState) => state.product.onSaleProducts;

export const selectCategories = (state: RootState) => state.product.categories;
export const selectBrands = (state: RootState) => state.product.brands;

export const selectCurrentPage = (state: RootState) => state.product.currentPage;
export const selectPageSize = (state: RootState) => state.product.pageSize;
export const selectTotalPages = (state: RootState) => state.product.totalPages;

export const selectSearchTerm = (state: RootState) => state.product.searchTerm;

// Thêm selectors mới cho mảng danh mục và thương hiệu
export const selectSelectedCategories = (state: RootState) => state.product.selectedCategories;
export const selectSelectedBrands = (state: RootState) => state.product.selectedBrands;

// Giữ lại selectors cũ cho tương thích ngược
export const selectSelectedCategory = (state: RootState) =>
    state.product.selectedCategories.length === 1 ? state.product.selectedCategories[0] : null;
export const selectSelectedBrand = (state: RootState) =>
    state.product.selectedBrands.length === 1 ? state.product.selectedBrands[0] : null;

export const selectPriceRange = (state: RootState) => state.product.priceRange;
export const selectSortBy = (state: RootState) => state.product.sortBy;
export const selectSortDir = (state: RootState) => state.product.sortDir;

export const selectLastRequestTimestamp = (state: RootState) => state.product.lastRequestTimestamp;

// Combined selectors - cập nhật để làm việc với mảng
export const selectProductsWithPagination = (state: RootState) => ({
    products: state.product.products,
    currentPage: state.product.currentPage,
    pageSize: state.product.pageSize,
    totalPages: state.product.totalPages,
    totalProducts: state.product.totalProducts,
});

// Cập nhật để sử dụng mảng thay vì giá trị đơn
export const selectProductFilters = (state: RootState) => ({
    searchTerm: state.product.searchTerm,
    selectedCategories: state.product.selectedCategories,
    selectedBrands: state.product.selectedBrands,
    priceRange: state.product.priceRange,
    sortBy: state.product.sortBy,
    sortDir: state.product.sortDir
});

export const selectProductDetail = (state: RootState) => ({
    product: state.product.selectedProduct,
    images: state.product.productImages,
    variants: state.product.productVariants,
    relatedProducts: state.product.relatedProducts,
    loading: state.product.loading,
    error: state.product.error,
});

export const selectHomepageCollections = (state: RootState) => ({
    featured: state.product.featuredProducts,
    latest: state.product.latestProducts,
    onSale: state.product.onSaleProducts,
});

// Utility selectors
export const selectHasProducts = (state: RootState) => state.product.products.length > 0;
export const selectIsProductDetailLoaded = (state: RootState) => !!state.product.selectedProduct;
export const selectPrimaryProductImage = (state: RootState) =>
    state.product.productImages.find(image => image.isPrimary) ||
    (state.product.productImages.length > 0 ? state.product.productImages[0] : null);

// Thêm selector để hiển thị tên của các danh mục đã chọn
export const selectSelectedCategoryNames = createSelector(
    [selectSelectedCategories, selectCategories],
    (selectedCategoryIds, categories) => {
        if (!selectedCategoryIds || !categories) return [];
        return selectedCategoryIds
            .map(id => categories.find(cat => cat.categoryId === id)?.name)
            .filter(Boolean) as string[];
    }
);

// Thêm selector để hiển thị tên của các thương hiệu đã chọn
export const selectSelectedBrandNames = createSelector(
    [selectSelectedBrands, selectBrands],
    (selectedBrandIds, brands) => {
        if (!selectedBrandIds || !brands) return [];
        return selectedBrandIds
            .map(id => brands.find(brand => brand.brandId === id)?.name)
            .filter(Boolean) as string[];
    }
);

// Thêm selector để lọc danh mục theo từ khóa - Sửa lỗi TS6133 thêm dấu _ vào tham số không sử dụng
export const selectFilteredCategories = createSelector(
    [selectCategories, (_: RootState, keyword: string) => keyword],
    (categories, keyword) => {
        if (!keyword) return categories;
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(keyword.toLowerCase())
        );
    }
);

// Thêm selector để lọc thương hiệu theo từ khóa - Sửa lỗi TS6133 thêm dấu _ vào tham số không sử dụng
export const selectFilteredBrands = createSelector(
    [selectBrands, (_: RootState, keyword: string) => keyword],
    (brands, keyword) => {
        if (!keyword) return brands;
        return brands.filter(brand =>
            brand.name.toLowerCase().includes(keyword.toLowerCase())
        );
    }
);

// Memoized selectors cho sizes và colors
export const selectAvailableSizes = createSelector(
    (state: RootState) => state.product.productVariants,
    (variants) => {
        const sizeSet = new Set<string>();
        variants.forEach(variant => {
            if (variant.size) sizeSet.add(variant.size);
        });
        return Array.from(sizeSet);
    }
);

export const selectAvailableColors = createSelector(
    (state: RootState) => state.product.productVariants,
    (variants) => {
        const colorSet = new Set<string>();
        variants.forEach(variant => {
            if (variant.color) colorSet.add(variant.color);
        });
        return Array.from(colorSet);
    }
);

export const selectIsVariantAvailable = createSelector(
    (state: RootState) => state.product.productVariants,
    (_: RootState, size: string) => size,
    (_: RootState, __: string, color: string) => color,
    (variants, size, color) =>
        variants.some(v => v.size === size && v.color === color && v.stockQuantity > 0 && v.status)
);