import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentResponseDTO, PaymentHistoryDTO } from '../../types/payment.types';
import {PaymentStatus} from "../../enum/PaymentStatus.tsx";


interface PaymentState {
    payments: PaymentResponseDTO[]; // Danh sách các giao dịch thanh toán
    currentPayment: PaymentResponseDTO | null; // Giao dịch hiện tại đang xem
    paymentHistory: PaymentHistoryDTO[]; // Lịch sử của giao dịch hiện tại
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: PaymentState = {
    payments: [],
    currentPayment: null,
    paymentHistory: [],
    loading: false,
    error: null,
    lastRequestTimestamp: 0
};

// Hàm hỗ trợ để đảm bảo dữ liệu thanh toán hợp lệ
const ensurePaymentData = (payment: PaymentResponseDTO): PaymentResponseDTO => {
    if (!payment) return payment;
    return {
        ...payment,
        paymentStatus: payment.paymentStatus || PaymentStatus.PENDING,
        transactionCode: payment.transactionCode || '',
        paymentUrl: payment.paymentUrl || undefined,
        createdAt: payment.createdAt || new Date().toISOString(),
        updatedAt: payment.updatedAt || undefined
    };
};

// Hàm hỗ trợ để đảm bảo dữ liệu lịch sử thanh toán hợp lệ
const ensurePaymentHistoryData = (history: PaymentHistoryDTO): PaymentHistoryDTO => {
    if (!history) return history;
    return {
        ...history,
        note: history.note || '',
        createdAt: history.createdAt || new Date().toISOString()
    };
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu thanh toán
        fetchPaymentStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy danh sách thanh toán
        fetchPaymentsSuccess(state, action: PayloadAction<PaymentResponseDTO[]>) {
            state.loading = false;
            try {
                if (Array.isArray(action.payload)) {
                    state.payments = action.payload.map(payment => ensurePaymentData(payment));
                    console.log('Payments stored in Redux:', state.payments);
                } else {
                    console.warn('Received invalid payment list data:', action.payload);
                    state.error = 'Dữ liệu danh sách thanh toán không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing payment list data:', error);
                state.error = 'Lỗi xử lý dữ liệu danh sách thanh toán';
            }
        },

        // Thành công khi lấy chi tiết thanh toán
        fetchPaymentByIdSuccess(state, action: PayloadAction<PaymentResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.paymentId) {
                    state.currentPayment = ensurePaymentData(action.payload);
                    console.log('Payment data stored in Redux:', state.currentPayment);
                } else {
                    console.warn('Received invalid payment data:', action.payload);
                    state.error = 'Dữ liệu thanh toán không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing payment data:', error);
                state.error = 'Lỗi xử lý dữ liệu thanh toán';
            }
        },

        // Thành công khi tạo thanh toán
        createPaymentSuccess(state, action: PayloadAction<PaymentResponseDTO>) {
            state.loading = false;
            try {
                const newPayment = ensurePaymentData(action.payload);
                state.payments = [...state.payments, newPayment];
                state.currentPayment = newPayment;
                console.log('Created new payment:', newPayment);
            } catch (error) {
                console.error('Error processing new payment data:', error);
                state.error = 'Lỗi xử lý dữ liệu thanh toán mới';
            }
        },

        // Thành công khi hủy thanh toán
        cancelPaymentSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            const paymentId = action.payload;
            state.payments = state.payments.map(payment =>
                payment.paymentId === paymentId
                    ? { ...payment, paymentStatus: PaymentStatus.FAILED }
                    : payment
            );
            if (state.currentPayment && state.currentPayment.paymentId === paymentId) {
                state.currentPayment = { ...state.currentPayment, paymentStatus: PaymentStatus.FAILED };
            }
            console.log('Canceled payment:', paymentId);
        },

        // Thành công khi lấy lịch sử thanh toán
        fetchPaymentHistorySuccess(state, action: PayloadAction<PaymentHistoryDTO[]>) {
            state.loading = false;
            try {
                if (Array.isArray(action.payload)) {
                    state.paymentHistory = action.payload.map(history => ensurePaymentHistoryData(history));
                    console.log('Payment history stored in Redux:', state.paymentHistory);
                } else {
                    console.warn('Received invalid payment history data:', action.payload);
                    state.error = 'Dữ liệu lịch sử thanh toán không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing payment history data:', error);
                state.error = 'Lỗi xử lý dữ liệu lịch sử thanh toán';
            }
        },

        // Thất bại khi tải dữ liệu
        fetchPaymentFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Xóa lỗi
        clearPaymentError(state) {
            state.error = null;
        },

        // Reset trạng thái thanh toán hiện tại
        resetCurrentPayment(state) {
            state.currentPayment = null;
            state.paymentHistory = [];
        },

        // Reset toàn bộ trạng thái
        resetPaymentState() {
            return initialState;
        }
    },
});

export const {
    fetchPaymentStart,
    fetchPaymentsSuccess,
    fetchPaymentByIdSuccess,
    createPaymentSuccess,
    cancelPaymentSuccess,
    fetchPaymentHistorySuccess,
    fetchPaymentFailure,
    clearPaymentError,
    resetCurrentPayment,
    resetPaymentState
} = paymentSlice.actions;

export default paymentSlice.reducer;