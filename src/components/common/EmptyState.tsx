import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {icon ? (
                <div className="mb-6 text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            ) : (
                <div className="mb-6 text-gray-400 dark:text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 6h16M4 12h16M4 18h7"
                        />
                    </svg>
                </div>
            )}

            <motion.h3
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                {title}
            </motion.h3>

            <motion.p
                className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                {description}
            </motion.p>

            {action && (
                <motion.button
                    className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors duration-200 font-medium"
                    onClick={action.onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;