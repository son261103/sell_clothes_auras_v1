// PaymentStatus.ts
export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export const PAYMENT_STATUS_DESCRIPTIONS: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Chờ thanh toán',
    [PaymentStatus.COMPLETED]: 'Đã hoàn thành',
    [PaymentStatus.FAILED]: 'Thất bại',
    [PaymentStatus.REFUNDED]: 'Đã hoàn tiền'
};