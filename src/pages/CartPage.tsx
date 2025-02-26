import React, { useState, useEffect } from 'react';
import CartItem from '../components/cart/CartItem';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useNavigate } from 'react-router-dom';

interface CartItemType {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    rating: number;
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItemType[]>([
        {
            id: 1,
            name: 'Váy Mùa Hè Thanh Lịch',
            price: 1800000,
            image: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'váy',
            rating: 4.5,
            quantity: 2,
        },
        {
            id: 2,
            name: 'Áo Khoác Denim Cá Tính',
            price: 2100000,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'áo khoác',
            rating: 4.8,
            quantity: 1,
        },
    ]);

    const navigate = useNavigate(); // Hook để điều hướng

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleQuantityChange = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemoveItem = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        navigate('/checkout'); // Điều hướng đến trang checkout
    };

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            {/* Main Content with Inset */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                {/* Cart Section */}
                <section data-aos="fade-down">
                    <h1 className="text-3xl font-bold text-primary tracking-tight mb-6">Giỏ Hàng</h1>
                    {cartItems.length === 0 ? (
                        <p
                            className="text-secondary/70 dark:text-textLight/70 text-center text-base"
                            data-aos="fade-up"
                        >
                            Giỏ hàng của bạn đang trống.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item.id}
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
                            <div className="border-t border-primary/10 dark:border-primary/20 pt-4">
                                <div
                                    className="flex flex-col sm:flex-row justify-between items-center gap-4"
                                    data-aos="fade-up"
                                    data-aos-delay="200"
                                >
                                    <span className="text-lg font-medium text-textDark dark:text-textLight">
                                        Tổng cộng:
                                    </span>
                                    <span className="text-xl font-bold text-primary">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                    </span>
                                </div>
                                <div
                                    className="flex justify-end mt-4"
                                    data-aos="fade-up"
                                    data-aos-delay="300"
                                >
                                    <button
                                        className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition duration-300 shadow-sm"
                                        onClick={handleCheckout} // Gọi hàm điều hướng
                                    >
                                        Thanh Toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CartPage;