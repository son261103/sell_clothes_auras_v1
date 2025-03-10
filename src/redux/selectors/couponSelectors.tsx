import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CouponType } from '../../types/coupon.types';

// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getValidCoupons = (state: RootState) => state.coupon.validCoupons;
const getCurrentCoupon = (state: RootState) => state.coupon.currentCoupon;
const getAppliedCoupon = (state: RootState) => state.coupon.appliedCoupon;
const getValidationResult = (state: RootState) => state.coupon.validationResult;
const getOrderWithCoupon = (state: RootState) => state.coupon.orderWithCoupon;
const getCouponLoadingState = (state: RootState) => state.coupon.loading;
const getCouponErrorState = (state: RootState) => state.coupon.error;
const getLastCouponRequestTimestamp = (state: RootState) => state.coupon.lastRequestTimestamp;

// Selectors cơ bản
export const selectValidCoupons = getValidCoupons;
export const selectCurrentCoupon = getCurrentCoupon;
export const selectAppliedCoupon = getAppliedCoupon;
export const selectValidationResult = getValidationResult;
export const selectOrderWithCoupon = getOrderWithCoupon;
export const selectCouponLoading = getCouponLoadingState;
export const selectCouponError = getCouponErrorState;
export const selectLastCouponRequestTimestamp = getLastCouponRequestTimestamp;

// Selector kiểm tra có mã giảm giá đang được áp dụng không
export const selectHasAppliedCoupon = createSelector(
    [getAppliedCoupon],
    (appliedCoupon) => {
        return appliedCoupon !== null;
    }
);

// Selector lấy mã của mã giảm giá đang được áp dụng
export const selectAppliedCouponCode = createSelector(
    [getAppliedCoupon],
    (appliedCoupon) => {
        if (!appliedCoupon) return '';
        return appliedCoupon.code;
    }
);

// Selector lấy số tiền giảm giá của mã giảm giá đang được áp dụng
export const selectAppliedCouponDiscountAmount = createSelector(
    [getAppliedCoupon],
    (appliedCoupon) => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.discountAmount;
    }
);

// Selector lấy loại mã giảm giá đang được áp dụng
export const selectAppliedCouponType = createSelector(
    [getAppliedCoupon],
    (appliedCoupon) => {
        if (!appliedCoupon) return null;
        return appliedCoupon.type;
    }
);

// Selector hiển thị mô tả giảm giá (VD: "10%" hoặc "50,000 VND")
export const selectCouponDiscountDisplay = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return '';
        if (coupon.type === CouponType.PERCENTAGE) {
            return `${coupon.value}%`;
        } else {
            return `${coupon.value.toLocaleString('vi-VN')} VND`;
        }
    }
);

// Selector kiểm tra mã giảm giá hiện tại có hợp lệ không
export const selectIsCouponValid = createSelector(
    [getValidationResult],
    (validationResult) => {
        if (!validationResult) return false;
        return validationResult.valid;
    }
);

// Selector lấy thông báo xác thực mã giảm giá
export const selectCouponValidationMessage = createSelector(
    [getValidationResult],
    (validationResult) => {
        if (!validationResult) return '';
        return validationResult.message;
    }
);

// Selector kiểm tra mã giảm giá hiện tại có hết hạn không
export const selectIsCouponExpired = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return false;
        return coupon.isExpired;
    }
);

// Selector kiểm tra mã giảm giá hiện tại đã sử dụng hết chưa
export const selectIsCouponFullyUsed = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return false;
        return coupon.isFullyUsed;
    }
);

// Selector lấy thông tin giới hạn sử dụng mã giảm giá
export const selectCouponUsageLimitInfo = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return { hasLimit: false, used: 0, remaining: 0, limit: 0 };
        const hasLimit = typeof coupon.usageLimit === 'number' && coupon.usageLimit > 0;

        return {
            hasLimit,
            used: coupon.usedCount || 0,
            limit: coupon.usageLimit || 0,
            remaining: hasLimit ? Math.max(0, (coupon.usageLimit || 0) - (coupon.usedCount || 0)) : null
        };
    }
);

// Selector lấy thông tin thời hạn mã giảm giá
export const selectCouponDateInfo = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return { hasStartDate: false, hasEndDate: false, startDate: null, endDate: null };

        return {
            hasStartDate: !!coupon.startDate,
            hasEndDate: !!coupon.endDate,
            startDate: coupon.startDate ? new Date(coupon.startDate) : null,
            endDate: coupon.endDate ? new Date(coupon.endDate) : null
        };
    }
);

