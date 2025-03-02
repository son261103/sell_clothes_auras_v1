import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useOrder from '../../hooks/useOrder';
import { OrderItemDTO } from '../../types/order.types';

// Định nghĩa interface cho paymentDetails dựa trên dữ liệu từ VNPay callback
interface PaymentDetails {
    orderId: string;
    amount: number;
    transactionNo: string;
    orderInfo: string;
    status: string;
}

const PaymentConfirmPage: React.FC = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { getOrderById, loading, currentOrder } = useOrder();
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(search);
        const orderId = params.get('vnp_TxnRef');
        const responseCode = params.get('vnp_ResponseCode');
        const amount = params.get('vnp_Amount');
        const transactionNo = params.get('vnp_TransactionNo');
        const orderInfo = params.get('vnp_OrderInfo');

        if (!orderId || !responseCode) {
            toast.error('Thông tin thanh toán không hợp lệ');
            navigate('/');
            return;
        }

        setPaymentDetails({
            orderId,
            amount: amount ? parseInt(amount) / 100 : 0, // Chuyển từ đơn vị VNPay sang VND
            transactionNo: transactionNo || 'N/A',
            orderInfo: orderInfo || 'Không có thông tin',
            status: responseCode === '00' ? 'Thành công' : 'Thất bại',
        });

        const orderIdNum = parseInt(orderId);

        // Nếu currentOrder đã có và khớp với orderId, không gọi API
        if (currentOrder && currentOrder.orderId === orderIdNum) {
            return;
        }

        // Chỉ gọi API nếu chưa fetch và không đang loading
        if (!hasFetched && !loading) {
            setHasFetched(true);
            getOrderById(orderIdNum)
                .then((order) => {
                    console.log("order", order)
                    // Thành công, không cần làm gì thêm vì Redux đã cập nhật currentOrder
                })
                .catch((error) => {
                    console.error('Error fetching order:', error);
                    toast.error('Không thể tải thông tin đơn hàng');
                });
        }
    }, [search, navigate, getOrderById, currentOrder, hasFetched, loading]);

    // Hiển thị loading nếu chưa có dữ liệu
    if (loading || !paymentDetails || !currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
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
                    className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm"
                >
                    <h1 className="text-3xl font-bold text-primary mb-6">Hóa đơn thanh toán</h1>
                    <div className="space-y-4">
                        <p>
                            <strong>Mã đơn hàng:</strong> {paymentDetails.orderId}
                        </p>
                        <p>
                            <strong>Thông tin đơn hàng:</strong> {paymentDetails.orderInfo}
                        </p>
                        <p>
                            <strong>Khách hàng:</strong> {currentOrder.userId}{' '}
                            {/* userId thay vì fullName vì type không có fullName */}
                        </p>
                        <p>
                            <strong>Địa chỉ giao hàng:</strong> {currentOrder.address.addressLine}
                        </p>
                        <p>
                            <strong>Số tiền:</strong>{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(paymentDetails.amount)}
                        </p>
                        <p>
                            <strong>Phí vận chuyển:</strong>{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(currentOrder.shippingFee)}
                        </p>
                        <p>
                            <strong>Tổng tiền:</strong>{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(currentOrder.totalAmount)}
                        </p>
                        <p>
                            <strong>Mã giao dịch:</strong> {paymentDetails.transactionNo}
                        </p>
                        <p>
                            <strong>Trạng thái:</strong>{' '}
                            <span
                                className={
                                    paymentDetails.status === 'Thành công'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {paymentDetails.status}
                            </span>
                        </p>
                    </div>

                    <h2 className="text-xl font-semibold mt-6 mb-4">Chi tiết đơn hàng</h2>
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="border p-2">Sản phẩm</th>
                            <th className="border p-2">Số lượng</th>
                            <th className="border p-2">Đơn giá</th>
                            <th className="border p-2">Tổng</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentOrder.items.map((item: OrderItemDTO) => (
                            <tr key={item.orderItemId}>
                                <td className="border p-2">{item.productName}</td>
                                <td className="border p-2">{item.quantity}</td>
                                <td className="border p-2">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(item.unitPrice)}
                                </td>
                                <td className="border p-2">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(item.totalPrice)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/90"
                    >
                        Quay về trang chủ
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentConfirmPage;