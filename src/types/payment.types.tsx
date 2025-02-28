import {PaymentHistoryStatus, PaymentStatus} from "../enum/PaymentStatus.tsx";

/**
 * Interface for creating a new payment request
 */
export interface PaymentRequestDTO {
    userId: number;              // ID người dùng
    orderId: number;             // ID đơn hàng
    methodId: number;            // ID phương thức thanh toán
    amount: number;              // Số tiền thanh toán
    returnUrl?: string;          // URL để quay lại sau khi thanh toán (tùy chọn)
}

/**
 * Interface for payment response
 */
export interface PaymentResponseDTO {
    paymentId: number;           // ID thanh toán
    orderId: number;             // ID đơn hàng
    methodId: number;            // ID phương thức thanh toán
    amount: number;              // Số tiền
    transactionCode?: string;    // Mã giao dịch
    paymentStatus: PaymentStatus;// Trạng thái thanh toán
    paymentUrl?: string;         // URL thanh toán (nếu có)
    createdAt: string;           // Thời gian tạo
    updatedAt?: string;          // Thời gian cập nhật
}

/**
 * Interface for payment history
 */
export interface PaymentHistoryDTO {
    historyId: number;           // ID lịch sử
    paymentId: number;           // ID thanh toán
    status: PaymentHistoryStatus;// Trạng thái lịch sử thanh toán
    note?: string;               // Ghi chú
    createdAt: string;           // Thời gian tạo
}