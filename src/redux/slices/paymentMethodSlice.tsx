import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentMethodDTO } from '../../types/payment.method.types';

interface PaymentMethodState {
    paymentMethods: PaymentMethodDTO[]; // Danh sách phương thức thanh toán
    currentMethod: PaymentMethodDTO | null; // Phương thức hiện tại đang xem
    supportedBanks: string[]; // Danh sách ngân hàng hỗ trợ (cho VNPay)
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: PaymentMethodState = {
    paymentMethods: [],
    currentMethod: null,
    supportedBanks: [],
    loading: false,
    error: null,
    lastRequestTimestamp: 0
};

// Hàm hỗ trợ để đảm bảo dữ liệu phương thức thanh toán hợp lệ
const ensurePaymentMethodData = (method: PaymentMethodDTO): PaymentMethodDTO => {
    if (!method) return method;
    return {
        ...method,
        description: method.description || '',
        status: method.status !== undefined ? method.status : true,
        createdAt: method.createdAt || new Date().toISOString(),
        updatedAt: method.updatedAt || undefined
    };
};

const paymentMethodSlice = createSlice({
    name: 'paymentMethod',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu phương thức thanh toán
        fetchPaymentMethodStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy danh sách phương thức thanh toán
        fetchPaymentMethodsSuccess(state, action: PayloadAction<PaymentMethodDTO[]>) {
            state.loading = false;
            try {
                if (Array.isArray(action.payload)) {
                    state.paymentMethods = action.payload.map(method => ensurePaymentMethodData(method));
                    console.log('Payment methods stored in Redux:', state.paymentMethods);
                } else {
                    console.warn('Received invalid payment method list data:', action.payload);
                    state.error = 'Dữ liệu danh sách phương thức thanh toán không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing payment method list data:', error);
                state.error = 'Lỗi xử lý dữ liệu danh sách phương thức thanh toán';
            }
        },

        // Thành công khi lấy chi tiết phương thức thanh toán
        fetchPaymentMethodByIdSuccess(state, action: PayloadAction<PaymentMethodDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.methodId) {
                    state.currentMethod = ensurePaymentMethodData(action.payload);
                    console.log('Payment method data stored in Redux:', state.currentMethod);
                } else {
                    console.warn('Received invalid payment method data:', action.payload);
                    state.error = 'Dữ liệu phương thức thanh toán không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing payment method data:', error);
                state.error = 'Lỗi xử lý dữ liệu phương thức thanh toán';
            }
        },

        // Thành công khi lấy danh sách ngân hàng hỗ trợ
        fetchSupportedBanksSuccess(state, action: PayloadAction<string[]>) {
            state.loading = false;
            try {
                if (Array.isArray(action.payload)) {
                    state.supportedBanks = action.payload;
                    console.log('Supported banks stored in Redux:', state.supportedBanks);
                } else {
                    console.warn('Received invalid supported banks data:', action.payload);
                    state.error = 'Dữ liệu danh sách ngân hàng không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing supported banks data:', error);
                state.error = 'Lỗi xử lý dữ liệu danh sách ngân hàng';
            }
        },

        // Thất bại khi tải dữ liệu
        fetchPaymentMethodFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Xóa lỗi
        clearPaymentMethodError(state) {
            state.error = null;
        },

        // Reset trạng thái phương thức thanh toán hiện tại
        resetCurrentMethod(state) {
            state.currentMethod = null;
            state.supportedBanks = [];
        },

        // Reset toàn bộ trạng thái
        resetPaymentMethodState() {
            return initialState;
        }
    },
});

export const {
    fetchPaymentMethodStart,
    fetchPaymentMethodsSuccess,
    fetchPaymentMethodByIdSuccess,
    fetchSupportedBanksSuccess,
    fetchPaymentMethodFailure,
    clearPaymentMethodError,
    resetCurrentMethod,
    resetPaymentMethodState
} = paymentMethodSlice.actions;

export default paymentMethodSlice.reducer;