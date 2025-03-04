import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useOrder from '../../hooks/useOrder';
import usePayment from '../../hooks/usePayment';
import useAuth from '../../hooks/useAuth';
import { OrderResponseDTO, OrderStatus, OrderItemDTO } from '../../types/order.types';
import { PaymentResponseDTO } from '../../types/payment.types';

import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPackage, FiTruck, FiCreditCard, FiMapPin, FiCalendar,
    FiDollarSign, FiCheckCircle, FiXCircle, FiAlertCircle,
    FiClock, FiChevronLeft, FiFileText, FiSend, FiPhone,
    FiInfo
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import OrderItemCard from '../../components/order/OrderItemCard';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { PaymentStatus } from "../../enum/PaymentStatus.tsx";

// Define interface for OtpConfirmationForm props
interface OtpConfirmationFormProps {
    orderId: number;
    onSubmit: (otp: string) => void;
    onCancel: () => void;
}

// Define structure for Redux store order items
interface ReduxOrderItem {
    color?: string;
    orderId: number;
    productId: number;
    productImage?: string;
    productName: string;
    quantity: number;
    size?: string;
    sku?: string;
    totalPrice: number;
    unitPrice: number;
    variantId: number;
}

// Create a combined PaymentResponseDTO that includes all necessary fields
interface ExtendedPaymentResponseDTO extends PaymentResponseDTO {
    paymentMethodName?: string;
    paymentMethodCode?: string;
}

// Extended OrderResponseDTO to handle Redux store format
interface ExtendedOrderResponseDTO extends OrderResponseDTO {
    orderItems?: ReduxOrderItem[];
}

