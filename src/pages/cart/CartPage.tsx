import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { toast } from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiChevronLeft, FiShoppingBag, FiPackage, FiShield, FiTruck } from 'react-icons/fi';
import { CartItemDTO, CartUpdateQuantityDTO } from '../../types/cart.types';

interface CartItemProps {
    item: CartItemDTO;
    onQuantityChange: (itemId: number, newQuantity: number) => void;
    onRemove: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
    // Check for basic required fields instead of variant.product
    if (!item || !item.itemId || !item.productName) {
        console.warn('Invalid or missing cart item data:', item);
        return (
            <div className="flex flex-col sm:flex-row border border-red-300 dark:border-red-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm text-center">
                <p className="text-red-600 dark:text-red-400">Dữ liệu sản phẩm không hợp lệ hoặc không tồn tại.</p>
            </div>
        );
    }

    const { itemId, quantity, productName, imageUrl, unitPrice, color, size, sku, stockQuantity } = item;
    const fallbackImage = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

    const displayName = productName || 'Sản phẩm không xác định';
    const price = unitPrice || 0;
    const displayImage = imageUrl || fallbackImage;

    return (
        <div className="flex flex-col sm:flex-row border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="flex-shrink-0 w-full sm:w-36 h-36 mb-4 sm:mb-0 sm:mr-6">
                <div className="w-full h-full relative rounded-md overflow-hidden">
                    <img
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                    />
                    {displayImage === fallbackImage && (
                        <p className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-opacity-50">No Image</p>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{displayName}</h3>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {color && <p className="inline-block mr-4">Màu: {color}</p>}
                            {size && <p className="inline-block mr-4">Kích thước: {size}</p>}
                            {sku && <p className="inline-block">SKU: {sku}</p>}
                            {!color && !size && !sku && (
                                <p className="text-red-500 dark:text-red-400">Thông tin biến thể không đầy đủ</p>
                            )}
                        </div>
                        {stockQuantity && stockQuantity <= 5 && (
                            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                Chỉ còn {stockQuantity} sản phẩm
                            </p>
                        )}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <button
                                onClick={() => onQuantityChange(itemId, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                aria-label="Decrease quantity"
                            >
                                <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="mx-3 w-8 text-center text-gray-900 dark:text-white">{quantity}</span>
                            <button
                                onClick={() => onQuantityChange(itemId, quantity + 1)}
                                disabled={quantity >= (stockQuantity || 1)}
                                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                aria-label="Increase quantity"
                            >
                                <FiPlus className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <div className="text-base font-medium text-primary sm:mr-6">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                    price * quantity
                                )}
                            </div>
                            <button
                                onClick={() => onRemove(itemId)}
                                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                aria-label="Remove item"
                            >
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderSummary: React.FC<{
    itemCount: number;
    totalPrice: number;
    onCheckout: () => void;
}> = ({ itemCount, totalPrice, onCheckout }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiShoppingBag className="w-5 h-5 mr-2" />
                Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tổng số sản phẩm:</span>
                    <span className="text-gray-900 dark:text-white">{itemCount}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-base font-medium text-gray-900 dark:text-white">Tổng cộng:</span>
                    <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                        <FiTruck className="w-5 h-5 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Giao hàng miễn phí cho đơn hàng trên 500.000₫</span>
                    </li>
                    <li className="flex items-start">
                        <FiShield className="w-5 h-5 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Bảo đảm chất lượng sản phẩm</span>
                    </li>
                    <li className="flex items-start">
                        <FiPackage className="w-5 h-5 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Đổi trả trong vòng 7 ngày</span>
                    </li>
                </ul>

                <motion.button
                    onClick={onCheckout}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition duration-300 shadow-md flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="mr-2">Tiến hành đặt hàng</span>
                    <FiChevronLeft className="w-5 h-5 transform rotate-180" />
                </motion.button>
            </div>
        </div>
    );
};

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const [isInitialized, setIsInitialized] = useState(false);
    const { isAuthenticated } = useAuth();
    const {
        cartItems,
        loading,
        error,
        hasItems,
        itemCount,
        totalPrice,
        removeCartItem,
        updateCartItemQuantity,
        getUserCart,
        clearCartError
    } = useCart();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    useEffect(() => {
        const fetchCartData = async () => {
            if (!isAuthenticated) {
                setIsInitialized(true);
                return;
            }

            try {
                clearCartError();
                await getUserCart();
                console.log("Cart data fetched successfully");
            } catch (error) {
                console.error('Error fetching cart data:', error);
                toast.error('Không thể tải dữ liệu giỏ hàng');
            } finally {
                setIsInitialized(true);
            }
        };

        fetchCartData();
    }, [getUserCart, clearCartError, isAuthenticated]);

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            const update: CartUpdateQuantityDTO = { quantity: newQuantity };
            await updateCartItemQuantity(itemId, update);
            toast.success('Đã cập nhật số lượng');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Không thể cập nhật số lượng');
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!itemId || isNaN(itemId)) {
            console.error('Invalid cart item ID:', itemId);
            toast.error('Không thể xóa sản phẩm: ID không hợp lệ');
            return;
        }

        try {
            await removeCartItem(itemId);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Không thể xóa sản phẩm');
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thanh toán!');
            navigate('/login');
            return;
        }
        if (!hasItems) {
            toast.error('Giỏ hàng của bạn đang trống!');
            return;
        }
        navigate('/order');
    };

