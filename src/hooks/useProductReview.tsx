import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '../redux/store';
import {
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
    fetchUserProductReviewsStart,
    fetchUserProductReviewsSuccess,
    fetchUserProductReviewsFailure,
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
    setHasUserReviewed,
    setUserProductReview,
    clearUserProductReview,
    clearUserProductReviews,
    setCurrentPage,
    setPageSize,
    setUserReviewsCurrentPage,
    setUserReviewsPageSize,
    setCommentsCurrentPage,
    setCommentsPageSize,
    setSortBy,
    setSortDir,
    setSorting,
    clearReviewData,
    clearError
} from '../redux/slices/productReviewSlice';

import {
    selectReviews,
    selectTotalReviews,
    selectReviewsLoading,
    selectReviewSummary,
    selectSummaryLoading,
    selectUserReviews,
    selectTotalUserReviews,
    selectUserReviewsLoading,
    selectSelectedReview,
    selectReviewLoading,
    selectSubmitting,
    selectUserProductReview,
    selectUserProductReviews,
    selectHasUserReviewed,
    selectReviewComments,
    selectTotalComments,
    selectCommentsLoading,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectUserReviewsCurrentPage,
    selectUserReviewsPageSize,
    selectUserReviewsTotalPages,
    selectCommentsCurrentPage,
    selectCommentsPageSize,
    selectCommentsTotalPages,
    selectSortBy,
    selectSortDir,
    selectReviewError,
    selectAverageRating,
    selectRatingCounts,
    selectRatingPercentages,
    selectLatestReviews,
    selectReviewExistenceState,
    selectReviewSummaryData,
    selectLoadingStates,
    selectCommentsWithPagination,
    selectSortedComments
} from '../redux/selectors/productReviewSelectors';

import ProductReviewService from '../services/product.review.service';
import {
    ProductReviewCreateDTO,
    ProductReviewResponseDTO,
    ProductReviewSummaryDTO,
    ProductReviewUpdateDTO,
    ReviewFilterParams,
    ReviewCommentCreateDTO,
    ReviewCommentUpdateDTO,
    ReviewCommentResponseDTO,
} from '../types/product.review.types';
import {PageResponse} from '../types/product.types';
import {ApiResponse} from '../types/auth.types';
import {useRef, useCallback} from 'react';

// Define type for Axios error
interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
        status?: number;
    };
    request?: unknown;
    message?: string;
}

// Track requests to prevent duplicate calls
const userReviewStatusRequests = new Map<string, {
    timestamp: number;
    inProgress: boolean;
    result?: boolean;
}>();

const userProductReviewRequests = new Map<string, {
    timestamp: number;
    inProgress: boolean;
    result?: ProductReviewResponseDTO | null;
}>();

const userProductReviewsRequests = new Map<string, {
    timestamp: number;
    inProgress: boolean;
    result?: ProductReviewResponseDTO[];
}>();

const reviewCommentsRequests = new Map<string, {
    timestamp: number;
    inProgress: boolean;
}>();

const REQUEST_THROTTLE = 2000; // 2 seconds

