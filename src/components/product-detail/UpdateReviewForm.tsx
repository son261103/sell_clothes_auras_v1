// components/product-detail/UpdateReviewForm.tsx
import React, { useState } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import useProductReview from '../../hooks/useProductReview';
import { ProductReviewResponseDTO, ProductReviewUpdateDTO } from '../../types/product.review.types';
import { toast } from 'react-hot-toast';

interface UpdateReviewFormProps {
    review: ProductReviewResponseDTO;
    onCancel: () => void;
    onSuccess: () => void;
}

const UpdateReviewForm: React.FC<UpdateReviewFormProps> = ({ review, onCancel, onSuccess }) => {
    const [rating, setRating] = useState<number>(review.rating);
    const [hover, setHover] = useState<number | null>(null);
    const [comment, setComment] = useState<string>(review.comment);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { updateReview } = useProductReview();

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
            const reviewData: ProductReviewUpdateDTO = {
                rating,
                comment: comment.trim()
            };

            await updateReview(review.reviewId, reviewData);
            toast.success('Đánh giá của bạn đã được cập nhật thành công!');
            onSuccess();
        } catch (error) {
            console.error('Review update error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật đánh giá. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Chỉnh sửa đánh giá của bạn
            </h3>

            <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Đánh giá của bạn:
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
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim() || (rating === review.rating && comment === review.comment)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span>Đang cập nhật...</span>
                    ) : (
                        <>
                            <FiSend className="mr-2" />
                            Cập nhật đánh giá
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default UpdateReviewForm;