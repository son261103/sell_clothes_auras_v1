import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCheckCircle, FiChevronLeft, FiCreditCard, FiHome, FiPackage } from 'react-icons/fi';
import 'aos/dist/aos.css';
import AOS from 'aos';

const OrderSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center"
                    data-aos="fade-up"
                >
                    <div className="mb-6">
                        <FiCheckCircle className="w-20 h-20 mx-auto text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-textDark dark:text-textLight mb-4">
                        Đặt hàng thành công!
                    </h1>

                    <p className="text-lg text-secondary/80 dark:text-textLight/80 mb-6">
                        Đơn hàng của bạn đã được tạo thành công với mã: <span className="font-medium text-primary">#{orderId}</span>
                    </p>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <p className="text-secondary/70 dark:text-textLight/70 mb-4">
                            Bạn vui lòng chọn hình thức thanh toán để hoàn tất đơn hàng
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 max-w-md mx-auto">
                            <button
                                onClick={() => navigate(`/payment/${orderId}`)}
                                className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-full hover:bg-primary/90 transition-colors"
                            >
                                <FiCreditCard className="w-5 h-5" />
                                <span>Thanh toán ngay</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/products')}
                            className="flex items-center justify-center gap-2 text-primary border border-primary py-2 px-5 rounded-full hover:bg-primary/5 transition-colors"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                            <span>Tiếp tục mua sắm</span>
                        </button>

                        <button
                            onClick={() => navigate('/account/orders')}
                            className="flex items-center justify-center gap-2 text-textDark dark:text-textLight bg-gray-100 dark:bg-gray-700 py-2 px-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FiPackage className="w-5 h-5" />
                            <span>Xem đơn hàng của bạn</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 text-textDark dark:text-textLight bg-gray-100 dark:bg-gray-700 py-2 px-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FiHome className="w-5 h-5" />
                            <span>Trang chủ</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-secondary/70 dark:text-textLight/70" data-aos="fade-up" data-aos-delay="100">
                    <p>Chúng tôi đã gửi email xác nhận đơn hàng tới địa chỉ email của bạn.</p>
                    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.</p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;