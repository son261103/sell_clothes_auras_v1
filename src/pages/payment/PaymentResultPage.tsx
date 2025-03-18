// src/pages/payment/PaymentResultPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import {
    FiCheckCircle, FiXCircle, FiTruck, FiPackage,
    FiClock, FiChevronRight, FiArrowLeft, FiShoppingBag,
    FiChevronDown, FiChevronUp, FiInfo, FiCreditCard, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AOS from 'aos';
import 'aos/dist/aos.css';

const PaymentResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { confirmPayment } = usePayment();
    const [status, setStatus] = useState<'success' | 'failure' | 'processing'>('processing');
    const [message, setMessage] = useState<string>('Đang xác nhận kết quả thanh toán...');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [transactionCode, setTransactionCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDetailsInfo, setShowDetailsInfo] = useState(false);
    const [totalAmount, setTotalAmount] = useState<number | null>(null);

    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            easing: 'ease-out-cubic',
            delay: 50
        });
        return () => AOS.refresh();
    }, []);

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                setIsLoading(true);

                // Xử lý kết quả VNPay (từ query parameters trong URL)
                const queryParams = Object.fromEntries(new URLSearchParams(location.search));

                // Xử lý dữ liệu từ state (cho COD và các phương thức khác)
                const stateData = location.state;

                if (queryParams.vnp_ResponseCode) {
                    // Đây là phản hồi từ VNPay
                    const responseCode = queryParams.vnp_ResponseCode;
                    const orderIdFromVnp = queryParams.vnp_TxnRef;
                    setOrderId(orderIdFromVnp);
                    setPaymentMethod('VNPAY');
                    setTransactionCode(queryParams.vnp_TransactionNo || null);
                    setTotalAmount(queryParams.vnp_Amount ? parseInt(queryParams.vnp_Amount) / 100 : null);

                    if (responseCode === '00') {
                        // Thanh toán VNPay thành công
                        await confirmPayment(queryParams);
                        setStatus('success');
                        setMessage('Thanh toán thành công! Cảm ơn bạn đã đặt hàng.');
                    } else {
                        // Thanh toán VNPay thất bại
                        setStatus('failure');
                        setMessage(`Thanh toán thất bại. Mã lỗi: ${responseCode}. Vui lòng thử lại hoặc chọn phương thức khác.`);
                    }
                } else if (stateData) {
                    // Xử lý dữ liệu từ state (cho COD và các phương thức khác)
                    setOrderId(stateData.orderId?.toString() || null);
                    setPaymentMethod(stateData.paymentMethod || null);
                    setTransactionCode(stateData.transactionCode || null);
                    setTotalAmount(stateData.amount || null);

                    if (stateData.paymentMethod === 'COD') {
                        // Xử lý kết quả thanh toán COD
                        setStatus('success'); // COD luôn là thành công ban đầu, vì thanh toán xảy ra khi giao hàng
                        setMessage(stateData.message || 'Đơn hàng đã được xác nhận. Bạn sẽ thanh toán khi nhận hàng.');
                    } else if (stateData.paymentStatus) {
                        // Xử lý các phương thức thanh toán khác
                        if (stateData.paymentStatus === 'PENDING') {
                            setStatus('processing');
                            setMessage(stateData.message || 'Đơn hàng của bạn đang được xử lý.');
                        } else if (stateData.paymentStatus === 'COMPLETED') {
                            setStatus('success');
                            setMessage(stateData.message || 'Thanh toán thành công! Cảm ơn bạn đã đặt hàng.');
                        } else {
                            setStatus('failure');
                            setMessage(stateData.message || 'Thanh toán không thành công. Vui lòng thử lại sau.');
                        }
                    } else {
                        // Trường hợp không xác định
                        setStatus('processing');
                        setMessage('Đang xử lý đơn hàng của bạn.');
                    }
                } else {
                    // Không có thông tin thanh toán hợp lệ
                    setStatus('failure');
                    setMessage('Không nhận được thông tin thanh toán hợp lệ.');
                }
            } catch (error) {
                console.error('Error processing payment result:', error);
                setStatus('failure');
                setMessage(error instanceof Error ? error.message : 'Xảy ra lỗi khi xác nhận thanh toán');
            } finally {
                setIsLoading(false);
            }
        };

        processPaymentResult();
    }, [location.search, location.state, confirmPayment]);

    const getStatusIcon = () => {
        if (isLoading) {
            return <LoadingSpinner size="large" />;
        }

        switch (status) {
            case 'success':
                return paymentMethod === 'COD'
                    ? <div className="w-24 h-24 bg-primary/10 dark:bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                        <FiTruck className="h-12 w-12 text-primary dark:text-accent" />
                    </div>
                    : <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <FiCheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
                    </div>;
            case 'processing':
                return <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                    <FiClock className="h-12 w-12 text-yellow-500 dark:text-yellow-400" />
                </div>;
            case 'failure':
                return <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <FiXCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                </div>;
            default:
                return <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <FiPackage className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </div>;
        }
    };

    const getStatusTitle = () => {
        if (isLoading) return 'Đang xử lý';

        if (paymentMethod === 'COD') {
            switch (status) {
                case 'success': return 'Đặt hàng thành công';
                case 'processing': return 'Đơn hàng đang xử lý';
                case 'failure': return 'Đặt hàng thất bại';
                default: return 'Trạng thái đơn hàng';
            }
        } else {
            switch (status) {
                case 'success': return 'Thanh toán thành công';
                case 'processing': return 'Đang xử lý thanh toán';
                case 'failure': return 'Thanh toán thất bại';
                default: return 'Trạng thái thanh toán';
            }
        }
    };

    const getPaymentMethodIcon = () => {
        if (!paymentMethod) return <FiCreditCard className="w-6 h-6 text-primary dark:text-accent" />;

        switch (paymentMethod) {
            case 'VNPAY':
                return <FiCreditCard className="w-6 h-6 text-green-500 dark:text-green-400" />;
            case 'COD':
                return <FiTruck className="w-6 h-6 text-primary dark:text-accent" />;
            case 'BANK_TRANSFER':
                return <FiCreditCard className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />;
            default:
                return <FiCreditCard className="w-6 h-6 text-primary dark:text-accent" />;
        }
    };

    const getPaymentMethodInfo = () => {
        if (!paymentMethod) return null;

        switch (paymentMethod) {
            case 'COD':
                return (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-start">
                            <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-300">Thanh toán khi nhận hàng (COD)</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Đơn hàng sẽ được vận chuyển đến địa chỉ của bạn. Vui lòng thanh toán khi nhận được hàng.
                                </p>
                                <div className="mt-2">
                                    <button
                                        onClick={() => setShowDetailsInfo(!showDetailsInfo)}
                                        className="text-sm text-primary dark:text-accent font-medium hover:underline inline-flex items-center"
                                    >
                                        <span>{showDetailsInfo ? "Ẩn thông tin chi tiết" : "Xem thêm thông tin"}</span>
                                        {showDetailsInfo ?
                                            <FiChevronUp className="ml-1" /> :
                                            <FiChevronDown className="ml-1" />
                                        }
                                    </button>

                                    {showDetailsInfo && (
                                        <div className="mt-3 text-sm text-blue-700 dark:text-blue-400 p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
                                            <p className="mb-2">• Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc.</p>
                                            <p className="mb-2">• Phí COD sẽ được tính vào tổng giá trị đơn hàng.</p>
                                            <p className="mb-2">• Vui lòng kiểm tra hàng trước khi thanh toán.</p>
                                            <p>• Bạn sẽ nhận được mã OTP để xác nhận khi nhận hàng.</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate('/payment/cod-info')}
                                        className="text-sm text-primary dark:text-accent font-medium hover:underline mt-2 inline-flex items-center ml-4"
                                    >
                                        <span>Xem chi tiết quy trình COD</span>
                                        <FiChevronRight className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'VNPAY':
                return (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-start">
                            <FiInfo className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-green-800 dark:text-green-300">Thanh toán qua VNPAY</h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    {status === 'success'
                                        ? 'Thanh toán của bạn đã được xác nhận thành công qua cổng thanh toán VNPAY.'
                                        : status === 'failure'
                                            ? 'Thanh toán qua VNPAY không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'
                                            : 'Thanh toán của bạn đang được xử lý qua cổng thanh toán VNPAY.'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'BANK_TRANSFER':
                return (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-start">
                            <FiInfo className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Thanh toán chuyển khoản ngân hàng</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                    {status === 'success'
                                        ? 'Chúng tôi đã nhận được khoản thanh toán của bạn. Đơn hàng sẽ được xử lý trong thời gian sớm nhất.'
                                        : status === 'processing'
                                            ? 'Vui lòng hoàn tất thanh toán chuyển khoản và đợi hệ thống xác nhận. Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán thành công.'
                                            : 'Thanh toán của bạn chưa thể xác nhận. Vui lòng liên hệ với chúng tôi để được hỗ trợ.'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleViewOrderDetails = () => {
        if (orderId) {
            navigate(`/order/order-detail/${orderId}`);
        } else {
            toast.error('Không tìm thấy thông tin đơn hàng', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
        }
    };

    const handleRetryPayment = () => {
        if (orderId) {
            navigate(`/payment/${orderId}`);
        } else {
            toast.error('Không tìm thấy thông tin đơn hàng', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
            navigate('/order');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center text-sm mb-8 text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm"
                    data-aos="fade-down"
                >
                    <Link to="/" className="hover:text-primary dark:hover:text-accent transition-colors">
                        Trang chủ
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />

                    <Link to="/cart" className="hover:text-primary dark:hover:text-accent transition-colors">
                        Giỏ hàng
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />

                    <Link to={orderId ? `/payment/${orderId}` : "/payment"} className="hover:text-primary dark:hover:text-accent transition-colors">
                        Thanh toán
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />

                    <span className="text-gray-900 dark:text-white font-medium">
                        Kết quả thanh toán
                    </span>
                </motion.nav>

                {/* Back Button for Mobile */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => navigate(-1)}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    data-aos="fade-up"
                >
                    <div className="p-6 md:p-8">
                        <div className="mb-8" data-aos="zoom-in" data-aos-delay="100">
                            {getStatusIcon()}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4" data-aos="fade-up" data-aos-delay="200">
                            {getStatusTitle()}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 text-center mb-8" data-aos="fade-up" data-aos-delay="250">
                            {message}
                        </p>

                        <div className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg" data-aos="fade-up" data-aos-delay="300">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
                                <span className="text-gray-900 dark:text-white font-medium">{orderId || '---'}</span>
                            </div>
                            {transactionCode && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{transactionCode}</span>
                                </div>
                            )}
                            {totalAmount && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tổng tiền:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            maximumFractionDigits: 0
                                        }).format(totalAmount)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {paymentMethod && (
                            <div className="mb-6" data-aos="fade-up" data-aos-delay="350">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Phương thức thanh toán</h3>
                                <div className="p-4 bg-primary/5 dark:bg-accent/10 border border-primary/20 dark:border-accent/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getPaymentMethodIcon()}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {paymentMethod === 'VNPAY' ? 'VNPAY' :
                                                    paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' :
                                                        paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                                                            'Thanh toán'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {getPaymentMethodInfo()}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8" data-aos="fade-up" data-aos-delay="400">
                            {status === 'success' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleViewOrderDetails}
                                    className="py-3 px-6 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center shadow-sm"
                                >
                                    <span className="mr-2">Xem chi tiết đơn hàng</span>
                                    <FiChevronRight className="w-5 h-5" />
                                </motion.button>
                            )}

                            {status === 'failure' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRetryPayment}
                                    className="py-3 px-6 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center shadow-sm"
                                >
                                    <span className="mr-2">Thử lại thanh toán</span>
                                    <FiChevronRight className="w-5 h-5" />
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/')}
                                className="py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition duration-200 flex items-center justify-center shadow-sm"
                            >
                                <FiArrowLeft className="mr-2 w-5 h-5" />
                                <span>Về trang chủ</span>
                            </motion.button>
                        </div>

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-6 text-center"
                                data-aos="fade-up"
                                data-aos-delay="450"
                            >
                                <button
                                    onClick={() => navigate('/products')}
                                    className="text-primary dark:text-accent hover:underline flex items-center justify-center mx-auto"
                                >
                                    <FiShoppingBag className="mr-2 w-5 h-5" />
                                    Tiếp tục mua sắm
                                </button>
                            </motion.div>
                        )}

                        {status === 'processing' && (
                            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center" data-aos="fade-up" data-aos-delay="450">
                                <FiAlertCircle className="w-4 h-4 mr-2" />
                                <span>Thanh toán đang được xử lý, vui lòng chờ trong giây lát</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentResultPage;