import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCreditCard } from 'react-icons/fi';

interface OrderSummaryProps {
    itemCount: number;
    subtotal: number;
    shippingFee: number;
    totalPrice: number;
    onCreateOrder: () => void;
    loading: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
                                                       itemCount,
                                                       subtotal,
                                                       shippingFee,
                                                       totalPrice,
                                                       onCreateOrder,
                                                       loading
                                                   }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiShoppingBag className="w-5 h-5 mr-2" />
                Thanh toán đơn hàng
            </h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Số lượng sản phẩm:</span>
                    <span className="text-gray-900 dark:text-white">{itemCount}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tạm tính:</span>
                    <span className="text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                    </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-base font-medium text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </span>
                </div>
            </div>

            <motion.button
                onClick={onCreateOrder}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition duration-300 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="mr-2">Tiến hành thanh toán</span>
                <FiCreditCard className="w-5 h-5" />
            </motion.button>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Bạn sẽ xác nhận đơn hàng ở bước tiếp theo trước khi thanh toán
            </p>
        </div>
    );
};

export default OrderSummary;