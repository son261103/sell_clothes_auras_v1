import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    BrandResponseDTO,
    BrandHierarchyDTO,
    BrandStatisticsDTO
} from '../../types/brand.types';
import {
    CategoryResponseDTO,
    CategoryHierarchyDTO,
    CategoryApiResponseDTO // Thêm import mới
} from '../../types/category.types';

interface BrandCategoryState {
    // Brands
    brands: BrandResponseDTO[];
    selectedBrand: BrandResponseDTO | null;
    brandHierarchy: BrandHierarchyDTO | null;
    brandStatistics: BrandStatisticsDTO | null;

    // Categories
    parentCategories: CategoryResponseDTO[];
    subCategories: CategoryResponseDTO[];
    selectedCategory: CategoryResponseDTO | null;
    categoryHierarchy: CategoryHierarchyDTO | null;
    categoryBreadcrumb: CategoryResponseDTO[];

    // UI State
    loading: boolean;
    error: string | null;
    lastRequestTimestamp: number;

    // Filter State
    brandSearchTerm: string;
    categorySearchTerm: string;
    selectedCategoryId: number | null;
    selectedBrandId: number | null;
    showActiveOnly: boolean;
}

const initialState: BrandCategoryState = {
    // Brands
    brands: [],
    selectedBrand: null,
    brandHierarchy: null,
    brandStatistics: null,

    // Categories
    parentCategories: [],
    subCategories: [],
    selectedCategory: null,
    categoryHierarchy: null,
    categoryBreadcrumb: [],

    // UI State
    loading: false,
    error: null,
    lastRequestTimestamp: 0,

    // Filter State
    brandSearchTerm: '',
    categorySearchTerm: '',
    selectedCategoryId: null,
    selectedBrandId: null,
    showActiveOnly: true
};

const brandCategorySlice = createSlice({
    name: 'brandCategory',
    initialState,
    reducers: {
        // General loading states
        fetchStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },
        fetchFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Brand reducers
        fetchBrandsSuccess(state, action: PayloadAction<BrandResponseDTO[]>) {
            state.loading = false;
            // Tạo bản sao sâu để đảm bảo các đối tượng có thể mở rộng
            state.brands = action.payload.map(brand => ({ ...brand }));
        },
        fetchBrandDetailSuccess(state, action: PayloadAction<BrandResponseDTO>) {
            state.loading = false;
            // Tạo bản sao để đảm bảo đối tượng có thể mở rộng
            state.selectedBrand = { ...action.payload };
        },
        fetchBrandHierarchySuccess(state, action: PayloadAction<BrandHierarchyDTO>) {
            state.loading = false;
            // Tạo bản sao sâu của đối tượng hierarchy
            state.brandHierarchy = {
                ...action.payload,
                brands: action.payload.brands?.map(brand => ({ ...brand })) || []
            };
            state.brandStatistics = action.payload.statistics ? { ...action.payload.statistics } : null;
        },
        clearSelectedBrand(state) {
            state.selectedBrand = null;
        },

        // Category reducers
        fetchParentCategoriesSuccess(state, action: PayloadAction<CategoryResponseDTO[]>) {
            state.loading = false;
            // Tạo bản sao sâu để đảm bảo các đối tượng có thể mở rộng
            state.parentCategories = action.payload.map(category => ({ ...category }));
        },
        fetchSubCategoriesSuccess(state, action: PayloadAction<CategoryResponseDTO[]>) {
            state.loading = false;
            // Tạo bản sao sâu để đảm bảo các đối tượng có thể mở rộng
            state.subCategories = action.payload.map(category => ({ ...category }));
        },
        fetchCategoryDetailSuccess(state, action: PayloadAction<CategoryResponseDTO>) {
            state.loading = false;
            // Tạo bản sao để đảm bảo đối tượng có thể mở rộng
            state.selectedCategory = { ...action.payload };
        },
        fetchCategoryHierarchySuccess(state, action: PayloadAction<CategoryHierarchyDTO | CategoryApiResponseDTO>) {
            state.loading = false;

            // Xử lý cả hai định dạng API (cũ và mới)
            // Chuyển đổi từ API response format sang format mà frontend mong đợi
            let formattedHierarchy: CategoryHierarchyDTO;

            // Kiểm tra nếu đây là API response format (có thể chứa parent/subCategories hoặc category/subcategories)
            if ('parent' in action.payload || 'subCategories' in action.payload) {
                formattedHierarchy = {
                    category: action.payload.parent ? { ...action.payload.parent } : null,
                    subcategories: (action.payload.subCategories || []).map(cat => ({ ...cat }))
                };
            } else if ('category' in action.payload) {
                // Đây là format trực tiếp từ frontend
                formattedHierarchy = {
                    category: action.payload.category ? { ...action.payload.category } : null,
                    subcategories: (action.payload.subcategories || []).map(cat => ({ ...cat }))
                };
            } else {
                // Fallback nếu không phù hợp với bất kỳ định dạng nào
                formattedHierarchy = {
                    category: null,
                    subcategories: []
                };
            }

            state.categoryHierarchy = formattedHierarchy;

            // Update subcategories if they're included in the hierarchy
            if (formattedHierarchy.subcategories && formattedHierarchy.subcategories.length > 0) {
                state.subCategories = formattedHierarchy.subcategories;
            }
        },
        fetchCategoryBreadcrumbSuccess(state, action: PayloadAction<CategoryResponseDTO[]>) {
            // Tạo bản sao sâu để đảm bảo các đối tượng có thể mở rộng
            state.categoryBreadcrumb = action.payload.map(category => ({ ...category }));
        },
        clearSelectedCategory(state) {
            state.selectedCategory = null;
            state.categoryHierarchy = null;
            state.categoryBreadcrumb = [];
        },

        // Filter actions
        setBrandSearchTerm(state, action: PayloadAction<string>) {
            state.brandSearchTerm = action.payload;
        },
        setCategorySearchTerm(state, action: PayloadAction<string>) {
            state.categorySearchTerm = action.payload;
        },
        setSelectedCategoryId(state, action: PayloadAction<number | null>) {
            state.selectedCategoryId = action.payload;
        },
        setSelectedBrandId(state, action: PayloadAction<number | null>) {
            state.selectedBrandId = action.payload;
        },
        setShowActiveOnly(state, action: PayloadAction<boolean>) {
            state.showActiveOnly = action.payload;
        },
        clearFilters(state) {
            state.brandSearchTerm = '';
            state.categorySearchTerm = '';
            state.selectedCategoryId = null;
            state.selectedBrandId = null;
            state.showActiveOnly = true;
        }
    }
});

export const {
    // General actions
    fetchStart,
    fetchFailure,

    // Brand actions
    fetchBrandsSuccess,
    fetchBrandDetailSuccess,
    fetchBrandHierarchySuccess,
    clearSelectedBrand,

    // Category actions
    fetchParentCategoriesSuccess,
    fetchSubCategoriesSuccess,
    fetchCategoryDetailSuccess,
    fetchCategoryHierarchySuccess,
    fetchCategoryBreadcrumbSuccess,
    clearSelectedCategory,

    // Filter actions
    setBrandSearchTerm,
    setCategorySearchTerm,
    setSelectedCategoryId,
    setSelectedBrandId,
    setShowActiveOnly,
    clearFilters
} = brandCategorySlice.actions;

export default brandCategorySlice.reducer;