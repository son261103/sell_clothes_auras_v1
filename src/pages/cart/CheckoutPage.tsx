import React, { useState } from 'react';
import { motion } from 'framer-motion';
import OrderSummary from '../../components/checkout/OrderSummary';
import 'aos/dist/aos.css';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {FiChevronLeft, FiCreditCard, FiTruck, FiTag, FiUser, FiShoppingBag} from 'react-icons/fi';

interface CartItemType {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    rating: number;
}

interface FormData {
    fullName: string;
    address: string;
    phone: string;
    email: string;
    note: string;
    discountCode: string;
}

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const cartItems: CartItemType[] = location.state?.cartItems || [];

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        address: '',
        phone: '',
        email: '',
        note: '',
        discountCode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('cod'); // Mặc định COD
    const [shippingMethod, setShippingMethod] = useState('standard'); // Mặc định tiêu chuẩn

    const shippingOptions = [
        { value: 'standard', label: 'Giao hàng tiêu chuẩn', fee: 30000 },
        { value: 'express', label: 'Giao hàng nhanh', fee: 50000 },
    ];

    const paymentOptions = [
        { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
        { value: 'card', label: 'Thẻ tín dụng/Thẻ ghi nợ' },
        { value: 'momo', label: 'Ví MoMo' },
        { value: 'zalopay', label: 'Ví ZaloPay' },
    ];

    // Animation variants
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, address, phone, email } = formData;
        if (!fullName || !address || !phone || !email) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        if (!paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán!');
            return;
        }
        if (!shippingMethod) {
            toast.error('Vui lòng chọn phương thức vận chuyển!');
            return;
        }
        toast.success('Đặt hàng thành công!');
        // Logic xử lý thanh toán thực tế (gửi API, reset form, v.v.) có thể thêm ở đây
    };

    const shippingFee = shippingOptions.find(option => option.value === shippingMethod)?.fee || 0;

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
                            <FiCreditCard className="mr-2" />
                            Thanh Toán
                            <motion.button
                                onClick={() => navigate('/cart')}
                                className="ml-auto flex items-center text-primary text-base font-normal hover:underline"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiChevronLeft className="mr-1" />
                                Quay lại giỏ hàng
                            </motion.button>
                        </h1>
                    </div>

                    <div className="p-6">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                                    <FiShoppingBag className="w-full h-full" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Không có sản phẩm để thanh toán</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                                <motion.button
                                    onClick={() => navigate('/products')}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Tiếp tục mua sắm
                                </motion.button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Form Thông tin giao hàng */}
                                <div className="lg:col-span-2">
                                    <motion.div
                                        className="space-y-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {/* Thông tin giao hàng */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <FiUser className="w-5 h-5 mr-2" />
                                                Thông tin giao hàng
                                            </h2>
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Họ và tên <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="Nhập họ và tên"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Địa chỉ <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="Nhập địa chỉ giao hàng"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Số điện thoại <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                            placeholder="Nhập số điện thoại"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Email <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                            placeholder="Nhập email"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Ghi chú đơn hàng
                                                    </label>
                                                    <textarea
                                                        name="note"
                                                        value={formData.note}
                                                        onChange={handleInputChange}
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="Ghi chú (nếu có)"
                                                        rows={3}
                                                    />
                                                </div>
                                            </form>
                                        </div>

                                        {/* Phương thức vận chuyển */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <FiTruck className="w-5 h-5 mr-2" />
                                                Phương thức vận chuyển
                                            </h2>
                                            <div className="space-y-3">
                                                {shippingOptions.map(option => (
                                                    <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="shippingMethod"
                                                            value={option.value}
                                                            checked={shippingMethod === option.value}
                                                            onChange={() => setShippingMethod(option.value)}
                                                            className="text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.fee)}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Phương thức thanh toán */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <FiCreditCard className="w-5 h-5 mr-2" />
                                                Phương thức thanh toán
                                            </h2>
                                            <div className="space-y-3">
                                                {paymentOptions.map(option => (
                                                    <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={option.value}
                                                            checked={paymentMethod === option.value}
                                                            onChange={() => setPaymentMethod(option.value)}
                                                            className="text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mã giảm giá */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <FiTag className="w-5 h-5 mr-2" />
                                                Mã giảm giá
                                            </h2>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    name="discountCode"
                                                    value={formData.discountCode}
                                                    onChange={handleInputChange}
                                                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Nhập mã giảm giá"
                                                />
                                                <motion.button
                                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
                                                    onClick={() => toast.success('Mã giảm giá đã được áp dụng!')}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Áp dụng
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Nút xác nhận */}
                                        <div className="flex justify-end">
                                            <motion.button
                                                onClick={handleSubmit}
                                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition duration-300 shadow-md flex items-center space-x-2"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span>Xác nhận thanh toán</span>
                                                <FiCreditCard className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Tóm tắt đơn hàng */}
                                <div className="lg:col-span-1">
                                    <motion.div
                                        className="sticky top-6"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <OrderSummary items={cartItems} shippingFee={shippingFee} />
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CheckoutPage;