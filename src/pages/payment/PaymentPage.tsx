import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import usePaymentMethod from '../../hooks/usePaymentMethod';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiCreditCard, FiInfo, FiAlertCircle, FiTruck, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const PaymentPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { createPayment, loading: paymentLoading } = usePayment();
    const { paymentMethods, getActivePaymentMethods, loading: paymentMethodLoading } = usePaymentMethod();

    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCodInfo, setShowCodInfo] = useState(false);

    const selectedPaymentMethod = paymentMethods.find(method => method.methodId === selectedPaymentMethodId);
    const isCodMethod = selectedPaymentMethod?.code === 'COD';
    const isVnpayMethod = selectedPaymentMethod?.code === 'VNPAY';
    const isBankTransferMethod = selectedPaymentMethod?.code === 'BANK_TRANSFER';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!state || !state.orderId || !state.totalAmount || !state.paymentMethodId) {
            toast.error('Thông tin đơn hàng không hợp lệ');
            navigate('/cart');
            return;
        }

        setSelectedPaymentMethodId(state.paymentMethodId);
        setTotalAmount(state.totalAmount);
    }, [isAuthenticated, state, navigate]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                await getActivePaymentMethods();
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                toast.error('Không thể tải danh sách phương thức thanh toán');
            }
        };
        if (!paymentMethods.length && !paymentMethodLoading) {
            fetchPaymentMethods();
        }
    }, [getActivePaymentMethods, paymentMethods, paymentMethodLoading]);

    const getPaymentMethodIcon = (code: string) => {
        switch (code) {
            case 'VNPAY':
                return <FiDollarSign className="w-6 h-6 text-primary" />;
            case 'COD':
                return <FiTruck className="w-6 h-6 text-primary" />;
            case 'BANK_TRANSFER':
                return <FiCreditCard className="w-6 h-6 text-primary" />;
            default:
                return <FiCreditCard className="w-6 h-6 text-primary" />;
        }
    };

    const handlePayment = async () => {
        if (!orderId || !selectedPaymentMethodId) {
            toast.error('Thông tin thanh toán không đầy đủ');
            return;
        }

        setIsProcessing(true);
        try {
            const paymentData = {
                userId: user?.userId || 1,
                orderId: parseInt(orderId),
                methodId: selectedPaymentMethodId,
                amount: totalAmount,
                returnUrl: `${window.location.origin}/payment/result`
            };

            const paymentResponse = await createPayment(paymentData);

            if (paymentResponse.paymentUrl) {
                // Chuyển hướng đến URL thanh toán (VNPay)
                window.location.href = paymentResponse.paymentUrl;
            } else if (isCodMethod) {
                // Store the COD order ID in localStorage to clear cart later
                const recentCODOrders = JSON.parse(localStorage.getItem('recentCODOrders') || '[]');
                if (!recentCODOrders.includes(parseInt(orderId))) {
                    recentCODOrders.push(parseInt(orderId));
                    localStorage.setItem('recentCODOrders', JSON.stringify(recentCODOrders));
                }

                // Xử lý riêng cho COD
                toast.success('Đã xác nhận đơn hàng với phương thức COD!');
                navigate('/payment/result', {
                    state: {
                        orderId: parseInt(orderId),
                        paymentId: paymentResponse.paymentId,
                        paymentMethod: 'COD',
                        paymentStatus: 'PENDING',
                        message: 'Đơn hàng của bạn đang được xử lý. Vui lòng thanh toán khi nhận hàng.',
                        transactionCode: paymentResponse.transactionCode
                    }
                });
            } else if (isBankTransferMethod) {
                // Xử lý riêng cho chuyển khoản ngân hàng
                navigate('/payment/bank-transfer-info', {
                    state: {
                        orderId: parseInt(orderId),
                        paymentId: paymentResponse.paymentId,
                        transactionCode: paymentResponse.transactionCode,
                        amount: totalAmount
                    }
                });
            } else {
                // Xử lý các phương thức thanh toán khác
                toast.success('Thanh toán thành công!');
                navigate('/order-success', {
                    state: {
                        orderId: parseInt(orderId),
                        paymentId: paymentResponse.paymentId
                    }
                });
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Thanh toán thất bại. Vui lòng thử lại sau.');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPaymentMethodInfo = () => {
        if (!selectedPaymentMethod) return null;

        switch (selectedPaymentMethod.code) {
            case 'COD':
                return (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                            <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-300">Thanh toán khi nhận hàng (COD)</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Bạn sẽ thanh toán khi nhận được hàng. Nhân viên giao hàng sẽ liên hệ trước khi giao.
                                </p>
                                <div className="mt-2">
                                    <button
                                        onClick={() => setShowCodInfo(!showCodInfo)}
                                        className="text-sm text-primary font-medium hover:underline inline-flex items-center"
                                    >
                                        <span>{showCodInfo ? "Ẩn thông tin chi tiết" : "Xem thêm thông tin"}</span>
                                        {showCodInfo ?
                                            <FiChevronUp className="ml-1" /> :
                                            <FiChevronDown className="ml-1" />
                                        }
                                    </button>

                                    {showCodInfo && (
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
                                        <FiChevronLeft className="transform rotate-180 ml-1" />
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
                                <h4 className="font-medium text-green-800 dark:text-green-300">Thanh toán trực tuyến qua VNPAY</h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất thanh toán. Sau khi thanh toán thành công,
                                    bạn sẽ được chuyển về trang xác nhận.
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
                                    Sau khi đặt hàng, bạn sẽ nhận được thông tin tài khoản để chuyển khoản. Đơn hàng sẽ được xử lý
                                    sau khi xác nhận thanh toán thành công.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (paymentLoading || paymentMethodLoading || !state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lightBackground dark:bg-darkBackground">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LoadingSpinner size="large" />
                </motion.div>
            </div>
        );
    }

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
                            <FiCreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Thanh Toán Đơn Hàng</h1>
                    </div>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-full shadow-sm text-primary border border-primary/20 transition-colors duration-200"
                    >
                        <FiChevronLeft className="mr-1" /> Quay lại giỏ hàng
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4">Thông tin thanh toán</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary/70 dark:text-textLight/70">Mã đơn hàng:</span>
                            <span className="text-textDark dark:text-textLight">{orderId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary/70 dark:text-textLight/70">Tổng tiền:</span>
                            <span className="text-textDark dark:text-textLight">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-textDark dark:text-textLight mb-2">Phương thức thanh toán</h3>
                            {selectedPaymentMethod ? (
                                <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getPaymentMethodIcon(selectedPaymentMethod.code)}
                                            <div>
                                                <p className="font-medium text-textDark dark:text-textLight">{selectedPaymentMethod.name}</p>
                                                <p className="text-sm text-secondary/70 dark:text-textLight/70">{selectedPaymentMethod.code}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/order`, { state: { redirectBack: true } })}
                                            className="text-primary hover:underline"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300">Chưa chọn phương thức thanh toán</p>
                            )}

                            {renderPaymentMethodInfo()}
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || !selectedPaymentMethodId}
                        className="w-full mt-6 bg-primary text-white py-3 rounded-full hover:bg-primary/90 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <LoadingSpinner size="small" color="white" />
                        ) : (
                            <>
                                <span className="mr-2">
                                    {isCodMethod ? 'Xác nhận đặt hàng' : 'Thanh toán ngay'}
                                </span>
                                {isCodMethod ? <FiTruck className="w-5 h-5" /> : <FiCreditCard className="w-5 h-5" />}
                            </>
                        )}
                    </button>

                    {isVnpayMethod && (
                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                            <FiAlertCircle className="w-4 h-4 mr-1" />
                            <span>Bạn sẽ được chuyển đến trang thanh toán của VNPAY</span>
                        </div>
                    )}

                    {isCodMethod && (
                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                            <FiAlertCircle className="w-4 h-4 mr-1" />
                            <span>Đơn hàng sẽ được gửi đi khi bạn nhấn xác nhận đặt hàng</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;