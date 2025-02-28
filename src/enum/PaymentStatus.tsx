/**
 * Enum for payment status
 */
export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

/**
 * Enum for payment history status
 * Giả định các giá trị dựa trên thông lệ, vì file Enums.Status.PaymentHistoryStatus không được cung cấp chi tiết
 */
export enum PaymentHistoryStatus {
    INITIATED = "INITIATED",      // Khởi tạo
    PROCESSING = "PROCESSING",    // Đang xử lý
    SUCCEEDED = "SUCCEEDED",      // Thành công
    FAILED = "FAILED",            // Thất bại
    CANCELLED = "CANCELLED",      // Đã hủy
}