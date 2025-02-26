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

interface CartItemProps {
    item: CartItemType;
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white dark:bg-secondary/10 rounded-xl shadow-md border border-highlight/10 dark:border-secondary/30 p-4 mb-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30">
            {/* Hình ảnh sản phẩm */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center rounded-md"
                />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-textDark dark:text-textLight truncate">{item.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-accent">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={i < Math.floor(item.rating) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={i < Math.floor(item.rating) ? 'fill-accent' : 'text-highlight/30 dark:text-gray-600'}
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    ))}
                    <span className="text-sm text-secondary/70 dark:text-gray-400 ml-1">{item.rating}</span>
                </div>
                <p className="font-bold text-primary text-base sm:text-lg mt-2">
                    {formatPrice(item.price * item.quantity)}
                </p>
                <span className="text-sm text-secondary/60 dark:text-gray-400 capitalize bg-highlight/10 dark:bg-secondary/20 px-2 py-1 rounded-full mt-1 inline-block">
                    {item.category}
                </span>
            </div>

            {/* Số lượng và Xóa */}
            <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4">
                <div className="flex items-center space-x-2">
                    <button
                        className="text-primary w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-primary/30 rounded-full hover:bg-primary/10 transition disabled:opacity-50"
                        onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        -
                    </button>
                    <span className="text-sm sm:text-base w-8 text-center">{item.quantity}</span>
                    <button
                        className="text-primary w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-primary/30 rounded-full hover:bg-primary/10 transition"
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                        +
                    </button>
                </div>
                <button
                    className="text-red-500 hover:text-red-700 transition p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => onRemove(item.id)}
                    aria-label="Xóa sản phẩm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CartItem;