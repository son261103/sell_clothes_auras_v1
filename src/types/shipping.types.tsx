/**
 * Interface representing a shipping method from the API
 */
export interface ShippingMethodDTO {
    id: number;
    name: string;
    estimatedDeliveryTime: string;
    baseFee: number;
    extraFeePerKg?: number;
}

/**
 * Interface for creating a new shipping method (admin only)
 */
export interface ShippingMethodCreateDTO {
    name: string;
    estimatedDeliveryTime?: string;
    baseFee: number;
    extraFeePerKg?: number;
}

/**
 * Interface for updating an existing shipping method (admin only)
 */
export interface ShippingMethodUpdateDTO {
    name?: string;
    estimatedDeliveryTime?: string;
    baseFee?: number;
    extraFeePerKg?: number;
}

/**
 * Interface for shipping cost estimation
 */
export interface ShippingEstimateDTO {
    methodId: number;
    methodName: string;
    shippingFee: number;
    estimatedDeliveryTime: string;
    freeShippingEligible: boolean;
    freeShippingThreshold: number;
}

/**
 * Interface for applying shipping to an order (admin only)
 */
export interface ApplyShippingDTO {
    orderId: number;
    shippingMethodId: number;
    totalWeight?: number;
}