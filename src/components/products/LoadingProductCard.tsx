import React from 'react';

interface LoadingProductCardProps {
    viewMode?: 'grid' | 'list';
}

const LoadingProductCard: React.FC<LoadingProductCardProps> = ({ viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        // List view skeleton
        return (
            <div className="bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm border border-highlight/10 dark:border-secondary/30 h-full flex flex-col sm:flex-row animate-pulse">
                {/* Image placeholder */}
                <div className="h-52 sm:h-auto sm:w-48 md:w-56 lg:w-64 flex-shrink-0 bg-gray-200 dark:bg-gray-700 relative"></div>

                {/* Content placeholder */}
                <div className="p-4 flex-grow flex flex-col">
                    {/* Badge and rating */}
                    <div className="mb-2 flex items-center justify-between">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>

                    {/* Title placeholder */}
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>

                    {/* Description placeholder */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>

                    {/* Price and button placeholder */}
                    <div className="mt-auto flex items-end justify-between">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view skeleton (default)
    return (
        <div className="bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm border border-highlight/10 dark:border-secondary/30 h-full flex flex-col animate-pulse">
            {/* Image placeholder */}
            <div className="h-52 bg-gray-200 dark:bg-gray-700 relative"></div>

            {/* Content placeholder */}
            <div className="p-3 flex-grow flex flex-col">
                {/* Title placeholder */}
                <div className="h-12 mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>

                {/* Rating placeholder */}
                <div className="mt-2 flex items-center">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        ))}
                    </div>
                    <div className="w-6 h-3 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
                </div>

                {/* Price and category placeholder */}
                <div className="mt-2 flex justify-between items-center">
                    <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingProductCard;