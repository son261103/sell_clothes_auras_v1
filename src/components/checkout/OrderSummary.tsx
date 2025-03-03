import React from 'react';
import { FiShoppingBag, FiPackage, FiTruck } from 'react-icons/fi';

interface CartItemType {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    rating: number;
}

interface OrderSummaryProps {
    items: CartItemType[];
    shippingFee: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, shippingFee }) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shippingFee;
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiShoppingBag className="w-5 h-5 mr-2" />
                Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4 mb-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                                    }}
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Số lượng: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-primary whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span>Tổng cộng:</span>
                    <span className="font-bold text-primary">{formatPrice(total)}</span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2">
                    <li className="flex items-start">
                        <FiTruck className="w-5 h-5 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Giao hàng miễn phí cho đơn hàng trên 500.000₫</span>
                    </li>
                    <li className="flex items-start">
                        <FiPackage className="w-5 h-5 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Đổi trả trong vòng 7 ngày</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default OrderSummary;