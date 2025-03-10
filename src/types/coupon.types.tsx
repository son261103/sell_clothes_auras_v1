// Coupon Type Enum
export enum CouponType {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount'
}

// Basic Coupon DTO
export interface CouponDTO {
    code: string;
    type: CouponType;
    discountAmount: number;
}

// Coupon Response
export interface CouponResponseDTO {
    couponId: number;
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usedCount: number;
    status: boolean;
    description?: string;
    isExpired: boolean;
    isFullyUsed: boolean;
}

// Pagination response type
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Coupon Page type
export type CouponPage = PageResponse<CouponResponseDTO>;

// Coupon Create Request
export interface CouponCreateDTO {
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    status?: boolean;
    description?: string;
}

// Coupon Update Request
export interface CouponUpdateDTO {
    code?: string;
    type?: CouponType;
    value?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    status?: boolean;
    description?: string;
}

// Coupon Validation Response
export interface CouponValidationDTO {
    valid: boolean;
    message: string;
    discountAmount?: number;
    coupon?: CouponResponseDTO;
}

// Coupon Filters
export interface CouponFilters {
    code?: string;
    status?: boolean;
    isExpired?: boolean;
    startDate?: string;
    endDate?: string;
}

// Coupon Statistics
export interface CouponStatisticsDTO {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    fullyUsedCoupons: number;
}

// Status filter counts type
export interface StatusCounts {
    active: number;
    inactive: number;
    expired: number;
    fullyUsed: number;
}

// Type filter counts type
export interface TypeCounts {
    percentage: number;
    fixedAmount: number;
}

// Order with Coupon information
export interface OrderWithCouponDTO {
    subtotalBeforeDiscount: number;
    totalDiscount: number;
    coupons: CouponDTO[];
}