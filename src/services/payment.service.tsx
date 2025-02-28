import api from './api';
import { PaymentRequestDTO, PaymentResponseDTO, PaymentHistoryDTO } from '../types/payment.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

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

    /**
     * Confirm payment (for VNPay callback)
     * @param vnpayParams - The VNPay callback parameters
     * @returns Promise containing the payment confirmation response
     */
    async confirmPayment(vnpayParams: Record<string, string>): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>('/public/payment/confirm', {
                params: vnpayParams
            });
            return response.data;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }
};

export default PaymentService;