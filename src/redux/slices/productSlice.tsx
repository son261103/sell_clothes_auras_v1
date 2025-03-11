import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ProductResponseDTO,
    ProductImageResponseDTO,
    ProductVariantResponseDTO,
    PageResponse
} from '../../types/product.types';
import { CategoryDTO } from '../../types/category.types';
import { BrandDTO } from "../../types/brand.types.tsx";

interface ProductState {
    products: ProductResponseDTO[];
    totalProducts: number;
    loading: boolean;
    error: string | null;
    selectedProduct: ProductResponseDTO | null;
    productImages: ProductImageResponseDTO[];
    productVariants: ProductVariantResponseDTO[];
    relatedProducts: ProductResponseDTO[];
    featuredProducts: ProductResponseDTO[];
    latestProducts: ProductResponseDTO[];
    onSaleProducts: ProductResponseDTO[];
    categories: CategoryDTO[];
    brands: BrandDTO[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    searchTerm: string;
    // Thay đổi từ single value thành array
    selectedCategories: number[];
    selectedBrands: number[];
    priceRange: {
        min: number | null;
        max: number | null;
    };
    lastRequestTimestamp: number;
    sortBy: string;
    sortDir: 'asc' | 'desc';
}

const initialState: ProductState = {
    products: [],
    totalProducts: 0,
    loading: false,
    error: null,
    selectedProduct: null,
    productImages: [],
    productVariants: [],
    relatedProducts: [],
    featuredProducts: [],
    latestProducts: [],
    onSaleProducts: [],
    categories: [],
    brands: [],
    currentPage: 0,
    pageSize: 12,
    totalPages: 0,
    searchTerm: '',
    // Khởi tạo mảng rỗng thay vì null
    selectedCategories: [],
    selectedBrands: [],
    priceRange: { min: null, max: null },
    lastRequestTimestamp: 0,
    sortBy: 'createdAt',
    sortDir: 'desc'
};

const ensureProductData = (product: ProductResponseDTO): ProductResponseDTO => {
    if (!product) return product;
    return {
        ...product,
        category: product.category || {
            categoryId: 0,
            name: 'Unknown Category',
            slug: 'unknown-category',
            status: true,
            level: 0
        },
        brand: product.brand || {
            brandId: 0,
            name: 'Unknown Brand',
            slug: 'unknown-brand',
            status: true
        }
    };
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        fetchProductsStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },
        fetchProductsSuccess(state, action: PayloadAction<PageResponse<ProductResponseDTO>>) {
            state.loading = false;
            if (action.payload.content) {
                state.products = action.payload.content.map(product => ensureProductData(product));
            } else {
                state.products = [];
                console.error('Products payload missing content array', action.payload);
            }
            state.totalProducts = action.payload.totalElements || 0;
            state.currentPage = action.payload.number || 0;
            state.pageSize = action.payload.size || 12;
            state.totalPages = action.payload.totalPages || 0;
        },
        fetchProductsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        fetchProductDetailStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchProductDetailSuccess(state, action: PayloadAction<ProductResponseDTO>) {
            state.loading = false;
            state.selectedProduct = ensureProductData(action.payload);
        },
        fetchProductImagesSuccess(state, action: PayloadAction<ProductImageResponseDTO[]>) {
            state.productImages = action.payload;
        },
        fetchProductVariantsSuccess(state, action: PayloadAction<ProductVariantResponseDTO[]>) {
            state.productVariants = action.payload;
        },
        fetchRelatedProductsSuccess(state, action: PayloadAction<ProductResponseDTO[]>) {
            state.relatedProducts = action.payload.map(product => ensureProductData(product));
        },
        clearProductDetail(state) {
            state.selectedProduct = null;
            state.productImages = [];
            state.productVariants = [];
            state.relatedProducts = [];
        },
        fetchFeaturedProductsSuccess(state, action: PayloadAction<ProductResponseDTO[]>) {
            state.featuredProducts = action.payload.map(product => ensureProductData(product));
        },
        fetchLatestProductsSuccess(state, action: PayloadAction<ProductResponseDTO[]>) {
            state.latestProducts = action.payload.map(product => ensureProductData(product)).slice(0, 8);
        },
        fetchOnSaleProductsSuccess(state, action: PayloadAction<PageResponse<ProductResponseDTO>>) {
            if (action.payload.content) {
                state.onSaleProducts = action.payload.content.map(product => ensureProductData(product));
            } else {
                state.onSaleProducts = [];
            }
        },
        fetchCategoriesSuccess(state, action: PayloadAction<CategoryDTO[]>) {
            state.categories = action.payload;
        },
        fetchBrandsSuccess(state, action: PayloadAction<BrandDTO[]>) {
            state.brands = action.payload;
        },
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
            // Reset về trang đầu khi thay đổi searchTerm
            state.currentPage = 0;
        },

        // Thay đổi từ việc lưu trữ single value thành array
        setCategoryIds(state, action: PayloadAction<number[] | null>) {
            state.selectedCategories = action.payload ? [...action.payload] : [];
            // Reset về trang đầu khi thay đổi danh mục
            state.currentPage = 0;
        },

        // Thêm action để thêm một category vào mảng nếu chưa có
        addCategoryId(state, action: PayloadAction<number>) {
            if (!state.selectedCategories.includes(action.payload)) {
                state.selectedCategories.push(action.payload);
                state.currentPage = 0;
            }
        },

        // Thêm action để xóa một category khỏi mảng
        removeCategoryId(state, action: PayloadAction<number>) {
            state.selectedCategories = state.selectedCategories.filter(id => id !== action.payload);
            state.currentPage = 0;
        },

        // Giữ lại action cũ cho tương thích ngược
        setSelectedCategory(state, action: PayloadAction<number | null>) {
            if (action.payload === null) {
                state.selectedCategories = [];
            } else {
                state.selectedCategories = [action.payload];
            }
            state.currentPage = 0;
        },

        // Thay đổi từ việc lưu trữ single value thành array
        setBrandIds(state, action: PayloadAction<number[] | null>) {
            state.selectedBrands = action.payload ? [...action.payload] : [];
            // Reset về trang đầu khi thay đổi thương hiệu
            state.currentPage = 0;
        },

        // Thêm action để thêm một brand vào mảng nếu chưa có
        addBrandId(state, action: PayloadAction<number>) {
            if (!state.selectedBrands.includes(action.payload)) {
                state.selectedBrands.push(action.payload);
                state.currentPage = 0;
            }
        },

        // Thêm action để xóa một brand khỏi mảng
        removeBrandId(state, action: PayloadAction<number>) {
            state.selectedBrands = state.selectedBrands.filter(id => id !== action.payload);
            state.currentPage = 0;
        },

        // Giữ lại action cũ cho tương thích ngược
        setSelectedBrand(state, action: PayloadAction<number | null>) {
            if (action.payload === null) {
                state.selectedBrands = [];
            } else {
                state.selectedBrands = [action.payload];
            }
            state.currentPage = 0;
        },

        setPriceRange(state, action: PayloadAction<{ min: number | null; max: number | null }>) {
            state.priceRange = action.payload;
            state.currentPage = 0;
        },

        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },

        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
            state.currentPage = 0;
        },

        setSortBy(state, action: PayloadAction<string>) {
            state.sortBy = action.payload;
            state.currentPage = 0;
        },

        setSortDir(state, action: PayloadAction<'asc' | 'desc'>) {
            state.sortDir = action.payload;
            state.currentPage = 0;
        },

        // Action hỗ trợ thiết lập cả sortBy và sortDir cùng lúc
        setSorting(state, action: PayloadAction<{ sortBy: string; sortDir: 'asc' | 'desc' }>) {
            state.sortBy = action.payload.sortBy;
            state.sortDir = action.payload.sortDir;
            state.currentPage = 0;
        },

        clearFilters(state) {
            state.searchTerm = '';
            state.selectedCategories = [];
            state.selectedBrands = [];
            state.priceRange = { min: null, max: null };
            state.currentPage = 0;
            state.sortBy = 'createdAt';
            state.sortDir = 'desc';
        }
    }
});

export const {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
    fetchProductDetailStart,
    fetchProductDetailSuccess,
    fetchProductImagesSuccess,
    fetchProductVariantsSuccess,
    fetchRelatedProductsSuccess,
    clearProductDetail,
    fetchFeaturedProductsSuccess,
    fetchLatestProductsSuccess,
    fetchOnSaleProductsSuccess,
    fetchCategoriesSuccess,
    fetchBrandsSuccess,
    setSearchTerm,
    // Export các action mới
    setCategoryIds,
    addCategoryId,
    removeCategoryId,
    setBrandIds,
    addBrandId,
    removeBrandId,
    // Giữ lại các action cũ cho tương thích ngược
    setSelectedCategory,
    setSelectedBrand,
    setPriceRange,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortDir,
    setSorting,
    clearFilters
} = productSlice.actions;

export default productSlice.reducer;