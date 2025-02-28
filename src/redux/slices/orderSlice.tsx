import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    OrderResponseDTO,
    OrderSummaryDTO,
    OrderItemDTO,
    PaymentResponseDTO,
    OrderStatus,
    PaginatedResponse,
    ShippingMethodDTO
} from '../../types/order.types';
import {PaymentStatus} from "../../enum/PaymentStatus.tsx";
import {ShippingEstimateDTO} from '../../types/shipping.types';

interface OrderState {
    currentOrder: OrderResponseDTO | null; // Đơn hàng hiện tại đang xem chi tiết
    orderList: OrderSummaryDTO[]; // Danh sách tóm tắt đơn hàng
    pagination: {
        totalPages: number;
        totalElements: number;
        currentPage: number;
        pageSize: number;
    };
    orderItems: OrderItemDTO[]; // Chi tiết các mục trong đơn hàng
    payment: PaymentResponseDTO | null; // Thanh toán liên quan đến đơn hàng
    shippingMethods: ShippingMethodDTO[]; // Danh sách phương thức vận chuyển
    shippingEstimate: ShippingEstimateDTO | null; // Ước tính phí vận chuyển
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
    filters: {
        status: OrderStatus | null; // Bộ lọc theo trạng thái
    }
}

const initialState: OrderState = {
    currentOrder: null,
    orderList: [],
    pagination: {
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        pageSize: 10
    },
    orderItems: [],
    payment: null,
    shippingMethods: [],
    shippingEstimate: null,
    loading: false,
    error: null,
    lastRequestTimestamp: 0,
    filters: {
        status: null
    }
};