    // Page animation variants
    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 dark:bg-secondary py-12"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={contentVariants}>
                        <EmptyState
                            title="Vui lòng đăng nhập"
                            description="Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình."
                            action={{
                                label: 'Đăng nhập ngay',
                                onClick: () => navigate('/login'),
                            }}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                            }
                        />
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 dark:bg-secondary py-12"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={contentVariants}>
                        <EmptyState
                            title="Đã có lỗi xảy ra"
                            description={`Không thể tải dữ liệu giỏ hàng: ${error}`}
                            action={{
                                label: 'Quay lại cửa hàng',
                                onClick: () => navigate('/products'),
                            }}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            }
                        />
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    // Filter valid cart items
    const validCartItems = cartItems.filter(item => item && item.itemId && item.productName);

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-secondary transition-colors duration-300"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="container mx-auto px-4 sm:px-8 py-6">
                <motion.div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    variants={contentVariants}
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <FiShoppingBag className="mr-2" />
                            Giỏ Hàng
                            <motion.button
                                onClick={() => navigate('/products')}
                                className="ml-auto flex items-center text-primary text-base font-normal hover:underline"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiChevronLeft className="mr-1" />
                                Tiếp tục mua sắm
                            </motion.button>
                        </h1>
                    </div>

                    {loading && isInitialized && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="medium" />
                        </div>
                    )}

                    {!loading && (!hasItems || validCartItems.length === 0) ? (
                        <div className="p-6">
                            <EmptyState
                                title="Giỏ hàng trống"
                                description="Không có sản phẩm nào trong giỏ hàng của bạn."
                                action={{
                                    label: 'Khám phá sản phẩm',
                                    onClick: () => navigate('/products'),
                                }}
                                icon={
                                    <FiShoppingBag className="w-16 h-16" />
                                }
                            />
                        </div>
                    ) : (
                        !loading && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Cart Items */}
                                    <div className="lg:col-span-2">
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {validCartItems.map((item, index) => (
                                                    <motion.div
                                                        key={`cart-item-${item.itemId}`}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    >
                                                        <CartItem
                                                            item={item}
                                                            onQuantityChange={handleQuantityChange}
                                                            onRemove={handleRemoveItem}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="lg:col-span-1">
                                        <div className="sticky top-6">
                                            <OrderSummary
                                                itemCount={itemCount}
                                                totalPrice={totalPrice}
                                                onCheckout={handleCheckout}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CartPage;