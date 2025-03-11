// types/category.types.ts

// Basic Category DTO
export interface CategoryDTO {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    status: boolean;
    parentId?: number | null;
    level: number;
}

// Response DTOs
export interface CategoryResponseDTO {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    status: boolean;
    parentId?: number | null;
    level: number;
    createdAt?: string;
    updatedAt?: string;
}

// API Response format (để mapping với backend)
export interface CategoryApiResponseDTO {
    // Format mới của API
    category?: CategoryResponseDTO | null;
    subcategories?: CategoryResponseDTO[] | null;

    // Format cũ (từ ParentCategoryService.getParentCategoryWithSubs)
    parent?: CategoryResponseDTO | null;
    subCategories?: CategoryResponseDTO[] | null;
    totalSubCategories?: number;
    activeSubCategories?: number;
    inactiveSubCategories?: number;
}

// Hierarchical structure for parent categories with subcategories
export interface CategoryHierarchyDTO {
    category: CategoryResponseDTO | null;
    subcategories: CategoryResponseDTO[];
    productCount?: number;
}

// Request parameters for category filtering
export interface CategoryFilterParams {
    status?: boolean;
    level?: number;
    parentId?: number;
    search?: string;
}

// Create and Update DTOs
export interface CreateCategoryDTO {
    name: string;
    description?: string;
    parentId?: number | null;
    status?: boolean;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    status?: boolean;
    slug?: string;
}

// Category statistics
export interface CategoryStatisticsDTO {
    totalCategories: number;
    activeCategories: number;
    parentCategories: number;
    subCategories: number;
}