// Hàm hỗ trợ để đảm bảo dữ liệu đơn hàng hợp lệ
const ensureOrderData = (order: OrderResponseDTO): OrderResponseDTO => {
    if (!order) return order;
    return {
        ...order,
        items: Array.isArray(order.items) ? order.items.map(item => {
            if (!item) return item;
            return {
                ...item,
                productName: item.productName || 'Unknown Product',
                imageUrl: item.imageUrl || undefined, // Sử dụng undefined thay vì null
            };
        }) : [],
        shippingFee: order.shippingFee || 0,
        shippingMethod: order.shippingMethod || undefined // Sử dụng undefined thay vì null
    };
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu đơn hàng
        fetchOrderStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy chi tiết đơn hàng
        fetchOrderSuccess(state, action: PayloadAction<OrderResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && action.payload.orderId) {
                    state.currentOrder = ensureOrderData(action.payload);
                    console.log('Order data stored in Redux:', state.currentOrder);
                } else {
                    console.warn('Received invalid order data:', action.payload);
                    state.error = 'Dữ liệu đơn hàng không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing order data:', error);
                state.error = 'Lỗi xử lý dữ liệu đơn hàng';
            }
        },

        // Thành công khi lấy danh sách đơn hàng
        fetchOrderListSuccess(state, action: PayloadAction<PaginatedResponse<OrderSummaryDTO>>) {
            state.loading = false;
            try {
                if (action.payload && Array.isArray(action.payload.content)) {
                    state.orderList = action.payload.content;
                    state.pagination = {
                        totalPages: action.payload.totalPages,
                        totalElements: action.payload.totalElements,
                        currentPage: action.payload.number,
                        pageSize: action.payload.size
                    };
                    console.log('Order list stored in Redux:', state.orderList);
                } else {
                    console.warn('Received invalid order list data:', action.payload);
                    state.error = 'Dữ liệu danh sách đơn hàng không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing order list data:', error);
                state.error = 'Lỗi xử lý dữ liệu danh sách đơn hàng';
            }
        },

        // Thành công khi lấy danh sách mục đơn hàng
        fetchOrderItemsSuccess(state, action: PayloadAction<OrderItemDTO[]>) {
            state.loading = false;
            state.orderItems = action.payload;
        },

        // Thành công khi lấy danh sách phương thức vận chuyển
        fetchShippingMethodsSuccess(state, action: PayloadAction<ShippingMethodDTO[]>) {
            state.loading = false;
            state.shippingMethods = action.payload;
            console.log('Shipping methods stored in Redux:', state.shippingMethods);
        },

        // Thành công khi ước tính phí vận chuyển
        fetchShippingEstimateSuccess(state, action: PayloadAction<ShippingEstimateDTO>) {
            state.loading = false;
            state.shippingEstimate = action.payload;
            console.log('Shipping estimate stored in Redux:', state.shippingEstimate);
        },

        // Thất bại khi tải dữ liệu
        fetchOrderFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Tạo đơn hàng mới thành công
        createOrderSuccess(state, action: PayloadAction<OrderResponseDTO>) {
            state.loading = false;
            state.currentOrder = ensureOrderData(action.payload);
            console.log('Created new order:', action.payload);
        },

        // Cập nhật bộ lọc cho danh sách đơn hàng
        updateOrderFilter(state, action: PayloadAction<{ status: OrderStatus | null }>) {
            state.filters.status = action.payload.status;
        },

        // Hủy đơn hàng thành công
        cancelOrderSuccess(state, action: PayloadAction<OrderResponseDTO>) {
            state.loading = false;
            state.currentOrder = ensureOrderData(action.payload);

            // Cập nhật trạng thái trong danh sách đơn hàng nếu có
            if (state.orderList.length > 0) {
                const orderIndex = state.orderList.findIndex(
                    order => order.orderId === action.payload.orderId
                );
                if (orderIndex >= 0) {
                    state.orderList[orderIndex].status = action.payload.status;
                }
            }
            console.log('Cancelled order:', action.payload.orderId);
        },

        // Cập nhật phương thức vận chuyển thành công
        updateShippingMethodSuccess(state, action: PayloadAction<OrderResponseDTO>) {
            state.loading = false;
            state.currentOrder = ensureOrderData(action.payload);

            // Cập nhật trong danh sách đơn hàng nếu có
            if (state.orderList.length > 0) {
                const orderIndex = state.orderList.findIndex(
                    order => order.orderId === action.payload.orderId
                );
                if (orderIndex >= 0) {
                    state.orderList[orderIndex].shippingFee = action.payload.shippingFee;
                    state.orderList[orderIndex].shippingMethodName =
                        action.payload.shippingMethod ? action.payload.shippingMethod.name : undefined;
                }
            }
            console.log('Updated shipping method for order:', action.payload.orderId);
        },

        // Lấy thông tin thanh toán thành công
        fetchPaymentSuccess(state, action: PayloadAction<PaymentResponseDTO>) {
            state.loading = false;
            state.payment = action.payload;
        },

        // Tạo thanh toán thành công
        createPaymentSuccess(state, action: PayloadAction<PaymentResponseDTO>) {
            state.loading = false;
            state.payment = action.payload;
            console.log('Created payment:', action.payload);
        },

        // Cập nhật trạng thái thanh toán
        updatePaymentStatusSuccess(state, action: PayloadAction<PaymentResponseDTO>) {
            state.loading = false;
            state.payment = action.payload;

            // Cập nhật trạng thái đơn hàng nếu thanh toán thành công
            if (action.payload.paymentStatus === PaymentStatus.COMPLETED && state.currentOrder) {
                // Đơn hàng đang xem chi tiết
                if (state.currentOrder.orderId === action.payload.orderId) {
                    state.currentOrder.status = OrderStatus.CONFIRMED;
                }

                // Trong danh sách đơn hàng
                const orderIndex = state.orderList.findIndex(
                    order => order.orderId === action.payload.orderId
                );
                if (orderIndex >= 0) {
                    state.orderList[orderIndex].status = OrderStatus.CONFIRMED;
                    state.orderList[orderIndex].paymentStatus = PaymentStatus.COMPLETED;
                }
            }
            console.log('Updated payment status:', action.payload.paymentStatus);
        },

        // Hủy thanh toán thành công
        cancelPaymentSuccess(state) {
            state.loading = false;
            if (state.payment) {
                state.payment.paymentStatus = PaymentStatus.FAILED;
            }
            console.log('Cancelled payment');
        },

        // Xóa lỗi
        clearOrderError(state) {
            state.error = null;
        },

        // Reset trạng thái đơn hàng hiện tại
        resetCurrentOrder(state) {
            state.currentOrder = null;
            state.orderItems = [];
            state.payment = null;
            state.shippingEstimate = null;
        },

        // Reset các trạng thái liên quan đến vận chuyển
        resetShippingState(state) {
            state.shippingEstimate = null;
        },

        // Reset toàn bộ trạng thái
        resetOrderState() {
            return initialState;
        }
    },
});

export const {
    fetchOrderStart,
    fetchOrderSuccess,
    fetchOrderListSuccess,
    fetchOrderItemsSuccess,
    fetchShippingMethodsSuccess,
    fetchShippingEstimateSuccess,
    fetchOrderFailure,
    createOrderSuccess,
    updateOrderFilter,
    cancelOrderSuccess,
    updateShippingMethodSuccess,
    fetchPaymentSuccess,
    createPaymentSuccess,
    updatePaymentStatusSuccess,
    cancelPaymentSuccess,
    clearOrderError,
    resetCurrentOrder,
    resetShippingState,
    resetOrderState
} = orderSlice.actions;

export default orderSlice.reducer;