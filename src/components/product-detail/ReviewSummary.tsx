// components/product-detail/ReviewSummary.tsx
import React from 'react';
import { FiStar } from 'react-icons/fi';
import { ProductReviewSummaryDTO, calculateStarPercentage } from '../../types/product.review.types';

interface ReviewSummaryProps {
    summary: ProductReviewSummaryDTO;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary }) => {
    const renderStarRating = (fillPercentage: number) => {
        return (
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                <div
                    className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full"
                    style={{ width: `${fillPercentage}%` }}
                ></div>
            </div>
        );
    };

    const renderStarDistribution = () => {
        const stars = [
            { count: summary.fiveStarCount, label: '5' },
            { count: summary.fourStarCount, label: '4' },
            { count: summary.threeStarCount, label: '3' },
            { count: summary.twoStarCount, label: '2' },
            { count: summary.oneStarCount, label: '1' },
        ];

        return (
            <div className="space-y-2">
                {stars.map((star, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 text-sm text-gray-600 dark:text-gray-300 flex items-center">
                            {star.label} <FiStar className="ml-1 h-3 w-3 inline text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            {renderStarRating(calculateStarPercentage(star.count, summary.totalReviews))}
                        </div>
                        <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-300">
                            {star.count}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {summary.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <FiStar
                                key={index}
                                className={`h-5 w-5 ${
                                    starValue <= Math.round(summary.averageRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        );
                    })}
                </div>
                <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                    {summary.totalReviews} đánh giá
                </div>
            </div>

            <div className="mt-4">{renderStarDistribution()}</div>
        </div>
    );
};

export default ReviewSummary;