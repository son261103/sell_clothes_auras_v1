// order.service.ts
import api from './api';
import {
    OrderResponseDTO,
    OrderSummaryDTO,
    CreateOrderDTO,
    CancelOrderDTO,
    OrderItemDTO,
    BestsellingProductDTO,
    OrderStatus,
    PaymentMethodDTO,
    PaymentRequestDTO,
    PaymentResponseDTO,
    PaginatedResponse,
    ShippingMethodDTO
} from '../types/order.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

const OrderService = {
    /**
     * Tạo đơn hàng mới từ giỏ hàng
     * @param userId - ID của người dùng
     * @param createDTO - Dữ liệu tạo đơn hàng (bao gồm addressId, shippingMethodId và các thông tin khác)
     */
    async createOrder(userId: number, createDTO: CreateOrderDTO): Promise<OrderResponseDTO> {
        try {
            const response = await api.post<OrderResponseDTO>('/public/orders/create', createDTO, {
                headers: { 'X-User-Id': userId }
            });
            console.log('Order created:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error creating order:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Failed to create order';
        }
    },

    /**
     * Lấy thông tin đơn hàng theo ID
     */
    async getOrderById(userId: number, orderId: number): Promise<OrderResponseDTO> {
        try {
            const response = await api.get<OrderResponseDTO>(`/public/orders/${orderId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách đơn hàng của người dùng
     */
    async getUserOrders(
        userId: number,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<OrderSummaryDTO>> {
        try {
            const response = await api.get<PaginatedResponse<OrderSummaryDTO>>('/public/orders', {
                headers: { 'X-User-Id': userId },
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách đơn hàng theo trạng thái
     */
    async getUserOrdersByStatus(
        userId: number,
        status: OrderStatus,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<OrderSummaryDTO>> {
        try {
            const response = await api.get<PaginatedResponse<OrderSummaryDTO>>(`/public/orders/status/${status}`, {
                headers: { 'X-User-Id': userId },
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders with status ${status}:`, error);
            throw error;
        }
    },

    /**
     * Hủy đơn hàng
     */
    async cancelOrder(userId: number, orderId: number, cancelDTO: CancelOrderDTO): Promise<OrderResponseDTO> {
        try {
            const response = await api.post<OrderResponseDTO>(`/public/orders/${orderId}/cancel`, cancelDTO, {
                headers: { 'X-User-Id': userId }
            });
            console.log('Order cancelled:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết các sản phẩm trong đơn hàng
     */
    async getOrderItems(userId: number, orderId: number): Promise<OrderItemDTO[]> {
        try {
            const response = await api.get<OrderItemDTO[]>(`/public/orders/${orderId}/items`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching items for order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách sản phẩm bán chạy
     */
    async getBestsellingProducts(limit: number = 10): Promise<BestsellingProductDTO[]> {
        try {
            const response = await api.get<BestsellingProductDTO[]>('/public/orders/bestselling', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching bestselling products:', error);
            throw error;
        }
    },

    /**
     * Ước tính phí vận chuyển cho đơn hàng
     */
    async estimateOrderShipping(
        orderTotal: number,
        shippingMethodId: number,
        totalWeight?: number
    ): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>('/public/orders/shipping-estimate', {
                params: {
                    orderTotal,
                    shippingMethodId,
                    totalWeight
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error estimating order shipping:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách phương thức vận chuyển
     */
    async getShippingMethods(): Promise<ShippingMethodDTO[]> {
        try {
            const response = await api.get<ShippingMethodDTO[]>('/public/orders/shipping-methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách phương thức thanh toán khả dụng
     */
    async getAvailablePaymentMethods(): Promise<PaymentMethodDTO[]> {
        try {
            const response = await api.get<PaymentMethodDTO[]>('/public/payment-methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    },

    /**
     * Tạo thanh toán cho đơn hàng
     */
    async createPayment(userId: number, paymentRequest: PaymentRequestDTO): Promise<PaymentResponseDTO> {
        try {
            const response = await api.post<PaymentResponseDTO>('/public/payment/create', paymentRequest, {
                headers: { 'X-User-Id': userId }
            });
            console.log('Payment created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra trạng thái thanh toán
     */
    async checkPaymentStatus(userId: number, transactionId: string): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>(`/public/payment/status/${transactionId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error checking payment status for transaction ${transactionId}:`, error);
            throw error;
        }
    },

    /**
     * Hủy thanh toán
     */
    async cancelPayment(userId: number, paymentId: number): Promise<ApiResponse> {
        try {
            const response = await api.post<ApiResponse>(`/public/payment/${paymentId}/cancel`, {}, {
                headers: { 'X-User-Id': userId }
            });
            console.log('Payment cancelled:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error cancelling payment ${paymentId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy thông tin thanh toán theo đơn hàng
     */
    async getPaymentByOrderId(userId: number, orderId: number): Promise<PaymentResponseDTO> {
        try {
            const response = await api.get<PaymentResponseDTO>(`/public/payment/order/${orderId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment for order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Mở trang thanh toán VNPay (dùng cho frontend)
     */
    openPaymentPage(paymentUrl: string): void {
        if (!paymentUrl) {
            console.error('Payment URL is empty');
            return;
        }

        // Mở trang thanh toán trong tab mới
        window.open(paymentUrl, '_blank');
    },

    /**
     * Kiểm tra kết quả thanh toán từ URL callback
     */
    async verifyPaymentCallback(queryParams: URLSearchParams): Promise<PaymentResponseDTO> {
        try {
            // Chuyển đổi URLSearchParams thành object
            const params: Record<string, string> = {};
            queryParams.forEach((value, key) => {
                params[key] = value;
            });

            // Gọi API xác nhận thanh toán
            const response = await api.get<PaymentResponseDTO>('/public/payment/confirm', {
                params
            });

            console.log('Payment verification result:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error verifying payment callback:', error);
            throw error;
        }
    },

    /**
     * Theo dõi trạng thái thanh toán (polling)
     */
    async pollPaymentStatus(
        userId: number,
        orderId: number,
        intervalMs: number = 3000,
        timeoutMs: number = 60000
    ): Promise<PaymentResponseDTO> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkStatus = async () => {
                try {
                    const payment = await this.getPaymentByOrderId(userId, orderId);

                    // Nếu thanh toán đã hoàn tất hoặc thất bại, trả về kết quả
                    if (payment.paymentStatus === 'COMPLETED' || payment.paymentStatus === 'FAILED') {
                        resolve(payment);
                        return;
                    }

                    // Kiểm tra timeout
                    if (Date.now() - startTime > timeoutMs) {
                        reject(new Error('Payment status check timed out'));
                        return;
                    }

                    // Tiếp tục kiểm tra sau khoảng thời gian
                    setTimeout(checkStatus, intervalMs);
                } catch (error) {
                    reject(error);
                }
            };

            // Bắt đầu kiểm tra
            checkStatus();
        });
    }
};

export default OrderService;