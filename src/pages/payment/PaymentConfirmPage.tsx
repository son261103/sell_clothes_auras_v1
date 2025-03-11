import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiHome, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { OrderStatus } from '../../types/order.types';
import useAuth from '../../hooks/useAuth';
import useOrder from '../../hooks/useOrder';
import usePayment from '../../hooks/usePayment';

const PaymentConfirmPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { currentOrder, loading: orderLoading, resetOrderState } = useOrder();
    const { confirmPayment, loading: paymentLoading } = usePayment();

    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [processingAttempted, setProcessingAttempted] = useState(false);
    const [responseCode, setResponseCode] = useState<string | null>(null);

    // Function to extract parameters from URL
    const getURLParams = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const paramsObject: Record<string, string> = {};

        // Convert URLSearchParams to a plain object
        searchParams.forEach((value, key) => {
            paramsObject[key] = value;
        });

        return {
            searchParams,
            paramsObject,
            responseCode: searchParams.get('vnp_ResponseCode')
        };
    }, [location.search]);

    // Function to extract order ID from VNPay response
    const extractOrderId = useCallback((orderInfo: string | null): number | null => {
        if (!orderInfo) return null;

        const orderIdMatch = orderInfo.match(/ORDER_(\d+)/);
        return orderIdMatch ? parseInt(orderIdMatch[1]) : null;
    }, []);

    // Process payment confirmation with retry mechanism
    const processPaymentConfirmation = useCallback(async (retryCount = 0) => {
        if (!isProcessing || processingAttempted) return;

        try {
            setProcessingAttempted(true);

            // Get URL parameters
            const { searchParams, paramsObject, responseCode: code } = getURLParams();
            setResponseCode(code);

            // Check if we have necessary parameters
            if (!code || !searchParams.get('vnp_TxnRef')) {
                setError('Thiếu thông tin xác nhận thanh toán');
                setIsProcessing(false);
                return;
            }

            // Extract order ID from vnp_OrderInfo
            const orderInfo = searchParams.get('vnp_OrderInfo') || '';
            const extractedOrderId = extractOrderId(orderInfo);

            if (extractedOrderId) {
                setOrderId(extractedOrderId);
            }

            // Get response code to determine if we need to process
            // If responseCode is not '00', we don't need to confirm payment with API
            if (code !== '00') {
                console.log('Payment unsuccessful, response code:', code);
                setIsProcessing(false);
                return;
            }

            try {
                // Confirm the payment
                const response = await confirmPayment(paramsObject);
                console.log('Payment confirmation successful:', response);

                // Success - wait briefly for backend to update order status
                setTimeout(() => {
                    setIsProcessing(false);
                }, 1000);
            } catch (error) {
                // Check if this is the debounce error
                const errorMessage = error instanceof Error ? error.message : 'Lỗi xác nhận thanh toán';

                if (errorMessage.includes('Yêu cầu đang được xử lý') && retryCount < 3) {
                    console.log(`Retrying payment confirmation (${retryCount + 1}/3) after delay...`);
                    // Wait and retry after 2.5 seconds
                    setTimeout(() => {
                        setProcessingAttempted(false);
                        processPaymentConfirmation(retryCount + 1);
                    }, 2500);
                    return;
                }

                // For other errors or if we've exhausted retries, just proceed
                // We can show the order details even if confirmation fails
                console.warn('Payment confirmation error or too many retries:', errorMessage);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error in payment confirmation flow:', error);
            setError(error instanceof Error ? error.message : 'Lỗi xác nhận thanh toán');
            setIsProcessing(false);
        }
    }, [isProcessing, processingAttempted, getURLParams, extractOrderId, confirmPayment]);

    // Initialization effect
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        processPaymentConfirmation();

        // Cleanup function to reset state when component unmounts
        return () => {
            resetOrderState();
        };
    }, [isAuthenticated, navigate, processPaymentConfirmation, resetOrderState]);

    // Determine payment status from response code
    const getPaymentStatusFromResponseCode = (responseCode: string | null): string => {
        if (!responseCode) return 'Không xác định';
        return responseCode === '00' ? 'Thành công' : 'Thất bại';
    };

    const paymentStatus = getPaymentStatusFromResponseCode(responseCode);
    const isPaymentSuccessful = responseCode === '00';

    // Handle navigation back to order details
    const handleViewOrderDetails = () => {
        if (orderId) {
            navigate(`/account/orders/${orderId}`);
        } else {
            navigate('/account/orders');
        }
    };

    // Handle navigation back to homepage
    const handleBackToHome = () => {
        navigate('/');
    };

    // Combined loading state
    const isLoading = isProcessing || orderLoading || paymentLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-lightBackground dark:bg-darkBackground p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center"
                >
                    <LoadingSpinner size="large" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-primary/10 dark:border-primary/20"
            >
                <div className="text-center mb-6">
                    {isPaymentSuccessful ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <FiCheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <FiXCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                        </motion.div>
                    )}
                    <h2 className="text-2xl font-bold text-textDark dark:text-textLight">
                        {isPaymentSuccessful ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Trạng thái thanh toán:</p>
                        <p className={`font-medium ${isPaymentSuccessful ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {paymentStatus}
                        </p>
                    </div>

                    {currentOrder && (
                        <>
                            <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Mã đơn hàng:</p>
                                <p className="font-medium text-textDark dark:text-textLight">#{currentOrder.orderId}</p>
                            </div>

                            <div className="border-b border-gray-200 dark:border-gray-700 py-4">
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Tổng thanh toán:</p>
                                <p className="font-medium text-textDark dark:text-textLight">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(currentOrder.totalAmount)}
                                </p>
                            </div>

                            <div className="py-4">
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Trạng thái đơn hàng:</p>
                                <p className="font-medium text-textDark dark:text-textLight">
                                    {currentOrder.status === OrderStatus.CONFIRMED ? 'Đã xác nhận' :
                                        currentOrder.status === OrderStatus.PENDING ? 'Chờ xác nhận' :
                                            currentOrder.status === OrderStatus.CANCELLED ? 'Đã hủy' :
                                                currentOrder.status === OrderStatus.PROCESSING ? 'Đang xử lý' :
                                                    currentOrder.status === OrderStatus.SHIPPING ? 'Đang giao hàng' :
                                                        currentOrder.status === OrderStatus.COMPLETED ? 'Hoàn thành' :
                                                            currentOrder.status}
                                </p>
                            </div>

                            {currentOrder.payment && (
                                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Phương thức thanh toán:</p>
                                    <p className="font-medium text-textDark dark:text-textLight">
                                        {currentOrder.payment.paymentMethodName || 'Không xác định'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleViewOrderDetails}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition duration-200 flex items-center justify-center"
                    >
                        <FiFileText className="mr-2" />
                        Xem chi tiết đơn hàng
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackToHome}
                        className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-full transition duration-200 flex items-center justify-center"
                    >
                        <FiHome className="mr-2" />
                        Quay lại trang chủ
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentConfirmPage;