import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCreditCard, FiTag, FiPercent } from 'react-icons/fi';

interface OrderSummaryProps {
    itemCount: number;
    subtotal: number;
    shippingFee: number;
    couponDiscount?: number;
    totalPrice: number;
    onCreateOrder: () => void;
    loading: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
                                                       itemCount,
                                                       subtotal,
                                                       shippingFee,
                                                       couponDiscount = 0,
                                                       totalPrice,
                                                       onCreateOrder,
                                                       loading
                                                   }) => {
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    const hasCoupon = couponDiscount > 0;
    const totalWithDiscount = totalPrice - couponDiscount;

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
                        {formatter.format(subtotal)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="text-gray-900 dark:text-white">
                        {formatter.format(shippingFee)}
                    </span>
                </div>

                {hasCoupon && (
                    <motion.div
                        className="flex justify-between text-green-600 dark:text-green-400"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="flex items-center">
                            <FiTag className="w-4 h-4 mr-1.5" />
                            Giảm giá:
                        </span>
                        <span>- {formatter.format(couponDiscount)}</span>
                    </motion.div>
                )}

                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-base font-medium text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-lg font-bold text-primary">
                        {formatter.format(hasCoupon ? totalWithDiscount : totalPrice)}
                    </span>
                </div>

                {hasCoupon && (
                    <div className="flex justify-end">
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full flex items-center">
                            <FiPercent className="w-3 h-3 mr-1" />
                            Đã áp dụng mã giảm giá
                        </span>
                    </div>
                )}
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