// Selector kiểm tra mã giảm giá có điều kiện đơn hàng tối thiểu không
export const selectCouponHasMinOrderAmount = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return false;
        return typeof coupon.minOrderAmount === 'number' && coupon.minOrderAmount > 0;
    }
);

// Selector lấy giá trị đơn hàng tối thiểu để sử dụng mã giảm giá
export const selectCouponMinOrderAmount = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon || typeof coupon.minOrderAmount !== 'number') return 0;
        return coupon.minOrderAmount;
    }
);

// Selector kiểm tra mã giảm giá có giới hạn số tiền giảm tối đa không
export const selectCouponHasMaxDiscountAmount = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return false;
        return typeof coupon.maxDiscountAmount === 'number' && coupon.maxDiscountAmount > 0;
    }
);

// Selector lấy giá trị giảm tối đa của mã giảm giá
export const selectCouponMaxDiscountAmount = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon || typeof coupon.maxDiscountAmount !== 'number') return 0;
        return coupon.maxDiscountAmount;
    }
);

// Selector lấy thông tin đơn hàng trước khi giảm giá
export const selectOrderSubtotalBeforeDiscount = createSelector(
    [getOrderWithCoupon],
    (orderWithCoupon) => {
        if (!orderWithCoupon) return 0;
        return orderWithCoupon.subtotalBeforeDiscount;
    }
);

// Selector lấy tổng số tiền được giảm giá
export const selectOrderTotalDiscount = createSelector(
    [getOrderWithCoupon],
    (orderWithCoupon) => {
        if (!orderWithCoupon) return 0;
        return orderWithCoupon.totalDiscount;
    }
);

// Selector lấy giá sau khi áp dụng mã giảm giá
export const selectOrderTotalAfterDiscount = createSelector(
    [getOrderWithCoupon],
    (orderWithCoupon) => {
        if (!orderWithCoupon) return 0;
        return Math.max(0, orderWithCoupon.subtotalBeforeDiscount - orderWithCoupon.totalDiscount);
    }
);

// Selector lấy mã giảm giá theo mã
export const selectCouponByCode = createSelector(
    [
        (state: RootState) => getValidCoupons(state),
        (_: RootState, code: string) => code
    ],
    (coupons, code) => {
        return coupons.find(coupon => coupon.code === code) || null;
    }
);

// Selector lấy danh sách mã giảm giá đang hoạt động
export const selectActiveCoupons = createSelector(
    [getValidCoupons],
    (coupons) => {
        return coupons.filter(coupon => coupon.status === true && !coupon.isExpired && !coupon.isFullyUsed);
    }
);

// Selector lấy danh sách mã giảm giá sắp hết hạn (còn 7 ngày)
export const selectSoonToExpireCoupons = createSelector(
    [getValidCoupons],
    (coupons) => {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return coupons.filter(coupon => {
            if (!coupon.endDate || coupon.isExpired) return false;
            const endDate = new Date(coupon.endDate);
            return endDate > now && endDate <= nextWeek;
        });
    }
);

// Selector lấy số lượng mã giảm giá theo loại
export const selectCouponCountByType = createSelector(
    [getValidCoupons],
    (coupons) => {
        const counts = {
            [CouponType.PERCENTAGE]: 0,
            [CouponType.FIXED_AMOUNT]: 0,
            total: 0
        };

        coupons.forEach(coupon => {
            if (coupon.type in counts) {
                counts[coupon.type] += 1;
            }
            counts.total += 1;
        });

        return counts;
    }
);

// Selector lấy trạng thái mã giảm giá dưới dạng văn bản hiển thị
export const selectCouponStatusText = createSelector(
    [getCurrentCoupon],
    (coupon) => {
        if (!coupon) return 'Không có thông tin';

        if (!coupon.status) return 'Không hoạt động';
        if (coupon.isExpired) return 'Đã hết hạn';
        if (coupon.isFullyUsed) return 'Đã sử dụng hết';

        return 'Có hiệu lực';
    }
);

// Selector lấy thông tin hiển thị về loại mã giảm giá
export const selectCouponTypeText = createSelector(
    [
        (_: RootState, type: CouponType) => type
    ],
    (type) => {
        const typeTexts = {
            [CouponType.PERCENTAGE]: 'Phần trăm',
            [CouponType.FIXED_AMOUNT]: 'Số tiền cố định'
        };

        return typeTexts[type] || 'Không xác định';
    }
);