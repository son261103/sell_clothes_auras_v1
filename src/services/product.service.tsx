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
            minPrice,
            maxPrice,
        } = params;

        try {
            console.log('API Request - getProducts:', { params });

            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products', {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDir,
                    search,
                    categoryId,
                    brandId,
                    minPrice,
                    maxPrice,
                }
            });

            // Check the response data
            if (!response.data.content) {
                console.error('Invalid API response structure:', response.data);
                throw new Error('API response is missing content array');
            }

            // Validate category and brand data in products
            if (response.data.content.length > 0) {
                const missingCategory = response.data.content.filter(p => !p.category).length;
                const missingBrand = response.data.content.filter(p => !p.brand).length;

                if (missingCategory > 0 || missingBrand > 0) {
                    console.warn(`Found ${missingCategory} products missing category and ${missingBrand} missing brand`);

                    // If we find missing data, try to supplement it with default values
                    // to prevent UI errors - this is a temporary solution until the API is fixed
                    response.data.content = response.data.content.map(product => {
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

            console.log(`Received ${response.data.content.length} products from API`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
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
                throw new Error(`Product with ID ${productId} not found`);
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
            throw error;
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
                throw new Error(`Product with slug ${slug} not found`);
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
            throw error;
        }
    },

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId: number): Promise<ProductResponseDTO[]> {
        try {
            const response = await api.get<ProductResponseDTO[]>(`/public/products/category/${categoryId}`);

            // Validate and fix any products with missing data
            const products = response.data.map(product => {
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
            throw error;
        }
    },

    /**
     * Get products by brand
     */
    async getProductsByBrand(brandId: number): Promise<ProductResponseDTO[]> {
        try {
            const response = await api.get<ProductResponseDTO[]>(`/public/products/brand/${brandId}`);

            // Validate and fix any products with missing data
            const products = response.data.map(product => {
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
            throw error;
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

            // Validate and fix any products with missing data
            const products = response.data.map(product => {
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
            throw error;
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

            // Check and fix content if needed
            if (response.data.content) {
                response.data.content = response.data.content.map(product => {
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

            return response.data;
        } catch (error) {
            console.error('Error fetching latest products:', error);
            throw error;
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

            // Check and fix content if needed
            if (response.data.content) {
                response.data.content = response.data.content.map(product => {
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

            return response.data;
        } catch (error) {
            console.error('Error fetching products on sale:', error);
            throw error;
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

            // Validate and fix any products with missing data
            const products = response.data.map(product => {
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
            throw error;
        }
    },

    /**
     * Search products
     */
    async searchProducts(params: ProductSearchRequest): Promise<PageResponse<ProductResponseDTO>> {
        const {
            keyword,
            minPrice,
            maxPrice,
            categoryId,
            brandId,
            page = 0,
            size = 12,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/search', {
                params: {
                    keyword,
                    minPrice,
                    maxPrice,
                    categoryId,
                    brandId,
                    page,
                    size,
                    sortBy,
                    sortDir
                }
            });

            // Check and fix content if needed
            if (response.data.content) {
                response.data.content = response.data.content.map(product => {
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
            }

            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    /**
     * Get filtered products
     */
    async getFilteredProducts(
        categoryId?: number,
        brandId?: number,
        page: number = 0,
        size: number = 12,
        sortBy: string = 'createdAt',
        sortDir: string = 'desc'
    ): Promise<PageResponse<ProductResponseDTO>> {
        try {
            const response = await api.get<PageResponse<ProductResponseDTO>>('/public/products/filter', {
                params: {
                    categoryId,
                    brandId,
                    page,
                    size,
                    sortBy,
                    sortDir
                }
            });

            // Check and fix content if needed
            if (response.data.content) {
                response.data.content = response.data.content.map(product => {
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
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching filtered products:', error);
            throw error;
        }
    },

    /* Product Images */

    /**
     * Get all images for a product
     */
    async getProductImages(productId: number): Promise<ProductImageResponseDTO[]> {
        try {
            const response = await api.get<ProductImageResponseDTO[]>(`/public/products/${productId}/images`);
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
            return response.data;
        } catch (error) {
            console.error(`Error fetching primary image for product ${productId}:`, error);
            // Return a default image object as fallback
            return {
                imageId: 0,
                productId: productId,
                imageUrl: '/placeholder-image.jpg',
                displayOrder: 1,
                isPrimary: true
            };
        }
    },

    /* Product Variants */

    /**
     * Get active variants for a product
     */
    async getActiveVariants(productId: number): Promise<ProductVariantResponseDTO[]> {
        try {
            const response = await api.get<ProductVariantResponseDTO[]>(`/public/products/${productId}/variants`);
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
            return response.data;
        } catch (error) {
            console.error(`Error fetching variant ${variantId}:`, error);
            throw error;
        }
    },

    /**
     * Get variant by SKU
     */
    async getVariantBySku(sku: string): Promise<ProductVariantResponseDTO> {
        try {
            const response = await api.get<ProductVariantResponseDTO>(`/public/products/variants/sku/${sku}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching variant with SKU ${sku}:`, error);
            throw error;
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
            return response.data;
        } catch (error) {
            console.error(`Error checking variant availability for product ${productId}:`, error);
            // Return not available as fallback
            return { available: false };
        }
    }
};

export default ProductService;