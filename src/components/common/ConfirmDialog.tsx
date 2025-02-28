import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';

type DialogType = 'warning' | 'info' | 'error' | 'success';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: DialogType;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         isOpen,
                                                         title,
                                                         message,
                                                         confirmText = 'Xác nhận',
                                                         cancelText = 'Hủy',
                                                         type = 'warning',
                                                         onConfirm,
                                                         onCancel
                                                     }) => {
    if (!isOpen) return null;

    const getIconByType = () => {
        switch (type) {
            case 'warning':
                return <FiAlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />;
            case 'error':
                return <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />;
            case 'success':
                return <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />;
            case 'info':
            default:
                return <FiInfo className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
        }
    };

    const getButtonColorByType = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700';
            case 'error':
                return 'bg-red-600 hover:bg-red-700';
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'info':
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    const getBgColorByType = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900/30';
            case 'error':
                return 'bg-red-100 dark:bg-red-900/30';
            case 'success':
                return 'bg-green-100 dark:bg-green-900/30';
            case 'info':
            default:
                return 'bg-blue-100 dark:bg-blue-900/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getBgColorByType()} mb-4`}>
                        {getIconByType()}
                    </div>
                    <h3 className="text-lg font-medium leading-6 text-textDark dark:text-textLight mb-2">{title}</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-secondary/70 dark:text-textLight/70">
                            {message}
                        </p>
                    </div>
                    <div className="flex justify-center mt-5 space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 ${getButtonColorByType()} text-white rounded-lg transition-all`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmDialog;