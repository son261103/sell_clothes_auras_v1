import api from './api';
import { PaymentRequestDTO, PaymentResponseDTO, PaymentHistoryDTO } from '../types/payment.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

// let lastConfirmRequestTime = 0;
// const DEBOUNCE_INTERVAL = 2000;

/**
 * Service for managing user payments
 */
const PaymentService = {
    /**
     * Create a new payment for an order
     * @param userId - The ID of the user
     * @param paymentData - The payment data to create
     * @returns Promise containing the created payment response
     */
    async createPayment(userId: number, paymentData: PaymentRequestDTO): Promise<PaymentResponseDTO> {
        try {
            const response = await api.post<PaymentResponseDTO>('/public/payment/create', paymentData, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error creating payment:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Failed to create payment';
        }
    },

    /**
     * Get payment details by order ID
     * @param userId - The ID of the user
     * @param orderId - The ID of the order
     * @returns Promise containing the payment details
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
     * Cancel a payment
     * @param userId - The ID of the user
     * @param paymentId - The ID of the payment to cancel
     * @returns Promise containing the API response
     */
    async cancelPayment(userId: number, paymentId: number): Promise<ApiResponse> {
        try {
            const response = await api.post<ApiResponse>(`/public/payment/${paymentId}/cancel`, {}, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error canceling payment ${paymentId}:`, error);
            throw error;
        }
    },

    /**
     * Check payment status by transaction ID
     * @param userId - The ID of the user
     * @param transactionId - The transaction ID to check
     * @returns Promise containing the payment status
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
     * Get payment history by order ID
     * @param userId - The ID of the user
     * @param orderId - The ID of the order
     * @returns Promise containing the payment history
     */
    async getPaymentHistoryByOrderId(userId: number, orderId: number): Promise<PaymentHistoryDTO[]> {
        try {
            const response = await api.get<PaymentHistoryDTO[]>(`/public/payment/history/order/${orderId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment history for order ${orderId}:`, error);
            throw error;
        }
    },

    // /**
    //  * Confirm payment (for VNPay callback)
    //  * @param vnpayParams - The VNPay callback parameters
    //  * @returns Promise containing the payment confirmation response
    //  */
    // async confirmPayment(vnpayParams: Record<string, string>): Promise<ApiResponse> {
    //     try {
    //         // Implement debounce to prevent multiple rapid requests
    //         const now = Date.now();
    //         if (now - lastConfirmRequestTime < DEBOUNCE_INTERVAL) {
    //             console.log('Payment confirmation request throttled');
    //             throw new Error('Yêu cầu đang được xử lý, vui lòng đợi');
    //         }
    //
    //         lastConfirmRequestTime = now;
    //
    //         const response = await api.get<ApiResponse>('/public/payment/confirm', {
    //             params: vnpayParams
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error confirming payment:', error);
    //         throw error instanceof Error ? error : new Error('Lỗi xác nhận thanh toán');
    //     }
    // }

    async confirmPayment(vnpayParams: Record<string, string>): Promise<ApiResponse> {
        try {
            // Mapping mã lỗi VNPAY sang thông báo dễ hiểu
            const errorMessages: Record<string, string> = {
                '01': 'Giao dịch đã tồn tại',
                '02': 'Merchant không hợp lệ',
                '03': 'Dữ liệu gửi sang không đúng định dạng',
                '04': 'Không đúng checksum',
                '05': 'Số tiền không hợp lệ',
                '06': 'Mã tiền tệ không hợp lệ',
                '07': 'Dữ liệu gửi sang không đủ',
                '08': 'Số tiền không đủ để thanh toán',
                '09': 'Tên hàng hóa không hợp lệ',
                '10': 'Thông tin thanh toán không hợp lệ',
                '11': 'Đơn hàng không hợp lệ',
                '12': 'Đơn vị không hợp lệ',
                '13': 'Phương thức thanh toán không hợp lệ',
                '24': 'Giao dịch bị nghi ngờ là gian lận',
                '51': 'Tài khoản không đủ số dư',
                '65': 'Tài khoản vượt quá hạn mức thanh toán trong ngày',
                '75': 'Ngân hàng thanh toán đang bảo trì',
                '99': 'Lỗi không xác định'
            };

            // Lấy mã lỗi từ params
            const responseCode = vnpayParams['vnp_ResponseCode'];

            // Nếu không phải mã thành công (00) thì xử lý như lỗi
            if (responseCode && responseCode !== '00') {
                const errorMessage = errorMessages[responseCode] || `Lỗi không xác định (Mã: ${responseCode})`;
                throw new Error(`Thanh toán thất bại: ${errorMessage}`);
            }

            // Xử lý callback bình thường
            const response = await api.get<ApiResponse>('/public/payment/confirm', {
                params: vnpayParams
            });
            return response.data;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error instanceof Error ? error : new Error('Lỗi xác nhận thanh toán');
        }
    },

    // services/payment.service.ts
    async confirmDeliveryWithOtp(userId: number, orderId: number, otp: string): Promise<PaymentResponseDTO> {
        try {
            const response = await api.post<PaymentResponseDTO>(
                `/public/payment/confirm-delivery/${orderId}`,
                { otp },
                { headers: { 'X-User-Id': userId } }
            );
            return response.data;
        } catch (error) {
            console.error(`Error confirming delivery with OTP for order ${orderId}:`, error);
            throw error;
        }
    }

};

export default PaymentService;