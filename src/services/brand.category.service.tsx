import api from './api';
import {
    BrandResponseDTO,
    BrandHierarchyDTO,
    BrandFilterParams
} from '../types/brand.types';
import {
    CategoryResponseDTO,
    CategoryHierarchyDTO,
    CategoryFilterParams, CategoryApiResponseDTO
} from '../types/category.types';

const BrandCategoryService = {
    /* Brand Methods */

    /**
     * Get all active brands
     */
    async getActiveBrands(): Promise<BrandResponseDTO[]> {
        try {
            const response = await api.get<BrandResponseDTO[]>('/public/categories-and-brands/brands');
            return response.data;
        } catch (error) {
            console.error('Error fetching active brands:', error);
            throw error;
        }
    },

    /**
     * Get brand by ID
     */
    async getBrandById(brandId: number): Promise<BrandResponseDTO> {
        try {
            const response = await api.get<BrandResponseDTO>(`/public/categories-and-brands/brands/${brandId}`);

            // Validate brand data
            if (!response.data) {
                throw new Error(`Brand with ID ${brandId} not found`);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching brand ${brandId}:`, error);
            throw error;
        }
    },

    /**
     * Search brands by keyword
     */
    async searchBrands(keyword?: string): Promise<BrandResponseDTO[]> {
        try {
            const response = await api.get<BrandResponseDTO[]>('/public/categories-and-brands/brands/search', {
                params: { keyword }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching brands:', error);
            throw error;
        }
    },

    /**
     * Get all brands with hierarchy information (statistics)
     */
    async getBrandHierarchy(): Promise<BrandHierarchyDTO> {
        try {
            const response = await api.get<BrandHierarchyDTO>('/public/categories-and-brands/brands/hierarchy');
            return response.data;
        } catch (error) {
            console.error('Error fetching brand hierarchy:', error);
            throw error;
        }
    },

    /**
     * Get filtered brands
     */
    async getFilteredBrands(params: BrandFilterParams = {}): Promise<BrandResponseDTO[]> {
        const { status, search } = params;

        try {
            const response = await api.get<BrandResponseDTO[]>('/public/categories-and-brands/brands', {
                params: {
                    status,
                    search
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered brands:', error);
            throw error;
        }
    },

    /* Category Methods */

    /**
     * Get all active parent categories
     */
    async getAllActiveParentCategories(): Promise<CategoryResponseDTO[]> {
        try {
            const response = await api.get<CategoryResponseDTO[]>('/public/categories-and-brands/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching active parent categories:', error);
            throw error;
        }
    },

    /**
     * Get parent category by ID with its subcategories
     * Updated to handle both parent categories and subcategories
     */
    async getCategoryWithSubcategories(categoryId: number): Promise<CategoryHierarchyDTO> {
        try {
            console.log(`Fetching category with subcategories for ID: ${categoryId}`);
            const response = await api.get<CategoryApiResponseDTO>(`/public/categories-and-brands/categories/${categoryId}`);

            // Map the backend response format to our frontend expected format
            const result: CategoryHierarchyDTO = {
                category: response.data.category || response.data.parent || null,
                subcategories: response.data.subcategories || response.data.subCategories || []
            };

            // Perform deep copy of data to avoid "object is not extensible" errors
            return {
                category: result.category ? { ...result.category } : null,
                subcategories: result.subcategories.map(sub => ({ ...sub }))
            };
        } catch (error) {
            console.error(`Error fetching category with subcategories ${categoryId}:`, error);

            // Return a fallback structure to avoid further errors
            return {
                category: null,
                subcategories: []
            };
        }
    },


    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug: string): Promise<CategoryResponseDTO> {
        try {
            const response = await api.get<CategoryResponseDTO>(`/public/categories-and-brands/categories/slug/${slug}`);

            // Validate category data
            if (!response.data) {
                throw new Error(`Category with slug ${slug} not found`);
            }

            // Return a copy to ensure object is extensible
            return { ...response.data };
        } catch (error) {
            console.error(`Error fetching category by slug ${slug}:`, error);
            throw error;
        }
    },

    /**
     * Get all active subcategories for a parent category
     */
    async getActiveSubCategories(parentId: number): Promise<CategoryResponseDTO[]> {
        try {
            const response = await api.get<CategoryResponseDTO[]>(`/public/categories-and-brands/categories/${parentId}/subcategories`);

            // Return copies of each subcategory to ensure they are extensible
            return response.data.map(category => ({ ...category }));
        } catch (error) {
            console.error(`Error fetching subcategories for parent ${parentId}:`, error);
            throw error;
        }
    },

    /**
     * Get subcategory by ID
     */
    async getSubCategoryById(categoryId: number): Promise<CategoryResponseDTO> {
        try {
            const response = await api.get<CategoryResponseDTO>(`/public/categories-and-brands/subcategories/${categoryId}`);

            // Validate category data
            if (!response.data) {
                throw new Error(`Subcategory with ID ${categoryId} not found`);
            }

            // Return a copy to ensure object is extensible
            return { ...response.data };
        } catch (error) {
            console.error(`Error fetching subcategory ${categoryId}:`, error);
            throw error;
        }
    },

    /**
     * Get filtered categories
     */
    async getFilteredCategories(params: CategoryFilterParams = {}): Promise<CategoryResponseDTO[]> {
        const { status, level, parentId, search } = params;

        try {
            const response = await api.get<CategoryResponseDTO[]>('/public/categories-and-brands/categories', {
                params: {
                    status,
                    level,
                    parentId,
                    search
                }
            });

            // Return copies of each category to ensure they are extensible
            return response.data.map(category => ({ ...category }));
        } catch (error) {
            console.error('Error fetching filtered categories:', error);
            throw error;
        }
    },

    /**
     * Get category breadcrumb
     * Creates a breadcrumb trail for navigation
     */
    async getCategoryBreadcrumb(categoryId: number): Promise<CategoryResponseDTO[]> {
        try {
            // First get the category
            const category = await this.getSubCategoryById(categoryId);

            // If it's a parent category (level 0), return just this category
            if (category.level === 0 || !category.parentId) {
                return [{ ...category }];
            }

            // Otherwise get the parent and build breadcrumb
            const parent = await this.getSubCategoryById(category.parentId);
            return [{ ...parent }, { ...category }];
        } catch (error) {
            console.error(`Error building breadcrumb for category ${categoryId}:`, error);
            throw error;
        }
    }
};

export default BrandCategoryService;