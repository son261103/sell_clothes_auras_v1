import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {PaymentStatus} from "../../enum/PaymentStatus.tsx";


// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getPayments = (state: RootState) => state.payment.payments;
const getCurrentPayment = (state: RootState) => state.payment.currentPayment;
const getPaymentHistory = (state: RootState) => state.payment.paymentHistory;
const getPaymentLoadingState = (state: RootState) => state.payment.loading;
const getPaymentErrorState = (state: RootState) => state.payment.error;
const getLastPaymentRequestTimestamp = (state: RootState) => state.payment.lastRequestTimestamp;

// Selectors cơ bản
export const selectPayments = getPayments;
export const selectCurrentPayment = getCurrentPayment;
export const selectPaymentHistory = getPaymentHistory;
export const selectPaymentLoading = getPaymentLoadingState;
export const selectPaymentError = getPaymentErrorState;
export const selectLastPaymentRequestTimestamp = getLastPaymentRequestTimestamp;

// Selector lấy số lượng giao dịch thanh toán
export const selectPaymentCount = createSelector(
    [getPayments],
    (payments) => payments.length
);

// Selector kiểm tra xem có giao dịch nào không
export const selectHasPayments = createSelector(
    [getPayments],
    (payments) => payments.length > 0
);

// Selector lấy giao dịch theo ID
export const selectPaymentById = createSelector(
    [
        (state: RootState) => getPayments(state),
        (_: RootState, paymentId: number) => paymentId
    ],
    (payments, paymentId) => {
        return payments.find(payment => payment.paymentId === paymentId) || null;
    }
);

// Selector lấy giao dịch theo orderId
export const selectPaymentByOrderId = createSelector(
    [
        (state: RootState) => getPayments(state),
        (_: RootState, orderId: number) => orderId
    ],
    (payments, orderId) => {
        return payments.find(payment => payment.orderId === orderId) || null;
    }
);

// Selector lấy danh sách giao dịch đã sắp xếp theo ngày tạo (mới nhất trước)
export const selectSortedPayments = createSelector(
    [getPayments],
    (payments) => {
        return [...payments].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
);

// Selector lấy các giao dịch đang chờ xử lý
export const selectPendingPayments = createSelector(
    [getPayments],
    (payments) => {
        return payments.filter(payment => payment.paymentStatus === PaymentStatus.PENDING);
    }
);

// Selector lấy các giao dịch đã hoàn thành
export const selectCompletedPayments = createSelector(
    [getPayments],
    (payments) => {
        return payments.filter(payment => payment.paymentStatus === PaymentStatus.COMPLETED);
    }
);

// Selector lấy các giao dịch thất bại hoặc đã hủy
export const selectFailedPayments = createSelector(
    [getPayments],
    (payments) => {
        return payments.filter(payment =>
            payment.paymentStatus === PaymentStatus.FAILED ||
            payment.paymentStatus === PaymentStatus.REFUNDED
        );
    }
);

// Selector kiểm tra trạng thái giao dịch hiện tại
export const selectCurrentPaymentStatus = createSelector(
    [getCurrentPayment],
    (currentPayment) => {
        return currentPayment ? currentPayment.paymentStatus : null;
    }
);

// Selector lấy lịch sử thanh toán theo paymentId
export const selectHistoryByPaymentId = createSelector(
    [
        (state: RootState) => getPaymentHistory(state),
        (_: RootState, paymentId: number) => paymentId
    ],
    (history, paymentId) => {
        return history.filter(item => item.paymentId === paymentId);
    }
);

// Selector lấy tổng số tiền đã thanh toán thành công
export const selectTotalCompletedAmount = createSelector(
    [getPayments],
    (payments) => {
        return payments
            .filter(payment => payment.paymentStatus === PaymentStatus.COMPLETED)
            .reduce((total, payment) => total + payment.amount, 0);
    }
);

// Selector kiểm tra giao dịch có URL thanh toán không
export const selectPaymentHasUrl = createSelector(
    [
        (state: RootState) => getPayments(state),
        (_: RootState, paymentId: number) => paymentId
    ],
    (payments, paymentId) => {
        const payment = payments.find(p => p.paymentId === paymentId);
        return payment ? Boolean(payment.paymentUrl) : false;
    }
);

// Selector format thông tin giao dịch
export const selectFormattedPaymentInfo = createSelector(
    [
        (state: RootState) => getPayments(state),
        (_: RootState, paymentId: number) => paymentId
    ],
    (payments, paymentId) => {
        const payment = payments.find(p => p.paymentId === paymentId);
        if (!payment) return '';

        return `Mã giao dịch: ${payment.transactionCode || 'N/A'} - Số tiền: ${payment.amount} - Trạng thái: ${
            payment.paymentStatus
        } - Ngày tạo: ${new Date(payment.createdAt).toLocaleString()}`;
    }
);