import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ProductReviewResponseDTO,
    ProductReviewSummaryDTO,
    ReviewCommentResponseDTO
} from '../../types/product.review.types';
import { PageResponse } from '../../types/product.types';

interface ProductReviewState {
    // Current product reviews
    reviews: ProductReviewResponseDTO[];
    totalReviews: number;

    // Review summary statistics
    reviewSummary: ProductReviewSummaryDTO | null;

    // Current user's reviews
    userReviews: ProductReviewResponseDTO[];
    totalUserReviews: number;

    // Current user's reviews for selected product (multiple reviews)
    userProductReviews: ProductReviewResponseDTO[];
    hasUserReviewed: boolean;

    // Keep for backward compatibility
    userProductReview: ProductReviewResponseDTO | null;

    // Selected review for viewing/editing
    selectedReview: ProductReviewResponseDTO | null;

    // Comments for the selected review
    reviewComments: ReviewCommentResponseDTO[];
    totalComments: number;

    // UI state
    loading: boolean;
    reviewsLoading: boolean;
    summaryLoading: boolean;
    userReviewsLoading: boolean;
    commentsLoading: boolean;
    submitting: boolean;

    error: string | null;

    // Pagination
    currentPage: number;
    pageSize: number;
    totalPages: number;

    // User reviews pagination
    userReviewsCurrentPage: number;
    userReviewsPageSize: number;
    userReviewsTotalPages: number;

    // Comments pagination
    commentsCurrentPage: number;
    commentsPageSize: number;
    commentsTotalPages: number;

    // Sorting and filtering
    sortBy: string;
    sortDir: 'asc' | 'desc';

    // For tracking API requests
    lastRequestTimestamp: number;
}

const initialState: ProductReviewState = {
    reviews: [],
    totalReviews: 0,

    reviewSummary: null,

    userReviews: [],
    totalUserReviews: 0,

    userProductReviews: [],
    userProductReview: null,
    hasUserReviewed: false,

    selectedReview: null,

    reviewComments: [],
    totalComments: 0,

    loading: false,
    reviewsLoading: false,
    summaryLoading: false,
    userReviewsLoading: false,
    commentsLoading: false,
    submitting: false,

    error: null,

    currentPage: 0,
    pageSize: 10,
    totalPages: 0,

    userReviewsCurrentPage: 0,
    userReviewsPageSize: 10,
    userReviewsTotalPages: 0,

    commentsCurrentPage: 0,
    commentsPageSize: 10,
    commentsTotalPages: 0,

    sortBy: 'createdAt',
    sortDir: 'desc',

    lastRequestTimestamp: 0
};

