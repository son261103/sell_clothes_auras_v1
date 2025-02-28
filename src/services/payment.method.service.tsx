import api from './api';
import { PaymentMethodDTO } from '../types/payment.method.types';
import { ApiResponse } from '../types';

/**
 * Service for managing payment methods
 */
const PaymentMethodService = {
    /**
     * Get all active payment methods
     * @returns Promise containing an array of active payment methods
     */
    async getActivePaymentMethods(): Promise<PaymentMethodDTO[]> {
        try {
            const response = await api.get<PaymentMethodDTO[]>('/public/payment-methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching active payment methods:', error);
            throw error;
        }
    },

    /**
     * Get payment method details by ID
     * @param methodId - The ID of the payment method
     * @returns Promise containing the payment method details
     */
    async getPaymentMethodById(methodId: number): Promise<PaymentMethodDTO> {
        try {
            const response = await api.get<PaymentMethodDTO>(`/public/payment-methods/${methodId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment method ${methodId}:`, error);
            throw error;
        }
    },

    /**
     * Get supported banks for a payment method (e.g., VNPay)
     * @param methodId - The ID of the payment method
     * @returns Promise containing an array of supported bank codes
     */
    async getSupportedBanks(methodId: number): Promise<string[]> {
        try {
            const response = await api.get<string[]>(`/public/payment-methods/${methodId}/banks`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching supported banks for payment method ${methodId}:`, error);
            throw error;
        }
    },

    /**
     * Check payment method status
     * @param methodId - The ID of the payment method
     * @returns Promise containing the status of the payment method
     */
    async checkPaymentMethodStatus(methodId: number): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>(`/public/payment-methods/${methodId}/status`);
            return response.data;
        } catch (error) {
            console.error(`Error checking status of payment method ${methodId}:`, error);
            throw error;
        }
    }
};

export default PaymentMethodService;