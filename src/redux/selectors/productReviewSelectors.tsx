import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Basic selectors with null checks and default values
export const selectReviews = (state: RootState) => state?.productReview?.reviews || [];
export const selectTotalReviews = (state: RootState) => state?.productReview?.totalReviews || 0;
export const selectReviewSummary = (state: RootState) => state?.productReview?.reviewSummary || null;

export const selectUserReviews = (state: RootState) => state?.productReview?.userReviews || [];
export const selectTotalUserReviews = (state: RootState) => state?.productReview?.totalUserReviews || 0;

// Multiple user reviews for a product
export const selectUserProductReviews = (state: RootState) => state?.productReview?.userProductReviews || [];

// For backward compatibility
export const selectUserProductReview = (state: RootState) => state?.productReview?.userProductReview || null;
export const selectHasUserReviewed = (state: RootState) => state?.productReview?.hasUserReviewed || false;

export const selectSelectedReview = (state: RootState) => state?.productReview?.selectedReview || null;

// Review comments
export const selectReviewComments = (state: RootState) => state?.productReview?.reviewComments || [];
export const selectTotalComments = (state: RootState) => state?.productReview?.totalComments || 0;

// Loading states
export const selectReviewsLoading = (state: RootState) => state?.productReview?.reviewsLoading || false;
export const selectSummaryLoading = (state: RootState) => state?.productReview?.summaryLoading || false;
export const selectUserReviewsLoading = (state: RootState) => state?.productReview?.userReviewsLoading || false;
export const selectCommentsLoading = (state: RootState) => state?.productReview?.commentsLoading || false;
export const selectSubmitting = (state: RootState) => state?.productReview?.submitting || false;
export const selectReviewLoading = (state: RootState) => state?.productReview?.loading || false;

export const selectReviewError = (state: RootState) => state?.productReview?.error || null;

// Reviews pagination
export const selectCurrentPage = (state: RootState) => state?.productReview?.currentPage || 0;
export const selectPageSize = (state: RootState) => state?.productReview?.pageSize || 10;
export const selectTotalPages = (state: RootState) => state?.productReview?.totalPages || 0;

// User reviews pagination
export const selectUserReviewsCurrentPage = (state: RootState) => state?.productReview?.userReviewsCurrentPage || 0;
export const selectUserReviewsPageSize = (state: RootState) => state?.productReview?.userReviewsPageSize || 10;
export const selectUserReviewsTotalPages = (state: RootState) => state?.productReview?.userReviewsTotalPages || 0;

// Comments pagination
export const selectCommentsCurrentPage = (state: RootState) => state?.productReview?.commentsCurrentPage || 0;
export const selectCommentsPageSize = (state: RootState) => state?.productReview?.commentsPageSize || 10;
export const selectCommentsTotalPages = (state: RootState) => state?.productReview?.commentsTotalPages || 0;

// Sorting
export const selectSortBy = (state: RootState) => state?.productReview?.sortBy || 'createdAt';
export const selectSortDir = (state: RootState) => state?.productReview?.sortDir || 'desc';

export const selectLastRequestTimestamp = (state: RootState) => state?.productReview?.lastRequestTimestamp || 0;

// Combined selectors
export const selectReviewsWithPagination = createSelector(
    [selectReviews, selectCurrentPage, selectPageSize, selectTotalPages, selectTotalReviews],
    (reviews, currentPage, pageSize, totalPages, totalReviews) => ({
        reviews,
        currentPage,
        pageSize,
        totalPages,
        totalReviews
    })
);

export const selectUserReviewsWithPagination = createSelector(
    [selectUserReviews, selectUserReviewsCurrentPage, selectUserReviewsPageSize, selectUserReviewsTotalPages, selectTotalUserReviews],
    (userReviews, currentPage, pageSize, totalPages, totalReviews) => ({
        reviews: userReviews,
        currentPage,
        pageSize,
        totalPages,
        totalReviews
    })
);

// New selector for comments with pagination
export const selectCommentsWithPagination = createSelector(
    [selectReviewComments, selectCommentsCurrentPage, selectCommentsPageSize, selectCommentsTotalPages, selectTotalComments],
    (comments, currentPage, pageSize, totalPages, totalComments) => ({
        comments,
        currentPage,
        pageSize,
        totalPages,
        totalComments
    })
);

export const selectSorting = createSelector(
    [selectSortBy, selectSortDir],
    (sortBy, sortDir) => ({
        sortBy,
        sortDir
    })
);

// Utility selectors
export const selectAverageRating = createSelector(
    [selectReviewSummary],
    (summary) => summary?.averageRating || 0
);

export const selectRatingCounts = createSelector(
    [selectReviewSummary],
    (summary) => {
        if (!summary) return {
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            twoStar: 0,
            oneStar: 0
        };

        return {
            fiveStar: summary.fiveStarCount,
            fourStar: summary.fourStarCount,
            threeStar: summary.threeStarCount,
            twoStar: summary.twoStarCount,
            oneStar: summary.oneStarCount
        };
    }
);

