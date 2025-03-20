// components/product-detail/ReviewItem.tsx
import React, { useState } from 'react';
import { FiStar, FiThumbsUp, FiFlag, FiUser, FiCalendar, FiMoreVertical, FiMessageCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductReviewResponseDTO } from '../../types/product.review.types';
import useProductReview from '../../hooks/useProductReview';
import ReviewComments from './ReviewComments';
import { toast } from 'react-hot-toast';
import UpdateReviewForm from './UpdateReviewForm';

interface ReviewItemProps {
    review: ProductReviewResponseDTO;
    isUserReview: boolean;
    onReviewUpdated: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, isUserReview, onReviewUpdated }) => {
    const { deleteReview } = useProductReview();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => (
                    <FiStar
                        key={index}
                        className={`h-4 w-4 ${
                            index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const handleDeleteReview = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteReview(review.reviewId);
            toast.success('Đánh giá đã được xóa thành công!');
            onReviewUpdated();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại sau.');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border ${
                isUserReview
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'
            }`}
        >
            {showEditForm ? (
                <div className="p-4">
                    <UpdateReviewForm
                        review={review}
                        onCancel={() => setShowEditForm(false)}
                        onSuccess={() => {
                            setShowEditForm(false);
                            onReviewUpdated();
                        }}
                    />
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                {review.userAvatar ? (
                                    <img
                                        src={review.userAvatar}
                                        alt={review.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <FiUser className="h-6 w-6" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {review.username} {isUserReview && <span className="text-primary text-sm">(Bạn)</span>}
                                    </h4>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <FiCalendar className="mr-1 h-3 w-3" />
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>

                                <div className="mt-1 flex items-center space-x-1">
                                    {renderStars(review.rating)}
                                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                        ({review.rating}/5)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <FiMoreVertical className="h-5 w-5" />
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                                    {isUserReview ? (
                                        <>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                onClick={() => {
                                                    setShowEditForm(true);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <FiEdit className="mr-2" />
                                                Chỉnh sửa đánh giá
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                onClick={() => {
                                                    handleDeleteReview();
                                                    setShowDropdown(false);
                                                }}
                                                disabled={isDeleting}
                                            >
                                                <FiTrash2 className="mr-2" />
                                                {isDeleting ? 'Đang xóa...' : 'Xóa đánh giá'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            onClick={() => {
                                                toast.error('Tính năng đang được phát triển!');
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <FiFlag className="mr-2" />
                                            Báo cáo vi phạm
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {review.comment}
                    </div>

                    {review.updatedAt !== review.createdAt && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                            Đã chỉnh sửa lúc {formatDate(review.updatedAt)}
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                        <button
                            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm"
                            onClick={toggleComments}
                        >
                            <FiMessageCircle className="mr-1" />
                            {review.commentCount ? `Bình luận (${review.commentCount})` : 'Bình luận'}
                        </button>

                        <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                            <FiThumbsUp className="mr-1" />
                            Hữu ích
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg overflow-hidden"
                    >
                        <ReviewComments
                            reviewId={review.reviewId}
                            onCommentAdded={onReviewUpdated}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReviewItem;