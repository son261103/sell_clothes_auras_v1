// Product Response DTO
import {CategoryDTO} from "./category.types.tsx";
import {BrandDTO} from "./brand.types.tsx";

export interface ProductResponseDTO {
    productId: number;
    name: string;
    description: string;
    slug: string;
    price: number;
    salePrice: number | null;
    status: boolean;
    thumbnail: string | null;
    category: CategoryDTO;
    brand: BrandDTO;
    createdAt: string;
    updatedAt: string;
}

// Product Image DTOs
export interface ProductImageDTO {
    imageUrl: string;
    isPrimary: boolean;
    displayOrder?: number;
}

export interface ProductImageResponseDTO {
    imageId: number;
    productId: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

// Product Variant DTOs
export interface ProductVariantDTO {
    variantId?: number;
    size: string;
    color: string;
    stockQuantity: number;
    status: boolean;
    imageUrl?: string | null;
    sku?: string;
}

export interface ProductVariantResponseDTO {
    variantId: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stockQuantity: number;
    imageUrl: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

// Request parameters for product filtering - cập nhật để hỗ trợ nhiều danh mục và thương hiệu
export interface ProductFilterParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;

    // Giữ lại cho khả năng tương thích ngược
    categoryId?: number | null;
    brandId?: number | null;

    // Sửa để không cho phép undefined (chỉ số hoặc null)
    categoryIds?: number[] | null;
    brandIds?: number[] | null;

    minPrice?: number | null;
    maxPrice?: number | null;
    status?: boolean;
}

// Pagination response interface
export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

// Special collections request types
export interface FeaturedProductsRequest {
    limit?: number;
}

export interface LatestProductsRequest {
    page?: number;
    size?: number;
    limit?: number;
}

export interface RelatedProductsRequest {
    productId: number;
    limit?: number;
}

// Cập nhật để hỗ trợ nhiều danh mục và thương hiệu
export interface ProductSearchRequest {
    keyword: string;
    minPrice?: number | null;
    maxPrice?: number | null;

    // Giữ lại cho khả năng tương thích ngược
    categoryId?: number;
    brandId?: number;

    // Thêm mới để hỗ trợ nhiều danh mục/thương hiệu
    categoryIds?: number[] | null;
    brandIds?: number[] | null;

    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

// Variant availability check
export interface VariantAvailabilityRequest {
    productId: number;
    size: string;
    color: string;
}

export interface VariantAvailabilityResponse {
    available: boolean;
    variantId?: number;
    stockQuantity?: number;
}