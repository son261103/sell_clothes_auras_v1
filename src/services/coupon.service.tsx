// coupon.service.tsx
import api from './api';
import {
    CouponResponseDTO,
    CouponValidationDTO,
    CouponDTO,
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponFilters,
    CouponStatisticsDTO,
    CouponPage,
    StatusCounts,
    TypeCounts,
    OrderWithCouponDTO,
    CouponType
} from '../types/coupon.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

const CouponService = {
    /**
     * Lấy danh sách mã giảm giá có hiệu lực
     */
    async getValidCoupons(): Promise<CouponResponseDTO[]> {
        try {
            const response = await api.get<CouponResponseDTO[]>('/public/coupons');
            return response.data;
        } catch (error) {
            console.error('Error fetching valid coupons:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra và xác thực mã giảm giá
     * @param code - Mã giảm giá cần kiểm tra
     * @param orderAmount - Tổng giá trị đơn hàng
     */
    async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationDTO> {
        try {
            const response = await api.get<CouponValidationDTO>('/public/coupons/validate', {
                params: { code, orderAmount }
            });
            return response.data;
        } catch (error) {
            console.error(`Error validating coupon code ${code}:`, error);
            throw error;
        }
    },

    /**
     * Lấy thông tin chi tiết mã giảm giá theo code
     * @param code - Mã giảm giá cần lấy thông tin
     */
    async getCouponByCode(code: string): Promise<CouponResponseDTO> {
        try {
            const response = await api.get<CouponResponseDTO>(`/public/coupons/${code}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching coupon details for code ${code}:`, error);
            throw error;
        }
    },

    /**
     * Kiểm tra xem mã giảm giá có tồn tại không (quick check)
     * @param code - Mã giảm giá cần kiểm tra
     */
    async checkCouponExists(code: string): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>(`/public/coupons/check/${code}`);
            return response.data;
        } catch (error) {
            console.error(`Error checking if coupon ${code} exists:`, error);
            return { success: false, message: 'Mã giảm giá không tồn tại' };
        }
    },

    /**
     * Áp dụng mã giảm giá cho đơn hàng
     * @param code - Mã giảm giá
     * @param orderTotal - Tổng giá trị đơn hàng
     */
    async applyCoupon(code: string, orderTotal: number): Promise<OrderWithCouponDTO> {
        try {
            // Trước tiên validate mã giảm giá
            const validationResult = await this.validateCoupon(code, orderTotal);

            if (!validationResult.valid) {
                throw new Error(validationResult.message);
            }

            // Nếu mã giảm giá hợp lệ, trả về thông tin đơn hàng với giảm giá
            const discountAmount = validationResult.discountAmount || 0;

            // Tạo đối tượng coupon từ kết quả validation
            const coupon: CouponDTO = {
                code: code,
                type: validationResult.coupon?.type || CouponType.FIXED_AMOUNT,
                discountAmount: discountAmount
            };

            // Trả về thông tin đơn hàng đã áp dụng mã giảm giá
            return {
                subtotalBeforeDiscount: orderTotal,
                totalDiscount: discountAmount,
                coupons: [coupon]
            };
        } catch (error) {
            console.error(`Error applying coupon ${code}:`, error);
            throw error;
        }
    },

    // --- Admin Methods --- //

    /**
     * Lấy danh sách mã giảm giá có phân trang và lọc
     * @param page - Số trang
     * @param size - Số lượng item mỗi trang
     * @param filters - Các điều kiện lọc
     */
    async getCoupons(
        page: number = 0,
        size: number = 10,
        filters?: CouponFilters
    ): Promise<CouponPage> {
        try {
            const response = await api.get<CouponPage>('/admin/coupons', {
                params: {
                    page,
                    size,
                    ...filters
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching coupons:', error);
            throw error;
        }
    },

    /**
     * Tạo mã giảm giá mới
     * @param createDTO - Dữ liệu tạo mã giảm giá
     */
    async createCoupon(createDTO: CouponCreateDTO): Promise<CouponResponseDTO> {
        try {
            const response = await api.post<CouponResponseDTO>('/admin/coupons', createDTO);
            console.log('Coupon created:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error creating coupon:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Failed to create coupon';
        }
    },

    /**
     * Cập nhật mã giảm giá
     * @param couponId - ID của mã giảm giá
     * @param updateDTO - Dữ liệu cập nhật
     */
    async updateCoupon(couponId: number, updateDTO: CouponUpdateDTO): Promise<CouponResponseDTO> {
        try {
            const response = await api.put<CouponResponseDTO>(`/admin/coupons/${couponId}`, updateDTO);
            console.log('Coupon updated:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating coupon ${couponId}:`, error);
            throw error;
        }
    },

    /**
     * Xóa mã giảm giá
     * @param couponId - ID của mã giảm giá
     */
    async deleteCoupon(couponId: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(`/admin/coupons/${couponId}`);
            console.log('Coupon deleted:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error deleting coupon ${couponId}:`, error);
            throw error;
        }
    },

    /**
     * Kích hoạt hoặc vô hiệu hóa mã giảm giá
     * @param couponId - ID của mã giảm giá
     * @param active - Trạng thái kích hoạt
     */
    async toggleCouponStatus(couponId: number, active: boolean): Promise<CouponResponseDTO> {
        try {
            const response = await api.patch<CouponResponseDTO>(`/admin/coupons/${couponId}/status`, {
                status: active
            });
            console.log(`Coupon ${active ? 'activated' : 'deactivated'}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error toggling coupon ${couponId} status:`, error);
            throw error;
        }
    },

    /**
     * Lấy thống kê về mã giảm giá
     */
    async getCouponStatistics(): Promise<CouponStatisticsDTO> {
        try {
            const response = await api.get<CouponStatisticsDTO>('/admin/coupons/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching coupon statistics:', error);
            throw error;
        }
    },

    /**
     * Lấy số lượng mã giảm giá theo trạng thái
     */
    async getCouponStatusCounts(): Promise<StatusCounts> {
        try {
            const response = await api.get<StatusCounts>('/admin/coupons/counts/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching coupon status counts:', error);
            throw error;
        }
    },

    /**
     * Lấy số lượng mã giảm giá theo loại
     */
    async getCouponTypeCounts(): Promise<TypeCounts> {
        try {
            const response = await api.get<TypeCounts>('/admin/coupons/counts/type');
            return response.data;
        } catch (error) {
            console.error('Error fetching coupon type counts:', error);
            throw error;
        }
    },

    /**
     * Tạo mã giảm giá ngẫu nhiên
     * @param length - Độ dài của mã giảm giá
     */
    generateRandomCouponCode(length: number = 8): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },

    /**
     * Tính toán số tiền giảm giá dựa trên loại mã giảm giá
     * @param type - Loại mã giảm giá (percentage hoặc fixed_amount)
     * @param value - Giá trị của mã giảm giá
     * @param orderAmount - Tổng giá trị đơn hàng
     * @param maxDiscountAmount - Giới hạn số tiền giảm tối đa (với loại percentage)
     */
    calculateDiscountAmount(
        type: CouponType,
        value: number,
        orderAmount: number,
        maxDiscountAmount?: number
    ): number {
        let discountAmount = 0;

        if (type === CouponType.PERCENTAGE) {
            // Tính số tiền giảm giá dựa trên phần trăm
            discountAmount = (orderAmount * value) / 100;

            // Áp dụng giới hạn số tiền giảm tối đa (nếu có)
            if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
                discountAmount = maxDiscountAmount;
            }
        } else if (type === CouponType.FIXED_AMOUNT) {
            // Số tiền giảm giá cố định
            discountAmount = value;

            // Đảm bảo số tiền giảm giá không vượt quá giá trị đơn hàng
            if (discountAmount > orderAmount) {
                discountAmount = orderAmount;
            }
        }

        return discountAmount;
    }
};

export default CouponService;