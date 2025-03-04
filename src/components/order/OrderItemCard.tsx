// src/components/order/OrderItemCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { OrderItemDTO } from '../../types/order.types';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';

interface OrderItemCardProps {
    item: OrderItemDTO;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item }) => {
    // Format currency
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 mr-4 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <FiPackage className="w-8 h-8" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <Link
                        to={`/product/${item.productId}`}
                        className="text-base font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
                    >
                        {item.productName}
                    </Link>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.size && (
                            <span>
                Kích thước: <span className="font-medium">{item.size}</span>
              </span>
                        )}

                        {item.color && (
                            <span>
                Màu sắc: <span className="font-medium">{item.color}</span>
              </span>
                        )}

                        {item.sku && (
                            <span className="text-xs">
                SKU: {item.sku}
              </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-1 ml-4">
          <span className="text-sm text-gray-900 dark:text-white">
            {formatPrice(item.unitPrice)} x {item.quantity}
          </span>
                    <span className="text-base font-medium text-primary">
            {formatPrice(item.totalPrice)}
          </span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Số lượng: <span className="font-medium">{item.quantity}</span>
                </div>
                <Link
                    to={`/product/${item.productId}`}
                    className="text-sm text-primary hover:underline flex items-center"
                >
                    <FiShoppingBag className="mr-1 w-4 h-4" /> Mua lại
                </Link>
            </div>
        </div>
    );
};

export default OrderItemCard;