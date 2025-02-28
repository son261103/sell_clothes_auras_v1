import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import usePaymentMethod from '../../hooks/usePaymentMethod';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiCreditCard } from 'react-icons/fi';

const PaymentPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { createPayment, loading: paymentLoading } = usePayment();
    const { paymentMethods, getActivePaymentMethods, loading: paymentMethodLoading } = usePaymentMethod();

    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedPaymentMethod = paymentMethods.find(method => method.methodId === selectedPaymentMethodId);

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

    const handlePayment = async () => {
        if (!orderId || !selectedPaymentMethodId) {
            toast.error('Thông tin thanh toán không đầy đủ');
            return;
        }

        setIsProcessing(true);
        try {
            const paymentData = {
                userId: 1, // Thay bằng userId thực tế từ auth
                orderId: parseInt(orderId),
                methodId: selectedPaymentMethodId,
                amount: totalAmount,
                returnUrl: `${window.location.origin}/payment/success`
            };
            const paymentResponse = await createPayment(paymentData);

            if (paymentResponse.paymentUrl) {
                // Chuyển hướng trực tiếp đến URL thanh toán (VNPay hoặc các phương thức khác)
                window.location.href = paymentResponse.paymentUrl;
            } else {
                toast.success('Thanh toán thành công!');
                navigate('/order-success', { state: { orderId: parseInt(orderId) } });
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Thanh toán thất bại. Vui lòng thử lại sau.');
        } finally {
            setIsProcessing(false);
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
                                            <FiCreditCard className="w-6 h-6 text-primary" />
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
                                <span className="mr-2">Thanh toán ngay</span>
                                <FiCreditCard className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;