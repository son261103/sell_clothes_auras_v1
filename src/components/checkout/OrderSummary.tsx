import React from 'react';

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
        <div className="bg-white dark:bg-secondary/10 rounded-xl shadow-md border border-highlight/10 dark:border-secondary/30 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md"
                            />
                            <div>
                                <p className="text-sm sm:text-base font-medium text-textDark dark:text-textLight truncate max-w-[200px]">{item.name}</p>
                                <p className="text-sm text-secondary/70 dark:text-textLight/70">Số lượng: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-primary">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                    </div>
                ))}
                <div className="border-t border-highlight/20 dark:border-secondary/30 pt-4 space-y-2">
                    <div className="flex justify-between text-sm sm:text-base text-textDark dark:text-textLight">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base text-textDark dark:text-textLight">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium text-textDark dark:text-textLight">
                        <span>Tổng cộng:</span>
                        <span className="font-bold text-primary">{formatPrice(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;