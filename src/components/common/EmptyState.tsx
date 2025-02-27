import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
                                                   title,
                                                   description,
                                                   action,
                                                   icon = <FiShoppingBag className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" />,
                                               }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-darkBackground rounded-lg shadow-sm">
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-accent"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;