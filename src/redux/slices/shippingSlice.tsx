import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ShippingMethodDTO,
    ShippingEstimateDTO,
} from '../../types/shipping.types';
import { ApiResponse } from '../../types';

interface ShippingState {
    shippingMethods: ShippingMethodDTO[]; // Danh sách phương thức vận chuyển
    currentShippingMethod: ShippingMethodDTO | undefined; // Phương thức vận chuyển hiện tại đang xem/chỉnh sửa
    selectedShippingMethod: ShippingMethodDTO | undefined; // Phương thức vận chuyển đã chọn cho đơn hàng
    shippingEstimate: ShippingEstimateDTO | undefined; // Ước tính phí vận chuyển
    freeShippingThreshold: number; // Ngưỡng miễn phí vận chuyển
    loading: boolean; // Trạng thái tải
    error: string | undefined; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: ShippingState = {
    shippingMethods: [],
    currentShippingMethod: undefined,
    selectedShippingMethod: undefined,
    shippingEstimate: undefined,
    freeShippingThreshold: 500000, // Mặc định 500.000 VND
    loading: false,
    error: undefined,
    lastRequestTimestamp: 0
};

const shippingSlice = createSlice({
    name: 'shipping',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu vận chuyển
        fetchShippingStart(state) {
            state.loading = true;
            state.error = undefined;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy danh sách phương thức vận chuyển
        fetchShippingMethodsSuccess(state, action: PayloadAction<ShippingMethodDTO[]>) {
            state.loading = false;
            state.shippingMethods = action.payload;
            console.log('Shipping methods stored in Redux:', state.shippingMethods);
        },

        // Thành công khi lấy chi tiết phương thức vận chuyển
        fetchShippingMethodByIdSuccess(state, action: PayloadAction<ShippingMethodDTO>) {
            state.loading = false;
            state.currentShippingMethod = action.payload;
            console.log('Shipping method stored in Redux:', state.currentShippingMethod);
        },

        // Thành công khi ước tính phí vận chuyển
        fetchShippingEstimateSuccess(state, action: PayloadAction<ShippingEstimateDTO>) {
            state.loading = false;
            state.shippingEstimate = action.payload;

            // Cập nhật phương thức vận chuyển đã chọn nếu có
            if (action.payload.methodId) {
                state.selectedShippingMethod = state.shippingMethods.find(
                    method => method.id === action.payload.methodId
                );
            }

            // Cập nhật ngưỡng miễn phí vận chuyển nếu có
            if (action.payload.freeShippingThreshold) {
                state.freeShippingThreshold = action.payload.freeShippingThreshold;
            }

            console.log('Shipping estimate stored in Redux:', state.shippingEstimate);
        },

        // Tạo phương thức vận chuyển mới thành công (admin)
        createShippingMethodSuccess(state, action: PayloadAction<ShippingMethodDTO>) {
            state.loading = false;
            state.shippingMethods = [...state.shippingMethods, action.payload];
            state.currentShippingMethod = action.payload;
            console.log('Created new shipping method:', action.payload);
        },

        // Cập nhật phương thức vận chuyển thành công (admin)
        updateShippingMethodSuccess(state, action: PayloadAction<ShippingMethodDTO>) {
            state.loading = false;

            // Cập nhật trong danh sách
            state.shippingMethods = state.shippingMethods.map(method =>
                method.id === action.payload.id ? action.payload : method
            );

            // Cập nhật phương thức hiện tại
            if (state.currentShippingMethod && state.currentShippingMethod.id === action.payload.id) {
                state.currentShippingMethod = action.payload;
            }

            // Cập nhật phương thức đã chọn nếu cần
            if (state.selectedShippingMethod && state.selectedShippingMethod.id === action.payload.id) {
                state.selectedShippingMethod = action.payload;
            }

            console.log('Updated shipping method:', action.payload);
        },

        // Xóa phương thức vận chuyển thành công (admin)
        deleteShippingMethodSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            const methodId = action.payload;

            // Xóa khỏi danh sách
            state.shippingMethods = state.shippingMethods.filter(method => method.id !== methodId);

            // Reset phương thức hiện tại nếu cần
            if (state.currentShippingMethod && state.currentShippingMethod.id === methodId) {
                state.currentShippingMethod = undefined;
            }

            // Reset phương thức đã chọn nếu cần
            if (state.selectedShippingMethod && state.selectedShippingMethod.id === methodId) {
                state.selectedShippingMethod = undefined;
            }

            console.log('Deleted shipping method:', methodId);
        },

        // Chọn phương thức vận chuyển
        selectShippingMethod(state, action: PayloadAction<number>) {
            const methodId = action.payload;
            state.selectedShippingMethod = state.shippingMethods.find(method => method.id === methodId);
            console.log('Selected shipping method:', state.selectedShippingMethod);
        },

        // Áp dụng phương thức vận chuyển thành công
        applyShippingMethodSuccess(state, action: PayloadAction<ApiResponse>) {
            state.loading = false;
            console.log('Applied shipping method:', action.payload);
        },

        // Kiểm tra điều kiện miễn phí vận chuyển thành công
        checkFreeShippingEligibilitySuccess(state, action: PayloadAction<ApiResponse>) {
            state.loading = false;
            // Có thể lưu trữ thông tin bổ sung nếu cần
            console.log('Free shipping eligibility check:', action.payload);
        },

        // Thất bại khi tải dữ liệu
        fetchShippingFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Xóa lỗi
        clearShippingError(state) {
            state.error = undefined;
        },

        // Reset trạng thái phương thức vận chuyển hiện tại
        resetCurrentShippingMethod(state) {
            state.currentShippingMethod = undefined;
        },

        // Reset trạng thái ước tính vận chuyển
        resetShippingEstimate(state) {
            state.shippingEstimate = undefined;
        },

        // Reset trạng thái phương thức vận chuyển đã chọn
        resetSelectedShippingMethod(state) {
            state.selectedShippingMethod = undefined;
        },

        // Reset toàn bộ trạng thái
        resetShippingState() {
            return initialState;
        }
    },
});

export const {
    fetchShippingStart,
    fetchShippingMethodsSuccess,
    fetchShippingMethodByIdSuccess,
    fetchShippingEstimateSuccess,
    createShippingMethodSuccess,
    updateShippingMethodSuccess,
    deleteShippingMethodSuccess,
    selectShippingMethod,
    applyShippingMethodSuccess,
    checkFreeShippingEligibilitySuccess,
    fetchShippingFailure,
    clearShippingError,
    resetCurrentShippingMethod,
    resetShippingEstimate,
    resetSelectedShippingMethod,
    resetShippingState
} = shippingSlice.actions;

export default shippingSlice.reducer;