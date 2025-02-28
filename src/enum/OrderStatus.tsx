import {OrderStatus} from "../types/order.types.tsx";

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Chờ xác nhận',
    [OrderStatus.CONFIRMED]: 'Đã xác nhận',
    [OrderStatus.SHIPPING]: 'Đang giao hàng',
    [OrderStatus.COMPLETED]: 'Đã hoàn thành',
    [OrderStatus.CANCELLED]: 'Đã hủy',
    [OrderStatus.PROCESSING]: 'Đang xuất kho'
};