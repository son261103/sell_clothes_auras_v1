import api from './api';
import {
    ProductReviewCreateDTO,
    ProductReviewResponseDTO,
    ProductReviewSummaryDTO,
    ProductReviewUpdateDTO,
    ReviewCommentCreateDTO,
    ReviewCommentResponseDTO,
    ReviewCommentUpdateDTO,
    ReviewFilterParams,
    HasReviewedResponse,
    MyReviewResponse,
    MySingleReviewResponse
} from '../types/product.review.types.tsx';
import { PageResponse } from '../types/product.types';
import { ApiResponse } from '../types/auth.types';

const ProductReviewService = {
    /**
     * Get reviews for a specific product with pagination
     */
    async getProductReviews(
        productId: number,
        params: ReviewFilterParams = {}
    ): Promise<PageResponse<ProductReviewResponseDTO>> {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            const response = await api.get<PageResponse<ProductReviewResponseDTO>>(
                `/public/reviews/product/${productId}`,
                {
                    params: {
                        page,
                        size,
                        sortBy,
                        sortDir
                    }
                }
            );

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn(`Invalid response format for product ${productId} reviews`);
                return createEmptyPageResponse<ProductReviewResponseDTO>(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Product reviews content is not an array');
                response.data.content = [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for product ${productId}:`, error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse<ProductReviewResponseDTO>(page, size);
        }
    },

    /**
     * Get review summary for a product
     */
    async getProductReviewSummary(productId: number): Promise<ProductReviewSummaryDTO> {
        try {
            const response = await api.get<ProductReviewSummaryDTO>(
                `/public/reviews/product/${productId}/summary`
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for product ${productId} review summary`);
                return createEmptyReviewSummary(productId);
            }

            // Ensure latestReviews is an array
            if (!response.data.latestReviews || !Array.isArray(response.data.latestReviews)) {
                console.warn('Latest reviews is not an array in summary response');
                response.data.latestReviews = [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching review summary for product ${productId}:`, error);
            // Return default summary instead of throwing
            return createEmptyReviewSummary(productId);
        }
    },

    /**
     * Get a specific review by ID
     */
    async getReviewById(reviewId: number): Promise<ProductReviewResponseDTO> {
        try {
            const response = await api.get<ProductReviewResponseDTO>(`/public/reviews/${reviewId}`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for review ${reviewId}`);
                return createEmptyReview(reviewId);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching review ${reviewId}:`, error);
            // Return empty review instead of throwing
            return createEmptyReview(reviewId);
        }
    },

    /**
     * Submit a new review for a product
     * Note: userId is now automatically assigned by the backend from auth token
     */
    async createReview(review: ProductReviewCreateDTO): Promise<ProductReviewResponseDTO> {
        try {
            // Validate rating before sending to API
            if (!review.rating || review.rating < 1 || review.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Validate product ID
            if (!review.productId || review.productId <= 0) {
                throw new Error('Valid product ID is required');
            }

            // Ensure comment is a string (even if empty)
            if (review.comment === undefined || review.comment === null) {
                review.comment = '';
            }

            // Log the request for debugging
            console.log('Creating review:', {
                productId: review.productId,
                rating: review.rating,
                commentLength: review.comment?.length || 0
            });

            const response = await api.post<ProductReviewResponseDTO>('/public/reviews', review);

            // Validate response data
            if (!response.data) {
                console.warn('Invalid response format when creating review');
                throw new Error('Failed to create review');
            }

            return response.data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error; // Rethrow to handle in component
        }
    },

    /**
     * Update an existing review
     */
    async updateReview(reviewId: number, review: ProductReviewUpdateDTO): Promise<ProductReviewResponseDTO> {
        try {
            // Validate rating if provided
            if (review.rating && (review.rating < 1 || review.rating > 5)) {
                throw new Error('Rating must be between 1 and 5');
            }

            const response = await api.put<ProductReviewResponseDTO>(
                `/public/reviews/${reviewId}`,
                review
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format when updating review ${reviewId}`);
                throw new Error('Failed to update review');
            }

            return response.data;
        } catch (error) {
            console.error(`Error updating review ${reviewId}:`, error);
            throw error; // Rethrow to handle in component
        }
    },

    /**
     * Delete a review
     */
    async deleteReview(reviewId: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(`/public/reviews/${reviewId}`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format when deleting review ${reviewId}`);
                throw new Error('Failed to delete review');
            }

            return response.data;
        } catch (error) {
            console.error(`Error deleting review ${reviewId}:`, error);
            throw error; // Rethrow to handle in component
        }
    },

    /**
     * Get all reviews created by the current user
     */
    async getUserReviews(params: ReviewFilterParams = {}): Promise<PageResponse<ProductReviewResponseDTO>> {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            const response = await api.get<PageResponse<ProductReviewResponseDTO>>('/public/reviews/my-reviews', {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDir
                }
            });

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn('Invalid response format for user reviews');
                return createEmptyPageResponse<ProductReviewResponseDTO>(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('User reviews content is not an array');
                response.data.content = [];
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse<ProductReviewResponseDTO>(page, size);
        }
    },

    /**
     * Check if the current user has already reviewed a product
     */
    async hasUserReviewedProduct(productId: number): Promise<boolean> {
        try {
            const response = await api.get<HasReviewedResponse>(
                `/public/reviews/product/${productId}/has-reviewed`
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for has-reviewed check on product ${productId}`);
                return false;
            }

            return response.data.hasReviewed;
        } catch (error) {
            console.error(`Error checking if user has reviewed product ${productId}:`, error);
            // Assume user hasn't reviewed if there's an error
            return false;
        }
    },

    /**
     * Get all reviews by the current user for a specific product
     */
    async getUserReviewsForProduct(productId: number): Promise<MyReviewResponse> {
        try {
            const response = await api.get<MyReviewResponse>(
                `/public/reviews/product/${productId}/my-reviews`
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format for user reviews on product ${productId}`);
                return { hasReviews: false, reviews: [], message: 'No reviews found for this product' };
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching user reviews for product ${productId}:`, error);
            return { hasReviews: false, reviews: [], message: 'Failed to fetch review information' };
        }
    },

    /**
     * Get the current user's latest review for a specific product (for backward compatibility)
     */
    async getUserLatestReviewForProduct(productId: number): Promise<MySingleReviewResponse> {
        try {
            const response = await api.get<ProductReviewResponseDTO | MySingleReviewResponse>(
                `/public/reviews/product/${productId}/my-latest-review`
            );

            // Check if the response already has the hasReview property
            if (response.data && 'hasReview' in response.data) {
                return response.data as MySingleReviewResponse;
            }

            // If it's a ProductReviewResponseDTO, convert it
            if (response.data) {
                return {
                    hasReview: true,
                    review: response.data as ProductReviewResponseDTO
                };
            }

            // Default case when no review is found
            return { hasReview: false, message: 'No review found for this product' };
        } catch (error) {
            console.error(`Error fetching user's latest review for product ${productId}:`, error);
            return { hasReview: false, message: 'Failed to fetch review information' };
        }
    },

    /**
     * Get the current user's review for a specific product (backward compatibility)
     */
    async getUserReviewForProduct(productId: number): Promise<MySingleReviewResponse> {
        // Call the new method for latest review instead
        return this.getUserLatestReviewForProduct(productId);
    },

    // NEW METHODS FOR REVIEW COMMENTS

    /**
     * Get comments for a specific review with pagination
     */
    async getReviewComments(
        reviewId: number,
        params: ReviewFilterParams = {}
    ): Promise<PageResponse<ReviewCommentResponseDTO>> {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc'
        } = params;

        try {
            const response = await api.get<PageResponse<ReviewCommentResponseDTO>>(
                `/public/reviews/${reviewId}/comments`,
                {
                    params: {
                        page,
                        size,
                        sortBy,
                        sortDir
                    }
                }
            );

            // Validate response data
            if (!response.data || !response.data.content) {
                console.warn(`Invalid response format for review ${reviewId} comments`);
                return createEmptyPageResponse<ReviewCommentResponseDTO>(page, size);
            }

            // Ensure content is an array
            if (!Array.isArray(response.data.content)) {
                console.warn('Review comments content is not an array');
                response.data.content = [];
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching comments for review ${reviewId}:`, error);
            // Return empty page response instead of throwing
            return createEmptyPageResponse<ReviewCommentResponseDTO>(page, size);
        }
    },

    /**
     * Add a comment to a review
     */
    async addCommentToReview(
        reviewId: number,
        comment: ReviewCommentCreateDTO
    ): Promise<ReviewCommentResponseDTO> {
        try {
            // Ensure content is not empty
            if (!comment.content || comment.content.trim() === '') {
                throw new Error('Comment content cannot be empty');
            }

            const response = await api.post<ReviewCommentResponseDTO>(
                `/public/reviews/${reviewId}/comments`,
                comment
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format when adding comment to review ${reviewId}`);
                throw new Error('Failed to add comment');
            }

            return response.data;
        } catch (error) {
            console.error(`Error adding comment to review ${reviewId}:`, error);
            throw error;
        }
    },

    /**
     * Update a review comment
     */
    async updateComment(
        commentId: number,
        comment: ReviewCommentUpdateDTO
    ): Promise<ReviewCommentResponseDTO> {
        try {
            // Ensure content is not empty
            if (!comment.content || comment.content.trim() === '') {
                throw new Error('Comment content cannot be empty');
            }

            const response = await api.put<ReviewCommentResponseDTO>(
                `/public/reviews/comments/${commentId}`,
                comment
            );

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format when updating comment ${commentId}`);
                throw new Error('Failed to update comment');
            }

            return response.data;
        } catch (error) {
            console.error(`Error updating comment ${commentId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a review comment
     */
    async deleteComment(commentId: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(`/public/reviews/comments/${commentId}`);

            // Validate response data
            if (!response.data) {
                console.warn(`Invalid response format when deleting comment ${commentId}`);
                throw new Error('Failed to delete comment');
            }

            return response.data;
        } catch (error) {
            console.error(`Error deleting comment ${commentId}:`, error);
            throw error;
        }
    }
};

// Helper functions to create default/empty response objects
function createEmptyPageResponse<T>(page: number, size: number): PageResponse<T> {
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

function createEmptyReview(reviewId: number): ProductReviewResponseDTO {
    return {
        reviewId: reviewId,
        productId: 0,
        productName: 'Unknown Product',
        userId: 0,
        username: 'Unknown User',
        userAvatar: null,
        rating: 0,
        comment: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCurrentUser: false,
        commentCount: 0
    };
}

function createEmptyReviewSummary(productId: number): ProductReviewSummaryDTO {
    return {
        productId: productId,
        productName: 'Unknown Product',
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
        latestReviews: []
    };
}

export default ProductReviewService;