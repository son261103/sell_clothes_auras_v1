// File: components/profile/ProfileSidebar.tsx
import React from 'react';
import { FiUser, FiMapPin, FiPackage, FiSettings, FiLogOut } from 'react-icons/fi';
import { UserProfile } from '../../types/auth.types';

interface ProfileSidebarProps {
    user: UserProfile | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
                                                           user,
                                                           activeTab,
                                                           onTabChange,
                                                           onLogout
                                                       }) => {
    return (
        <div className="md:w-64 bg-gray-50 dark:bg-gray-750 p-6 shrink-0">
            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <FiUser className="w-12 h-12 text-primary" />
                    )}
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>

            <nav className="space-y-1">
                <button
                    onClick={() => onTabChange('profile')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'profile'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <FiUser className="w-5 h-5" />
                    <span>Hồ sơ</span>
                </button>

                <button
                    onClick={() => onTabChange('orders')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'orders'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <FiPackage className="w-5 h-5" />
                    <span>Đơn hàng của tôi</span>
                </button>

                <button
                    onClick={() => onTabChange('addresses')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'addresses'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <FiMapPin className="w-5 h-5" />
                    <span>Sổ địa chỉ</span>
                </button>

                <button
                    onClick={() => onTabChange('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'settings'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <FiSettings className="w-5 h-5" />
                    <span>Cài đặt tài khoản</span>
                </button>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </button>
            </nav>
        </div>
    );
};

export default ProfileSidebar;