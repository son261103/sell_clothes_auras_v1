import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ShippingMethodDTO } from '../../types/shipping.types';

// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getShippingMethods = (state: RootState) => state.shipping.shippingMethods;
const getCurrentShippingMethod = (state: RootState) => state.shipping.currentShippingMethod;
const getSelectedShippingMethod = (state: RootState) => state.shipping.selectedShippingMethod;
const getShippingEstimate = (state: RootState) => state.shipping.shippingEstimate;
const getFreeShippingThreshold = (state: RootState) => state.shipping.freeShippingThreshold;
const getShippingLoadingState = (state: RootState) => state.shipping.loading;
const getShippingErrorState = (state: RootState) => state.shipping.error;
const getLastShippingRequestTimestamp = (state: RootState) => state.shipping.lastRequestTimestamp;

// Selectors cơ bản
export const selectShippingMethods = getShippingMethods;
export const selectCurrentShippingMethod = getCurrentShippingMethod;
export const selectSelectedShippingMethod = getSelectedShippingMethod;
export const selectShippingEstimate = getShippingEstimate;
export const selectFreeShippingThreshold = getFreeShippingThreshold;
export const selectShippingLoading = getShippingLoadingState;
export const selectShippingError = getShippingErrorState;
export const selectLastShippingRequestTimestamp = getLastShippingRequestTimestamp;

// Selector lấy số lượng phương thức vận chuyển
export const selectShippingMethodCount = createSelector(
    [getShippingMethods],
    (methods) => methods.length
);

// Selector kiểm tra xem có phương thức vận chuyển nào không
export const selectHasShippingMethods = createSelector(
    [getShippingMethods],
    (methods) => methods.length > 0
);

// Selector lấy phương thức vận chuyển theo ID
export const selectShippingMethodById = createSelector(
    [
        (state: RootState) => getShippingMethods(state),
        (_: RootState, methodId: number) => methodId
    ],
    (methods, methodId) => {
        return methods.find(method => method.id === methodId) || undefined;
    }
);

// Selector lấy danh sách phương thức vận chuyển có thông tin hiển thị bổ sung
export const selectShippingMethodsWithDisplay = createSelector(
    [getShippingMethods],
    (methods) => {
        return methods.map(method => ({
            ...method,
            displayName: `${method.name} (${method.estimatedDeliveryTime || 'Không xác định'})`,
            priceDisplay: method.baseFee === 0 ? 'Miễn phí' : `${method.baseFee.toLocaleString('vi-VN')} VND`,
            value: method.id, // Cho select box
            label: `${method.name} - ${method.baseFee === 0 ? 'Miễn phí' : `${method.baseFee.toLocaleString('vi-VN')} VND`}`
        }));
    }
);

// Selector lấy phí vận chuyển hiện tại từ ước tính
export const selectCurrentShippingFee = createSelector(
    [getShippingEstimate],
    (estimate) => {
        if (!estimate) return 0;
        return estimate.shippingFee;
    }
);

// Selector kiểm tra xem đơn hàng có đủ điều kiện miễn phí vận chuyển không
export const selectIsFreeShippingEligible = createSelector(
    [getShippingEstimate],
    (estimate) => {
        if (!estimate) return false;
        return estimate.freeShippingEligible;
    }
);

// Selector lấy phương thức vận chuyển rẻ nhất
export const selectCheapestShippingMethod = createSelector(
    [getShippingMethods],
    (methods) => {
        if (!methods.length) return undefined;

        return methods.reduce((cheapest, current) => {
            if (!cheapest) return current;
            return current.baseFee < cheapest.baseFee ? current : cheapest;
        }, methods[0] as ShippingMethodDTO);
    }
);

// Selector lấy phương thức vận chuyển nhanh nhất (dựa vào thời gian giao hàng)
export const selectFastestShippingMethod = createSelector(
    [getShippingMethods],
    (methods) => {
        if (!methods.length) return undefined;

        // Đây là logic đơn giản, bạn có thể cần logic phức tạp hơn để xác định phương thức nhanh nhất
        // Ví dụ: phân tích chuỗi thời gian ước tính "1-2 ngày" vs "2-3 ngày"
        return methods.find(method =>
            method.estimatedDeliveryTime &&
            method.estimatedDeliveryTime.includes('1')
        ) || methods[0];
    }
);

// Selector lấy phương thức vận chuyển mặc định (có thể là rẻ nhất hoặc được đánh dấu là mặc định)
export const selectDefaultShippingMethod = createSelector(
    [getShippingMethods],
    (methods) => {
        if (!methods.length) return undefined;

        // Lấy phương thức rẻ nhất làm mặc định
        return methods.reduce((cheapest, current) => {
            if (!cheapest) return current;
            return current.baseFee < cheapest.baseFee ? current : cheapest;
        }, methods[0] as ShippingMethodDTO);
    }
);

// Selector lấy ngưỡng miễn phí vận chuyển dạng hiển thị
export const selectFreeShippingThresholdDisplay = createSelector(
    [getFreeShippingThreshold],
    (threshold) => {
        return threshold.toLocaleString('vi-VN') + ' VND';
    }
);

// Selector lấy số tiền cần thêm để đạt ngưỡng miễn phí vận chuyển
export const selectAmountNeededForFreeShipping = createSelector(
    [getFreeShippingThreshold, getShippingEstimate],
    (threshold, estimate) => {
        if (!estimate || estimate.freeShippingEligible) return 0;
        return Math.max(0, threshold - (estimate.methodId ? threshold : 0));
    }
);

// Selector lấy thông báo về miễn phí vận chuyển
export const selectFreeShippingMessage = createSelector(
    [selectIsFreeShippingEligible, selectAmountNeededForFreeShipping, selectFreeShippingThresholdDisplay],
    (isEligible, amountNeeded, thresholdDisplay) => {
        if (isEligible) {
            return 'Đơn hàng của bạn được miễn phí vận chuyển!';
        } else if (amountNeeded > 0) {
            return `Thêm ${amountNeeded.toLocaleString('vi-VN')} VND để được miễn phí vận chuyển.`;
        } else {
            return `Miễn phí vận chuyển cho đơn hàng từ ${thresholdDisplay}.`;
        }
    }
);