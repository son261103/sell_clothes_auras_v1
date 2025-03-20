// components/product-detail/ProductReviews.tsx
import React, { useEffect, useState, useRef } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import useProductReview from '../../hooks/useProductReview';
import useAuth from '../../hooks/useAuth';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import ReviewSummary from './ReviewSummary';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from './Pagination';
import NoReviews from './NoReviews';

interface ProductReviewsProps {
    productId: number;
    productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
    const {
        reviews,
        reviewSummary,
        hasUserReviewed,
        userProductReview,
        userProductReviews,
        reviewsLoading,
        summaryLoading,
        currentPage,
        totalPages,
        getProductReviews,
        loadProductReviewData,
        updateCurrentPage,
        checkUserReviewStatus,
        getUserProductReviews,
    } = useProductReview();

    const { isAuthenticated } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Add refs to track initialization and mounted state
    const reviewsInitialized = useRef<boolean>(false);
    const isMounted = useRef<boolean>(true);

    // Track last product ID to detect changes
    const lastProductIdRef = useRef<number | null>(null);

    // Initialize component and setup AOS
    useEffect(() => {
        // Initialize AOS
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
        });

        // Set mounted flag to true
        isMounted.current = true;

        // Cleanup function
        return () => {
            // Mark component as unmounted to prevent state updates after unmounting
            isMounted.current = false;
        };
    }, []);

    // Refresh AOS when reviews change
    useEffect(() => {
        if (reviews.length > 0) {
            AOS.refresh();
        }
    }, [reviews]);

    // Load review data only once when component mounts or productId changes
    useEffect(() => {
        // Skip if no product ID
        if (!productId) {
            return;
        }

        // Reset initialization when product ID changes
        if (lastProductIdRef.current !== productId) {
            reviewsInitialized.current = false;
            lastProductIdRef.current = productId;
        }

        // Only load if reviews haven't been initialized
        if (!reviewsInitialized.current) {
            console.log(`[ProductReviews] Loading reviews for product ${productId}`);

            loadProductReviewData(productId)
                .then(() => {
                    // Only update state if component is still mounted
                    if (isMounted.current) {
                        reviewsInitialized.current = true;
                    }
                })
                .catch((error) => {
                    console.error('[ProductReviews] Error loading product review data:', error);
                });
        }
    }, [productId, loadProductReviewData]);

    // Handle page change for pagination
    const handlePageChange = (page: number) => {
        // Skip if already on this page
        if (page === currentPage) return;

        updateCurrentPage(page);
        getProductReviews(productId, { page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Refresh reviews with debouncing to prevent excessive API calls
    const handleRefreshReviews = async () => {
        // Prevent duplicate refresh operations
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            await loadProductReviewData(productId);

            // Only check user review status if authenticated
            if (isAuthenticated) {
                // These API calls are now protected with throttling in our updated hook
                await Promise.all([
                    checkUserReviewStatus(productId),
                    getUserProductReviews(productId)
                ]);
            }
        } catch (error) {
            console.error('[ProductReviews] Error refreshing reviews:', error);
        } finally {
            // Only update state if component is still mounted
            if (isMounted.current) {
                setIsRefreshing(false);
            }
        }
    };

    // Show loading state when initially loading
    if (reviewsLoading && !reviews.length) {
        return (
            <div className="flex justify-center items-center py-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <LoadingSpinner size="medium" />
                </motion.div>
            </div>
        );
    }

    // Check if a review belongs to the current user
    const isUserReview = (reviewId: number): boolean => {
        return userProductReviews.some(review => review.reviewId === reviewId);
    };

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            data-aos="fade-up"
        >
            <motion.h2
                className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <FiMessageCircle className="mr-2" />
                Đánh giá từ khách hàng
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review Summary */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    data-aos="fade-right"
                    data-aos-delay="100"
                >
                    {summaryLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingSpinner size="small" />
                        </div>
                    ) : (
                        reviewSummary && <ReviewSummary summary={reviewSummary} />
                    )}
                </motion.div>

                {/* Review List and Form */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    data-aos="fade-left"
                    data-aos-delay="200"
                >
                    {/* Review Form */}
                    {isAuthenticated && (
                        <motion.div
                            className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            data-aos="zoom-in"
                            data-aos-delay="300"
                        >
                            <ReviewForm
                                productId={productId}
                                productName={productName}
                                existingReview={userProductReview}
                                hasUserReviewed={hasUserReviewed}
                                onReviewSubmitted={handleRefreshReviews}
                            />
                        </motion.div>
                    )}

                    {/* Reviews List */}
                    <div>
                        {isRefreshing ? (
                            <div className="flex justify-center items-center py-10">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <LoadingSpinner size="small" />
                                </motion.div>
                            </div>
                        ) : reviews.length > 0 ? (
                            <>
                                <motion.h3
                                    className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    data-aos="fade-up"
                                    data-aos-delay="400"
                                >
                                    {reviews.length} đánh giá
                                </motion.h3>

                                <motion.div
                                    className="space-y-6"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <AnimatePresence>
                                        {reviews.map((review, index) => (
                                            <motion.div
                                                key={review.reviewId}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: 0.1 * index }}
                                                data-aos="fade-up"
                                                data-aos-delay={200 + (index * 100)}
                                            >
                                                <ReviewItem
                                                    review={review}
                                                    onReviewUpdated={handleRefreshReviews}
                                                    isUserReview={isUserReview(review.reviewId)}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <motion.div
                                        className="mt-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                        data-aos="fade-up"
                                        data-aos-delay="600"
                                    >
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >
                                <NoReviews productName={productName} isAuthenticated={isAuthenticated} />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProductReviews;