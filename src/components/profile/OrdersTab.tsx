// File: components/profile/OrdersTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { NavigateFunction } from 'react-router-dom';
import { FiCalendar, FiPackage, FiChevronRight } from 'react-icons/fi';
import { OrderStatus, OrderSummaryDTO } from '../../types/order.types';
import useOrder from '../../hooks/useOrder';

interface OrdersTabProps {
    orders: OrderSummaryDTO[];
    navigate: NavigateFunction;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, navigate }) => {
    const { getOrderStatusText } = useOrder();

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Đơn hàng của tôi</h2>
                <motion.button
                    onClick={() => navigate('/orders')}
                    className="px-4 py-2 flex items-center space-x-2 text-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>Xem tất cả</span>
                    <FiChevronRight className="w-4 h-4" />
                </motion.button>
            </div>

            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => (
                        <motion.div
                            key={order.orderId}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex flex-col sm:flex-row justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Đơn hàng #{order.orderId}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <FiCalendar className="mr-1 w-3 h-3" />
                                        Ngày đặt: {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === OrderStatus.COMPLETED
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                          : order.status === OrderStatus.CANCELLED
                              ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                  }`}>
                    {order.statusDescription || getOrderStatusText(order.status)}
                  </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.totalItems} sản phẩm</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => navigate(`/orders/${order.orderId}`)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Xem chi tiết
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-10 shadow-md text-center">
                    <FiPackage className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có đơn hàng nào</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Bạn chưa có đơn hàng nào. Hãy mua sắm và quay lại sau.</p>
                    <motion.button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-primary text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Mua sắm ngay
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default OrdersTab;