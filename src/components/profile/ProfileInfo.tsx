import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { UserProfile, Gender } from '../../types/profile.types';

interface ProfileInfoProps {
    user: UserProfile | null;
    onEdit: () => void;
    onDelete: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onEdit, onDelete }) => {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const getGenderLabel = (gender?: Gender | null) => {
        if (!gender) return '';
        switch (gender) {
            case Gender.MALE:
                return 'Nam';
            case Gender.FEMALE:
                return 'Nữ';
            case Gender.OTHER:
            default:
                return 'Khác';
        }
    };

    return (
        <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={onEdit}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        <FiEdit className="mr-2" />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        <FiTrash2 className="mr-2" />
                        Xóa
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <dl>
                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên đăng nhập</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{user?.username || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{user?.email || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{user?.fullName || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{user?.phone || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{getGenderLabel(user?.gender) || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{formatDate(user?.dateOfBirth) || '—'}</dd>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ</dt>
                        <dd className="col-span-2 text-gray-900 dark:text-white mt-0">{user?.address || '—'}</dd>
                    </div>
                </dl>
            </div>
        </motion.div>
    );
};

export default ProfileInfo;