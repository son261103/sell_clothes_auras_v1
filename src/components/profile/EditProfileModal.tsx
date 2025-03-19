import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { UserProfile, ProfileUpdateDTO, Gender } from '../../types/profile.types';

interface EditProfileModalProps {
    isOpen: boolean;
    user: UserProfile | null;
    onSave: (updatedProfile: ProfileUpdateDTO) => void;
    onClose: () => void;
    onRequestDelete: () => void;
    isUpdating?: boolean;
}

// Form validation function
const validateForm = (data: ProfileUpdateDTO): string | null => {
    if (data.phone && !/^\d+$/.test(data.phone)) {
        return 'Số điện thoại chỉ được chứa chữ số';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return 'Email không hợp lệ';
    }

    // Validate date of birth is not in the future
    if (data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        if (birthDate > today) {
            return 'Ngày sinh không thể là ngày trong tương lai';
        }

        // Reasonable minimum date (120 years ago)
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120);
        if (birthDate < minDate) {
            return 'Ngày sinh không hợp lệ';
        }
    }

    return null;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
                                                               isOpen,
                                                               user,
                                                               onSave,
                                                               onClose,
                                                               onRequestDelete,
                                                               isUpdating = false,
                                                           }) => {
    const [formData, setFormData] = useState<ProfileUpdateDTO>({
        fullName: '',
        email: '',
        phone: '',
        gender: Gender.OTHER,
        dateOfBirth: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || Gender.OTHER,
                dateOfBirth: user.dateOfBirth || '',
                address: user.address || '',
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm(formData);
        if (validationError) {
            toast.error(validationError);
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="bg-white dark:bg-darkBackground rounded-lg shadow-xl p-6 w-full max-w-lg relative m-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-textDark dark:text-textLight">Chỉnh sửa hồ sơ</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary/30 transition-colors"
                        disabled={isUpdating}
                        aria-label="Đóng"
                    >
                        <FiX className="w-5 h-5 text-secondary dark:text-textLight" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight"
                            placeholder="Nhập họ và tên"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight"
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Giới tính
                        </label>
                        <select
                            name="gender"
                            value={formData.gender || Gender.OTHER}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight appearance-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: `right 0.5rem center`,
                                backgroundRepeat: `no-repeat`,
                                backgroundSize: `1.5em 1.5em`,
                                paddingRight: `2.5rem`
                            }}
                        >
                            <option value={Gender.MALE} className="py-2 bg-white dark:bg-secondary text-textDark dark:text-textLight hover:bg-primary/10">Nam</option>
                            <option value={Gender.FEMALE} className="py-2 bg-white dark:bg-secondary text-textDark dark:text-textLight hover:bg-primary/10">Nữ</option>
                            <option value={Gender.OTHER} className="py-2 bg-white dark:bg-secondary text-textDark dark:text-textLight hover:bg-primary/10">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary dark:text-textLight mb-1">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-secondary/20 text-textDark dark:text-textLight"
                            placeholder="Nhập địa chỉ"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 justify-between pt-4 border-t border-gray-200 dark:border-secondary/30 mt-6">
                        <button
                            type="button"
                            onClick={onRequestDelete}
                            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                            disabled={isUpdating}
                        >
                            <FiTrash2 className="mr-2" />
                            <span>Xóa tài khoản</span>
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-secondary text-textDark dark:text-textLight rounded-md hover:bg-gray-300 dark:hover:bg-secondary/70 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isUpdating}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;