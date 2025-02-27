import React from 'react';

const LoadingProductCard: React.FC = () => {
    return (
        <div className="bg-white dark:bg-darkBackground rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>

            {/* Content placeholder */}
            <div className="p-4">
                {/* Brand name */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>

                {/* Product name - 2 lines */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>

                {/* Price */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
            </div>
        </div>
    );
};

export default LoadingProductCard;