import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {OrderStatus} from '../../types/order.types';
import {PaymentStatus} from '../../enum/PaymentStatus';


// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getCurrentOrder = (state: RootState) => state.order.currentOrder;
const getOrderList = (state: RootState) => state.order.orderList;
const getOrderPagination = (state: RootState) => state.order.pagination;
const getOrderItems = (state: RootState) => state.order.orderItems;
const getPayment = (state: RootState) => state.order.payment;
const getShippingMethods = (state: RootState) => state.order.shippingMethods;
const getShippingEstimate = (state: RootState) => state.order.shippingEstimate;
const getOrderLoadingState = (state: RootState) => state.order.loading;
const getOrderErrorState = (state: RootState) => state.order.error;
const getOrderFilters = (state: RootState) => state.order.filters;
const getLastOrderRequestTimestamp = (state: RootState) => state.order.lastRequestTimestamp;

// Selectors cơ bản
export const selectCurrentOrder = getCurrentOrder;
export const selectOrderList = getOrderList;
export const selectOrderPagination = getOrderPagination;
export const selectOrderItems = getOrderItems;
export const selectPayment = getPayment;
export const selectShippingMethods = getShippingMethods;
export const selectShippingEstimate = getShippingEstimate;
export const selectOrderLoading = getOrderLoadingState;
export const selectOrderError = getOrderErrorState;
export const selectOrderFilters = getOrderFilters;
export const selectLastOrderRequestTimestamp = getLastOrderRequestTimestamp;

// Selector lấy số lượng mục trong đơn hàng hiện tại
export const selectCurrentOrderItemCount = createSelector(
    [getCurrentOrder],
    (order) => {
        if (!order || !Array.isArray(order.items)) return 0;
        return order.items.reduce((total, item) => {
            if (!item) return total;
            return total + (item.quantity || 0);
        }, 0);
    }
);

// Selector lấy tổng giá trị đơn hàng hiện tại
export const selectCurrentOrderTotal = createSelector(
    [getCurrentOrder],
    (order) => {
        if (!order) return 0;
        return order.totalAmount || 0;
    }
);

// Selector lấy phí vận chuyển đơn hàng hiện tại
export const selectCurrentOrderShippingFee = createSelector(
    [getCurrentOrder],
    (order) => {
        if (!order) return 0;
        return order.shippingFee || 0;
    }
);

// Selector lấy phương thức vận chuyển đơn hàng hiện tại
export const selectCurrentOrderShippingMethod = createSelector(
    [getCurrentOrder],
    (order) => {
        if (!order) return null;
        return order.shippingMethod || null;
    }
);

// Selector kiểm tra đơn hàng có đủ điều kiện miễn phí vận chuyển không
export const selectIsFreeShippingEligible = createSelector(
    [getShippingEstimate],
    (estimate) => {
        if (!estimate) return false;
        return estimate.freeShippingEligible;
    }
);

// Selector lấy số tiền cần thêm để đủ điều kiện miễn phí vận chuyển
export const selectAmountForFreeShipping = createSelector(
    [getCurrentOrder, getShippingEstimate],
    (order, estimate) => {
        if (!order || !estimate) return 0;
        if (estimate.freeShippingEligible) return 0;

        const currentAmount = order.totalAmount - (order.shippingFee || 0);
        return Math.max(0, estimate.freeShippingThreshold - currentAmount);
    }
);

// Selector kiểm tra đơn hàng đang được thanh toán
export const selectIsCurrentOrderPaid = createSelector(
    [getCurrentOrder, getPayment],
    (order, payment) => {
        if (!order || !payment) return false;
        return payment.paymentStatus === PaymentStatus.COMPLETED;
    }
);

// Selector kiểm tra đơn hàng có thể hủy
export const selectCanCancelOrder = createSelector(
    [getCurrentOrder],
    (order) => {
        if (!order) return false;
        return order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
    }
);

// Selector lấy đơn hàng theo ID
export const selectOrderById = createSelector(
    [
        (state: RootState) => getOrderList(state),
        (_: RootState, orderId: number) => orderId
    ],
    (orders, orderId) => {
        return orders.find(order => order.orderId === orderId) || null;
    }
);

// Selector lấy phương thức vận chuyển theo ID
export const selectShippingMethodById = createSelector(
    [
        (state: RootState) => getShippingMethods(state),
        (_: RootState, methodId: number) => methodId
    ],
    (methods, methodId) => {
        return methods.find(method => method.id === methodId) || null;
    }
);

