// File: components/profile/modals/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { ChangePasswordRequest } from '../../types/auth.types';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { changePassword } = useAuth();

    // Password change form
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field: 'oldPassword' | 'newPassword' | 'confirmPassword') => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            await changePassword(passwordForm);
            toast.success('Đã đổi mật khẩu thành công');
            onClose();
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Change password error:', error);
            toast.error('Không thể đổi mật khẩu. Vui lòng thử lại.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl m-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                    <FiLock className="w-5 h-5 mr-2" />
                                    Đổi mật khẩu
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.oldPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={passwordForm.oldPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            onClick={() => togglePasswordVisibility('oldPassword')}
                                        >
                                            {showPassword.oldPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.newPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                        >
                                            {showPassword.newPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                        >
                                            {showPassword.confirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex space-x-3">
                                    <motion.button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Hủy
                                    </motion.button>
                                    <motion.button
                                        onClick={handleChangePassword}
                                        className="px-4 py-2 bg-primary text-white rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                    >
                                        Xác nhận
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;