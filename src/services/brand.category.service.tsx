import api from './api';
import {
    BrandResponseDTO,
    BrandHierarchyDTO,
    BrandFilterParams,
} from '../types/brand.types';
import {
    CategoryResponseDTO,
    CategoryHierarchyDTO,
    CategoryFilterParams,
    CategoryApiResponseDTO
} from '../types/category.types';

const BrandCategoryService = {
    /* Brand Methods */

    /**
     * Get all active brands
     */
    async getActiveBrands(): Promise<BrandResponseDTO[]> {
        try {
            const response = await api.get<BrandResponseDTO[] | string | unknown>('/public/categories-and-brands/brands');

            // Fix potential malformed response format
            let brandData = response.data;

            // Check if the response is a string that looks like concatenated arrays "[{...}][{...}]"
            if (typeof brandData === 'string') {
                try {
                    // Extract just the first array
                    const match = brandData.match(/^\[(.*?)\]/);
                    if (match) {
                        brandData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern seen in logs
            if (typeof brandData === 'object' && !Array.isArray(brandData)) {
                const str = JSON.stringify(brandData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        brandData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!brandData || !Array.isArray(brandData)) {
                console.warn('Invalid brands response format:', response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Tạo bản sao của mỗi thương hiệu để đảm bảo chúng có thể mở rộng
            return brandData.map(brand => ({ ...brand } as BrandResponseDTO));
        } catch (error) {
            console.error('Error fetching active brands:', error);
            // Trả về mảng rỗng thay vì ném lỗi
            return [];
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
                console.warn(`Brand with ID ${brandId} not found`);
                // Trả về một đối tượng thương hiệu mặc định
                return {
                    brandId: brandId,
                    name: 'Unknown Brand',
                    slug: 'unknown-brand',
                    status: true,
                    description: ''
                };
            }

            // Trả về một bản sao để đảm bảo đối tượng có thể mở rộng
            return { ...response.data };
        } catch (error) {
            console.error(`Error fetching brand ${brandId}:`, error);
            // Trả về một đối tượng thương hiệu mặc định thay vì ném lỗi
            return {
                brandId: brandId,
                name: 'Unknown Brand',
                slug: 'unknown-brand',
                status: true,
                description: ''
            };
        }
    },

    /**
     * Search brands by keyword
     */
    async searchBrands(keyword?: string): Promise<BrandResponseDTO[]> {
        try {
            const response = await api.get<BrandResponseDTO[] | string | unknown>('/public/categories-and-brands/brands/search', {
                params: { keyword }
            });

            // Fix potential malformed response format
            let brandData = response.data;

            // Check if the response is a string that looks like concatenated arrays
            if (typeof brandData === 'string') {
                try {
                    // Extract just the first array
                    const match = brandData.match(/^\[(.*?)\]/);
                    if (match) {
                        brandData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern
            if (typeof brandData === 'object' && !Array.isArray(brandData)) {
                const str = JSON.stringify(brandData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        brandData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!brandData || !Array.isArray(brandData)) {
                console.warn('Invalid search brands response format:', response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Tạo bản sao của mỗi thương hiệu
            return brandData.map(brand => ({ ...brand } as BrandResponseDTO));
        } catch (error) {
            console.error('Error searching brands:', error);
            return []; // Trả về mảng rỗng thay vì ném lỗi
        }
    },

    /**
     * Get all brands with hierarchy information (statistics)
     */
    async getBrandHierarchy(): Promise<BrandHierarchyDTO> {
        try {
            const response = await api.get<BrandHierarchyDTO>('/public/categories-and-brands/brands/hierarchy');

            if (!response.data) {
                console.warn('Invalid brand hierarchy response format:', response.data);
                // Trả về cấu trúc mặc định
                return {
                    brands: [],
                    statistics: {
                        totalBrands: 0,
                        activeBrands: 0,
                        inactiveBrands: 0,
                        brandsWithProducts: 0
                    }
                };
            }

            // Tạo bản sao sâu của dữ liệu phản hồi
            const hierarchy = { ...response.data };
            if (Array.isArray(hierarchy.brands)) {
                hierarchy.brands = hierarchy.brands.map(brand => ({ ...brand }));
            } else {
                hierarchy.brands = [];
            }

            // Đảm bảo thuộc tính statistics đầy đủ
            hierarchy.statistics = hierarchy.statistics || {
                totalBrands: 0,
                activeBrands: 0,
                inactiveBrands: 0,
                brandsWithProducts: 0
            };

            return hierarchy;
        } catch (error) {
            console.error('Error fetching brand hierarchy:', error);
            // Trả về cấu trúc mặc định thay vì ném lỗi
            return {
                brands: [],
                statistics: {
                    totalBrands: 0,
                    activeBrands: 0,
                    inactiveBrands: 0,
                    brandsWithProducts: 0
                }
            };
        }
    },

    /**
     * Get filtered brands
     */
    async getFilteredBrands(params: BrandFilterParams = {}): Promise<BrandResponseDTO[]> {
        const { status, search } = params;

        try {
            const response = await api.get<BrandResponseDTO[] | string | unknown>('/public/categories-and-brands/brands', {
                params: {
                    status,
                    search
                }
            });

            // Fix potential malformed response format
            let brandData = response.data;

            // Check if the response is a string that looks like concatenated arrays
            if (typeof brandData === 'string') {
                try {
                    // Extract just the first array
                    const match = brandData.match(/^\[(.*?)\]/);
                    if (match) {
                        brandData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern
            if (typeof brandData === 'object' && !Array.isArray(brandData)) {
                const str = JSON.stringify(brandData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        brandData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!brandData || !Array.isArray(brandData)) {
                console.warn('Invalid filtered brands response format:', response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Tạo bản sao của mỗi thương hiệu
            return brandData.map(brand => ({ ...brand } as BrandResponseDTO));
        } catch (error) {
            console.error('Error fetching filtered brands:', error);
            return []; // Trả về mảng rỗng thay vì ném lỗi
        }
    },

    /* Category Methods */

    /**
     * Get all active parent categories
     */
    async getAllActiveParentCategories(): Promise<CategoryResponseDTO[]> {
        try {
            const response = await api.get<CategoryResponseDTO[] | string | unknown>('/public/categories-and-brands/categories');

            // Fix potential malformed response format
            let categoryData = response.data;

            // Check if the response is a string that looks like concatenated arrays
            if (typeof categoryData === 'string') {
                try {
                    // Extract just the first array
                    const match = categoryData.match(/^\[(.*?)\]/);
                    if (match) {
                        categoryData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern
            if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
                const str = JSON.stringify(categoryData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        categoryData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!categoryData || !Array.isArray(categoryData)) {
                console.warn('Invalid categories response format:', response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Tạo bản sao của mỗi danh mục
            return categoryData.map(category => ({ ...category } as CategoryResponseDTO));
        } catch (error) {
            console.error('Error fetching active parent categories:', error);
            return []; // Trả về mảng rỗng thay vì ném lỗi
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

            // Xử lý trường hợp response.data là null hoặc undefined
            if (!response.data) {
                console.warn(`No data returned for category ${categoryId}`);
                return {
                    category: null,
                    subcategories: []
                };
            }

            // Map the backend response format to our frontend expected format
            const result: CategoryHierarchyDTO = {
                category: response.data.category || response.data.parent || null,
                subcategories: Array.isArray(response.data.subcategories)
                    ? response.data.subcategories
                    : Array.isArray(response.data.subCategories)
                        ? response.data.subCategories
                        : []
            };

            // Perform deep copy of data to avoid "object is not extensible" errors
            return {
                category: result.category ? { ...result.category } : null,
                subcategories: Array.isArray(result.subcategories)
                    ? result.subcategories.map(sub => ({ ...sub }))
                    : []
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
                console.warn(`Category with slug ${slug} not found`);
                // Trả về một đối tượng danh mục mặc định
                return {
                    categoryId: 0,
                    name: 'Unknown Category',
                    slug: slug,
                    parentId: null,
                    status: true,
                    level: 0,
                    description: ''
                };
            }

            // Return a copy to ensure object is extensible
            return { ...response.data };
        } catch (error) {
            console.error(`Error fetching category by slug ${slug}:`, error);
            // Trả về một đối tượng danh mục mặc định thay vì ném lỗi
            return {
                categoryId: 0,
                name: 'Unknown Category',
                slug: slug,
                parentId: null,
                status: true,
                level: 0,
                description: ''
            };
        }
    },

    /**
     * Get all active subcategories for a parent category
     */
    async getActiveSubCategories(parentId: number): Promise<CategoryResponseDTO[]> {
        try {
            const response = await api.get<CategoryResponseDTO[] | string | unknown>(
                `/public/categories-and-brands/categories/${parentId}/subcategories`
            );

            // Fix potential malformed response format
            let categoryData = response.data;

            // Check if the response is a string that looks like concatenated arrays
            if (typeof categoryData === 'string') {
                try {
                    // Extract just the first array
                    const match = categoryData.match(/^\[(.*?)\]/);
                    if (match) {
                        categoryData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern
            if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
                const str = JSON.stringify(categoryData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        categoryData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!categoryData || !Array.isArray(categoryData)) {
                console.warn(`Invalid subcategories response for parent ${parentId}:`, response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Return copies of each subcategory to ensure they are extensible
            return categoryData.map(category => ({ ...category } as CategoryResponseDTO));
        } catch (error) {
            console.error(`Error fetching subcategories for parent ${parentId}:`, error);
            return []; // Trả về mảng rỗng thay vì ném lỗi
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
                console.warn(`Subcategory with ID ${categoryId} not found`);
                // Trả về một đối tượng danh mục mặc định
                return {
                    categoryId: categoryId,
                    name: 'Unknown Subcategory',
                    slug: `unknown-subcategory-${categoryId}`,
                    parentId: null,
                    status: true,
                    level: 1,
                    description: ''
                };
            }

            // Return a copy to ensure object is extensible
            return { ...response.data };
        } catch (error) {
            console.error(`Error fetching subcategory ${categoryId}:`, error);
            // Trả về một đối tượng danh mục mặc định thay vì ném lỗi
            return {
                categoryId: categoryId,
                name: 'Unknown Subcategory',
                slug: `unknown-subcategory-${categoryId}`,
                parentId: null,
                status: true,
                level: 1,
                description: ''
            };
        }
    },

    /**
     * Get filtered categories
     */
    async getFilteredCategories(params: CategoryFilterParams = {}): Promise<CategoryResponseDTO[]> {
        const { status, level, parentId, search } = params;

        try {
            const response = await api.get<CategoryResponseDTO[] | string | unknown>('/public/categories-and-brands/categories', {
                params: {
                    status,
                    level,
                    parentId,
                    search
                }
            });

            // Fix potential malformed response format
            let categoryData = response.data;

            // Check if the response is a string that looks like concatenated arrays
            if (typeof categoryData === 'string') {
                try {
                    // Extract just the first array
                    const match = categoryData.match(/^\[(.*?)\]/);
                    if (match) {
                        categoryData = JSON.parse(match[0]);
                    }
                } catch (e) {
                    console.error('Error parsing string response:', e);
                }
            }

            // Check if response has a specific malformed pattern
            if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
                const str = JSON.stringify(categoryData);
                if (str.includes('][')) {
                    // This is likely two arrays concatenated
                    try {
                        const firstArrayEnd = str.indexOf(']') + 1;
                        const firstArrayStr = str.substring(0, firstArrayEnd);
                        categoryData = JSON.parse(firstArrayStr);
                    } catch (e) {
                        console.error('Error extracting first array from malformed response:', e);
                    }
                }
            }

            // Kiểm tra phản hồi có phải mảng không
            if (!categoryData || !Array.isArray(categoryData)) {
                console.warn('Invalid filtered categories response format:', response.data);
                return []; // Trả về mảng rỗng thay vì ném lỗi
            }

            // Return copies of each category to ensure they are extensible
            return categoryData.map(category => ({ ...category } as CategoryResponseDTO));
        } catch (error) {
            console.error('Error fetching filtered categories:', error);
            return []; // Trả về mảng rỗng thay vì ném lỗi
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
            // Trả về breadcrumb tối thiểu thay vì ném lỗi
            return [{
                categoryId: categoryId,
                name: 'Unknown Category',
                slug: `unknown-category-${categoryId}`,
                parentId: null,
                status: true,
                level: 0,
                description: ''
            }];
        }
    }
};

export default BrandCategoryService;