// shipping.service.ts
import api from './api';
import {
    ShippingMethodDTO,
    ShippingEstimateDTO,
    ShippingMethodCreateDTO,
    ShippingMethodUpdateDTO,
    ApplyShippingDTO
} from '../types/shipping.types';
import { OrderResponseDTO } from '../types/order.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

/**
 * Service for managing shipping functionality
 */
const ShippingService = {
    /**
     * Lấy tất cả phương thức vận chuyển khả dụng
     */
    async getAllShippingMethods(): Promise<ShippingMethodDTO[]> {
        try {
            const response = await api.get<ShippingMethodDTO[]>('/public/shipping-methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            throw error;
        }
    },

    /**
     * Lấy phương thức vận chuyển theo ID
     * @param id - ID của phương thức vận chuyển
     */
    async getShippingMethodById(id: number): Promise<ShippingMethodDTO> {
        try {
            const response = await api.get<ShippingMethodDTO>(`/public/shipping-methods/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching shipping method ${id}:`, error);
            throw error;
        }
    },

    /**
     * Ước tính phí vận chuyển dựa trên tổng đơn hàng và phương thức vận chuyển
     * @param orderTotal - Tổng tiền đơn hàng
     * @param methodId - ID của phương thức vận chuyển
     * @param totalWeight - Tổng trọng lượng hàng (kg)
     */
    async estimateShipping(
        orderTotal: number,
        methodId: number,
        totalWeight?: number
    ): Promise<ShippingEstimateDTO> {
        try {
            const response = await api.get<ShippingEstimateDTO>('/public/shipping-methods/estimate', {
                params: {
                    orderTotal,
                    methodId,
                    totalWeight
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error estimating shipping cost:', error);
            throw error;
        }
    },

    /**
     * Ước tính phí vận chuyển cho người dùng đã đăng nhập
     * @param userId - ID của người dùng
     * @param orderTotal - Tổng tiền đơn hàng
     * @param methodId - ID của phương thức vận chuyển
     * @param totalWeight - Tổng trọng lượng hàng (kg)
     */
    async estimateShippingForUser(
        userId: number,
        orderTotal: number,
        methodId: number,
        totalWeight?: number
    ): Promise<ShippingEstimateDTO> {
        try {
            const response = await api.get<ShippingEstimateDTO>('/public/shipping-methods/user-estimate', {
                headers: { 'X-User-Id': userId },
                params: {
                    orderTotal,
                    methodId,
                    totalWeight
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error estimating shipping cost for user:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra điều kiện miễn phí vận chuyển
     * @param orderTotal - Tổng tiền đơn hàng
     */
    async checkFreeShippingEligibility(orderTotal: number): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>('/public/shipping-methods/free-shipping-eligibility', {
                params: { orderTotal }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking free shipping eligibility:', error);
            throw error;
        }
    },

    /**
     * Áp dụng phương thức vận chuyển cho đơn hàng (chỉ dành cho admin)
     * @param applyDTO - Dữ liệu áp dụng vận chuyển
     */
    async applyShippingToOrder(applyDTO: ApplyShippingDTO): Promise<OrderResponseDTO> {
        try {
            const response = await api.post<OrderResponseDTO>('/api/shipping-methods/admin/apply', applyDTO);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error applying shipping to order:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Không thể áp dụng phương thức vận chuyển';
        }
    },

    /**
     * Tạo phương thức vận chuyển mới (chỉ dành cho admin)
     * @param createDTO - Dữ liệu tạo phương thức vận chuyển
     */
    async createShippingMethod(createDTO: ShippingMethodCreateDTO): Promise<ShippingMethodDTO> {
        try {
            const response = await api.post<ShippingMethodDTO>('/api/shipping-methods/admin/methods', createDTO);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error creating shipping method:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Không thể tạo phương thức vận chuyển';
        }
    },

    /**
     * Cập nhật phương thức vận chuyển (chỉ dành cho admin)
     * @param id - ID của phương thức vận chuyển
     * @param updateDTO - Dữ liệu cập nhật
     */
    async updateShippingMethod(id: number, updateDTO: ShippingMethodUpdateDTO): Promise<ShippingMethodDTO> {
        try {
            const response = await api.put<ShippingMethodDTO>(`/api/shipping-methods/admin/methods/${id}`, updateDTO);
            return response.data;
        } catch (error) {
            console.error(`Error updating shipping method ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa phương thức vận chuyển (chỉ dành cho admin)
     * @param id - ID của phương thức vận chuyển
     */
    async deleteShippingMethod(id: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(`/api/shipping-methods/admin/methods/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting shipping method ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tính phí vận chuyển cho đơn hàng (dành cho admin)
     * @param orderTotal - Tổng tiền đơn hàng
     * @param methodId - ID của phương thức vận chuyển
     * @param totalWeight - Tổng trọng lượng hàng (kg)
     */
    async calculateShippingAdmin(
        orderTotal: number,
        methodId: number,
        totalWeight?: number
    ): Promise<ShippingEstimateDTO> {
        try {
            const response = await api.get<ShippingEstimateDTO>('/api/shipping-methods/admin/calculate', {
                params: {
                    orderTotal,
                    methodId,
                    totalWeight
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error calculating shipping (admin):', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách đơn hàng theo phương thức vận chuyển (chỉ dành cho admin)
     * @param methodId - ID của phương thức vận chuyển
     * @param page - Số trang
     * @param size - Số phần tử mỗi trang
     */
    async getOrdersByShippingMethod(
        methodId: number,
        page: number = 0,
        size: number = 10
    ): Promise<OrderResponseDTO[]> {
        try {
            const response = await api.get<{ orders: OrderResponseDTO[] }>(`/api/shipping-methods/admin/methods/${methodId}/orders`, {
                params: { page, size }
            });
            return response.data.orders;
        } catch (error) {
            console.error(`Error fetching orders for shipping method ${methodId}:`, error);
            throw error;
        }
    }
};

export default ShippingService;