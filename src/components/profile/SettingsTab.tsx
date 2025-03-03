// File: components/profile/SettingsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SettingsTabProps {
    onChangePassword: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onChangePassword }) => {
    return (
        <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cài đặt tài khoản</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Bảo mật</h3>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Đổi mật khẩu</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                        </div>
                        <motion.button
                            onClick={onChangePassword}
                            className="px-4 py-2 bg-primary text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Đổi mật khẩu
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Tùy chọn nâng cao</h3>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-red-500 dark:text-red-400">Đăng xuất khỏi tất cả các thiết bị</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Đăng xuất khỏi tất cả các phiên đăng nhập trên tất cả thiết bị</p>
                        </div>
                        <motion.button
                            onClick={() => toast.success('Đã đăng xuất khỏi tất cả các thiết bị')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Đăng xuất tất cả
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsTab;