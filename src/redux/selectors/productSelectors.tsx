import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Selectors cơ bản không thay đổi
export const selectProducts = (state: RootState) => state.product.products;
export const selectTotalProducts = (state: RootState) => state.product.totalProducts;
export const selectProductsLoading = (state: RootState) => state.product.loading;
export const selectProductsError = (state: RootState) => state.product.error;

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
export const selectSelectedCategory = (state: RootState) => state.product.selectedCategory;
export const selectSelectedBrand = (state: RootState) => state.product.selectedBrand;
export const selectPriceRange = (state: RootState) => state.product.priceRange;

export const selectLastRequestTimestamp = (state: RootState) => state.product.lastRequestTimestamp;

// Combined selectors
export const selectProductsWithPagination = (state: RootState) => ({
    products: state.product.products,
    currentPage: state.product.currentPage,
    pageSize: state.product.pageSize,
    totalPages: state.product.totalPages,
    totalProducts: state.product.totalProducts,
});

export const selectProductFilters = (state: RootState) => ({
    searchTerm: state.product.searchTerm,
    selectedCategory: state.product.selectedCategory,
    selectedBrand: state.product.selectedBrand,
    priceRange: state.product.priceRange,
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