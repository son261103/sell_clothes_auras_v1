import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getPaymentMethods = (state: RootState) => state.paymentMethod.paymentMethods;
const getCurrentMethod = (state: RootState) => state.paymentMethod.currentMethod;
const getSupportedBanks = (state: RootState) => state.paymentMethod.supportedBanks;
const getPaymentMethodLoadingState = (state: RootState) => state.paymentMethod.loading;
const getPaymentMethodErrorState = (state: RootState) => state.paymentMethod.error;
const getLastPaymentMethodRequestTimestamp = (state: RootState) => state.paymentMethod.lastRequestTimestamp;

// Selectors cơ bản
export const selectPaymentMethods = getPaymentMethods;
export const selectCurrentPaymentMethod = getCurrentMethod;
export const selectSupportedBanks = getSupportedBanks;
export const selectPaymentMethodLoading = getPaymentMethodLoadingState;
export const selectPaymentMethodError = getPaymentMethodErrorState;
export const selectLastPaymentMethodRequestTimestamp = getLastPaymentMethodRequestTimestamp;

// Selector lấy số lượng phương thức thanh toán
export const selectPaymentMethodCount = createSelector(
    [getPaymentMethods],
    (paymentMethods) => paymentMethods.length
);

// Selector kiểm tra xem có phương thức thanh toán nào không
export const selectHasPaymentMethods = createSelector(
    [getPaymentMethods],
    (paymentMethods) => paymentMethods.length > 0
);

// Selector lấy phương thức thanh toán theo ID
export const selectPaymentMethodById = createSelector(
    [
        (state: RootState) => getPaymentMethods(state),
        (_: RootState, methodId: number) => methodId
    ],
    (paymentMethods, methodId) => {
        return paymentMethods.find(method => method.methodId === methodId) || null;
    }
);

// Selector lấy phương thức thanh toán theo mã (code)
export const selectPaymentMethodByCode = createSelector(
    [
        (state: RootState) => getPaymentMethods(state),
        (_: RootState, code: string) => code
    ],
    (paymentMethods, code) => {
        return paymentMethods.find(method => method.code.toUpperCase() === code.toUpperCase()) || null;
    }
);

// Selector lấy danh sách phương thức thanh toán đang hoạt động
export const selectActivePaymentMethods = createSelector(
    [getPaymentMethods],
    (paymentMethods) => {
        return paymentMethods.filter(method => method.status);
    }
);

// Selector lấy danh sách phương thức thanh toán không hoạt động (bảo trì)
export const selectInactivePaymentMethods = createSelector(
    [getPaymentMethods],
    (paymentMethods) => {
        return paymentMethods.filter(method => !method.status);
    }
);

// Selector kiểm tra phương thức hiện tại có hoạt động không
export const selectCurrentMethodIsActive = createSelector(
    [getCurrentMethod],
    (currentMethod) => {
        return currentMethod ? currentMethod.status : false;
    }
);

// Selector kiểm tra phương thức có hỗ trợ ngân hàng không
export const selectMethodSupportsBanks = createSelector(
    [
        (state: RootState) => getPaymentMethods(state),
        (_: RootState, methodId: number) => methodId
    ],
    (paymentMethods, methodId) => {
        const method = paymentMethods.find(m => m.methodId === methodId);
        return method ? method.code.toUpperCase() === 'VNPAY' : false;
    }
);

// Selector lấy danh sách phương thức thanh toán đã sắp xếp theo tên
export const selectSortedPaymentMethods = createSelector(
    [getPaymentMethods],
    (paymentMethods) => {
        return [...paymentMethods].sort((a, b) => a.name.localeCompare(b.name));
    }
);

// Selector format thông tin phương thức thanh toán
export const selectFormattedPaymentMethod = createSelector(
    [
        (state: RootState) => getPaymentMethods(state),
        (_: RootState, methodId: number) => methodId
    ],
    (paymentMethods, methodId) => {
        const method = paymentMethods.find(m => m.methodId === methodId);
        if (!method) return '';

        return `${method.name} (${method.code}) - Trạng thái: ${
            method.status ? 'Hoạt động' : 'Bảo trì'
        }${method.description ? ` - ${method.description}` : ''}`;
    }
);