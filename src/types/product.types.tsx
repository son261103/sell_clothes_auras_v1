// Product DTO interfaces
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

export interface CategoryDTO {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    status: boolean;
    parentId?: number | null;
    level: number;
}

export interface BrandDTO {
    brandId: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    status: boolean;
}

// Product Image DTO
export interface ProductImageResponseDTO {
    imageId: number;
    productId: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

// Product Variant DTO
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

// Request parameters for product filtering
export interface ProductFilterParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
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

// Special collections response types
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

export interface ProductSearchRequest {
    keyword: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: number;
    brandId?: number;
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
}


// types/product.types.ts
export interface ProductImageDTO {
    imageUrl: string;
    isPrimary: boolean;
}

export interface ProductVariantDTO {
    variantId?: number;
    size: string;
    color: string;
    stockQuantity: number;
    status: boolean;
    imageUrl?: string | null;
    sku?: string;
}

