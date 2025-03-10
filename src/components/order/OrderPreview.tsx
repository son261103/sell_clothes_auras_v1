import React from 'react';
import { FiMapPin, FiCreditCard, FiTruck, FiPackage, FiMessageSquare, FiTag } from 'react-icons/fi';
import { CartItemDTO } from '../../types/cart.types';
import { AddressResponseDTO } from '../../types/user.address.types';
import { ShippingMethodDTO } from '../../types/shipping.types';
import { PaymentMethodDTO } from '../../types/payment.method.types';

interface OrderPreviewProps {
    orderItems: CartItemDTO[];
    subtotal: number;
    shippingFee: number;
    couponDiscount?: number;
    couponCode?: string;
    totalAmount: number;
    address: AddressResponseDTO | null;
    orderNote: string;
    shippingMethod: ShippingMethodDTO | null;
    paymentMethod: PaymentMethodDTO | null;
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
                                                       orderItems,
                                                       subtotal,
                                                       shippingFee,
                                                       couponDiscount = 0,
                                                       couponCode,
                                                       totalAmount,
                                                       address,
                                                       orderNote,
                                                       shippingMethod,
                                                       paymentMethod
                                                   }) => {
    const hasCoupon = couponDiscount > 0 && couponCode;
    const finalTotal = totalAmount - couponDiscount;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiPackage className="w-5 h-5 mr-2" />
                Xem trước đơn hàng
            </h2>

            {/* Thông tin nhận hàng */}
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiMapPin className="w-4 h-4 mr-2 text-primary" />
                    Thông tin nhận hàng
                </h3>
                {address ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {[address.addressLine, address.ward, address.district, address.city]
                                .filter(Boolean)
                                .join(', ')}
                            {address.phoneNumber && <span className="block mt-1 text-gray-500 dark:text-gray-400">SĐT: {address.phoneNumber}</span>}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Vui lòng chọn địa chỉ nhận hàng
                    </p>
                )}
            </div>

            {/* Phương thức vận chuyển */}
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiTruck className="w-4 h-4 mr-2 text-primary" />
                    Phương thức vận chuyển
                </h3>
                {shippingMethod ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {shippingMethod.name} - {shippingMethod.estimatedDeliveryTime}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Vui lòng chọn phương thức vận chuyển
                    </p>
                )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiCreditCard className="w-4 h-4 mr-2 text-primary" />
                    Phương thức thanh toán
                </h3>
                {paymentMethod ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start">
                        <FiCreditCard className="w-4 h-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {paymentMethod.name}
                            </p>
                            {paymentMethod.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {paymentMethod.description}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Vui lòng chọn phương thức thanh toán
                    </p>
                )}
            </div>

            {/* Mã giảm giá - Conditionally displayed */}
            {hasCoupon && (
                <div className="mb-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <FiTag className="w-4 h-4 mr-2 text-primary" />
                        Mã giảm giá
                    </h3>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {couponCode}
                            </p>
                            <span className="text-sm text-green-600 dark:text-green-400">
                                -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(couponDiscount)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Ghi chú đơn hàng */}
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiMessageSquare className="w-4 h-4 mr-2 text-primary" />
                    Ghi chú đơn hàng
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {orderNote ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{orderNote}</p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Không có ghi chú</p>
                    )}
                </div>
            </div>

            {/* Sản phẩm */}
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiPackage className="w-4 h-4 mr-2 text-primary" />
                    Sản phẩm ({orderItems.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {orderItems.map((item) => (
                        <div
                            key={item.itemId}
                            className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                    <img
                                        src={item.imageUrl || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'}
                                        alt={item.productName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                                        }}
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-gray-900 dark:text-white truncate max-w-[160px]">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.color && `${item.color}, `}
                                        {item.size && `${item.size}, `}
                                        x{item.quantity}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-primary whitespace-nowrap">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format((item.unitPrice ?? 0) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tổng kết */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tạm tính:</span>
                    <span className="text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
                    <span className="text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                    </span>
                </div>

                {/* Display coupon discount if applied */}
                {hasCoupon && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span className="flex items-center">
                            <FiTag className="w-3.5 h-3.5 mr-1" />
                            Giảm giá ({couponCode}):
                        </span>
                        <span>
                            -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(couponDiscount)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hasCoupon ? finalTotal : totalAmount)}
                    </span>
                </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                Mã đơn hàng sẽ được tạo sau khi bạn tiến hành thanh toán
            </div>
        </div>
    );
};

export default OrderPreview;