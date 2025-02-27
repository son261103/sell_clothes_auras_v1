import React, { useState, useEffect } from 'react';
import OrderSummary from '../../components/checkout/OrderSummary.tsx';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

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

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

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
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                <section data-aos="fade-down">
                    <h1 className="text-3xl font-bold text-primary tracking-tight mb-6">Thanh Toán</h1>
                    {cartItems.length === 0 ? (
                        <p className="text-secondary/70 dark:text-textLight/70 text-center">Không có sản phẩm để thanh toán.</p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Thông tin giao hàng */}
                            <div className="lg:col-span-2" data-aos="fade-up">
                                <div className="bg-white dark:bg-secondary/10 rounded-xl shadow-md border border-highlight/10 dark:border-secondary/30 p-4 sm:p-6 space-y-6">
                                    {/* Thông tin giao hàng */}
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Thông tin giao hàng</h2>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-textDark dark:text-textLight mb-1">
                                                    Họ và tên <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Nhập họ và tên"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-textDark dark:text-textLight mb-1">
                                                    Địa chỉ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Nhập địa chỉ giao hàng"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-textDark dark:text-textLight mb-1">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Nhập số điện thoại"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-textDark dark:text-textLight mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Nhập email"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-textDark dark:text-textLight mb-1">
                                                    Ghi chú đơn hàng
                                                </label>
                                                <textarea
                                                    name="note"
                                                    value={formData.note}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Ghi chú (nếu có)"
                                                    rows={3}
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    {/* Phương thức vận chuyển */}
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Phương thức vận chuyển</h2>
                                        <div className="space-y-2">
                                            {shippingOptions.map(option => (
                                                <label key={option.value} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="shippingMethod"
                                                        value={option.value}
                                                        checked={shippingMethod === option.value}
                                                        onChange={() => setShippingMethod(option.value)}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-textDark dark:text-textLight">{option.label} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.fee)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phương thức thanh toán */}
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Phương thức thanh toán</h2>
                                        <div className="space-y-2">
                                            {paymentOptions.map(option => (
                                                <label key={option.value} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={option.value}
                                                        checked={paymentMethod === option.value}
                                                        onChange={() => setPaymentMethod(option.value)}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-textDark dark:text-textLight">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mã giảm giá */}
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">Mã giảm giá</h2>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="discountCode"
                                                value={formData.discountCode}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-primary/30 dark:border-secondary/30 rounded-md bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Nhập mã giảm giá"
                                            />
                                            <button
                                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
                                                onClick={() => toast.success('Mã giảm giá đã được áp dụng (giả lập)!')}
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nút xác nhận */}
                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition duration-300 shadow-sm"
                                        >
                                            Xác nhận thanh toán
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tóm tắt đơn hàng */}
                            <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="200">
                                <OrderSummary items={cartItems} shippingFee={shippingFee} />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CheckoutPage;