import React from 'react';

interface LoadingProductCardProps {
    viewMode?: 'grid' | 'list';
}

const LoadingProductCard: React.FC<LoadingProductCardProps> = ({ viewMode = 'grid' }) => {
    // Grid skeleton loader
    if (viewMode === 'grid') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
                {/* Image skeleton */}
                <div className="bg-gray-200 dark:bg-gray-700 w-full pt-[100%] relative" />

                {/* Content skeleton */}
                <div className="p-4 flex-grow">
                    {/* Category/brand skeleton */}
                    <div className="flex justify-between">
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded" />
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded" />
                    </div>

                    {/* Title skeleton */}
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-5 w-full rounded" />
                    <div className="mt-1 bg-gray-200 dark:bg-gray-700 h-5 w-4/5 rounded" />

                    {/* Price skeleton */}
                    <div className="mt-3 flex items-center gap-2">
                        <div className="bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded" />
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // List skeleton loader
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="flex flex-col sm:flex-row">
                {/* Image skeleton */}
                <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700" />

                {/* Content skeleton */}
                <div className="p-4 flex-1">
                    {/* Category/brand skeleton */}
                    <div className="flex">
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded mr-2" />
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded" />
                    </div>

                    {/* Title skeleton */}
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-6 w-full rounded" />

                    {/* Description skeleton */}
                    <div className="mt-2">
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded mb-1" />
                        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-5/6 rounded" />
                    </div>

                    {/* Price and actions skeleton */}
                    <div className="mt-4 sm:flex sm:justify-between">
                        <div className="bg-gray-200 dark:bg-gray-700 h-6 w-32 rounded mb-3 sm:mb-0" />
                        <div className="flex gap-2">
                            <div className="bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded" />
                            <div className="bg-gray-200 dark:bg-gray-700 h-10 w-10 rounded" />
                            <div className="bg-gray-200 dark:bg-gray-700 h-10 w-10 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingProductCard;