// components/product-detail/CommentItem.tsx
import React, { useState } from 'react';
import { FiUser, FiCalendar, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ReviewCommentResponseDTO } from '../../types/product.review.types';
import useProductReview from '../../hooks/useProductReview';
import { toast } from 'react-hot-toast';

interface CommentItemProps {
    comment: ReviewCommentResponseDTO;
    reviewId: number;
    onCommentUpdated: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, reviewId, onCommentUpdated }) => {
    const { updateComment, deleteComment } = useProductReview();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleUpdateComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editText.trim()) {
            toast.error('Nội dung bình luận không được để trống');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateComment(comment.commentId, {
                content: editText.trim()
            });

            toast.success('Bình luận đã được cập nhật');
            setIsEditing(false);
            onCommentUpdated();
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Có lỗi xảy ra khi cập nhật bình luận');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteComment(comment.commentId, reviewId);

            toast.success('Bình luận đã được xóa');
            onCommentUpdated();
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Có lỗi xảy ra khi xóa bình luận');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex space-x-3"
        >
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {comment.userAvatar ? (
                    <img
                        src={comment.userAvatar}
                        alt={comment.username}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <FiUser className="h-5 w-5" />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {comment.username} {comment.isCurrentUser && <span className="text-primary text-xs">(Bạn)</span>}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <FiCalendar className="mr-1 h-3 w-3" />
                                {formatDate(comment.createdAt)}
                            </div>
                        </div>

                        {comment.isCurrentUser && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <FiMoreVertical className="h-4 w-4" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                                        <button
                                            className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <FiEdit className="mr-2" />
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            onClick={() => {
                                                handleDeleteComment();
                                                setShowDropdown(false);
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <FiTrash2 className="mr-2" />
                                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateComment} className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                rows={2}
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditText(comment.content);
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !editText.trim() || editText === comment.content}
                                    className="px-3 py-1 text-xs bg-primary hover:bg-primary-dark text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-2 text-gray-800 dark:text-gray-200 text-sm">
                            {comment.content}
                        </div>
                    )}

                    {comment.updatedAt !== comment.createdAt && !isEditing && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                            Đã chỉnh sửa
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CommentItem;