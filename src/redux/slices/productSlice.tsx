import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ProductResponseDTO,
    ProductImageResponseDTO,
    ProductVariantResponseDTO,
    CategoryDTO,
    BrandDTO,
    PageResponse
} from '../../types/product.types';

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
    selectedCategory: number | null;
    selectedBrand: number | null;
    priceRange: {
        min: number | null;
        max: number | null;
    };
    lastRequestTimestamp: number;
    sortBy: string;  // Thêm sortBy
    sortDir: 'asc' | 'desc';  // Thêm sortDir
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
    selectedCategory: null,
    selectedBrand: null,
    priceRange: { min: null, max: null },
    lastRequestTimestamp: 0,
    sortBy: 'createdAt',  // Mặc định là sắp xếp theo ngày tạo
    sortDir: 'desc'       // Mặc định là giảm dần
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
        },
        setSelectedCategory(state, action: PayloadAction<number | null>) {
            state.selectedCategory = action.payload;
        },
        setSelectedBrand(state, action: PayloadAction<number | null>) {
            state.selectedBrand = action.payload;
        },
        setPriceRange(state, action: PayloadAction<{ min: number | null; max: number | null }>) {
            state.priceRange = action.payload;
        },
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
        },
        setSortBy(state, action: PayloadAction<string>) {  // Thêm reducer cho sortBy
            state.sortBy = action.payload;
        },
        setSortDir(state, action: PayloadAction<'asc' | 'desc'>) {  // Thêm reducer cho sortDir
            state.sortDir = action.payload;
        },
        clearFilters(state) {
            state.searchTerm = '';
            state.selectedCategory = null;
            state.selectedBrand = null;
            state.priceRange = { min: null, max: null };
            state.currentPage = 0;
            state.sortBy = 'createdAt';  // Reset sortBy về mặc định
            state.sortDir = 'desc';      // Reset sortDir về mặc định
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
    setSelectedCategory,
    setSelectedBrand,
    setPriceRange,
    setCurrentPage,
    setPageSize,
    clearFilters,
    setSortBy,  // Export action mới
    setSortDir  // Export action mới
} = productSlice.actions;

export default productSlice.reducer;