import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiLock, FiX, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { ChangePasswordRequest } from '../../types/profile.types';
import useProfile from '../../hooks/useProfile';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { changePassword, passwordLoading } = useProfile();

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState<ChangePasswordRequest>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.oldPassword) {
            newErrors.oldPassword = 'Mật khẩu hiện tại là bắt buộc';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await changePassword(formData);
            if (response.success) {
                toast.success('Đổi mật khẩu thành công');
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                onClose();
            } else {
                toast.error(response.message || 'Đổi mật khẩu thất bại');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            const errorMessage = error instanceof Error ? error.message : 'Đổi mật khẩu thất bại';
            toast.error(errorMessage);
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
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOutsideClick}
        >
            <motion.div
                className="bg-white dark:bg-darkBackground rounded-lg shadow-xl p-6 w-full max-w-md m-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-textDark dark:text-textLight flex items-center">
                        <FiLock className="mr-2" />
                        Đổi mật khẩu
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary/30 transition-colors"
                        disabled={passwordLoading}
                        aria-label="Đóng"
                    >
                        <FiX className="w-5 h-5 text-secondary dark:text-textLight" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-secondary/20 text-textDark dark:text-textLight focus:outline-none focus:ring-2 pr-10
                                ${errors.oldPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-secondary/50 focus:ring-primary focus:border-primary'
                                }`}
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                tabIndex={-1}
                            >
                                {showOldPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.oldPassword && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.oldPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-secondary/20 text-textDark dark:text-textLight focus:outline-none focus:ring-2 pr-10
                                ${errors.newPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-secondary/50 focus:ring-primary focus:border-primary'
                                }`}
                                placeholder="Tối thiểu 8 ký tự"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                tabIndex={-1}
                            >
                                {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.newPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-secondary/20 text-textDark dark:text-textLight focus:outline-none focus:ring-2 pr-10
                                ${errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-secondary/50 focus:ring-primary focus:border-primary'
                                }`}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-secondary/30 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-secondary text-textDark dark:text-textLight rounded-md hover:bg-gray-300 dark:hover:bg-secondary/70 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={passwordLoading}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={passwordLoading}
                        >
                            {passwordLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2" />
                                    Đổi mật khẩu
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ChangePasswordModal;