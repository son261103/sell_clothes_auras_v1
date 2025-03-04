// src/pages/payment/PaymentResultPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import {
    FiCheckCircle, FiXCircle, FiTruck, FiPackage,
    FiClock, FiChevronRight, FiArrowLeft, FiShoppingBag,
    FiChevronDown, FiChevronUp, FiInfo, FiCreditCard, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
                    ? <FiTruck className="h-20 w-20 text-primary mx-auto" />
                    : <FiCheckCircle className="h-20 w-20 text-green-500 mx-auto" />;
            case 'processing':
                return <FiClock className="h-20 w-20 text-yellow-500 mx-auto" />;
            case 'failure':
                return <FiXCircle className="h-20 w-20 text-red-500 mx-auto" />;
            default:
                return <FiPackage className="h-20 w-20 text-gray-500 mx-auto" />;
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
        if (!paymentMethod) return <FiCreditCard className="w-6 h-6 text-primary" />;

        switch (paymentMethod) {
            case 'VNPAY':
                return <FiCreditCard className="w-6 h-6 text-green-500" />;
            case 'COD':
                return <FiTruck className="w-6 h-6 text-primary" />;
            case 'BANK_TRANSFER':
                return <FiCreditCard className="w-6 h-6 text-yellow-500" />;
            default:
                return <FiCreditCard className="w-6 h-6 text-primary" />;
        }
    };

    const getPaymentMethodInfo = () => {
        if (!paymentMethod) return null;

        switch (paymentMethod) {
            case 'COD':
                return (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
                                        className="text-sm text-primary font-medium hover:underline inline-flex items-center"
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
                                        className="text-sm text-primary font-medium hover:underline mt-2 inline-flex items-center ml-4"
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
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
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
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
            toast.error('Không tìm thấy thông tin đơn hàng');
        }
    };

    const handleRetryPayment = () => {
        if (orderId) {
            navigate(`/payment/${orderId}`);
        } else {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/order');
        }
    };

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            {paymentMethod === 'COD'
                                ? <FiTruck className="w-8 h-8 text-primary" />
                                : <FiCreditCard className="w-8 h-8 text-primary" />
                            }
                        </div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">
                            {paymentMethod === 'COD' ? 'Xác Nhận Đơn Hàng' : 'Kết Quả Thanh Toán'}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-full shadow-sm text-primary border border-primary/20 transition-colors duration-200"
                    >
                        <FiArrowLeft className="mr-1" /> Về trang chủ
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm"
                >
                    <div className="text-center mb-6 pt-4">
                        {getStatusIcon()}
                    </div>

                    <h2 className="text-2xl font-bold text-textDark dark:text-textLight text-center mb-4">
                        {getStatusTitle()}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary/70 dark:text-textLight/70">Mã đơn hàng:</span>
                            <span className="text-textDark dark:text-textLight">{orderId || '---'}</span>
                        </div>
                        {transactionCode && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary/70 dark:text-textLight/70">Mã giao dịch:</span>
                                <span className="text-textDark dark:text-textLight">{transactionCode}</span>
                            </div>
                        )}
                        {totalAmount && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary/70 dark:text-textLight/70">Tổng tiền:</span>
                                <span className="text-textDark dark:text-textLight">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                                </span>
                            </div>
                        )}
                        {paymentMethod && (
                            <div className="pt-2">
                                <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Phương thức thanh toán</h3>
                                <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getPaymentMethodIcon()}
                                        <div>
                                            <p className="font-medium text-textDark dark:text-textLight">
                                                {paymentMethod === 'VNPAY' ? 'VNPAY' :
                                                    paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' :
                                                        paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                                                            'Thanh toán'}
                                            </p>
                                            <p className="text-sm text-secondary/70 dark:text-textLight/70">{paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {getPaymentMethodInfo()}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                        {status === 'success' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleViewOrderDetails}
                                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center"
                            >
                                Xem chi tiết đơn hàng
                                <FiChevronRight className="ml-1" />
                            </motion.button>
                        )}

                        {status === 'failure' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRetryPayment}
                                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center"
                            >
                                Thử lại thanh toán
                                <FiChevronRight className="ml-1" />
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
                        >
                            <FiArrowLeft className="mr-1" />
                            Về trang chủ
                        </motion.button>
                    </div>

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <button
                                onClick={() => navigate('/products')}
                                className="text-primary hover:underline flex items-center justify-center mx-auto"
                            >
                                <FiShoppingBag className="mr-1" />
                                Tiếp tục mua sắm
                            </button>
                        </motion.div>
                    )}

                    {status === 'processing' && (
                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                            <FiAlertCircle className="w-4 h-4 mr-1" />
                            <span>Thanh toán đang được xử lý, vui lòng chờ trong giây lát</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentResultPage;