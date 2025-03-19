import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiMapPin, FiSettings, FiLogOut } from 'react-icons/fi';
import { UserProfile } from '../../types/profile.types';

interface ProfileSidebarProps {
    user: UserProfile | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    onAvatarClick: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
                                                           user,
                                                           activeTab,
                                                           onTabChange,
                                                           onLogout,
                                                           onAvatarClick
                                                       }) => {
    const tabs = [
        { id: 'profile', label: 'Hồ sơ', icon: <FiUser /> },
        { id: 'orders', label: 'Đơn hàng của tôi', icon: <FiPackage /> },
        { id: 'addresses', label: 'Địa chỉ', icon: <FiMapPin /> },
        { id: 'settings', label: 'Cài đặt', icon: <FiSettings /> },
    ];

    return (
        <div className="border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 md:h-full">
            <div className="flex flex-col items-center py-6 px-4">
                <div
                    className="relative cursor-pointer group"
                    onClick={onAvatarClick}
                >
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.fullName || 'User Avatar'}
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-primary">
                            <FiUser className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">
                            Thay đổi
                        </span>
                    </div>
                </div>
                <h3 className="mt-4 font-bold text-lg text-gray-900 dark:text-white">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
            </div>

            <nav className="mt-2">
                <ul className="space-y-1 px-2 pb-4">
                    {tabs.map((tab) => (
                        <li key={tab.id}>
                            <button
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="mr-3">{tab.icon}</span>
                                <span className="font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <FiLogOut className="mr-3" />
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ProfileSidebar;