export const selectRatingPercentages = createSelector(
    [selectReviewSummary],
    (summary) => {
        if (!summary || summary.totalReviews === 0) {
            return {
                fiveStar: 0,
                fourStar: 0,
                threeStar: 0,
                twoStar: 0,
                oneStar: 0
            };
        }

        const total = summary.totalReviews;
        return {
            fiveStar: Math.round((summary.fiveStarCount / total) * 100),
            fourStar: Math.round((summary.fourStarCount / total) * 100),
            threeStar: Math.round((summary.threeStarCount / total) * 100),
            twoStar: Math.round((summary.twoStarCount / total) * 100),
            oneStar: Math.round((summary.oneStarCount / total) * 100)
        };
    }
);

export const selectLatestReviews = createSelector(
    [selectReviewSummary],
    (summary) => summary?.latestReviews || []
);

// Updated to support multiple reviews per user
export const selectReviewExistenceState = createSelector(
    [selectHasUserReviewed, selectUserProductReviews, selectUserProductReview],
    (hasReviewed, userProductReviews, userProductReview) => ({
        hasReviewed,
        reviewCount: userProductReviews.length,
        reviewId: userProductReview?.reviewId ||
            (userProductReviews.length > 0 ? userProductReviews[0].reviewId : null),
        canReview: true  // Users can always review now, even if they already have
    })
);

export const selectReviewSummaryData = createSelector(
    [selectReviewSummary, selectSummaryLoading],
    (summary, loading) => ({
        productId: summary?.productId || 0,
        productName: summary?.productName || '',
        averageRating: summary?.averageRating || 0,
        totalReviews: summary?.totalReviews || 0,
        ratingCounts: {
            fiveStar: summary?.fiveStarCount || 0,
            fourStar: summary?.fourStarCount || 0,
            threeStar: summary?.threeStarCount || 0,
            twoStar: summary?.twoStarCount || 0,
            oneStar: summary?.oneStarCount || 0
        },
        loading
    })
);

// Filter reviews by rating
export const selectFilteredReviews = createSelector(
    [selectReviews, (_: RootState, rating: number | null) => rating],
    (reviews, rating) => {
        if (rating === null) return reviews;
        return reviews.filter(review => review.rating === rating);
    }
);

// Sort reviews by specified criteria
export const selectSortedReviews = createSelector(
    [
        selectReviews,
        (_: RootState, sortBy: string) => sortBy,
        (_: RootState, _sortBy: string, sortDir: 'asc' | 'desc') => sortDir
    ],
    (reviews, sortBy, sortDir) => {
        if (!reviews || !reviews.length) return [];

        const sortedReviews = [...reviews];

        return sortedReviews.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'rating':
                    comparison = a.rating - b.rating;
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'commentCount':
                    comparison = (a.commentCount || 0) - (b.commentCount || 0);
                    break;
                default:
                    comparison = 0;
            }

            return sortDir === 'asc' ? comparison : -comparison;
        });
    }
);

// Selector for review comments sorted by date
export const selectSortedComments = createSelector(
    [selectReviewComments],
    (comments) => {
        if (!comments || !comments.length) return [];

        return [...comments].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
);

// Select earliest and latest review dates
export const selectReviewDateRange = createSelector(
    [selectReviews],
    (reviews) => {
        if (!reviews || !reviews.length) return { earliest: null, latest: null };

        const dates = reviews.map(review => new Date(review.createdAt).getTime());
        return {
            earliest: new Date(Math.min(...dates)),
            latest: new Date(Math.max(...dates))
        };
    }
);

// Check if reviews are loaded
export const selectAreReviewsLoaded = createSelector(
    [selectReviews, selectReviewSummary, selectReviewsLoading, selectSummaryLoading],
    (reviews, summary, reviewsLoading, summaryLoading) =>
        !reviewsLoading && !summaryLoading && reviews && reviews.length > 0 && !!summary
);

// UI state selectors
export const selectIsSubmittingOrLoading = createSelector(
    [selectSubmitting, selectReviewLoading],
    (submitting, loading) => submitting || loading
);

export const selectLoadingStates = createSelector(
    [selectReviewsLoading, selectSummaryLoading, selectUserReviewsLoading, selectCommentsLoading, selectSubmitting, selectReviewLoading],
    (reviewsLoading, summaryLoading, userReviewsLoading, commentsLoading, submitting, loading) => ({
        reviewsLoading,
        summaryLoading,
        userReviewsLoading,
        commentsLoading,
        submitting,
        detailLoading: loading,
        anyLoading: reviewsLoading || summaryLoading || userReviewsLoading || commentsLoading || submitting || loading
    })
);

// New selector for user comments on a specific review
export const selectUserCommentsOnReview = createSelector(
    [selectReviewComments, (_: RootState, reviewId: number) => reviewId],
    (comments, reviewId) => comments.filter(comment =>
        comment.reviewId === reviewId && comment.isCurrentUser
    )
);

// New selector to check if the current user has commented on a review
export const selectHasUserCommentedOnReview = createSelector(
    [selectUserCommentsOnReview],
    (userComments) => userComments.length > 0
);