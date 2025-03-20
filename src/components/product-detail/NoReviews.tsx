// components/product-detail/NoReviews.tsx
import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

interface NoReviewsProps {
    productName: string;
    isAuthenticated: boolean;
}

const NoReviews: React.FC<NoReviewsProps> = ({ productName, isAuthenticated }) => {
    return (
        <div className="py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <FiMessageCircle className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Chưa có đánh giá nào cho {productName}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {isAuthenticated
                    ? 'Hãy là người đầu tiên chia sẻ trải nghiệm của bạn với sản phẩm này!'
                    : 'Đăng nhập để viết đánh giá cho sản phẩm này.'}
            </p>
        </div>
    );
};

export default NoReviews;