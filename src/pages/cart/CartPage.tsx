import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { toast } from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiChevronLeft, FiShoppingBag } from 'react-icons/fi';
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

    console.log('CartItem data:', {
        itemId,
        productName,
        imageUrl,
        price: unitPrice || 0,
        color,
        size,
        sku,
        stockQuantity,
        quantity,
        totalPrice: item.totalPrice
    });

    const displayName = productName || 'Sản phẩm không xác định';
    const price = unitPrice || 0;
    const displayImage = imageUrl || fallbackImage;

    if (!productName && !imageUrl) {
        console.warn('Missing product data for item:', item);
    }

    return (
        <div className="flex flex-col sm:flex-row border border-primary/10 dark:border-primary/20 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex-shrink-0 w-full sm:w-40 h-40 mb-4 sm:mb-0 sm:mr-6">
                <div className="w-full h-full relative rounded-md overflow-hidden">
                    <img
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                            console.error('Image load failed for:', displayName);
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
                            {color && <p>Màu: {color}</p>}
                            {size && <p>Kích thước: {size}</p>}
                            {sku && <p>SKU: {sku}</p>}
                            {!color && !size && !sku && (
                                <p className="text-red-500 dark:text-red-400">Thông tin biến thể không đầy đủ</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <button
                                onClick={() => onQuantityChange(itemId, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                aria-label="Decrease quantity"
                            >
                                <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="mx-3 w-8 text-center text-textDark dark:text-textLight">{quantity}</span>
                            <button
                                onClick={() => onQuantityChange(itemId, quantity + 1)}
                                disabled={quantity >= (stockQuantity || 1)}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                aria-label="Increase quantity"
                            >
                                <FiPlus className="w-4 h-4" />
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
                console.log("Cart data fetched successfully:", cartItems);
                cartItems.forEach(item => {
                    console.log("Cart item details:", {
                        itemId: item?.itemId,
                        productName: item?.productName,
                        imageUrl: item?.imageUrl,
                        price: item?.unitPrice,
                        color: item?.color,
                        size: item?.size,
                        sku: item?.sku,
                        stockQuantity: item?.stockQuantity,
                        quantity: item?.quantity,
                        totalPrice: item?.totalPrice
                    });
                });
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
        navigate('/checkout');
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

    // Updated filter to match flat CartItemDTO structure
    const validCartItems = cartItems.filter(item => item && item.itemId && item.productName);

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                <section data-aos="fade-down">
                    <div className="flex items-center justify-between mb-6">
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
                            <div className="space-y-6">
                                {validCartItems.map((item, index) => (
                                    <div
                                        key={`cart-item-${item.itemId}`}
                                        data-aos="fade-up"
                                        data-aos-delay={index * 100}
                                    >
                                        <CartItem
                                            item={item}
                                            onQuantityChange={handleQuantityChange}
                                            onRemove={handleRemoveItem}
                                        />
                                    </div>
                                ))}
                                {validCartItems.length > 0 && (
                                    <div className="border-t border-primary/10 dark:border-primary/20 pt-4">
                                        <div
                                            className="flex flex-col sm:flex-row justify-between items-center gap-4"
                                            data-aos="fade-up"
                                            data-aos-delay="200"
                                        >
                                            <div className="flex flex-col w-full sm:w-auto">
                                                <span className="text-sm text-secondary/70 dark:text-textLight/70 mb-1">
                                                    Tổng số sản phẩm: {itemCount}
                                                </span>
                                                <span className="text-lg font-medium text-textDark dark:text-textLight">
                                                    Tổng cộng:
                                                </span>
                                            </div>
                                            <span className="text-xl font-bold text-primary">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                                            </span>
                                        </div>
                                        <div
                                            className="flex justify-end mt-4"
                                            data-aos="fade-up"
                                            data-aos-delay="300"
                                        >
                                            <button
                                                className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition duration-300 shadow-sm flex items-center"
                                                onClick={handleCheckout}
                                            >
                                                <span className="mr-2">Thanh Toán</span>
                                                <FiChevronLeft className="w-5 h-5 transform rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </section>
            </div>
        </div>
    );
};

export default CartPage;