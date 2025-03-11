import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Basic selectors for brands
export const selectBrands = (state: RootState) => state.brandCategory.brands;
export const selectSelectedBrand = (state: RootState) => state.brandCategory.selectedBrand;
export const selectBrandHierarchy = (state: RootState) => state.brandCategory.brandHierarchy;
export const selectBrandStatistics = (state: RootState) => state.brandCategory.brandStatistics;

// Basic selectors for categories
export const selectParentCategories = (state: RootState) => state.brandCategory.parentCategories;
export const selectSubCategories = (state: RootState) => state.brandCategory.subCategories;
export const selectSelectedCategory = (state: RootState) => state.brandCategory.selectedCategory;
export const selectCategoryHierarchy = (state: RootState) => state.brandCategory.categoryHierarchy;
export const selectCategoryBreadcrumb = (state: RootState) => state.brandCategory.categoryBreadcrumb;

// UI state selectors
export const selectBrandCategoryLoading = (state: RootState) => state.brandCategory.loading;
export const selectBrandCategoryError = (state: RootState) => state.brandCategory.error;
export const selectLastRequestTimestamp = (state: RootState) => state.brandCategory.lastRequestTimestamp;

// Filter state selectors
export const selectBrandSearchTerm = (state: RootState) => state.brandCategory.brandSearchTerm;
export const selectCategorySearchTerm = (state: RootState) => state.brandCategory.categorySearchTerm;
export const selectSelectedCategoryId = (state: RootState) => state.brandCategory.selectedCategoryId;
export const selectSelectedBrandId = (state: RootState) => state.brandCategory.selectedBrandId;
export const selectShowActiveOnly = (state: RootState) => state.brandCategory.showActiveOnly;

// Combined selectors
export const selectBrandFilters = (state: RootState) => ({
    searchTerm: state.brandCategory.brandSearchTerm,
    selectedBrandId: state.brandCategory.selectedBrandId,
    showActiveOnly: state.brandCategory.showActiveOnly
});

export const selectCategoryFilters = (state: RootState) => ({
    searchTerm: state.brandCategory.categorySearchTerm,
    selectedCategoryId: state.brandCategory.selectedCategoryId,
    showActiveOnly: state.brandCategory.showActiveOnly
});

export const selectBrandDetail = (state: RootState) => ({
    brand: state.brandCategory.selectedBrand,
    loading: state.brandCategory.loading,
    error: state.brandCategory.error
});

// Cập nhật để xử lý trường hợp category có thể là null
export const selectCategoryDetail = (state: RootState) => ({
    category: state.brandCategory.selectedCategory,
    subcategories: state.brandCategory.categoryHierarchy?.subcategories || [],
    breadcrumb: state.brandCategory.categoryBreadcrumb,
    loading: state.brandCategory.loading,
    error: state.brandCategory.error
});

// Utility selectors
export const selectHasBrands = (state: RootState) => state.brandCategory.brands.length > 0;
export const selectHasParentCategories = (state: RootState) => state.brandCategory.parentCategories.length > 0;
export const selectHasSubCategories = (state: RootState) => state.brandCategory.subCategories.length > 0;
export const selectIsBrandDetailLoaded = (state: RootState) => !!state.brandCategory.selectedBrand;
export const selectIsCategoryDetailLoaded = (state: RootState) => !!state.brandCategory.selectedCategory;

// Memoized selectors for filtered data
export const selectActiveBrands = createSelector(
    [selectBrands],
    (brands) => brands.filter(brand => brand.status)
);

export const selectActiveParentCategories = createSelector(
    [selectParentCategories],
    (categories) => categories.filter(category => category.status)
);

export const selectActiveSubCategories = createSelector(
    [selectSubCategories],
    (subcategories) => subcategories.filter(subcategory => subcategory.status)
);

export const selectFilteredBrands = createSelector(
    [selectBrands, selectBrandSearchTerm, selectShowActiveOnly],
    (brands, searchTerm, showActiveOnly) => {
        let filtered = brands;

        // Filter by active status if needed
        if (showActiveOnly) {
            filtered = filtered.filter(brand => brand.status);
        }

        // Filter by search term if provided
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(brand =>
                brand.name.toLowerCase().includes(lowerSearch) ||
                brand.slug.toLowerCase().includes(lowerSearch) ||
                (brand.description && brand.description.toLowerCase().includes(lowerSearch))
            );
        }

        return filtered;
    }
);

export const selectFilteredCategories = createSelector(
    [selectParentCategories, selectCategorySearchTerm, selectShowActiveOnly],
    (categories, searchTerm, showActiveOnly) => {
        let filtered = categories;

        // Filter by active status if needed
        if (showActiveOnly) {
            filtered = filtered.filter(category => category.status);
        }

        // Filter by search term if provided
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(lowerSearch) ||
                category.slug.toLowerCase().includes(lowerSearch) ||
                (category.description && category.description.toLowerCase().includes(lowerSearch))
            );
        }

        return filtered;
    }
);

export const selectFilteredSubCategories = createSelector(
    [selectSubCategories, selectCategorySearchTerm, selectShowActiveOnly],
    (subcategories, searchTerm, showActiveOnly) => {
        let filtered = subcategories;

        // Filter by active status if needed
        if (showActiveOnly) {
            filtered = filtered.filter(subcategory => subcategory.status);
        }

        // Filter by search term if provided
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(subcategory =>
                subcategory.name.toLowerCase().includes(lowerSearch) ||
                subcategory.slug.toLowerCase().includes(lowerSearch) ||
                (subcategory.description && subcategory.description.toLowerCase().includes(lowerSearch))
            );
        }

        return filtered;
    }
);

// Find brand by ID
export const makeSelectBrandById = () =>
    createSelector(
        [selectBrands, (_: RootState, brandId: number) => brandId],
        (brands, brandId) => brands.find(brand => brand.brandId === brandId) || null
    );

// Find category by ID
export const makeSelectCategoryById = () =>
    createSelector(
        [
            (state: RootState) => [...state.brandCategory.parentCategories, ...state.brandCategory.subCategories],
            (_: RootState, categoryId: number) => categoryId
        ],
        (allCategories, categoryId) => allCategories.find(category => category.categoryId === categoryId) || null
    );

// For navigation - get categories with their subcategories for menu display
// Cập nhật để xử lý tạo bản sao sâu
export const selectCategoriesWithSubcategories = createSelector(
    [selectParentCategories, selectSubCategories],
    (parentCategories, subCategories) => {
        return parentCategories.map(parent => {
            // Tạo bản sao sâu để tránh lỗi "object is not extensible"
            const subcategories = subCategories
                .filter(sub => sub.parentId === parent.categoryId)
                .map(sub => ({ ...sub }));

            return {
                ...parent,
                subcategories
            };
        });
    }
);