import React from 'react';
import { FiChevronLeft, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm sticky top-4">
            <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-secondary/70 dark:text-textLight/70">Tổng sản phẩm:</span>
                    <span className="text-textDark dark:text-textLight">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-secondary/70 dark:text-textLight/70">Tạm tính:</span>
                    <span className="text-textDark dark:text-textLight">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-secondary/70 dark:text-textLight/70">Phí vận chuyển:</span>
                    <span className="text-textDark dark:text-textLight">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                    </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between font-semibold text-base">
                        <span className="text-textDark dark:text-textLight">Tổng thanh toán:</span>
                        <span className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center"><FiTruck className="w-5 h-5 text-primary mr-2" /> {/* Giao hàng miễn phí cho đơn trên 500.000₫ */} Phí vận chuyển phụ thuộc phương thức</li>
                    <li className="flex items-center"><FiShield className="w-5 h-5 text-primary mr-2" /> Bảo đảm chất lượng sản phẩm</li>
                    <li className="flex items-center"><FiClock className="w-5 h-5 text-primary mr-2" /> Đổi trả trong vòng 7 ngày</li>
                </ul>
                <button
                    onClick={onCreateOrder}
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-full hover:bg-primary/90 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <LoadingSpinner size="small" color="white" /> : (
                        <>
                            <span className="mr-2">Tạo đơn hàng</span>
                            <FiChevronLeft className="w-5 h-5 transform rotate-180" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderSummary;