import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="flex flex-col sm:flex-row border border-primary/10 dark:border-primary/20 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 hover:shadow-md">
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
                        <h3 className="text-lg font-medium text-textDark dark:text-textLight">{displayName}</h3>
                        <div className="mt-1 text-sm text-secondary/70 dark:text-textLight/70">
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
                            <span className="mx-3 w-8 text-center text-textDark dark:text-textLight">{quantity}</span>
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
                            <div className="text-lg font-medium text-primary sm:mr-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-secondary/70 dark:text-textLight/70">Tổng số sản phẩm:</span>
                    <span className="text-textDark dark:text-textLight">{itemCount}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-lg font-medium text-textDark dark:text-textLight">Tổng cộng:</span>
                    <span className="text-xl font-bold text-primary">
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

                <button
                    onClick={onCheckout}
                    className="w-full bg-primary text-white py-3 rounded-full hover:bg-primary/90 transition duration-300 shadow-sm flex items-center justify-center"
                >
                    <span className="mr-2">Tiến hành đặt hàng</span>
                    <FiChevronLeft className="w-5 h-5 transform rotate-180" />
                </button>
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

    if (loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lightBackground dark:bg-darkBackground">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
                <div className="container mx-auto px-4">
                    <EmptyState
                        title="Vui lòng đăng nhập"
                        description="Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình."
                        action={{
                            label: 'Đăng nhập ngay',
                            onClick: () => navigate('/login'),
                        }}
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
                <div className="container mx-auto px-4">
                    <EmptyState
                        title="Đã có lỗi xảy ra"
                        description={`Không thể tải dữ liệu giỏ hàng: ${error}`}
                        action={{
                            label: 'Quay lại cửa hàng',
                            onClick: () => navigate('/products'),
                        }}
                    />
                </div>
            </div>
        );
    }

    // Filter valid cart items
    const validCartItems = cartItems.filter(item => item && item.itemId && item.productName);

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                <section>
                    <div className="flex items-center justify-between mb-6" data-aos="fade-down">
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Giỏ Hàng</h1>
                        <button
                            onClick={() => navigate('/products')}
                            className="flex items-center text-primary hover:underline"
                        >
                            <FiChevronLeft className="mr-1" />
                            Tiếp tục mua sắm
                        </button>
                    </div>

                    {loading && isInitialized && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="medium" />
                        </div>
                    )}

                    {!loading && (!hasItems || validCartItems.length === 0) ? (
                        <div className="text-center py-16" data-aos="fade-up">
                            <div className="mb-6">
                                <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-secondary/70 dark:text-textLight/70 text-lg mb-6">
                                Không có sản phẩm trong giỏ hàng.
                            </p>
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition duration-300 shadow-sm"
                            >
                                Khám phá sản phẩm
                            </button>
                        </div>
                    ) : (
                        !loading && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cart Items */}
                                <div className="lg:col-span-2">
                                    <div className="space-y-4">
                                        {validCartItems.map((item, index) => (
                                            <div
                                                key={`cart-item-${item.itemId}`}
                                                data-aos="fade-up"
                                                data-aos-delay={index * 50}
                                            >
                                                <CartItem
                                                    item={item}
                                                    onQuantityChange={handleQuantityChange}
                                                    onRemove={handleRemoveItem}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="lg:col-span-1" data-aos="fade-left">
                                    <div className="sticky top-6">
                                        <OrderSummary
                                            itemCount={itemCount}
                                            totalPrice={totalPrice}
                                            onCheckout={handleCheckout}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </section>
            </div>
        </div>
    );
};

export default CartPage;