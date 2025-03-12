import api from './api';
import {
    ProductResponseDTO,
    ProductImageResponseDTO,
    ProductVariantResponseDTO,
    ProductFilterParams,
    PageResponse,
    FeaturedProductsRequest,
    LatestProductsRequest,
    ProductSearchRequest,
    RelatedProductsRequest,
    VariantAvailabilityRequest,
    VariantAvailabilityResponse
} from '../types/product.types';

// Define a type for request parameters to avoid 'any'
type RequestParams = Record<string, string | number | boolean | null | undefined>;

const ProductService = {
    /**
     * Get paginated list of products with optional filters
     */
    async getProducts(params: ProductFilterParams = {}): Promise<PageResponse<ProductResponseDTO>> {
        const {
            page = 0,
            size = 12,
            sortBy = 'createdAt',
            sortDir = 'desc',
            search,
            categoryId,
            brandId,
            // Thêm hỗ trợ cho mảng danh mục và thương hiệu
            categoryIds,
            brandIds,
            minPrice,
            maxPrice
        } = params;

        try {
            console.log('API Request - getProducts:', { params });

            // Xây dựng parameters cho request
            const requestParams: RequestParams = {
                page,
                size,
                sortBy,
                sortDir,
                search,
                minPrice,
                maxPrice,
            };

            // Ưu tiên sử dụng mảng nếu có
            if (categoryIds && categoryIds.length > 0) {
                // Xác định cách gửi mảng categoryIds
                // Cách 1: Chuyển thành chuỗi phân cách bởi dấu phẩy
                requestParams.categoryIds = categoryIds.join(',');
                // Cách 2: Giữ nguyên tham số (backend cần xử lý mảng)
                // requestParams.categoryIds = categoryIds;
            } else if (categoryId !== undefined) {
                // Tương thích ngược với API cũ
                requestParams.categoryId = categoryId;
            }

            // Tương tự với brandIds
            if (brandIds && brandIds.length > 0) {
                requestParams.brandIds = brandIds.join(',');
            } else if (brandId !== undefined) {
                requestParams.brandId = brandId;
            }

            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products', {
                params: requestParams
            });

            // Check for malformed data - in some cases we might get concatenated JSON
            let validResponse: PageResponse<ProductResponseDTO>;
            try {
                // If already valid JSON object, use as is
                if (response.data && typeof response.data === 'object') {
                    validResponse = response.data;
                }
                // If it's a string (possibly malformed), try to fix and parse
                else if (typeof response.data === 'string') {
                    console.warn('Received string response instead of JSON object, attempting to parse');
                    const responseStr: string = response.data;
                    const cleanData = responseStr.replace(/}{/g, '},{');
                    validResponse = JSON.parse(`[${cleanData}]`)[0] as PageResponse<ProductResponseDTO>;
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError, response.data);
                // Return empty page structure instead of throwing
                return createEmptyPageResponse(page, size);
            }

            // Check the response data for content array
            if (!validResponse.content) {
                console.error('Invalid API response structure:', validResponse);
                return createEmptyPageResponse(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(validResponse.content)) {
                console.error('API response content is not an array:', validResponse.content);
                validResponse.content = [];
            }

            // Validate category and brand data in products
            if (validResponse.content.length > 0) {
                const missingCategory = validResponse.content.filter((p: ProductResponseDTO) => !p.category).length;
                const missingBrand = validResponse.content.filter((p: ProductResponseDTO) => !p.brand).length;

                if (missingCategory > 0 || missingBrand > 0) {
                    console.warn(`Found ${missingCategory} products missing category and ${missingBrand} missing brand`);

                    // If we find missing data, try to supplement it with default values
                    // to prevent UI errors - this is a temporary solution until the API is fixed
                    validResponse.content = validResponse.content.map((product: ProductResponseDTO) => {
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
                    });
                }
            }

            console.log(`Received ${validResponse.content.length} products from API`);
            return validResponse;
        } catch (error) {
            console.error('Error fetching products:', error);
            // Return empty page response structure instead of throwing
            return createEmptyPageResponse(page, size);
        }
    },

    /**
     * Get product by ID
     */
    async getProductById(productId: number): Promise<ProductResponseDTO> {
        try {
            const response = await api.get<ProductResponseDTO>(`/public/products/${productId}`);

            // Validate product data
            if (!response.data) {
                console.warn(`Product with ID ${productId} not found`);
                return createEmptyProduct(productId);
            }

            // Check for missing category or brand data
            if (!response.data.category || !response.data.brand) {
                console.warn(`Product ID ${productId} has missing category or brand data`);

                // Provide default values if missing
                return {
                    ...response.data,
                    category: response.data.category || {
                        categoryId: 0,
                        name: 'Unknown Category',
                        slug: 'unknown-category',
                        status: true,
                        level: 0
                    },
                    brand: response.data.brand || {
                        brandId: 0,
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            // Return empty product instead of throwing
            return createEmptyProduct(productId);
        }
    },

    /**
     * Get product by slug
     */
    async getProductBySlug(slug: string): Promise<ProductResponseDTO> {
        try {
            const response = await api.get<ProductResponseDTO>(`/public/products/slug/${slug}`);

            // Validate product data
            if (!response.data) {
                console.warn(`Product with slug ${slug} not found`);
                return createEmptyProduct(0, slug);
            }

            // Check for missing category or brand data
            if (!response.data.category || !response.data.brand) {
                console.warn(`Product slug ${slug} has missing category or brand data`);

                // Provide default values if missing
                return {
                    ...response.data,
                    category: response.data.category || {
                        categoryId: 0,
                        name: 'Unknown Category',
                        slug: 'unknown-category',
                        status: true,
                        level: 0
                    },
                    brand: response.data.brand || {
                        brandId: 0,
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching product by slug ${slug}:`, error);
            // Return empty product instead of throwing
            return createEmptyProduct(0, slug);
        }
    },

    /**
     * Get products by category - support for multiple categories
     */
    async getProductsByCategories(categoryIds: number[]): Promise<ProductResponseDTO[]> {
        try {
            // Sử dụng categoryIds làm tham số query
            const response = await api.get<ProductResponseDTO[]>(`/public/products/categories`, {
                params: {
                    categoryIds: categoryIds.join(',')
                }
            });

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Invalid response format for getProductsByCategories');
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
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
            });

            return products;
        } catch (error) {
            console.error(`Error fetching products by categories:`, error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Get products by category (compatibility with old API)
     */
    async getProductsByCategory(categoryId: number): Promise<ProductResponseDTO[]> {
        try {
            const response = await api.get<ProductResponseDTO[]>(`/public/products/category/${categoryId}`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for category ${categoryId}`);
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
                return {
                    ...product,
                    category: product.category || {
                        categoryId: categoryId,
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
            });

            return products;
        } catch (error) {
            console.error(`Error fetching products by category ${categoryId}:`, error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Get products by brands - support for multiple brands
     */
    async getProductsByBrands(brandIds: number[]): Promise<ProductResponseDTO[]> {
        try {
            // Sử dụng brandIds làm tham số query
            const response = await api.get<ProductResponseDTO[]>(`/public/products/brands`, {
                params: {
                    brandIds: brandIds.join(',')
                }
            });

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Invalid response format for getProductsByBrands');
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
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
                        brandId: 0, // Không thể gán một brandId cụ thể vì có nhiều
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            });

            return products;
        } catch (error) {
            console.error(`Error fetching products by brands:`, error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Get products by brand (compatibility with old API)
     */
    async getProductsByBrand(brandId: number): Promise<ProductResponseDTO[]> {
        try {
            const response = await api.get<ProductResponseDTO[]>(`/public/products/brand/${brandId}`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for brand ${brandId}`);
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
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
                        brandId: brandId,
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            });

            return products;
        } catch (error) {
            console.error(`Error fetching products by brand ${brandId}:`, error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Get featured products
     */
    async getFeaturedProducts(params: FeaturedProductsRequest = {}): Promise<ProductResponseDTO[]> {
        const { limit = 8 } = params;
        try {
            const response = await api.get<ProductResponseDTO[]>('/public/products/featured', {
                params: { limit }
            });

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Invalid response format for featured products');
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
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
            });

            return products;
        } catch (error) {
            console.error('Error fetching featured products:', error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Get latest products
     */
    async getLatestProducts(params: LatestProductsRequest = {}): Promise<PageResponse<ProductResponseDTO>> {
        const { page = 0, size = 12, limit = 8 } = params;
        try {
            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/latest', {
                params: { page, size, limit }
            });

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn('Invalid response format for latest products');
                return createEmptyPageResponse(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Latest products content is not an array');
                response.data.content = [];
                return response.data;
            }

            // Check and fix content if needed
            response.data.content = response.data.content.map((product: ProductResponseDTO) => {
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
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching latest products:', error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse(page, size);
        }
    },

    /**
     * Get products on sale
     */
    async getProductsOnSale(page: number = 0, size: number = 12, sortBy: string = 'createdAt', sortDir: string = 'desc'): Promise<PageResponse<ProductResponseDTO>> {
        try {
            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/on-sale', {
                params: { page, size, sortBy, sortDir }
            });

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn('Invalid response format for products on sale');
                return createEmptyPageResponse(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Products on sale content is not an array');
                response.data.content = [];
                return response.data;
            }

            // Check and fix content if needed
            response.data.content = response.data.content.map((product: ProductResponseDTO) => {
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
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching products on sale:', error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse(page, size);
        }
    },

    /**
     * Get related products
     */
    async getRelatedProducts(params: RelatedProductsRequest): Promise<ProductResponseDTO[]> {
        const { productId, limit = 4 } = params;
        try {
            const response = await api.get<ProductResponseDTO[]>(`/public/products/related/${productId}`, {
                params: { limit }
            });

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for related products of ${productId}`);
                return [];
            }

            // Validate and fix any products with missing data
            const products = response.data.map((product: ProductResponseDTO) => {
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
            });

            return products;
        } catch (error) {
            console.error(`Error fetching related products for ${productId}:`, error);
            // Return empty array instead of throwing
            return [];
        }
    },

    /**
     * Search products - cập nhật để hỗ trợ nhiều danh mục và thương hiệu
     */
    async searchProducts(params: ProductSearchRequest): Promise<PageResponse<ProductResponseDTO>> {
        const {
            keyword,
            minPrice,
            maxPrice,
            categoryId,
            brandId,
            // Thêm mới
            categoryIds,
            brandIds,
            page = 0,
            size = 12,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            // Xây dựng tham số query
            const queryParams: RequestParams = {
                keyword,
                minPrice,
                maxPrice,
                page,
                size,
                sortBy,
                sortDir
            };

            // Ưu tiên sử dụng mảng ids nếu có
            if (categoryIds && categoryIds.length > 0) {
                queryParams.categoryIds = categoryIds.join(',');
            } else if (categoryId !== undefined) {
                queryParams.categoryId = categoryId;
            }

            if (brandIds && brandIds.length > 0) {
                queryParams.brandIds = brandIds.join(',');
            } else if (brandId !== undefined) {
                queryParams.brandId = brandId;
            }

            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/search', {
                params: queryParams
            });

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn('Invalid response format for search products');
                return createEmptyPageResponse(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Search products content is not an array');
                response.data.content = [];
                return response.data;
            }

            // Check and fix content if needed
            response.data.content = response.data.content.map((product: ProductResponseDTO) => {
                return {
                    ...product,
                    category: product.category || {
                        categoryId: categoryId || 0,
                        name: 'Unknown Category',
                        slug: 'unknown-category',
                        status: true,
                        level: 0
                    },
                    brand: product.brand || {
                        brandId: brandId || 0,
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            });

            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse(page, size);
        }
    },

    /**
     * Get filtered products - cập nhật để hỗ trợ nhiều danh mục và thương hiệu
     */
    async getFilteredProducts(params: ProductFilterParams = {}): Promise<PageResponse<ProductResponseDTO>> {
        const {
            categoryId,
            brandId,
            // Thêm mới
            categoryIds,
            brandIds,
            minPrice,
            maxPrice,
            search,
            page = 0,
            size = 12,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            // Xây dựng tham số query
            const queryParams: RequestParams = {
                page,
                size,
                sortBy,
                sortDir,
                search,
                minPrice,
                maxPrice
            };

            // Ưu tiên sử dụng mảng ids nếu có
            if (categoryIds && categoryIds.length > 0) {
                queryParams.categoryIds = categoryIds.join(',');
            } else if (categoryId !== undefined) {
                queryParams.categoryId = categoryId;
            }

            if (brandIds && brandIds.length > 0) {
                queryParams.brandIds = brandIds.join(',');
            } else if (brandId !== undefined) {
                queryParams.brandId = brandId;
            }

            console.log('Filtered products request params:', queryParams);

            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/filter', {
                params: queryParams
            });

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn('Invalid response format for filtered products');
                return createEmptyPageResponse(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Filtered products content is not an array');
                response.data.content = [];
                return response.data;
            }

            // Check and fix content if needed
            response.data.content = response.data.content.map((product: ProductResponseDTO) => {
                return {
                    ...product,
                    category: product.category || {
                        categoryId: categoryId || 0,
                        name: 'Unknown Category',
                        slug: 'unknown-category',
                        status: true,
                        level: 0
                    },
                    brand: product.brand || {
                        brandId: brandId || 0,
                        name: 'Unknown Brand',
                        slug: 'unknown-brand',
                        status: true
                    }
                };
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching filtered products:', error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse(page, size);
        }
    },

    /* Product Images */

    /**
     * Get all images for a product
     */
    async getProductImages(productId: number): Promise<ProductImageResponseDTO[]> {
        try {
            const response = await api.get<ProductImageResponseDTO[]>(`/public/products/${productId}/images`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for product images of ${productId}`);
                return [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching images for product ${productId}:`, error);
            // Return empty array as fallback instead of throwing
            console.warn('Returning empty images array as fallback');
            return [];
        }
    },

    /**
     * Get primary image for a product
     */
    async getPrimaryImage(productId: number): Promise<ProductImageResponseDTO> {
        try {
            const response = await api.get<ProductImageResponseDTO>(`/public/products/${productId}/images/primary`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for primary image of ${productId}`);
                return createDefaultImage(productId);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching primary image for product ${productId}:`, error);
            // Return a default image object as fallback
            return createDefaultImage(productId);
        }
    },

    /* Product Variants */

    /**
     * Get active variants for a product
     */
    async getActiveVariants(productId: number): Promise<ProductVariantResponseDTO[]> {
        try {
            const response = await api.get<ProductVariantResponseDTO[]>(`/public/products/${productId}/variants`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for variants of ${productId}`);
                return [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching variants for product ${productId}:`, error);
            // Return empty array as fallback instead of throwing
            console.warn('Returning empty variants array as fallback');
            return [];
        }
    },

    /**
     * Get available sizes for a product
     */
    async getAvailableSizes(productId: number): Promise<string[]> {
        try {
            const response = await api.get<string[]>(`/public/products/${productId}/variants/sizes`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for sizes of ${productId}`);
                return [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching available sizes for product ${productId}:`, error);
            console.warn('Returning empty sizes array as fallback');
            return [];
        }
    },

    /**
     * Get available colors for a product
     */
    async getAvailableColors(productId: number): Promise<string[]> {
        try {
            const response = await api.get<string[]>(`/public/products/${productId}/variants/colors`);

            // Validate response data
            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`Invalid response format for colors of ${productId}`);
                return [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching available colors for product ${productId}:`, error);
            console.warn('Returning empty colors array as fallback');
            return [];
        }
    },

    /**
     * Get variant by ID
     */
    async getVariantById(variantId: number): Promise<ProductVariantResponseDTO> {
        try {
            const response = await api.get<ProductVariantResponseDTO>(`/public/products/variants/${variantId}`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for variant ${variantId}`);
                return createDefaultVariant(variantId);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching variant ${variantId}:`, error);
            // Return default variant instead of throwing
            return createDefaultVariant(variantId);
        }
    },

    /**
     * Get variant by SKU
     */
    async getVariantBySku(sku: string): Promise<ProductVariantResponseDTO> {
        try {
            const response = await api.get<ProductVariantResponseDTO>(`/public/products/variants/sku/${sku}`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for variant with SKU ${sku}`);
                return createDefaultVariant(0, sku);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching variant with SKU ${sku}:`, error);
            // Return default variant instead of throwing
            return createDefaultVariant(0, sku);
        }
    },

    /**
     * Check variant availability
     */
    async checkVariantAvailability(params: VariantAvailabilityRequest): Promise<VariantAvailabilityResponse> {
        const { productId, size, color } = params;
        try {
            const response = await api.get<VariantAvailabilityResponse>(`/public/products/${productId}/check-availability`, {
                params: { size, color }
            });

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for availability check of product ${productId}`);
                return { available: false };
            }

            return response.data;
        } catch (error) {
            console.error(`Error checking variant availability for product ${productId}:`, error);
            // Return not available as fallback
            return { available: false };
        }
    }
};

// Helper functions to create default/empty response objects
function createEmptyPageResponse(page: number, size: number): PageResponse<ProductResponseDTO> {
    return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page,
        pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: true, unsorted: false, empty: false },
            offset: page * size,
            paged: true,
            unpaged: false
        },
        sort: { sorted: true, unsorted: false, empty: false },
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true
    };
}

function createEmptyProduct(productId: number, slug?: string): ProductResponseDTO {
    return {
        productId: productId,
        name: slug ? `Product ${slug}` : `Product ${productId}`,
        description: '',
        price: 0,
        salePrice: null,
        thumbnail: '/placeholder-image.jpg',
        slug: slug || `product-${productId}`,
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
            categoryId: 0,
            name: 'Unknown Category',
            slug: 'unknown-category',
            status: true,
            level: 0
        },
        brand: {
            brandId: 0,
            name: 'Unknown Brand',
            slug: 'unknown-brand',
            status: true
        }
    };
}

function createDefaultImage(productId: number): ProductImageResponseDTO {
    return {
        imageId: 0,
        productId: productId,
        imageUrl: '/placeholder-image.jpg',
        displayOrder: 1,
        isPrimary: true
    };
}

function createDefaultVariant(variantId: number, sku?: string): ProductVariantResponseDTO {
    return {
        variantId: variantId,
        productId: 0,
        sku: sku || `SKU-${variantId}`,
        size: 'One Size',
        color: 'Default',
        stockQuantity: 0,  // Đã sửa thành stockQuantity thay vì stock
        imageUrl: null,
        status: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

export default ProductService;