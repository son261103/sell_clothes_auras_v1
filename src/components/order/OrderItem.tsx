import React from 'react';
import { motion } from 'framer-motion';
import { CartItemDTO } from '../../types/cart.types';

interface OrderItemProps {
    item: CartItemDTO;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
    if (!item || !item.itemId || !item.productName) {
        console.warn('Invalid or missing order item data:', item);
        return (
            <div className="flex flex-col sm:flex-row border border-red-300 dark:border-red-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm text-center">
                <p className="text-red-600 dark:text-red-400">Dữ liệu sản phẩm không hợp lệ hoặc không tồn tại.</p>
            </div>
        );
    }

    const { productName, imageUrl, unitPrice = 0, color, size, sku, quantity } = item;
    const fallbackImage = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

    return (
        <motion.div
            className="flex flex-col sm:flex-row border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.01 }}
        >
            <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                <div className="w-full h-full relative rounded-md overflow-hidden">
                    <img
                        src={imageUrl || fallbackImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).src = fallbackImage}
                    />
                </div>
            </div>
            <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{productName}</h3>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {color && <span className="mr-2">Màu: {color}</span>}
                    {size && <span>Kích thước: {size}</span>}
                </div>
                {sku && <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {sku}</p>}
                <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Số lượng: {quantity}</span>
                    <span className="text-base font-medium text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(unitPrice * quantity)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderItem;