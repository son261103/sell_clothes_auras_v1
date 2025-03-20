// components/product-detail/ReviewComments.tsx
import React, { useEffect, useState } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import useProductReview from '../../hooks/useProductReview';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import CommentItem from './CommentItem';
import { toast } from 'react-hot-toast';

interface ReviewCommentsProps {
    reviewId: number;
    onCommentAdded: () => void;
}

const ReviewComments: React.FC<ReviewCommentsProps> = ({ reviewId, onCommentAdded }) => {
    const {
        reviewComments,
        commentsLoading,
        addComment,
        getReviewComments,
        loadReviewComments,
        commentsCurrentPage,
        loadNextCommentsPage,
        loadPreviousCommentsPage,
        commentsTotalPages
    } = useProductReview();

    const { isAuthenticated, user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true);
            try {
                await loadReviewComments(reviewId);
            } catch (error) {
                console.error('Error loading comments:', error);
                toast.error('Không thể tải bình luận');
            } finally {
                setIsLoading(false);
            }
        };

        loadComments();
    }, [reviewId, loadReviewComments]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) {
            toast.error('Vui lòng nhập nội dung bình luận');
            return;
        }

        setIsSubmitting(true);
        try {
            await addComment(reviewId, {
                content: commentText.trim()
            });

            setCommentText('');
            toast.success('Bình luận đã được gửi thành công');
            onCommentAdded();

            // Refresh comments after adding
            await getReviewComments(reviewId);
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Có lỗi xảy ra khi gửi bình luận');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentUpdated = async () => {
        try {
            await getReviewComments(reviewId);
            onCommentAdded(); // Update parent component
        } catch (error) {
            console.error('Error refreshing comments:', error);
        }
    };

    const handleLoadMore = async () => {
        if (commentsCurrentPage < commentsTotalPages - 1) {
            await loadNextCommentsPage(reviewId);
        }
    };

    const handleLoadPrevious = async () => {
        if (commentsCurrentPage > 0) {
            await loadPreviousCommentsPage(reviewId);
        }
    };

    if (isLoading || commentsLoading) {
        return (
            <div className="py-4 flex justify-center">
                <LoadingSpinner size="small" />
            </div>
        );
    }

    return (
        <div className="p-4">
            {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mb-4">
                    <div className="flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username || 'User'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <FiUser className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 pr-10 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !commentText.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary dark:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend />
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="text-center py-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Vui lòng đăng nhập để bình luận
                </div>
            )}

            <div className="space-y-4">
                {reviewComments.length > 0 ? (
                    <>
                        {reviewComments.map((comment) => (
                            <CommentItem
                                key={comment.commentId}
                                comment={comment}
                                reviewId={reviewId}
                                onCommentUpdated={handleCommentUpdated}
                            />
                        ))}

                        {/* Pagination controls */}
                        {commentsTotalPages > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleLoadPrevious}
                                    disabled={commentsCurrentPage === 0}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Trang {commentsCurrentPage + 1} / {commentsTotalPages}
                                </span>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={commentsCurrentPage >= commentsTotalPages - 1}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewComments;