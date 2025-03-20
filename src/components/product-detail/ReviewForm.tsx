// components/product-detail/ReviewForm.tsx
import React, { useState, useEffect } from 'react';
import { FiStar, FiSend, FiPlus } from 'react-icons/fi';
import useProductReview from '../../hooks/useProductReview';
import { ProductReviewCreateDTO, ProductReviewResponseDTO } from '../../types/product.review.types';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
    productId: number;
    productName: string;
    existingReview: ProductReviewResponseDTO | null;
    hasUserReviewed: boolean;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
                                                   productId,
                                                   productName,
                                                   existingReview,
                                                   hasUserReviewed,
                                                   onReviewSubmitted
                                               }) => {
    const [rating, setRating] = useState<number>(existingReview?.rating || 5);
    const [hover, setHover] = useState<number | null>(null);
    const [comment, setComment] = useState<string>(existingReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showAddNewReviewForm, setShowAddNewReviewForm] = useState<boolean>(!hasUserReviewed);

    const { createReview, userProductReviews } = useProductReview();

    useEffect(() => {
        // Only reset the form if we're editing an existing review
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            // For new reviews, always reset to defaults
            setRating(5);
            setComment('');
        }

        // Show the form if the user hasn't reviewed yet
        setShowAddNewReviewForm(!hasUserReviewed);
    }, [existingReview, hasUserReviewed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating < 1 || rating > 5) {
            toast.error('Vui lòng chọn số sao từ 1 đến 5');
            return;
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setIsSubmitting(true);

        try {
            // Always create a new review
            const reviewData: ProductReviewCreateDTO = {
                productId,
                rating,
                comment: comment.trim()
            };

            await createReview(reviewData);
            toast.success('Đánh giá của bạn đã được gửi thành công!');

            // Important: Don't hide the form after submission
            // Instead, reset it for a new review
            setRating(5);
            setComment('');

            onReviewSubmitted();
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderReviewForm = () => {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Viết đánh giá của bạn
                </h3>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Đánh giá của bạn về {productName}:
                    </label>
                    <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHover(starValue)}
                                    onMouseLeave={() => setHover(null)}
                                    className="focus:outline-none"
                                >
                                    <FiStar
                                        className={`h-8 w-8 ${
                                            (hover || rating) >= starValue
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            );
                        })}
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {rating} / 5
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="reviewComment" className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Nhận xét của bạn:
                    </label>
                    <textarea
                        id="reviewComment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        placeholder="Hãy chia sẻ trải nghiệm của bạn với sản phẩm này..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    {hasUserReviewed && (
                        <button
                            type="button"
                            onClick={() => setShowAddNewReviewForm(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span>Đang gửi...</span>
                        ) : (
                            <>
                                <FiSend className="mr-2" />
                                Gửi đánh giá
                            </>
                        )}
                    </button>
                </div>
            </form>
        );
    };

    // If we're showing the review form
    if (showAddNewReviewForm) {
        return renderReviewForm();
    }

    // Even if the user has reviewed, always show the "Add a new review" button
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Thêm đánh giá mới
                </h3>
                <button
                    onClick={() => setShowAddNewReviewForm(true)}
                    className="flex items-center px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                >
                    <FiPlus className="mr-1" /> Thêm đánh giá mới
                </button>
            </div>
            {userProductReviews.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bạn đã gửi {userProductReviews.length} đánh giá cho sản phẩm này. Bạn có thể thêm đánh giá mới bất cứ lúc nào.
                </p>
            )}
        </div>
    );
};

export default ReviewForm;