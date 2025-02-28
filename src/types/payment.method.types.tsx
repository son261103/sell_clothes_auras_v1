/**
 * Interface for payment method
 */
export interface PaymentMethodDTO {
    methodId: number;            // ID phương thức thanh toán
    name: string;                // Tên phương thức
    code: string;                // Mã phương thức (ví dụ: VNPAY)
    description?: string;        // Mô tả
    status: boolean;             // Trạng thái hoạt động
    createdAt: string;           // Thời gian tạo
    updatedAt?: string;          // Thời gian cập nhật
}