const productReviewSlice = createSlice({
    name: 'productReview',
    initialState,
    reducers: {
        // EXISTING REDUCERS

        // Fetch product reviews
        fetchProductReviewsStart(state) {
            state.reviewsLoading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },
        fetchProductReviewsSuccess(state, action: PayloadAction<PageResponse<ProductReviewResponseDTO>>) {
            state.reviewsLoading = false;

            if (action.payload.content) {
                state.reviews = action.payload.content;
            } else {
                state.reviews = [];
                console.error('Reviews payload missing content array', action.payload);
            }

            state.totalReviews = action.payload.totalElements || 0;
            state.currentPage = action.payload.number || 0;
            state.pageSize = action.payload.size || 10;
            state.totalPages = action.payload.totalPages || 0;
        },
        fetchProductReviewsFailure(state, action: PayloadAction<string>) {
            state.reviewsLoading = false;
            state.error = action.payload;
        },

        // Fetch review summary
        fetchReviewSummaryStart(state) {
            state.summaryLoading = true;
            state.error = null;
        },
        fetchReviewSummarySuccess(state, action: PayloadAction<ProductReviewSummaryDTO>) {
            state.summaryLoading = false;
            state.reviewSummary = action.payload;
        },
        fetchReviewSummaryFailure(state, action: PayloadAction<string>) {
            state.summaryLoading = false;
            state.error = action.payload;
        },

        // Fetch single review
        fetchReviewDetailStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchReviewDetailSuccess(state, action: PayloadAction<ProductReviewResponseDTO>) {
            state.loading = false;
            state.selectedReview = action.payload;
        },
        fetchReviewDetailFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Create review
        createReviewStart(state) {
            state.submitting = true;
            state.error = null;
        },
        createReviewSuccess(state, action: PayloadAction<ProductReviewResponseDTO>) {
            state.submitting = false;

            // Add new review to the list and increment total
            state.reviews = [action.payload, ...state.reviews];
            state.totalReviews += 1;

            // Update user's review status and reviews
            state.userProductReview = action.payload;  // For backward compatibility
            state.userProductReviews = [action.payload, ...state.userProductReviews];
            state.hasUserReviewed = true;

            // Add to user reviews if it's not there
            if (!state.userReviews.some(review => review.reviewId === action.payload.reviewId)) {
                state.userReviews = [action.payload, ...state.userReviews];
                state.totalUserReviews += 1;
            }
        },
        createReviewFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // Update review
        updateReviewStart(state) {
            state.submitting = true;
            state.error = null;
        },
        updateReviewSuccess(state, action: PayloadAction<ProductReviewResponseDTO>) {
            state.submitting = false;

            // Update in reviews list
            state.reviews = state.reviews.map(review =>
                review.reviewId === action.payload.reviewId ? action.payload : review
            );

            // Update selected review if it matches
            if (state.selectedReview && state.selectedReview.reviewId === action.payload.reviewId) {
                state.selectedReview = action.payload;
            }

            // Update user product review if it matches (backward compatibility)
            if (state.userProductReview && state.userProductReview.reviewId === action.payload.reviewId) {
                state.userProductReview = action.payload;
            }

            // Update in user product reviews list
            state.userProductReviews = state.userProductReviews.map(review =>
                review.reviewId === action.payload.reviewId ? action.payload : review
            );

            // Update in user reviews if it exists there
            state.userReviews = state.userReviews.map(review =>
                review.reviewId === action.payload.reviewId ? action.payload : review
            );
        },
        updateReviewFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // Delete review
        deleteReviewStart(state) {
            state.submitting = true;
            state.error = null;
        },
        deleteReviewSuccess(state, action: PayloadAction<number>) {
            state.submitting = false;
            const reviewId = action.payload;

            // Remove from reviews list and decrement total
            state.reviews = state.reviews.filter(review => review.reviewId !== reviewId);
            if (state.totalReviews > 0) state.totalReviews -= 1;

            // Clear selected review if it matches
            if (state.selectedReview && state.selectedReview.reviewId === reviewId) {
                state.selectedReview = null;
            }

            // Remove from user product reviews
            state.userProductReviews = state.userProductReviews.filter(
                review => review.reviewId !== reviewId
            );

            // Update hasUserReviewed flag based on remaining reviews
            if (state.userProductReviews.length === 0) {
                state.hasUserReviewed = false;
            }

            // Clear user product review if it matches (backward compatibility)
            if (state.userProductReview && state.userProductReview.reviewId === reviewId) {
                state.userProductReview = null;
            }

            // Remove from user reviews if it exists there
            const wasInUserReviews = state.userReviews.some(review => review.reviewId === reviewId);
            if (wasInUserReviews) {
                state.userReviews = state.userReviews.filter(review => review.reviewId !== reviewId);
                if (state.totalUserReviews > 0) state.totalUserReviews -= 1;
            }
        },
        deleteReviewFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // Fetch user reviews
        fetchUserReviewsStart(state) {
            state.userReviewsLoading = true;
            state.error = null;
        },
        fetchUserReviewsSuccess(state, action: PayloadAction<PageResponse<ProductReviewResponseDTO>>) {
            state.userReviewsLoading = false;

            if (action.payload.content) {
                state.userReviews = action.payload.content;
            } else {
                state.userReviews = [];
                console.error('User reviews payload missing content array', action.payload);
            }

            state.totalUserReviews = action.payload.totalElements || 0;
            state.userReviewsCurrentPage = action.payload.number || 0;
            state.userReviewsPageSize = action.payload.size || 10;
            state.userReviewsTotalPages = action.payload.totalPages || 0;
        },
        fetchUserReviewsFailure(state, action: PayloadAction<string>) {
            state.userReviewsLoading = false;
            state.error = action.payload;
        },

        // NEW REDUCERS FOR USER'S PRODUCT REVIEWS (MULTIPLE)

        // Fetch all user reviews for a specific product
        fetchUserProductReviewsStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchUserProductReviewsSuccess(state, action: PayloadAction<ProductReviewResponseDTO[]>) {
            state.loading = false;
            state.userProductReviews = action.payload;
            state.hasUserReviewed = action.payload.length > 0;

            // Set userProductReview to the most recent review for backward compatibility
            if (action.payload.length > 0) {
                // Find most recent review (highest reviewId or latest createdAt)
                const sortedReviews = [...action.payload].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                state.userProductReview = sortedReviews[0];
            } else {
                state.userProductReview = null;
            }
        },
        fetchUserProductReviewsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
            state.userProductReviews = [];
            state.userProductReview = null;
            state.hasUserReviewed = false;
        },

        // NEW REDUCERS FOR REVIEW COMMENTS

        // Fetch comments for a review
        fetchReviewCommentsStart(state) {
            state.commentsLoading = true;
            state.error = null;
        },
        fetchReviewCommentsSuccess(state, action: PayloadAction<PageResponse<ReviewCommentResponseDTO>>) {
            state.commentsLoading = false;

            if (action.payload.content) {
                state.reviewComments = action.payload.content;
            } else {
                state.reviewComments = [];
                console.error('Review comments payload missing content array', action.payload);
            }

            state.totalComments = action.payload.totalElements || 0;
            state.commentsCurrentPage = action.payload.number || 0;
            state.commentsPageSize = action.payload.size || 10;
            state.commentsTotalPages = action.payload.totalPages || 0;
        },
        fetchReviewCommentsFailure(state, action: PayloadAction<string>) {
            state.commentsLoading = false;
            state.error = action.payload;
        },

        // Add comment to a review
        addCommentStart(state) {
            state.submitting = true;
            state.error = null;
        },
        addCommentSuccess(state, action: PayloadAction<ReviewCommentResponseDTO>) {
            state.submitting = false;
            state.reviewComments = [action.payload, ...state.reviewComments];
            state.totalComments += 1;

            // Update comment count on the parent review if it matches the selected review
            if (state.selectedReview && state.selectedReview.reviewId === action.payload.reviewId) {
                const commentCount = (state.selectedReview.commentCount || 0) + 1;
                state.selectedReview = {
                    ...state.selectedReview,
                    commentCount
                };
            }

            // Also update in main reviews list
            state.reviews = state.reviews.map(review => {
                if (review.reviewId === action.payload.reviewId) {
                    const commentCount = (review.commentCount || 0) + 1;
                    return { ...review, commentCount };
                }
                return review;
            });
        },
        addCommentFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // Update a comment
        updateCommentStart(state) {
            state.submitting = true;
            state.error = null;
        },
        updateCommentSuccess(state, action: PayloadAction<ReviewCommentResponseDTO>) {
            state.submitting = false;
            state.reviewComments = state.reviewComments.map(comment =>
                comment.commentId === action.payload.commentId ? action.payload : comment
            );
        },
        updateCommentFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // Delete a comment
        deleteCommentStart(state) {
            state.submitting = true;
            state.error = null;
        },
        deleteCommentSuccess(state, action: PayloadAction<{commentId: number, reviewId: number}>) {
            state.submitting = false;
            const { commentId, reviewId } = action.payload;

            // Remove from comments list
            state.reviewComments = state.reviewComments.filter(
                comment => comment.commentId !== commentId
            );

            if (state.totalComments > 0) {
                state.totalComments -= 1;
            }

            // Update comment count on the parent review if it matches the selected review
            if (state.selectedReview && state.selectedReview.reviewId === reviewId) {
                const commentCount = Math.max(0, (state.selectedReview.commentCount || 0) - 1);
                state.selectedReview = {
                    ...state.selectedReview,
                    commentCount
                };
            }

            // Also update in main reviews list
            state.reviews = state.reviews.map(review => {
                if (review.reviewId === reviewId) {
                    const commentCount = Math.max(0, (review.commentCount || 0) - 1);
                    return { ...review, commentCount };
                }
                return review;
            });
        },
        deleteCommentFailure(state, action: PayloadAction<string>) {
            state.submitting = false;
            state.error = action.payload;
        },

        // EXISTING UTILITY REDUCERS

        // Check if user has reviewed
        setHasUserReviewed(state, action: PayloadAction<boolean>) {
            state.hasUserReviewed = action.payload;
        },

        // Set user's review for current product (backward compatibility)
        setUserProductReview(state, action: PayloadAction<ProductReviewResponseDTO | null>) {
            state.userProductReview = action.payload;

            // Update userProductReviews if this is a new review
            if (action.payload !== null) {
                const review = action.payload; // Create a local variable to help TypeScript with type narrowing
                const reviewExists = state.userProductReviews.some(
                    existingReview => existingReview.reviewId === review.reviewId
                );

                if (!reviewExists) {
                    state.userProductReviews = [review, ...state.userProductReviews];
                }
            }

            state.hasUserReviewed = action.payload !== null || state.userProductReviews.length > 0;
        },

        // Clear user's reviews for current product
        clearUserProductReviews(state) {
            state.userProductReviews = [];
            state.userProductReview = null;
            state.hasUserReviewed = false;
        },

        // For backward compatibility
        clearUserProductReview(state) {
            state.userProductReview = null;

            // Only set hasUserReviewed to false if there are no other reviews
            if (state.userProductReviews.length === 0) {
                state.hasUserReviewed = false;
            }
        },

        // Set pagination for product reviews
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },

        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
            state.currentPage = 0; // Reset to first page when changing page size
        },

        // Set pagination for user reviews
        setUserReviewsCurrentPage(state, action: PayloadAction<number>) {
            state.userReviewsCurrentPage = action.payload;
        },

        setUserReviewsPageSize(state, action: PayloadAction<number>) {
            state.userReviewsPageSize = action.payload;
            state.userReviewsCurrentPage = 0;
        },

        // Set pagination for comments
        setCommentsCurrentPage(state, action: PayloadAction<number>) {
            state.commentsCurrentPage = action.payload;
        },

        setCommentsPageSize(state, action: PayloadAction<number>) {
            state.commentsPageSize = action.payload;
            state.commentsCurrentPage = 0;
        },

        // Set sorting
        setSortBy(state, action: PayloadAction<string>) {
            state.sortBy = action.payload;
            state.currentPage = 0;
        },

        setSortDir(state, action: PayloadAction<'asc' | 'desc'>) {
            state.sortDir = action.payload;
            state.currentPage = 0;
        },

        setSorting(state, action: PayloadAction<{ sortBy: string; sortDir: 'asc' | 'desc' }>) {
            state.sortBy = action.payload.sortBy;
            state.sortDir = action.payload.sortDir;
            state.currentPage = 0;
        },

        // Clear all review data
        clearReviewData(state) {
            state.reviews = [];
            state.totalReviews = 0;
            state.reviewSummary = null;
            state.selectedReview = null;
            state.userProductReview = null;
            state.userProductReviews = [];
            state.hasUserReviewed = false;
            state.reviewComments = [];
            state.totalComments = 0;
            state.currentPage = 0;
            state.totalPages = 0;
            state.commentsCurrentPage = 0;
            state.commentsTotalPages = 0;
            state.error = null;
        },

        // Clear error
        clearError(state) {
            state.error = null;
        }
    }
});