// Định nghĩa giao diện cho CancelOrderDialogProps
interface CancelOrderDialogProps {
    isOpen: boolean;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

// Component cho dialog hủy đơn hàng với input lý do tích hợp
const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn hàng');
            return;
        }
        onConfirm(reason);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Xác nhận hủy đơn hàng
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Lý do hủy đơn hàng <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="cancelReason"
                                rows={3}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Vui lòng cho chúng tôi biết lý do bạn hủy đơn hàng"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Giữ lại đơn hàng
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Hủy đơn hàng
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Optional OTP confirmation component
const OtpConfirmationForm: React.FC<OtpConfirmationFormProps> = ({ onSubmit, onCancel }) => {
    const [otp, setOtp] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Mã OTP phải có 6 chữ số');
            return;
        }
        onSubmit(otp);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Xác nhận giao hàng</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
                Vui lòng nhập mã OTP mà bạn đã nhận qua email để xác nhận đã nhận hàng.
            </p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                    placeholder="Nhập mã OTP 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    required
                />
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        Xác nhận
                    </button>
                </div>
            </form>
        </div>
    );
};

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        getOrderById,
        currentOrder,
        loading: orderLoading,
        error: orderError,
        cancelOrder,
        getOrderStatusText
    } = useOrder();

    const {
        confirmDeliveryWithOtp,
        getPaymentByOrderId
    } = usePayment();

    const [order, setOrder] = useState<OrderResponseDTO | null>(null);
    const [payment, setPayment] = useState<ExtendedPaymentResponseDTO | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [fetchAttempts, setFetchAttempts] = useState(0);
    const [displayItems, setDisplayItems] = useState<OrderItemDTO[]>([]);
    const [orderCancelled, setOrderCancelled] = useState(false);

    // Helper to convert Redux order items to OrderItemDTO
    const mapReduxItemsToOrderItems = (items: ReduxOrderItem[]): OrderItemDTO[] => {
        return items.map(item => ({
            orderItemId: item.variantId || 0, // Fallback to variantId if orderItemId is missing
            variantId: item.variantId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            color: item.color,
            size: item.size,
            sku: item.sku,
            imageUrl: item.productImage // Map productImage to imageUrl
        }));
    };

    // Type guard to check if order has Redux style orderItems
    const hasReduxOrderItems = (order: OrderResponseDTO): order is ExtendedOrderResponseDTO => {
        return 'orderItems' in order && Array.isArray((order as ExtendedOrderResponseDTO).orderItems);
    };

    // Fetch order details
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrderDetails = async () => {
            if (!orderId) return;

            try {
                // Use the current order from Redux store if available
                if (currentOrder && currentOrder.orderId === parseInt(orderId)) {
                    setOrder(currentOrder);

                    // Handle the case where we have orderItems in the Redux store but need to map to items
                    if (hasReduxOrderItems(currentOrder) && currentOrder.orderItems && currentOrder.orderItems.length > 0) {
                        const mappedItems = mapReduxItemsToOrderItems(currentOrder.orderItems);
                        setDisplayItems(mappedItems);
                    } else if (currentOrder.items && currentOrder.items.length > 0) {
                        setDisplayItems(currentOrder.items);
                    }

                    // Set payment info if available
                    if (currentOrder.payment) {
                        setPayment(currentOrder.payment as ExtendedPaymentResponseDTO);
                    }
                    return;
                }

                // Otherwise make an API call
                try {
                    const orderData = await getOrderById(parseInt(orderId));
                    setOrder(orderData);

                    // Check if we have items in the standard format
                    if (orderData.items && orderData.items.length > 0) {
                        setDisplayItems(orderData.items);
                    }
                    // Check if we have orderItems in the Redux format
                    else if (hasReduxOrderItems(orderData) && orderData.orderItems && orderData.orderItems.length > 0) {
                        const mappedItems = mapReduxItemsToOrderItems(orderData.orderItems);
                        setDisplayItems(mappedItems);
                    }

                    // Fetch payment details if not included in the order response
                    if (!orderData.payment) {
                        try {
                            const paymentData = await getPaymentByOrderId(parseInt(orderId));
                            if (paymentData) {
                                setPayment(paymentData as ExtendedPaymentResponseDTO);
                            }
                        } catch (error) {
                            console.error('Error fetching payment:', error);
                            // Payment might not exist yet, which is fine
                        }
                    } else {
                        setPayment(orderData.payment as ExtendedPaymentResponseDTO);
                    }
                } catch (error) {
                    console.error('Error fetching order:', error);
                    // If we get a throttling error, try to use the data from Redux store
                    const errorMessage = error instanceof Error ? error.message : '';
                    if (errorMessage.includes('Yêu cầu đang được xử lý hoặc gửi quá thường xuyên')) {
                        if (currentOrder) {
                            console.log('Using cached order data');
                            setOrder(currentOrder);

                            // Handle the case where we have orderItems in the Redux store but need to map to items
                            if (hasReduxOrderItems(currentOrder) && currentOrder.orderItems && currentOrder.orderItems.length > 0) {
                                const mappedItems = mapReduxItemsToOrderItems(currentOrder.orderItems);
                                setDisplayItems(mappedItems);
                            } else if (currentOrder.items && currentOrder.items.length > 0) {
                                setDisplayItems(currentOrder.items);
                            }

                            if (currentOrder.payment) {
                                setPayment(currentOrder.payment as ExtendedPaymentResponseDTO);
                            }
                        } else if (fetchAttempts < 3) {
                            // Try again after a delay if we don't have cached data
                            setFetchAttempts(prev => prev + 1);
                            setTimeout(() => fetchOrderDetails(), 1000);
                        } else {
                            toast.error('Không thể tải thông tin đơn hàng sau nhiều lần thử');
                        }
                    } else {
                        toast.error('Không thể tải thông tin đơn hàng');
                    }
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                toast.error('Đã xảy ra lỗi không mong muốn');
            }
        };

        fetchOrderDetails();
    }, [orderId, isAuthenticated, navigate, getOrderById, getPaymentByOrderId, currentOrder, fetchAttempts]);

    // Function to handle order cancellation
    const handleCancelOrder = async (reason: string) => {
        if (!order || !reason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn hàng');
            return;
        }

        setIsLoadingAction(true);
        try {
            await cancelOrder(order.orderId, { cancelReason: reason });
            toast.success('Đơn hàng đã được hủy thành công');
            setShowCancelDialog(false);
            setOrderCancelled(true);

            // Add a slight delay before redirecting to show the success message
            setTimeout(() => {
                navigate('/order/list');
            }, 1500);
        } catch (error) {
            console.error('Error canceling order:', error);
            toast.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setIsLoadingAction(false);
        }
    };

    // Function to handle OTP confirmation for COD
    const handleConfirmDelivery = async (otp: string) => {
        if (!order) return;

        setIsLoadingAction(true);
        try {
            const result = await confirmDeliveryWithOtp(order.orderId, otp);
            toast.success('Xác nhận giao hàng thành công');
            setShowOtpForm(false);

            // Refresh order data
            const updatedOrder = await getOrderById(order.orderId);
            setOrder(updatedOrder);

            // Update display items
            if (updatedOrder.items && updatedOrder.items.length > 0) {
                setDisplayItems(updatedOrder.items);
            } else if (hasReduxOrderItems(updatedOrder) && updatedOrder.orderItems && updatedOrder.orderItems.length > 0) {
                const mappedItems = mapReduxItemsToOrderItems(updatedOrder.orderItems);
                setDisplayItems(mappedItems);
            }

            if (result) {
                setPayment(result as ExtendedPaymentResponseDTO);
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
            toast.error('Mã OTP không hợp lệ hoặc đã hết hạn');
        } finally {
            setIsLoadingAction(false);
        }
    };

    // Check if payment method is COD
    const isCodeMethod = payment?.paymentMethodCode === 'COD';

    // Render loading state
    if (orderLoading || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Render error state
    if (orderError) {
        return (
            <EmptyState
                title="Không thể tải thông tin đơn hàng"
                description="Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau."
                action={{ label: 'Quay lại', onClick: () => navigate('/orders') }}
                icon={<FiAlertCircle className="w-16 h-16 text-red-500" />}
            />
        );
    }

    // Format prices and dates
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'HH:mm - dd MMMM yyyy', { locale: vi });
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case OrderStatus.CONFIRMED:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case OrderStatus.PROCESSING:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case OrderStatus.SHIPPING:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case OrderStatus.COMPLETED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case OrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Helper function to get payment status icon and color
    const getPaymentStatusInfo = (status: string) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return {
                    icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
                    text: 'Đã thanh toán',
                    color: 'text-green-600 dark:text-green-400'
                };
            case PaymentStatus.PENDING:
                return {
                    icon: <FiClock className="w-5 h-5 text-yellow-500" />,
                    text: 'Đang chờ thanh toán',
                    color: 'text-yellow-600 dark:text-yellow-400'
                };
            case PaymentStatus.FAILED:
                return {
                    icon: <FiXCircle className="w-5 h-5 text-red-500" />,
                    text: 'Thanh toán thất bại',
                    color: 'text-red-600 dark:text-red-400'
                };
            default:
                return {
                    icon: <FiAlertCircle className="w-5 h-5 text-gray-500" />,
                    text: 'Chưa xác định',
                    color: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    // Get payment status info
    const paymentStatusInfo = payment
        ? getPaymentStatusInfo(payment.paymentStatus)
        : { icon: <FiCreditCard className="w-5 h-5 text-gray-500" />, text: 'Chưa thanh toán', color: 'text-gray-600 dark:text-gray-400' };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <button
                        onClick={() => navigate('/order/list')}
                        className="inline-flex items-center text-primary hover:underline mb-4"
                    >
                        <FiChevronLeft className="mr-1" /> Quay lại danh sách đơn hàng
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <FiPackage className="mr-2" /> Chi tiết đơn hàng #{order.orderId}
                        </h1>
                        <div className="mt-2 sm:mt-0 flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order details and items - Left column (2/3 width on large screens) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                <FiClock className="mr-2 text-primary" /> Trạng thái đơn hàng
                            </h2>
                            <OrderStatusTimeline order={order} />
                        </motion.div>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                <FiPackage className="mr-2 text-primary" /> Sản phẩm đã đặt ({displayItems.length})
                            </h2>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {displayItems.map((item, index) => (
                                        <motion.div
                                            key={`${item.productId}-${item.variantId}-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <OrderItemCard item={item} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Delivery Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                <FiTruck className="mr-2 text-primary" /> Thông tin giao hàng
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FiMapPin className="mt-1 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Địa chỉ giao hàng</h3>
                                        <p className="text-gray-600 dark:text-gray-300">{order.address.addressLine}</p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {order.address.ward && `${order.address.ward}, `}
                                            {order.address.district && `${order.address.district}, `}
                                            {order.address.city && `${order.address.city}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FiPhone className="mt-1 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Số điện thoại</h3>
                                        <p className="text-gray-600 dark:text-gray-300">{order.address.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FiTruck className="mt-1 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Phương thức vận chuyển</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {order.shippingMethod?.name || 'Tiêu chuẩn'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {order.shippingMethod?.estimatedDeliveryTime || 'Giao hàng trong 3-5 ngày làm việc'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* COD OTP Verification - Only show for COD orders that are in SHIPPING status */}
                        {isCodeMethod && order.status === OrderStatus.SHIPPING && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-primary"
                            >
                                <div className="flex items-start">
                                    <FiSend className="mt-1 mr-3 text-primary flex-shrink-0 w-5 h-5" />
                                    <div className="flex-1">
                                        <h3 className="text-md font-medium text-gray-900 dark:text-white">Xác nhận giao hàng thành công</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1 mb-3">
                                            Nếu bạn đã nhận được hàng và thanh toán thành công, hãy xác nhận bằng mã OTP được gửi đến email của bạn.
                                        </p>
                                        <button
                                            onClick={() => setShowOtpForm(true)}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                            disabled={isLoadingAction}
                                        >
                                            {isLoadingAction ? <LoadingSpinner size="small" color="white" /> : 'Xác nhận giao hàng'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary - Right column (1/3 width on large screens) */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6  top-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                <FiFileText className="mr-2 text-primary" /> Tóm tắt đơn hàng
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FiCalendar className="mt-1 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ngày đặt hàng</h3>
                                        <p className="text-gray-600 dark:text-gray-300">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FiCreditCard className="mt-1 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Phương thức thanh toán</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {payment?.paymentMethodName || 'Đang cập nhật'}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            {paymentStatusInfo.icon}
                                            <span className={`ml-1 text-sm ${paymentStatusInfo.color}`}>{paymentStatusInfo.text}</span>
                                        </div>
                                        {payment?.transactionCode && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Mã giao dịch: {payment.transactionCode}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex justify-between py-1 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Tạm tính</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{formatPrice(order.totalAmount - order.shippingFee)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{formatPrice(order.shippingFee)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 text-base font-semibold">
                                        <span className="text-gray-900 dark:text-white">Tổng cộng</span>
                                        <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thao tác</h2>

                            <div className="space-y-3">
                                {/* Show "Cancel Order" button if order can be canceled, or "Đã hủy" if cancelled */}
                                {orderCancelled ? (
                                    <button
                                        className="w-full px-4 py-2 bg-red-100 text-red-500 rounded-lg dark:bg-red-900/20 cursor-not-allowed"
                                        disabled={true}
                                    >
                                        Đã hủy
                                    </button>
                                ) : order.status === OrderStatus.CANCELLED ? (
                                    <button
                                        className="w-full px-4 py-2 bg-red-100 text-red-500 rounded-lg dark:bg-red-900/20 cursor-not-allowed"
                                        disabled={true}
                                    >
                                        Đã hủy
                                    </button>
                                ) : order.canCancel && (
                                    <button
                                        onClick={() => setShowCancelDialog(true)}
                                        className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        disabled={isLoadingAction}
                                    >
                                        {isLoadingAction ? <LoadingSpinner size="small" /> : 'Hủy đơn hàng'}
                                    </button>
                                )}

                                <button
                                    onClick={() => window.print()}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    In đơn hàng
                                </button>

                                <button
                                    onClick={() => navigate('/orders')}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Xem tất cả đơn hàng
                                </button>
                            </div>
                        </motion.div>

                        {/* COD Payment Information - Only for COD orders */}
                        {isCodeMethod && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                                    <FiDollarSign className="mr-2 text-primary" /> Thông tin COD
                                </h2>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                        Thanh toán khi nhận hàng (COD)
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Đơn hàng của bạn sẽ được giao trong vòng 3-5 ngày làm việc. Vui lòng chuẩn bị đúng số tiền
                                        <span className="font-medium"> {formatPrice(order.totalAmount)}</span> để thanh toán khi nhận hàng.
                                    </p>

                                    {order.status === OrderStatus.SHIPPING && (
                                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                <FiInfo className="inline-block mr-1" />
                                                Khi nhận hàng, bạn sẽ nhận được mã OTP qua email để xác nhận việc giao hàng thành công.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dùng component Dialog hủy đơn hàng mới đã tích hợp form */}
            <CancelOrderDialog
                isOpen={showCancelDialog}
                onConfirm={handleCancelOrder}
                onCancel={() => setShowCancelDialog(false)}
            />

            {/* OTP Confirmation Dialog */}
            <AnimatePresence>
                {showOtpForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <OtpConfirmationForm
                                orderId={order.orderId}
                                onSubmit={handleConfirmDelivery}
                                onCancel={() => setShowOtpForm(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderDetailPage;