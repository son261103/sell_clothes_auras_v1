// product.review.types.tsx

// Product Review DTOs
export interface ProductReviewCreateDTO {
    productId: number;
    userId?: number;  // Optional since it might be taken from auth context
    rating: number;
    comment: string;
}

export interface ProductReviewUpdateDTO {
    rating?: number;
    comment?: string;
}

export interface ProductReviewResponseDTO {
    reviewId: number;
    productId: number;
    productName: string;
    userId: number;
    username: string;
    userAvatar: string | null;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    isCurrentUser?: boolean; // Flag to indicate if the review belongs to current user
    commentCount?: number;   // Number of comments on this review
}

// Product Review Summary DTO
export interface ProductReviewSummaryDTO {
    productId: number;
    productName: string;
    averageRating: number;
    totalReviews: number;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
    latestReviews: ProductReviewResponseDTO[];
}

// Review Comment DTOs
export interface ReviewCommentCreateDTO {
    reviewId?: number;  // Will be set from path parameter
    userId?: number;    // Will be set from auth context
    content: string;
}

export interface ReviewCommentUpdateDTO {
    content: string;
}

export interface ReviewCommentResponseDTO {
    commentId: number;
    reviewId: number;
    userId: number;
    username: string;
    userAvatar: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
    isCurrentUser: boolean;
}

// Request parameters for reviews and comments
export interface ReviewFilterParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

// Has reviewed response
export interface HasReviewedResponse {
    hasReviewed: boolean;
}

// My review response - now supports multiple reviews
export interface MyReviewResponse {
    hasReviews: boolean;
    reviews?: ProductReviewResponseDTO[];
    message?: string;
}

// My single review response - for backward compatibility
export interface MySingleReviewResponse {
    hasReview: boolean;
    review?: ProductReviewResponseDTO;
    message?: string;
}

// Calculate star percentage helper
export function calculateStarPercentage(
    starCount: number,
    totalReviews: number
): number {
    if (totalReviews <= 0) return 0;
    return Math.round((starCount / totalReviews) * 100);
}

// Format rating value helper
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

// Validate rating helper
export function isValidRating(rating: number): boolean {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}