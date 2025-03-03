// File: components/profile/ProfileInfo.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiEdit3, FiCheck } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { UserProfile } from '../../types/auth.types';

interface ProfileInfoProps {
    user: UserProfile | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    const { updateUserProfile } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<UserProfile>({
        userId: user?.userId || 0,
        username: user?.username || '',
        email: user?.email || '',
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        status: user?.status || 'ACTIVE',
        roles: user?.roles || [],
        permissions: user?.permissions || [],
    });

    // Update profile form when user data changes
    useEffect(() => {
        if (user) {
            setProfileForm({
                userId: user.userId || 0,
                username: user.username || '',
                email: user.email || '',
                fullName: user.fullName || '',
                phone: user.phone || '',
                avatar: user.avatar || '',
                status: user.status || 'ACTIVE',
                roles: user.roles || [],
                permissions: user.permissions || [],
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender
            });
        }
    }, [user]);

    const handleSubmitProfile = async () => {
        try {
            await updateUserProfile(profileForm);
            toast.success('Cập nhật thông tin thành công');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h2>
                {!isEditingProfile ? (
                    <motion.button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 flex items-center space-x-2 bg-primary text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiEdit3 className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                    </motion.button>
                ) : (
                    <div className="flex space-x-3">
                        <motion.button
                            onClick={() => setIsEditingProfile(false)}
                            className="px-4 py-2 flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Hủy</span>
                        </motion.button>
                        <motion.button
                            onClick={handleSubmitProfile}
                            className="px-4 py-2 flex items-center space-x-2 bg-primary text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiCheck className="w-4 h-4" />
                            <span>Lưu</span>
                        </motion.button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                {isEditingProfile ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={profileForm.username}
                                    onChange={handleProfileChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profileForm.fullName}
                                    onChange={handleProfileChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Giới tính
                                </label>
                                <select
                                    name="gender"
                                    value={profileForm.gender || ''}
                                    onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profileForm.dateOfBirth || ''}
                                    onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Tên đăng nhập</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">{user?.username}</div>
                        </div>

                        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">{user?.email}</div>
                        </div>

                        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">{user?.fullName || '(Chưa cập nhật)'}</div>
                        </div>

                        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">{user?.phone || '(Chưa cập nhật)'}</div>
                        </div>

                        <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">
                                {user?.gender === 'MALE' ? 'Nam' :
                                    user?.gender === 'FEMALE' ? 'Nữ' :
                                        user?.gender === 'OTHER' ? 'Khác' :
                                            '(Chưa cập nhật)'}
                            </div>
                        </div>

                        <div className="flex items-center py-2">
                            <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh</div>
                            <div className="w-2/3 text-gray-900 dark:text-white">
                                {user?.dateOfBirth ? formatDate(user.dateOfBirth) : '(Chưa cập nhật)'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileInfo;