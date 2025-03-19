import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {FiUpload, FiTrash2, FiX, FiCamera, FiUser} from 'react-icons/fi';

interface AvatarUploadModalProps {
    isOpen: boolean;
    currentAvatar?: string;
    onUpload: (file: File, isUpdate: boolean) => Promise<void>;
    onDelete: () => Promise<void>;
    onClose: () => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
                                                                 isOpen,
                                                                 currentAvatar,
                                                                 onUpload,
                                                                 onDelete,
                                                                 onClose,
                                                             }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        const file = e.target.files[0];
        // Check file type
        if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
            toast.error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn một file hình ảnh');
            return;
        }

        setIsUploading(true);
        try {
            await onUpload(selectedFile, !!currentAvatar);
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete();
        } catch (error) {
            console.error('Error deleting avatar:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOutsideClick}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <FiCamera className="mr-2" />
                        Quản lý ảnh đại diện
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        disabled={isUploading || isDeleting}
                    >
                        <FiX className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-2 border-primary mb-6 bg-gray-100 dark:bg-gray-700">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : currentAvatar ? (
                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="w-16 h-16 text-gray-400 dark:text-gray-300" />
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                            disabled={isUploading || isDeleting}
                        >
                            <FiUpload className="mr-2" />
                            Chọn ảnh
                        </button>

                        {currentAvatar && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
                                disabled={isUploading || isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 className="mr-2" />
                                        Xóa ảnh
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        disabled={isUploading || isDeleting}
                    >
                        Đóng
                    </button>

                    {selectedFile && (
                        <button
                            type="button"
                            onClick={handleUpload}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70"
                            disabled={isUploading || isDeleting}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải lên...
                                </>
                            ) : (
                                <>
                                    <FiUpload className="mr-2" />
                                    Lưu ảnh
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AvatarUploadModal;