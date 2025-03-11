// types/brand.types.ts

// Basic Brand DTO
export interface BrandDTO {
    brandId: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    status: boolean;
}

// Response DTOs
export interface BrandResponseDTO {
    brandId: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Hierarchical structure for brands with statistics
export interface BrandHierarchyDTO {
    brands: BrandResponseDTO[];
    statistics: BrandStatisticsDTO;
}

// Brand statistics
export interface BrandStatisticsDTO {
    totalBrands: number;
    activeBrands: number;
    inactiveBrands: number;
    brandsWithProducts: number;
}

// Request parameters for brand filtering
export interface BrandFilterParams {
    status?: boolean;
    search?: string;
}

// Create and Update DTOs
export interface CreateBrandDTO {
    name: string;
    description?: string;
    logo?: string;
    status?: boolean;
}

export interface UpdateBrandDTO {
    name?: string;
    description?: string;
    logo?: string;
    status?: boolean;
    slug?: string;
}