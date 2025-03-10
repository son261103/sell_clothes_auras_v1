import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CouponResponseDTO,
    CouponValidationDTO,
    CouponDTO,
    OrderWithCouponDTO,
    CouponType
} from '../../types/coupon.types';

interface CouponState {
    validCoupons: CouponResponseDTO[]; // Danh sách mã giảm giá có hiệu lực
    currentCoupon: CouponResponseDTO | null; // Mã giảm giá hiện tại đang xem chi tiết
    appliedCoupon: CouponDTO | null; // Mã giảm giá đã áp dụng
    validationResult: CouponValidationDTO | null; // Kết quả xác thực mã giảm giá
    orderWithCoupon: OrderWithCouponDTO | null; // Đơn hàng với thông tin giảm giá
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: CouponState = {
    validCoupons: [],
    currentCoupon: null,
    appliedCoupon: null,
    validationResult: null,
    orderWithCoupon: null,
    loading: false,
    error: null,
    lastRequestTimestamp: 0
};

// Hàm hỗ trợ để đảm bảo dữ liệu mã giảm giá hợp lệ
const ensureCouponData = (coupon: CouponResponseDTO): CouponResponseDTO => {
    if (!coupon) return coupon;
    return {
        ...coupon,
        code: coupon.code || '',
        type: coupon.type || CouponType.FIXED_AMOUNT,
        value: coupon.value || 0,
        usedCount: coupon.usedCount || 0,
        status: typeof coupon.status === 'boolean' ? coupon.status : true,
        isExpired: typeof coupon.isExpired === 'boolean' ? coupon.isExpired : false,
        isFullyUsed: typeof coupon.isFullyUsed === 'boolean' ? coupon.isFullyUsed : false
    };
};

const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu mã giảm giá
        fetchCouponStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy danh sách mã giảm giá có hiệu lực
        fetchValidCouponsSuccess(state, action: PayloadAction<CouponResponseDTO[]>) {
            state.loading = false;
            try {
                if (action.payload && Array.isArray(action.payload)) {
                    state.validCoupons = action.payload.map(coupon => ensureCouponData(coupon));
                    console.log('Valid coupons stored in Redux:', state.validCoupons);
                } else {
                    console.warn('Received invalid coupons data:', action.payload);
                    state.error = 'Dữ liệu mã giảm giá không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing coupons data:', error);
                state.error = 'Lỗi xử lý dữ liệu mã giảm giá';
            }
        },

        // Thành công khi lấy chi tiết mã giảm giá
        fetchCouponDetailsSuccess(state, action: PayloadAction<CouponResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.code) {
                    state.currentCoupon = ensureCouponData(action.payload);
                    console.log('Coupon details stored in Redux:', state.currentCoupon);
                } else {
                    console.warn('Received invalid coupon details:', action.payload);
                    state.error = 'Dữ liệu chi tiết mã giảm giá không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing coupon details:', error);
                state.error = 'Lỗi xử lý dữ liệu chi tiết mã giảm giá';
            }
        },

        // Thành công khi xác thực mã giảm giá
        validateCouponSuccess(state, action: PayloadAction<CouponValidationDTO>) {
            state.loading = false;
            state.validationResult = action.payload;

            // Nếu mã giảm giá hợp lệ, lưu thông tin mã giảm giá hiện tại
            if (action.payload.valid && action.payload.coupon) {
                state.currentCoupon = ensureCouponData(action.payload.coupon);
                // Tạo phiên bản đơn giản hóa của mã giảm giá đã áp dụng
                state.appliedCoupon = {
                    code: action.payload.coupon.code,
                    type: action.payload.coupon.type,
                    discountAmount: action.payload.discountAmount || 0
                };
            } else {
                // Nếu không hợp lệ, xóa mã giảm giá hiện tại và đã áp dụng
                state.appliedCoupon = null;
            }
            console.log('Coupon validation result stored in Redux:', state.validationResult);
        },

        // Thành công khi áp dụng mã giảm giá cho đơn hàng
        applyCouponSuccess(state, action: PayloadAction<OrderWithCouponDTO>) {
            state.loading = false;
            state.orderWithCoupon = action.payload;
            // Nếu có mã giảm giá được áp dụng, lưu thông tin
            if (action.payload.coupons && action.payload.coupons.length > 0) {
                state.appliedCoupon = action.payload.coupons[0];
            }
            console.log('Order with coupon stored in Redux:', state.orderWithCoupon);
        },

        // Thất bại khi tải dữ liệu
        fetchCouponFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Xóa mã giảm giá đã áp dụng
        clearAppliedCoupon(state) {
            state.appliedCoupon = null;
            state.orderWithCoupon = null;
            state.validationResult = null;
        },

        // Xóa lỗi
        clearCouponError(state) {
            state.error = null;
        },

        // Reset trạng thái mã giảm giá hiện tại
        resetCurrentCoupon(state) {
            state.currentCoupon = null;
            state.validationResult = null;
        },

        // Cập nhật thông tin đơn hàng với mã giảm giá
        updateOrderWithCoupon(state, action: PayloadAction<{
            subtotalBeforeDiscount: number;
            totalDiscount: number;
        }>) {
            if (state.orderWithCoupon) {
                state.orderWithCoupon = {
                    ...state.orderWithCoupon,
                    subtotalBeforeDiscount: action.payload.subtotalBeforeDiscount,
                    totalDiscount: action.payload.totalDiscount
                };
            } else {
                state.orderWithCoupon = {
                    subtotalBeforeDiscount: action.payload.subtotalBeforeDiscount,
                    totalDiscount: action.payload.totalDiscount,
                    coupons: state.appliedCoupon ? [state.appliedCoupon] : []
                };
            }
        },

        // Kiểm tra mã giảm giá tồn tại thành công
        checkCouponExistsSuccess(state, action: PayloadAction<boolean>) {
            state.loading = false;
            // Chỉ cập nhật kết quả kiểm tra, không lưu thông tin chi tiết
            console.log('Coupon exists check result:', action.payload);
            // Nếu mã giảm giá không tồn tại, xóa các giá trị liên quan
            if (!action.payload) {
                state.appliedCoupon = null;
                state.validationResult = null;
            }
        },

        // Reset toàn bộ trạng thái
        resetCouponState() {
            return initialState;
        }
    },
});

export const {
    fetchCouponStart,
    fetchValidCouponsSuccess,
    fetchCouponDetailsSuccess,
    validateCouponSuccess,
    applyCouponSuccess,
    fetchCouponFailure,
    clearAppliedCoupon,
    clearCouponError,
    resetCurrentCoupon,
    updateOrderWithCoupon,
    checkCouponExistsSuccess,
    resetCouponState
} = couponSlice.actions;

export default couponSlice.reducer;