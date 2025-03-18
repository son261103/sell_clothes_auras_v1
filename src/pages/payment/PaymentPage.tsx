import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import usePaymentMethod from '../../hooks/usePaymentMethod';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCreditCard, FiInfo, FiAlertCircle, FiTruck, FiDollarSign, FiChevronDown, FiChevronUp, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!state || !state.orderId || !state.totalAmount || !state.paymentMethodId) {
            toast.error('Thông tin đơn hàng không hợp lệ', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
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
                toast.error('Không thể tải danh sách phương thức thanh toán', {
                    icon: <FiAlertCircle className="text-red-500" />,
                });
            }
        };
        if (!paymentMethods.length && !paymentMethodLoading) {
            fetchPaymentMethods();
        }
    }, [getActivePaymentMethods, paymentMethods, paymentMethodLoading]);

    const getPaymentMethodIcon = (code: string) => {
        switch (code) {
            case 'VNPAY':
                return <FiDollarSign className="w-6 h-6 text-primary dark:text-accent" />;
            case 'COD':
                return <FiTruck className="w-6 h-6 text-primary dark:text-accent" />;
            case 'BANK_TRANSFER':
                return <FiCreditCard className="w-6 h-6 text-primary dark:text-accent" />;
            default:
                return <FiCreditCard className="w-6 h-6 text-primary dark:text-accent" />;
        }
    };

    const handlePayment = async () => {
        if (!orderId || !selectedPaymentMethodId) {
            toast.error('Thông tin thanh toán không đầy đủ', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
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
                toast.success('Đã xác nhận đơn hàng với phương thức COD!', {
                    icon: <FiTruck className="text-green-500" />,
                });
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
                toast.success('Thanh toán thành công!', {
                    icon: <FiCreditCard className="text-green-500" />,
                });
                navigate('/order-success', {
                    state: {
                        orderId: parseInt(orderId),
                        paymentId: paymentResponse.paymentId
                    }
                });
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Thanh toán thất bại. Vui lòng thử lại sau.', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPaymentMethodInfo = () => {
        if (!selectedPaymentMethod) return null;

        switch (selectedPaymentMethod.code) {
            case 'COD':
                return (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" data-aos="fade-up" data-aos-delay="300">
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
                                        className="text-sm text-primary dark:text-accent font-medium hover:underline inline-flex items-center"
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
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800" data-aos="fade-up" data-aos-delay="300">
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

                    <span className="text-gray-900 dark:text-white font-medium">
                        Thanh toán
                    </span>
                </motion.nav>

                {/* Back Button for Mobile */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => navigate('/cart')}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại giỏ hàng
                </motion.button>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main payment info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        data-aos="fade-up"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/10 dark:bg-accent/20 p-2 rounded-full">
                                    <FiCreditCard className="w-7 h-7 text-primary dark:text-accent" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thanh Toán Đơn Hàng</h1>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">#{orderId}</span>
                                    </div>
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
                                </div>

                                <div data-aos="fade-up" data-aos-delay="200">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Phương thức thanh toán</h3>
                                    {selectedPaymentMethod ? (
                                        <div className="p-4 bg-primary/5 dark:bg-accent/10 border border-primary/20 dark:border-accent/20 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getPaymentMethodIcon(selectedPaymentMethod.code)}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedPaymentMethod.name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPaymentMethod.code}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/order`, { state: { redirectBack: true } })}
                                                    className="text-primary dark:text-accent hover:underline"
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

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePayment}
                                    disabled={isProcessing || !selectedPaymentMethodId}
                                    className="w-full mt-6 bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white py-3 rounded-lg shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition duration-200"
                                    data-aos="fade-up"
                                    data-aos-delay="400"
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
                                </motion.button>

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
                            </div>
                        </div>
                    </motion.div>

                    {/* Summary - Optional for larger screens */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden md:block w-80 h-fit bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        data-aos="fade-left"
                        data-aos-delay="200"
                    >
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tóm tắt đơn hàng</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tổng tiền hàng</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            maximumFractionDigits: 0
                                        }).format(totalAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển</span>
                                    <span className="text-gray-900 dark:text-white">Miễn phí</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-gray-900 dark:text-white">Tổng thanh toán</span>
                                        <span className="text-primary dark:text-accent">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                                maximumFractionDigits: 0
                                            }).format(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;