export const {
    // Existing actions
    fetchProductReviewsStart,
    fetchProductReviewsSuccess,
    fetchProductReviewsFailure,

    fetchReviewSummaryStart,
    fetchReviewSummarySuccess,
    fetchReviewSummaryFailure,

    fetchReviewDetailStart,
    fetchReviewDetailSuccess,
    fetchReviewDetailFailure,

    createReviewStart,
    createReviewSuccess,
    createReviewFailure,

    updateReviewStart,
    updateReviewSuccess,
    updateReviewFailure,

    deleteReviewStart,
    deleteReviewSuccess,
    deleteReviewFailure,

    fetchUserReviewsStart,
    fetchUserReviewsSuccess,
    fetchUserReviewsFailure,

    // New actions for multiple user reviews
    fetchUserProductReviewsStart,
    fetchUserProductReviewsSuccess,
    fetchUserProductReviewsFailure,

    // New actions for comments
    fetchReviewCommentsStart,
    fetchReviewCommentsSuccess,
    fetchReviewCommentsFailure,

    addCommentStart,
    addCommentSuccess,
    addCommentFailure,

    updateCommentStart,
    updateCommentSuccess,
    updateCommentFailure,

    deleteCommentStart,
    deleteCommentSuccess,
    deleteCommentFailure,

    // Existing utility actions
    setHasUserReviewed,
    setUserProductReview,
    clearUserProductReview,
    clearUserProductReviews,

    setCurrentPage,
    setPageSize,
    setUserReviewsCurrentPage,
    setUserReviewsPageSize,

    // New pagination actions for comments
    setCommentsCurrentPage,
    setCommentsPageSize,

    setSortBy,
    setSortDir,
    setSorting,

    clearReviewData,
    clearError
} = productReviewSlice.actions;

export default productReviewSlice.reducer;