// Selector lấy danh sách phương thức vận chuyển có thông tin thêm
export const selectShippingMethodsWithDetails = createSelector(
    [getShippingMethods],
    (methods) => {
        return methods.map(method => ({
            ...method,
            displayName: `${method.name} (${method.estimatedDeliveryTime})`,
            priceDisplay: method.baseFee === 0 ? 'Miễn phí' : `${method.baseFee.toLocaleString('vi-VN')} VND`
        }));
    }
);

// Selector lấy danh sách đơn hàng theo trạng thái
export const selectOrdersByStatus = createSelector(
    [
        (state: RootState) => getOrderList(state),
        (_: RootState, status: OrderStatus) => status
    ],
    (orders, status) => {
        return orders.filter(order => order.status === status);
    }
);

// Selector đếm số lượng đơn hàng theo trạng thái
export const selectOrderCountByStatus = createSelector(
    [getOrderList],
    (orders) => {
        const counts = {
            [OrderStatus.PENDING]: 0,
            [OrderStatus.CONFIRMED]: 0,
            [OrderStatus.PROCESSING]: 0,
            [OrderStatus.SHIPPING]: 0,
            [OrderStatus.COMPLETED]: 0,
            [OrderStatus.CANCELLED]: 0,
            total: 0
        };

        orders.forEach(order => {
            if (order.status in counts) {
                counts[order.status] += 1;
            }
            counts.total += 1;
        });

        return counts;
    }
);

// Selector lấy thông tin thanh toán của đơn hàng hiện tại
export const selectCurrentOrderPayment = createSelector(
    [getCurrentOrder, getPayment],
    (order, payment) => {
        if (!order || !payment) return null;
        return payment.orderId === order.orderId ? payment : null;
    }
);

// Selector lấy URL thanh toán của đơn hàng hiện tại
export const selectCurrentOrderPaymentUrl = createSelector(
    [getPayment],
    (payment) => {
        if (!payment) return null;
        return payment.paymentUrl || null;
    }
);

// Selector kiểm tra thanh toán đang chờ xử lý
export const selectIsPaymentPending = createSelector(
    [getPayment],
    (payment) => {
        if (!payment) return false;
        return payment.paymentStatus === PaymentStatus.PENDING;
    }
);

// Selector kiểm tra thanh toán đã hoàn tất
export const selectIsPaymentCompleted = createSelector(
    [getPayment],
    (payment) => {
        if (!payment) return false;
        return payment.paymentStatus === PaymentStatus.COMPLETED;
    }
);

// Selector kiểm tra thanh toán thất bại
export const selectIsPaymentFailed = createSelector(
    [getPayment],
    (payment) => {
        if (!payment) return false;
        return payment.paymentStatus === PaymentStatus.FAILED;
    }
);

// Selector lấy số lượng đơn hàng đang chờ xử lý
export const selectPendingOrderCount = createSelector(
    [getOrderList],
    (orders) => {
        return orders.filter(order => order.status === OrderStatus.PENDING).length;
    }
);

// Selector lấy các đơn hàng gần đây
export const selectRecentOrders = createSelector(
    [getOrderList],
    (orders) => {
        // Sắp xếp theo thời gian tạo, lấy 5 đơn hàng gần nhất
        return [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }
);

// Selector lấy trạng thái đơn hàng dưới dạng văn bản hiển thị
export const selectOrderStatusText = createSelector(
    [
        (_: RootState, status: OrderStatus) => status
    ],
    (status) => {
        const statusTexts = {
            [OrderStatus.PENDING]: 'Chờ xác nhận',
            [OrderStatus.CONFIRMED]: 'Đã xác nhận',
            [OrderStatus.PROCESSING]: 'Đang xử lý',
            [OrderStatus.SHIPPING]: 'Đang giao hàng',
            [OrderStatus.COMPLETED]: 'Hoàn thành',
            [OrderStatus.CANCELLED]: 'Đã hủy'
        };

        return statusTexts[status] || 'Không xác định';
    }
);

// Selector lấy trạng thái thanh toán dưới dạng văn bản hiển thị
export const selectPaymentStatusText = createSelector(
    [
        (_: RootState, status: PaymentStatus) => status
    ],
    (status) => {
        const statusTexts = {
            [PaymentStatus.PENDING]: 'Chờ thanh toán',
            [PaymentStatus.COMPLETED]: 'Đã hoàn thành',
            [PaymentStatus.FAILED]: 'Thất bại',
            [PaymentStatus.REFUNDED]: 'Đã hoàn tiền'
        };

        return statusTexts[status] || 'Không xác định';
    }
);