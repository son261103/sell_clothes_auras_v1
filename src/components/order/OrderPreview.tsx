import React from 'react';
import { FiMapPin, FiCreditCard } from 'react-icons/fi';
import { CartItemDTO } from '../../types/cart.types';
import { AddressResponseDTO } from '../../types/user.address.types';
import { ShippingMethodDTO } from '../../types/shipping.types';
import { PaymentMethodDTO } from '../../types/payment.method.types';

interface OrderPreviewProps {
    orderItems: CartItemDTO[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    address: AddressResponseDTO | null;
    orderNote: string;
    shippingMethod: ShippingMethodDTO | null;
    paymentMethod: PaymentMethodDTO | null; // Thêm paymentMethod vào props
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
                                                       orderItems,
                                                       subtotal,
                                                       shippingFee,
                                                       totalAmount,
                                                       address,
                                                       orderNote,
                                                       shippingMethod,
                                                       paymentMethod // Thêm vào destructuring
                                                   }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4">Xem trước đơn hàng</h2>

            {/* Thông tin nhận hàng */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Thông tin nhận hàng</h3>
                {address ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center">
                        <FiMapPin className="w-5 h-5 text-primary mr-2" />
                        <p className="text-textDark dark:text-textLight">
                            {[address.addressLine, address.ward, address.district, address.city]
                                .filter(Boolean)
                                .join(', ')}
                            {address.phoneNumber && ` - SĐT: ${address.phoneNumber}`}
                        </p>
                    </div>
                ) : (
                    <p className="text-red-500 dark:text-red-400">Vui lòng chọn địa chỉ nhận hàng</p>
                )}
            </div>

            {/* Phương thức vận chuyển */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Phương thức vận chuyển</h3>
                {shippingMethod ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-textDark dark:text-textLight">
                            {shippingMethod.name} - {shippingMethod.estimatedDeliveryTime}
                        </p>
                    </div>
                ) : (
                    <p className="text-red-500 dark:text-red-400">Vui lòng chọn phương thức vận chuyển</p>
                )}
            </div>

            {/* Phương thức thanh toán */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Phương thức thanh toán</h3>
                {paymentMethod ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center">
                        <FiCreditCard className="w-5 h-5 text-primary mr-2" />
                        <p className="text-textDark dark:text-textLight">
                            {paymentMethod.name}{' '}
                            {paymentMethod.description && (
                                <span className="text-sm text-secondary/70 dark:text-textLight/70">
                                    ({paymentMethod.description})
                                </span>
                            )}
                        </p>
                    </div>
                ) : (
                    <p className="text-red-500 dark:text-red-400">Vui lòng chọn phương thức thanh toán</p>
                )}
            </div>

            {/* Ghi chú đơn hàng */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Ghi chú đơn hàng</h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {orderNote ? (
                        <p className="text-textDark dark:text-textLight">{orderNote}</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Không có ghi chú</p>
                    )}
                </div>
            </div>

            {/* Sản phẩm */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">
                    Sản phẩm ({orderItems.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                    {orderItems.map((item) => (
                        <div
                            key={item.itemId}
                            className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center">
                                <img
                                    src={item.imageUrl || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'}
                                    alt={item.productName}
                                    className="w-10 h-10 rounded object-cover mr-3"
                                />
                                <div>
                                    <p className="text-sm text-textDark dark:text-textLight truncate max-w-xs">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-secondary/70 dark:text-textLight/70">
                                        {item.color && `${item.color}, `}
                                        {item.size && `${item.size}, `}
                                        x{item.quantity}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-primary">
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
            <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3">
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
                <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-textDark dark:text-textLight">Tổng thanh toán:</span>
                    <span className="text-lg text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                    </span>
                </div>
            </div>

            <div className="mt-4 text-center text-sm text-secondary/70 dark:text-textLight/70">
                Mã đơn hàng sẽ được tạo sau khi bạn tiến hành thanh toán
            </div>
        </div>
    );
};

export default OrderPreview;