const useProductReview = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Basic review data
    const reviews = useSelector(selectReviews);
    const totalReviews = useSelector(selectTotalReviews);
    const reviewSummary = useSelector(selectReviewSummary);
    const selectedReview = useSelector(selectSelectedReview);

    // User reviews
    const userReviews = useSelector(selectUserReviews);
    const totalUserReviews = useSelector(selectTotalUserReviews);
    const userProductReview = useSelector(selectUserProductReview);
    const userProductReviews = useSelector(selectUserProductReviews);
    const hasUserReviewed = useSelector(selectHasUserReviewed);

    // Review comments
    const reviewComments = useSelector(selectReviewComments);
    const totalComments = useSelector(selectTotalComments);
    const sortedComments = useSelector(selectSortedComments);
    const commentsWithPagination = useSelector(selectCommentsWithPagination);

    // Loading and error states
    const reviewsLoading = useSelector(selectReviewsLoading);
    const summaryLoading = useSelector(selectSummaryLoading);
    const userReviewsLoading = useSelector(selectUserReviewsLoading);
    const commentsLoading = useSelector(selectCommentsLoading);
    const reviewLoading = useSelector(selectReviewLoading);
    const submitting = useSelector(selectSubmitting);
    const error = useSelector(selectReviewError);
    const loadingStates = useSelector(selectLoadingStates);

    // Pagination
    const currentPage = useSelector(selectCurrentPage);
    const pageSize = useSelector(selectPageSize);
    const totalPages = useSelector(selectTotalPages);

    // User reviews pagination
    const userReviewsCurrentPage = useSelector(selectUserReviewsCurrentPage);
    const userReviewsPageSize = useSelector(selectUserReviewsPageSize);
    const userReviewsTotalPages = useSelector(selectUserReviewsTotalPages);

    // Comments pagination
    const commentsCurrentPage = useSelector(selectCommentsCurrentPage);
    const commentsPageSize = useSelector(selectCommentsPageSize);
    const commentsTotalPages = useSelector(selectCommentsTotalPages);

    // Sorting
    const sortBy = useSelector(selectSortBy);
    const sortDir = useSelector(selectSortDir);

    // Computed data
    const averageRating = useSelector(selectAverageRating);
    const ratingCounts = useSelector(selectRatingCounts);
    const ratingPercentages = useSelector(selectRatingPercentages);
    const latestReviews = useSelector(selectLatestReviews);
    const reviewExistenceState = useSelector(selectReviewExistenceState);
    const summaryData = useSelector(selectReviewSummaryData);

    // Request tracking
    const lastReviewsRequestRef = useRef({
        productId: 0,
        timestamp: 0,
        inProgress: false
    });

    const lastSummaryRequestRef = useRef({
        productId: 0,
        timestamp: 0,
        inProgress: false
    });

    const lastUserReviewsRequestRef = useRef({
        timestamp: 0,
        inProgress: false
    });

    const lastCommentsRequestRef = useRef({
        reviewId: 0,
        timestamp: 0,
        inProgress: false
    });

    /**
     * Get reviews for a product with pagination
     */
    const getProductReviews = useCallback(async (
        productId: number,
        params: ReviewFilterParams = {}
    ): Promise<PageResponse<ProductReviewResponseDTO>> => {
        const currentTime = Date.now();
        const isSameRequest = productId === lastReviewsRequestRef.current.productId;
        const isRecentRequest = currentTime - lastReviewsRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastReviewsRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate product reviews request for productId:', productId);
            // Return current data in state as mock response
            return new Promise((resolve) => {
                const mockResponse: PageResponse<ProductReviewResponseDTO> = {
                    content: reviews,
                    totalElements: totalReviews,
                    number: currentPage,
                    size: pageSize,
                    totalPages,
                    pageable: {
                        pageNumber: currentPage,
                        pageSize,
                        sort: {sorted: true, unsorted: false, empty: false},
                        offset: currentPage * pageSize,
                        paged: true,
                        unpaged: false
                    },
                    last: currentPage === totalPages - 1,
                    first: currentPage === 0,
                    sort: {sorted: true, unsorted: false, empty: false},
                    numberOfElements: reviews.length,
                    empty: reviews.length === 0
                };
                resolve(mockResponse);
            });
        }

        lastReviewsRequestRef.current = {
            productId,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchProductReviewsStart());
        try {
            const finalParams: ReviewFilterParams = {
                ...params,
                page: params.page !== undefined ? params.page : currentPage,
                size: params.size !== undefined ? params.size : pageSize,
                sortBy: params.sortBy || sortBy,
                sortDir: params.sortDir || sortDir
            };

            console.log(`Fetching reviews for product ${productId} with params:`, finalParams);
            const response = await ProductReviewService.getProductReviews(productId, finalParams);

            if (!response.content) {
                console.error('Invalid reviews response structure:', response);
                throw new Error('Invalid API response structure');
            }

            dispatch(fetchProductReviewsSuccess(response));
            lastReviewsRequestRef.current.inProgress = false;
            return response;
        } catch (error) {
            lastReviewsRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch product reviews';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Product reviews fetch error:', error);
            dispatch(fetchProductReviewsFailure(errorMessage));
            throw error;
        }
    }, [currentPage, dispatch, pageSize, reviews, sortBy, sortDir, totalPages, totalReviews]);

    /**
     * Get review summary for a product
     */
    const getProductReviewSummary = useCallback(async (productId: number): Promise<ProductReviewSummaryDTO> => {
        const currentTime = Date.now();
        const isSameRequest = productId === lastSummaryRequestRef.current.productId;
        const isRecentRequest = currentTime - lastSummaryRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastSummaryRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate review summary request for productId:', productId);

            if (reviewSummary) {
                return reviewSummary;
            }
        }

        lastSummaryRequestRef.current = {
            productId,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchReviewSummaryStart());
        try {
            console.log(`Fetching review summary for product ${productId}`);
            const summary = await ProductReviewService.getProductReviewSummary(productId);

            dispatch(fetchReviewSummarySuccess(summary));
            lastSummaryRequestRef.current.inProgress = false;
            return summary;
        } catch (error) {
            lastSummaryRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch review summary';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Review summary fetch error:', error);
            dispatch(fetchReviewSummaryFailure(errorMessage));
            throw error;
        }
    }, [dispatch, reviewSummary]);

    /**
     * Get a specific review by ID
     */
    const getReviewById = useCallback(async (reviewId: number): Promise<ProductReviewResponseDTO> => {
        dispatch(fetchReviewDetailStart());
        try {
            console.log(`Fetching review details for ID ${reviewId}`);
            const review = await ProductReviewService.getReviewById(reviewId);

            dispatch(fetchReviewDetailSuccess(review));
            return review;
        } catch (error) {
            let errorMessage = 'Failed to fetch review details';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Review detail fetch error:', error);
            dispatch(fetchReviewDetailFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Submit a new review for a product
     */
    const createReview = useCallback(async (reviewData: ProductReviewCreateDTO): Promise<ProductReviewResponseDTO> => {
        dispatch(createReviewStart());
        try {
            // Basic client-side validation
            if (!reviewData.productId) {
                throw new Error('Product ID is required');
            }

            if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // userId is now handled by the backend using the JWT token
            // We don't need to set it explicitly here

            console.log('Creating new review for product:', reviewData.productId);
            const createdReview = await ProductReviewService.createReview(reviewData);

            dispatch(createReviewSuccess(createdReview));
            dispatch(setHasUserReviewed(true));
            dispatch(setUserProductReview(createdReview));

            // Clear the cache for this product to force refresh
            const requestKey = `product_${reviewData.productId}`;
            userReviewStatusRequests.delete(requestKey);
            userProductReviewRequests.delete(requestKey);
            userProductReviewsRequests.delete(requestKey);

            return createdReview;
        } catch (error) {
            let errorMessage = 'Failed to create review';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object') {
                const axiosError = error as AxiosErrorResponse;
                // Extract error message from backend response if available
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.status === 401) {
                    errorMessage = 'You must be logged in to submit a review';
                } else if (axiosError.response?.status === 403) {
                    errorMessage = 'You are not authorized to submit this review';
                } else if (axiosError.response?.status === 400) {
                    errorMessage = 'Invalid review data. Please check your input and try again';
                }
            }

            console.error('Review creation error:', error);
            dispatch(createReviewFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Update an existing review
     */
    const updateReview = useCallback(async (
        reviewId: number,
        reviewData: ProductReviewUpdateDTO
    ): Promise<ProductReviewResponseDTO> => {
        dispatch(updateReviewStart());
        try {
            console.log(`Updating review ${reviewId}:`, reviewData);
            const updatedReview = await ProductReviewService.updateReview(reviewId, reviewData);

            dispatch(updateReviewSuccess(updatedReview));

            // Clear the cache for this product to force refresh
            if (updatedReview.productId) {
                const requestKey = `product_${updatedReview.productId}`;
                userReviewStatusRequests.delete(requestKey);
                userProductReviewRequests.delete(requestKey);
                userProductReviewsRequests.delete(requestKey);
            }

            return updatedReview;
        } catch (error) {
            let errorMessage = 'Failed to update review';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Review update error:', error);
            dispatch(updateReviewFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Delete a review
     */
    const deleteReview = useCallback(async (reviewId: number): Promise<ApiResponse> => {
        dispatch(deleteReviewStart());
        try {
            console.log(`Deleting review ${reviewId}`);
            const response = await ProductReviewService.deleteReview(reviewId);

            dispatch(deleteReviewSuccess(reviewId));

            // If the deleted review was the user's review for the current product
            if (userProductReview && userProductReview.reviewId === reviewId) {
                dispatch(clearUserProductReview());

                // Clear the cache for this product to force refresh
                const requestKey = `product_${userProductReview.productId}`;
                userReviewStatusRequests.delete(requestKey);
                userProductReviewRequests.delete(requestKey);
                userProductReviewsRequests.delete(requestKey);
            }

            return response;
        } catch (error) {
            let errorMessage = 'Failed to delete review';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Review deletion error:', error);
            dispatch(deleteReviewFailure(errorMessage));
            throw error;
        }
    }, [dispatch, userProductReview]);

    /**
     * Get all reviews by the current user
     */
    const getUserReviews = useCallback(async (params: ReviewFilterParams = {}): Promise<PageResponse<ProductReviewResponseDTO>> => {
        const currentTime = Date.now();
        const isRecentRequest = currentTime - lastUserReviewsRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastUserReviewsRequestRef.current.inProgress;

        if (isRecentRequest || isRequestInProgress) {
            console.log('Skipping duplicate user reviews request');
            // Return current data as mock response
            return new Promise((resolve) => {
                const mockResponse: PageResponse<ProductReviewResponseDTO> = {
                    content: userReviews,
                    totalElements: totalUserReviews,
                    number: userReviewsCurrentPage,
                    size: userReviewsPageSize,
                    totalPages: userReviewsTotalPages,
                    pageable: {
                        pageNumber: userReviewsCurrentPage,
                        pageSize: userReviewsPageSize,
                        sort: {sorted: true, unsorted: false, empty: false},
                        offset: userReviewsCurrentPage * userReviewsPageSize,
                        paged: true,
                        unpaged: false
                    },
                    last: userReviewsCurrentPage === userReviewsTotalPages - 1,
                    first: userReviewsCurrentPage === 0,
                    sort: {sorted: true, unsorted: false, empty: false},
                    numberOfElements: userReviews.length,
                    empty: userReviews.length === 0
                };
                resolve(mockResponse);
            });
        }

        lastUserReviewsRequestRef.current = {
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchUserReviewsStart());
        try {
            const finalParams: ReviewFilterParams = {
                ...params,
                page: params.page !== undefined ? params.page : userReviewsCurrentPage,
                size: params.size !== undefined ? params.size : userReviewsPageSize,
                sortBy: params.sortBy || 'createdAt',
                sortDir: params.sortDir || 'desc'
            };

            console.log('Fetching user reviews with params:', finalParams);
            const response = await ProductReviewService.getUserReviews(finalParams);

            if (!response.content) {
                console.error('Invalid user reviews response structure:', response);
                throw new Error('Invalid API response structure');
            }

            dispatch(fetchUserReviewsSuccess(response));
            lastUserReviewsRequestRef.current.inProgress = false;
            return response;
        } catch (error) {
            lastUserReviewsRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch user reviews';
            if (error instanceof Error) errorMessage = error.message;
            console.error('User reviews fetch error:', error);
            dispatch(fetchUserReviewsFailure(errorMessage));
            throw error;
        }
    }, [dispatch, userReviews, totalUserReviews, userReviewsCurrentPage, userReviewsPageSize, userReviewsTotalPages]);

    /**
     * Get all reviews by the current user for a specific product
     */
    const getUserProductReviews = useCallback(async (productId: number): Promise<ProductReviewResponseDTO[]> => {
        // Create a unique key for this request
        const requestKey = `product_reviews_${productId}`;
        const now = Date.now();

        // Check if we've made this request recently
        const lastRequest = userProductReviewsRequests.get(requestKey);
        if (lastRequest && now - lastRequest.timestamp < REQUEST_THROTTLE) {
            console.log(`Throttling user-product-reviews request for product ${productId} (last check: ${now - lastRequest.timestamp}ms ago)`);
            return lastRequest.result || userProductReviews;
        }

        // Check if this request is already in progress
        if (lastRequest && lastRequest.inProgress) {
            console.log(`Request already in progress for user-product-reviews on product ${productId}`);
            return userProductReviews;
        }

        // Mark this request as in progress
        userProductReviewsRequests.set(requestKey, { timestamp: now, inProgress: true });

        dispatch(fetchUserProductReviewsStart());
        try {
            console.log(`Fetching user's reviews for product ${productId}`);
            const response = await ProductReviewService.getUserReviewsForProduct(productId);

            // The response is MyReviewResponse type, extract the reviews array
            const reviews = response.hasReviews && response.reviews ? response.reviews : [];

            dispatch(fetchUserProductReviewsSuccess(reviews));

            userProductReviewsRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: reviews
            });

            return reviews;
        } catch (error) {
            let errorMessage = 'Failed to fetch user product reviews';
            if (error instanceof Error) errorMessage = error.message;
            console.error('User product reviews fetch error:', error);
            dispatch(fetchUserProductReviewsFailure(errorMessage));

            userProductReviewsRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: []
            });

            throw error;
        }
    }, [dispatch, userProductReviews]);

    /**
     * Check if the current user has already reviewed a product
     * Modified to prevent infinite loops
     */
    const checkUserReviewStatus = useCallback(async (productId: number): Promise<boolean> => {
        // Create a unique key for this request
        const requestKey = `product_${productId}`;
        const now = Date.now();

        // Check if we've made this request recently
        const lastRequest = userReviewStatusRequests.get(requestKey);
        if (lastRequest && now - lastRequest.timestamp < REQUEST_THROTTLE) {
            console.log(`Throttling has-reviewed check for product ${productId} (last check: ${now - lastRequest.timestamp}ms ago)`);
            return lastRequest.result !== undefined ? lastRequest.result : hasUserReviewed;
        }

        // Check if this request is already in progress
        if (lastRequest && lastRequest.inProgress) {
            console.log(`Request already in progress for has-reviewed check on product ${productId}`);
            return hasUserReviewed;
        }

        // Mark this request as in progress
        userReviewStatusRequests.set(requestKey, { timestamp: now, inProgress: true });

        try {
            console.log(`Checking if user has reviewed product ${productId}`);
            const hasReviewed = await ProductReviewService.hasUserReviewedProduct(productId);

            // Store the result and update state
            dispatch(setHasUserReviewed(hasReviewed));
            userReviewStatusRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: hasReviewed
            });

            return hasReviewed;
        } catch (error) {
            console.error('Error checking user review status:', error);
            userReviewStatusRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: false
            });
            return false;
        }
    }, [dispatch, hasUserReviewed]);

    /**
     * Get the current user's review for a specific product (for backward compatibility)
     */
    const getUserReviewForProduct = useCallback(async (productId: number): Promise<ProductReviewResponseDTO | null> => {
        // Create a unique key for this request
        const requestKey = `product_${productId}`;
        const now = Date.now();

        // Check if we've made this request recently
        const lastRequest = userProductReviewRequests.get(requestKey);
        if (lastRequest && now - lastRequest.timestamp < REQUEST_THROTTLE) {
            console.log(`Throttling my-review request for product ${productId} (last check: ${now - lastRequest.timestamp}ms ago)`);

            // Return current state if we already have it
            if (userProductReview && userProductReview.productId === productId) {
                return userProductReview;
            }

            // Return cached result if we have it
            if (lastRequest.result !== undefined) {
                return lastRequest.result;
            }

            return null;
        }

        // Check if this request is already in progress
        if (lastRequest && lastRequest.inProgress) {
            console.log(`Request already in progress for my-review on product ${productId}`);
            return userProductReview && userProductReview.productId === productId ? userProductReview : null;
        }

        // Mark this request as in progress
        userProductReviewRequests.set(requestKey, { timestamp: now, inProgress: true });

        try {
            console.log(`Fetching user's review for product ${productId}`);
            const response = await ProductReviewService.getUserReviewForProduct(productId);

            if (response.hasReview && response.review) {
                dispatch(setUserProductReview(response.review));
                userProductReviewRequests.set(requestKey, {
                    timestamp: now,
                    inProgress: false,
                    result: response.review
                });
                return response.review;
            } else {
                dispatch(clearUserProductReview());
                userProductReviewRequests.set(requestKey, {
                    timestamp: now,
                    inProgress: false,
                    result: null
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching user product review:', error);
            dispatch(clearUserProductReview());
            userProductReviewRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: null
            });
            return null;
        }
    }, [dispatch, userProductReview]);

    /**
     * Get the current user's latest review for a specific product
     */
    const getUserLatestReviewForProduct = useCallback(async (productId: number): Promise<ProductReviewResponseDTO | null> => {
        // Create a unique key for this request
        const requestKey = `product_latest_${productId}`;
        const now = Date.now();

        // Check if this request is already in progress
        const lastRequest = userProductReviewRequests.get(requestKey);
        if (lastRequest && lastRequest.inProgress) {
            console.log(`Request already in progress for latest-review on product ${productId}`);
            return userProductReview && userProductReview.productId === productId ? userProductReview : null;
        }

        // Mark this request as in progress
        userProductReviewRequests.set(requestKey, { timestamp: now, inProgress: true });

        try {
            console.log(`Fetching user's latest review for product ${productId}`);
            const response = await ProductReviewService.getUserLatestReviewForProduct(productId);

            if (response.hasReview && response.review) {
                dispatch(setUserProductReview(response.review));
                userProductReviewRequests.set(requestKey, {
                    timestamp: now,
                    inProgress: false,
                    result: response.review
                });
                return response.review;
            } else {
                dispatch(clearUserProductReview());
                userProductReviewRequests.set(requestKey, {
                    timestamp: now,
                    inProgress: false,
                    result: null
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching user latest product review:', error);
            dispatch(clearUserProductReview());
            userProductReviewRequests.set(requestKey, {
                timestamp: now,
                inProgress: false,
                result: null
            });
            return null;
        }
    }, [dispatch, userProductReview]);

    /**
     * Get comments for a specific review with pagination
     */
    const getReviewComments = useCallback(async (
        reviewId: number,
        params: ReviewFilterParams = {}
    ): Promise<PageResponse<ReviewCommentResponseDTO>> => {
        const currentTime = Date.now();
        const isSameRequest = reviewId === lastCommentsRequestRef.current.reviewId;
        const isRecentRequest = currentTime - lastCommentsRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastCommentsRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate comments request for reviewId:', reviewId);
            // Return current data in state as mock response
            return new Promise((resolve) => {
                const mockResponse: PageResponse<ReviewCommentResponseDTO> = {
                    content: reviewComments,
                    totalElements: totalComments,
                    number: commentsCurrentPage,
                    size: commentsPageSize,
                    totalPages: commentsTotalPages,
                    pageable: {
                        pageNumber: commentsCurrentPage,
                        pageSize: commentsPageSize,
                        sort: {sorted: true, unsorted: false, empty: false},
                        offset: commentsCurrentPage * commentsPageSize,
                        paged: true,
                        unpaged: false
                    },
                    last: commentsCurrentPage === commentsTotalPages - 1,
                    first: commentsCurrentPage === 0,
                    sort: {sorted: true, unsorted: false, empty: false},
                    numberOfElements: reviewComments.length,
                    empty: reviewComments.length === 0
                };
                resolve(mockResponse);
            });
        }

        lastCommentsRequestRef.current = {
            reviewId,
            timestamp: currentTime,
            inProgress: true
        };

        // Create a unique key for request tracking
        const requestKey = `review_comments_${reviewId}`;
        reviewCommentsRequests.set(requestKey, { timestamp: currentTime, inProgress: true });

        dispatch(fetchReviewCommentsStart());
        try {
            const finalParams: ReviewFilterParams = {
                ...params,
                page: params.page !== undefined ? params.page : commentsCurrentPage,
                size: params.size !== undefined ? params.size : commentsPageSize,
                sortBy: params.sortBy || 'createdAt',
                sortDir: params.sortDir || 'desc'
            };

            console.log(`Fetching comments for review ${reviewId} with params:`, finalParams);
            const response = await ProductReviewService.getReviewComments(reviewId, finalParams);

            if (!response.content) {
                console.error('Invalid comments response structure:', response);
                throw new Error('Invalid API response structure');
            }

            dispatch(fetchReviewCommentsSuccess(response));
            lastCommentsRequestRef.current.inProgress = false;
            reviewCommentsRequests.set(requestKey, { timestamp: currentTime, inProgress: false });
            return response;
        } catch (error) {
            lastCommentsRequestRef.current.inProgress = false;
            reviewCommentsRequests.set(requestKey, { timestamp: currentTime, inProgress: false });
            let errorMessage = 'Failed to fetch review comments';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Review comments fetch error:', error);
            dispatch(fetchReviewCommentsFailure(errorMessage));
            throw error;
        }
    }, [commentsCurrentPage, commentsTotalPages, commentsPageSize, dispatch, reviewComments, totalComments]);

    /**
     * Add a comment to a review
     */
    const addComment = useCallback(async (
        reviewId: number,
        commentData: ReviewCommentCreateDTO
    ): Promise<ReviewCommentResponseDTO> => {
        dispatch(addCommentStart());
        try {
            // Client-side validation if needed
            if (!commentData.content || commentData.content.trim() === '') {
                throw new Error('Comment content cannot be empty');
            }

            console.log(`Adding comment to review ${reviewId}:`, commentData);
            const comment = await ProductReviewService.addCommentToReview(reviewId, commentData);

            dispatch(addCommentSuccess(comment));
            return comment;
        } catch (error) {
            let errorMessage = 'Failed to add comment';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Comment addition error:', error);
            dispatch(addCommentFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Update an existing comment
     */
    const updateComment = useCallback(async (
        commentId: number,
        commentData: ReviewCommentUpdateDTO
    ): Promise<ReviewCommentResponseDTO> => {
        dispatch(updateCommentStart());
        try {
            // Client-side validation if needed
            if (!commentData.content || commentData.content.trim() === '') {
                throw new Error('Comment content cannot be empty');
            }

            console.log(`Updating comment ${commentId}:`, commentData);
            const updatedComment = await ProductReviewService.updateComment(commentId, commentData);

            dispatch(updateCommentSuccess(updatedComment));
            return updatedComment;
        } catch (error) {
            let errorMessage = 'Failed to update comment';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Comment update error:', error);
            dispatch(updateCommentFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Delete a comment
     */
    const deleteComment = useCallback(async (commentId: number, reviewId: number): Promise<ApiResponse> => {
        dispatch(deleteCommentStart());
        try {
            console.log(`Deleting comment ${commentId} from review ${reviewId}`);
            const response = await ProductReviewService.deleteComment(commentId);

            dispatch(deleteCommentSuccess({ commentId, reviewId }));
            return response;
        } catch (error) {
            let errorMessage = 'Failed to delete comment';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Comment deletion error:', error);
            dispatch(deleteCommentFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    /**
     * Load all review data for a product
     * Modified to prevent excessive API calls
     */
    const loadProductReviewData = useCallback(async (
        productId: number,
        reviewParams: ReviewFilterParams = {}
    ): Promise<boolean> => {
        try {
            // Run these requests in parallel but with better throttling
            const [reviewsResult, summaryResult] = await Promise.all([
                getProductReviews(productId, reviewParams),
                getProductReviewSummary(productId)
            ]);

            // Only check user review status if we successfully got the basic data
            if (reviewsResult && summaryResult) {
                // These calls are now protected with throttling
                await checkUserReviewStatus(productId);

                // Get all user reviews for this product
                await getUserProductReviews(productId);

                // For backward compatibility
                await getUserReviewForProduct(productId);
            }

            return true;
        } catch (error) {
            console.error('Failed to load product review data:', error);
            return false;
        }
    }, [getProductReviews, getProductReviewSummary, checkUserReviewStatus, getUserProductReviews, getUserReviewForProduct]);

    /**
     * Load comments for the selected review
     */
    const loadReviewComments = useCallback(async (
        reviewId: number,
        params: ReviewFilterParams = {}
    ): Promise<boolean> => {
        try {
            await getReviewComments(reviewId, params);
            return true;
        } catch (error) {
            console.error('Failed to load review comments:', error);
            return false;
        }
    }, [getReviewComments]);

    /**
     * Clear all user reviews for a product (using the imported action)
     */
    const clearAllUserProductReviews = useCallback((productId: number) => {
        dispatch(clearUserProductReviews());

        // Clear related caches
        const requestKey = `product_${productId}`;
        userReviewStatusRequests.delete(requestKey);
        userProductReviewRequests.delete(requestKey);
        userProductReviewsRequests.delete(`product_reviews_${productId}`);

        console.log(`Cleared all user reviews for product ${productId}`);
    }, [dispatch]);

    // Pagination helpers
    const updateCurrentPage = useCallback((page: number) => dispatch(setCurrentPage(page)), [dispatch]);
    const updatePageSize = useCallback((size: number) => dispatch(setPageSize(size)), [dispatch]);
    const updateUserReviewsCurrentPage = useCallback((page: number) => dispatch(setUserReviewsCurrentPage(page)), [dispatch]);
    const updateUserReviewsPageSize = useCallback((size: number) => dispatch(setUserReviewsPageSize(size)), [dispatch]);
    const updateCommentsCurrentPage = useCallback((page: number) => dispatch(setCommentsCurrentPage(page)), [dispatch]);
    const updateCommentsPageSize = useCallback((size: number) => dispatch(setCommentsPageSize(size)), [dispatch]);

    // Sorting helpers
    const updateSortBy = useCallback((sortByValue: string) => dispatch(setSortBy(sortByValue)), [dispatch]);
    const updateSortDir = useCallback((sortDirValue: 'asc' | 'desc') => dispatch(setSortDir(sortDirValue)), [dispatch]);
    const updateSorting = useCallback((sortByValue: string, sortDirValue: 'asc' | 'desc') =>
        dispatch(setSorting({sortBy: sortByValue, sortDir: sortDirValue})), [dispatch]);

    // Reset helpers
    const resetReviewData = useCallback(() => {
        // Clear caches when resetting data
        userReviewStatusRequests.clear();
        userProductReviewRequests.clear();
        userProductReviewsRequests.clear();
        reviewCommentsRequests.clear();
        dispatch(clearReviewData());
    }, [dispatch]);

    const resetError = useCallback(() => dispatch(clearError()), [dispatch]);

    /**
     * Load the next page of product reviews
     */
    const loadNextPage = useCallback(async (
        productId: number
    ): Promise<PageResponse<ProductReviewResponseDTO> | null> => {
        if (currentPage < totalPages - 1) {
            const nextPage = currentPage + 1;
            dispatch(setCurrentPage(nextPage));

            return getProductReviews(productId, {
                page: nextPage,
                size: pageSize,
                sortBy,
                sortDir
            });
        }
        return null;
    }, [currentPage, totalPages, pageSize, sortBy, sortDir, dispatch, getProductReviews]);

    /**
     * Load the previous page of product reviews
     */
    const loadPreviousPage = useCallback(async (
        productId: number
    ): Promise<PageResponse<ProductReviewResponseDTO> | null> => {
        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            dispatch(setCurrentPage(prevPage));

            return getProductReviews(productId, {
                page: prevPage,
                size: pageSize,
                sortBy,
                sortDir
            });
        }
        return null;
    }, [currentPage, pageSize, sortBy, sortDir, dispatch, getProductReviews]);

    /**
     * Load the next page of comments
     */
    const loadNextCommentsPage = useCallback(async (
        reviewId: number
    ): Promise<PageResponse<ReviewCommentResponseDTO> | null> => {
        if (commentsCurrentPage < commentsTotalPages - 1) {
            const nextPage = commentsCurrentPage + 1;
            dispatch(setCommentsCurrentPage(nextPage));

            return getReviewComments(reviewId, {
                page: nextPage,
                size: commentsPageSize
            });
        }
        return null;
    }, [commentsCurrentPage, commentsTotalPages, commentsPageSize, dispatch, getReviewComments]);

    /**
     * Load the previous page of comments
     */
    const loadPreviousCommentsPage = useCallback(async (
        reviewId: number
    ): Promise<PageResponse<ReviewCommentResponseDTO> | null> => {
        if (commentsCurrentPage > 0) {
            const prevPage = commentsCurrentPage - 1;
            dispatch(setCommentsCurrentPage(prevPage));

            return getReviewComments(reviewId, {
                page: prevPage,
                size: commentsPageSize
            });
        }
        return null;
    }, [commentsCurrentPage, commentsPageSize, dispatch, getReviewComments]);

    return {
        // Data
        reviews,
        totalReviews,
        reviewSummary,
        userReviews,
        totalUserReviews,
        selectedReview,
        userProductReview,
        userProductReviews,
        hasUserReviewed,
        reviewComments,
        totalComments,
        sortedComments,
        commentsWithPagination,

        // Loading and error states
        reviewsLoading,
        summaryLoading,
        userReviewsLoading,
        commentsLoading,
        reviewLoading,
        submitting,
        error,
        loadingStates,

        // Pagination
        currentPage,
        pageSize,
        totalPages,
        userReviewsCurrentPage,
        userReviewsPageSize,
        userReviewsTotalPages,
        commentsCurrentPage,
        commentsPageSize,
        commentsTotalPages,

        // Sorting
        sortBy,
        sortDir,

        // Computed data
        averageRating,
        ratingCounts,
        ratingPercentages,
        latestReviews,
        reviewExistenceState,
        summaryData,

        // API methods
        getProductReviews,
        getProductReviewSummary,
        getReviewById,
        createReview,
        updateReview,
        deleteReview,
        getUserReviews,
        getUserProductReviews,
        checkUserReviewStatus,
        getUserReviewForProduct,
        getUserLatestReviewForProduct,
        getReviewComments,
        addComment,
        updateComment,
        deleteComment,
        loadProductReviewData,
        loadReviewComments,
        clearAllUserProductReviews,

        // Helpers
        updateCurrentPage,
        updatePageSize,
        updateUserReviewsCurrentPage,
        updateUserReviewsPageSize,
        updateCommentsCurrentPage,
        updateCommentsPageSize,
        updateSortBy,
        updateSortDir,
        updateSorting,
        resetReviewData,
        resetError,
        loadNextPage,
        loadPreviousPage,
        loadNextCommentsPage,
        loadPreviousCommentsPage
    };
};

export default useProductReview;