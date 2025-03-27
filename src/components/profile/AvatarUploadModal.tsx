import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiTrash2, FiCamera, FiUser } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import LoadingSpinner from '../common/LoadingSpinner';

// Server's file size limit in bytes
const MAX_SERVER_FILE_SIZE = 1 * 1024 * 1024; // 1MB (server limit)

interface AvatarUploadModalProps {
    isOpen: boolean;
    currentAvatar?: string;
    onUpload: (file: File, isUpdate: boolean) => Promise<void>;
    onDelete: () => Promise<void>;
    onClose: () => void;
    timestamp?: number;
    isUpdating?: boolean;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
                                                                 isOpen,
                                                                 currentAvatar,
                                                                 onUpload,
                                                                 onDelete,
                                                                 onClose,
                                                                 timestamp = Date.now(),
                                                                 isUpdating = false
                                                             }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentAvatarWithTimestamp, setCurrentAvatarWithTimestamp] = useState<string | undefined>(undefined);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryTimeoutRef = useRef<number | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", damping: 25, stiffness: 400, delay: 0.1 }
        },
        exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
    };

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { delay: 0.2, staggerChildren: 0.1, when: "beforeChildren" }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 500, damping: 25 }
        }
    };

    // Helper to check if a URL is a Google avatar URL
    const isGoogleAvatarUrl = (url: string): "" | boolean => {
        return url && (
            url.includes('googleusercontent.com') ||
            url.includes('google.com') ||
            url.includes('googleapis.com')
        );
    };

    // Memoized function to get avatar URL with timestamp
    const getAvatarUrl = useCallback((url?: string, forceNewTimestamp = false): string | undefined => {
        if (!url) return undefined;
        if (url.startsWith('blob:')) return url;

        // For Google avatar URLs, handle differently to prevent CORS issues
        if (isGoogleAvatarUrl(url)) {
            // Return Google URLs without any modifications
            return url;
        }

        try {
            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.delete('t');
            urlObj.searchParams.delete('_t');
            urlObj.searchParams.delete('timestamp');
            urlObj.searchParams.delete('cache');

            const timeValue = forceNewTimestamp ? Date.now() : timestamp;
            urlObj.searchParams.append('t', timeValue.toString());

            if (forceNewTimestamp) {
                urlObj.searchParams.append('cache', Math.random().toString().slice(2));
            }

            return urlObj.toString();
        } catch (error) {
            console.error('Error processing avatar URL:', error);

            // Don't modify Google URLs
            if (isGoogleAvatarUrl(url)) {
                return url;
            }

            const hasParams = url.includes('?');
            const timeValue = forceNewTimestamp ? Date.now() : timestamp;
            let result = `${url}${hasParams ? '&' : '?'}t=${timeValue}`;
            if (forceNewTimestamp) {
                result += `&cache=${Math.random().toString().slice(2)}`;
            }
            return result;
        }
    }, [timestamp]);

    // Memoized function to load avatar image with retry logic
    const loadAvatarImage = useCallback((url?: string) => {
        if (!url) {
            setIsImageLoading(false);
            return;
        }

        const img = new Image();

        img.onload = () => {
            console.log("Avatar image loaded successfully");
            setIsImageLoading(false);
            setImgError(false);
            setRetryCount(0);
        };

        img.onerror = () => {
            console.error(`Failed to load avatar image (attempt ${retryCount + 1}/${maxRetries}):`, url);

            if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                console.log(`Retrying in ${retryDelay}ms...`);
                if (retryTimeoutRef.current) {
                    window.clearTimeout(retryTimeoutRef.current);
                }
                retryTimeoutRef.current = window.setTimeout(() => {
                    const retryUrl = getAvatarUrl(currentAvatar, true);
                    if (retryUrl) {
                        setCurrentAvatarWithTimestamp(retryUrl);
                        loadAvatarImage(retryUrl);
                    }
                }, retryDelay);
            } else {
                setImgError(true);
                setIsImageLoading(false);
            }
        };

        // Add special handling for CORS issues with Google avatars
        if (isGoogleAvatarUrl(url)) {
            img.crossOrigin = "anonymous";
            img.referrerPolicy = "no-referrer";
        }

        img.src = url;
    }, [retryCount, maxRetries, currentAvatar, getAvatarUrl]);

    // Compress image to fit within 1MB limit
    const compressImage = async (file: File, maxWidth = 1024, quality = 0.8, maxSizeBytes = MAX_SERVER_FILE_SIZE): Promise<File> => {
        setIsCompressing(true);

        try {
            return new Promise((resolve, reject) => {
                // Small files don't need compression
                if (file.size <= maxSizeBytes * 0.9) {
                    setIsCompressing(false);
                    resolve(file);
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target?.result as string;
                    img.onload = () => {
                        // Create canvas for resizing
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Resize if width is larger than maxWidth
                        if (width > maxWidth) {
                            height = (maxWidth / width) * height;
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw image on canvas
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            setIsCompressing(false);
                            reject(new Error('Could not get canvas context'));
                            return;
                        }

                        // Draw image with white background (for transparent PNGs)
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to blob with compression
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    setIsCompressing(false);
                                    reject(new Error('Could not create blob'));
                                    return;
                                }

                                // Check if compression was sufficient
                                if (blob.size > maxSizeBytes) {
                                    // Try with lower quality or size
                                    if (quality > 0.5) {
                                        // Try with lower quality first
                                        compressImage(file, maxWidth, quality - 0.1, maxSizeBytes)
                                            .then(resolve)
                                            .catch(reject);
                                    } else if (maxWidth > 512) {
                                        // Then try with smaller dimensions
                                        compressImage(file, maxWidth * 0.8, 0.7, maxSizeBytes)
                                            .then(resolve)
                                            .catch(reject);
                                    } else {
                                        // If all else fails, tell the user
                                        setIsCompressing(false);
                                        reject(new Error(`Không thể nén ảnh xuống dưới 1MB. Vui lòng chọn ảnh nhỏ hơn hoặc sử dụng công cụ nén ảnh trước khi tải lên.`));
                                    }
                                    return;
                                }

                                // Create new File object
                                const compressedFile = new File([blob], file.name, {
                                    type: file.type,
                                    lastModified: Date.now()
                                });

                                console.log(`Compressed image: ${file.size / 1024}KB -> ${compressedFile.size / 1024}KB`);
                                setIsCompressing(false);
                                resolve(compressedFile);
                            },
                            file.type,
                            quality
                        );
                    };

                    img.onerror = () => {
                        setIsCompressing(false);
                        reject(new Error('Error loading image for compression'));
                    };
                };

                reader.onerror = () => {
                    setIsCompressing(false);
                    reject(new Error('Error reading file for compression'));
                };
            });
        } catch (error) {
            setIsCompressing(false);
            throw error;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                window.clearTimeout(retryTimeoutRef.current);
            }
            // Cleanup any previews
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setPreview(null);
            setUploadError(null);
            setImgError(false);
            setIsImageLoading(true);
            setRetryCount(0);
            setIsCompressing(false);

            if (currentAvatar) {
                const avatarUrl = getAvatarUrl(currentAvatar);
                if (avatarUrl) {
                    setCurrentAvatarWithTimestamp(avatarUrl);
                    loadAvatarImage(avatarUrl);
                }
            } else {
                setCurrentAvatarWithTimestamp(undefined);
                setIsImageLoading(false);
            }
        }
    }, [isOpen, currentAvatar, getAvatarUrl, loadAvatarImage]);

    // Reset image error when timestamp changes
    useEffect(() => {
        setImgError(false);
        setIsImageLoading(true);
        setRetryCount(0);

        if (currentAvatar) {
            const avatarUrl = getAvatarUrl(currentAvatar);
            if (avatarUrl) {
                setCurrentAvatarWithTimestamp(avatarUrl);
                loadAvatarImage(avatarUrl);
            }
        }
    }, [timestamp, currentAvatar, getAvatarUrl, loadAvatarImage]);

    // Update loading state based on isUpdating prop
    useEffect(() => {
        setIsLoading(isUpdating);
    }, [isUpdating]);

    // Create a preview when file is selected
    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        setIsImageLoading(true);

        const img = new Image();
        img.onload = () => setIsImageLoading(false);
        img.onerror = () => {
            setImgError(true);
            setIsImageLoading(false);
        };
        img.src = objectUrl;

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null);
            return;
        }

        const file = e.target.files[0];

        // Check file type first
        if (!file.type.startsWith('image/')) {
            setUploadError('Chỉ chấp nhận file hình ảnh.');
            return;
        }

        // Check file size against server limit
        if (file.size > MAX_SERVER_FILE_SIZE) {
            setUploadError(null); // Clear error while we try compression

            try {
                // Try to compress the image to fit within 1MB
                console.log(`Compressing image from ${(file.size / (1024 * 1024)).toFixed(2)}MB to under 1MB...`);
                const compressedFile = await compressImage(file);
                setSelectedFile(compressedFile);
            } catch (error) {
                console.error('Compression error:', error);
                setUploadError(`Kích thước ảnh vượt quá giới hạn 1MB (${(file.size / (1024 * 1024)).toFixed(2)}MB). ${error instanceof Error ? error.message : ''}`);
            }
            return;
        }

        // File is valid
        setSelectedFile(file);
        setUploadError(null);
    };

    // Trigger file input click
    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    // Handle upload button click
    const handleUpload = async () => {
        if (!selectedFile) return;

        // Final check on file size before sending to server
        if (selectedFile.size > MAX_SERVER_FILE_SIZE) {
            setUploadError(`Kích thước ảnh vẫn vượt quá giới hạn 1MB sau khi đã nén (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB). Vui lòng chọn ảnh nhỏ hơn.`);
            return;
        }

        setIsLoading(true);
        setUploadError(null);

        try {
            await onUpload(selectedFile, !!currentAvatar);
        } catch (error) {
            console.error('Error in avatar upload:', error);

            // Detect MaxUploadSizeExceededException
            let errorMessage = 'Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.';

            if (error instanceof Error) {
                if (error.message.includes('Maximum upload size exceeded') ||
                    error.message.includes('exceeds its maximum permitted size')) {
                    errorMessage = `Kích thước ảnh vượt quá giới hạn cho phép (1MB). Vui lòng chọn ảnh nhỏ hơn.`;
                } else if (error.message.includes('content type')) {
                    errorMessage = 'Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG hoặc GIF.';
                } else {
                    errorMessage = error.message;
                }
            }

            setUploadError(errorMessage);
            setIsLoading(false);
        }
    };

    // Handle delete button click
    const handleDelete = async () => {
        if (!currentAvatar) return;

        setIsLoading(true);

        try {
            await onDelete();
        } catch (error) {
            console.error('Error deleting avatar:', error);
            setUploadError('Không thể xóa ảnh đại diện. Vui lòng thử lại sau.');
            setIsLoading(false);
        }
    };

    // Handle image load error
    const handleImageError = () => {
        console.error('Failed to load avatar image:', currentAvatarWithTimestamp);
        if (retryCount < maxRetries) {
            setIsImageLoading(true);
        } else {
            setImgError(true);
            setIsImageLoading(false);
        }
    };

    // Handle image load success
    const handleImageLoad = () => {
        console.log('Avatar image loaded successfully');
        setIsImageLoading(false);
        setImgError(false);
    };

    // Effect to apply body styling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-hidden">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md z-10 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent z-0"></div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white z-10"
                            onClick={onClose}
                            disabled={isLoading || isCompressing}
                        >
                            <FiX className="w-5 h-5" />
                        </motion.button>
                        <motion.div variants={contentVariants} className="relative z-10">
                            <motion.h2
                                variants={itemVariants}
                                className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"
                            >
                                <FiCamera className="mr-2 text-primary" />
                                Cập nhật ảnh đại diện
                            </motion.h2>
                            <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
                                <motion.div
                                    className="mb-6 relative"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.3 }
                                    }}
                                >
                                    <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-600 relative">
                                        <AnimatePresence>
                                            {(isImageLoading || isLoading || isCompressing) && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 z-10"
                                                >
                                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    {isCompressing && (
                                                        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white bg-black bg-opacity-50 py-1">
                                                            Đang nén ảnh...
                                                        </div>
                                                    )}
                                                    {retryCount > 0 && !isCompressing && (
                                                        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white bg-black bg-opacity-50 py-1">
                                                            Đang thử lại... {retryCount}/{maxRetries}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Avatar Preview"
                                                className={`w-full h-full object-cover ${(isImageLoading || isLoading || isCompressing) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                                                onLoad={handleImageLoad}
                                                onError={handleImageError}
                                                key={`preview-${selectedFile?.name}-${Date.now()}`}
                                            />
                                        ) : currentAvatarWithTimestamp && !imgError ? (
                                            <img
                                                src={currentAvatarWithTimestamp}
                                                alt="Current Avatar"
                                                className={`w-full h-full object-cover ${(isImageLoading || isLoading) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                                                onLoad={handleImageLoad}
                                                onError={handleImageError}
                                                key={`avatar-modal-${timestamp}-${retryCount}`}
                                                crossOrigin="anonymous"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <FiUser className={`w-16 h-16 text-gray-400 dark:text-gray-500 ${(isLoading || isCompressing) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                                        )}
                                    </div>
                                    <motion.div
                                        className="absolute -bottom-2 right-0"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleBrowseClick}
                                            className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                                            disabled={isLoading || isCompressing}
                                        >
                                            <FiUpload className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                </motion.div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/png,image/gif"
                                    className="hidden"
                                />
                                <motion.div
                                    variants={itemVariants}
                                    className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs mb-4 space-y-2"
                                >
                                    <p>Chọn một hình ảnh từ thiết bị của bạn làm ảnh đại diện. <span className="font-medium text-primary">Kích thước tối đa 1MB</span>.</p>
                                    <p className="text-xs text-primary-500 italic">
                                        Hệ thống sẽ tự động nén ảnh nếu kích thước lớn hơn 1MB. Nên dùng ảnh vuông để hiển thị tốt nhất.
                                    </p>
                                </motion.div>
                                {uploadError && (
                                    <motion.p
                                        variants={itemVariants}
                                        className="text-red-500 mt-2 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
                                    >
                                        <span className="flex items-center">
                                            <FiX className="mr-1" /> {uploadError}
                                        </span>
                                    </motion.p>
                                )}
                                {selectedFile && (
                                    <motion.p
                                        variants={itemVariants}
                                        className="text-green-500 mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded-md"
                                    >
                                        <span className="flex items-center">
                                            Kích thước ảnh: {(selectedFile.size / 1024).toFixed(1)}KB
                                            {selectedFile.size > MAX_SERVER_FILE_SIZE * 0.9 &&
                                                " - Gần đạt đến giới hạn 1MB"}
                                        </span>
                                    </motion.p>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex justify-between">
                                <motion.button
                                    type="button"
                                    onClick={handleDelete}
                                    className={`px-4 py-3 flex items-center rounded-lg transition-all ${
                                        currentAvatar && !isLoading && !isCompressing
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                    }`}
                                    disabled={!currentAvatar || isLoading || isCompressing}
                                    whileHover={currentAvatar && !isLoading && !isCompressing ? { scale: 1.03 } : {}}
                                    whileTap={currentAvatar && !isLoading && !isCompressing ? { scale: 0.97 } : {}}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size="small" />
                                            <span className="ml-2">Đang xóa...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <FiTrash2 className="mr-2" />
                                            Xóa ảnh
                                        </div>
                                    )}
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={handleUpload}
                                    className={`px-4 py-3 rounded-lg transition-all ${
                                        selectedFile && !isLoading && !isCompressing
                                            ? 'bg-primary text-white hover:bg-primary/90'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                    }`}
                                    disabled={!selectedFile || isLoading || isCompressing}
                                    whileHover={selectedFile && !isLoading && !isCompressing ? { scale: 1.03 } : {}}
                                    whileTap={selectedFile && !isLoading && !isCompressing ? { scale: 0.97 } : {}}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size="small" />
                                            <span className="ml-2">Đang xử lý...</span>
                                        </div>
                                    ) : isCompressing ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size="small" />
                                            <span className="ml-2">Đang nén...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <FiUpload className="mr-2" />
                                            Tải lên
                                        </div>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AvatarUploadModal;