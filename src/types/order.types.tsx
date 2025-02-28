export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PROCESSING = 'PROCESSING'
}

export interface OrderStatusDescription {
    status: OrderStatus;
    description: string;
}

export interface CreateOrderDTO {
    addressId: number;
    selectedVariantIds?: number[]; // Optional: only specific variants
    shippingMethodId?: number;
    totalWeight?: number;
}

export interface CancelOrderDTO {
    reason: string;
}

export interface OrderItemDTO {
    orderItemId: number;
    variantId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    color?: string;
    size?: string;
    sku?: string;
    imageUrl?: string;
}

export interface OrderResponseDTO {
    orderId: number;
    userId: number;
    status: OrderStatus;
    statusDescription: string;
    totalAmount: number;
    shippingFee: number;
    shippingMethod?: ShippingMethodDTO;
    items: OrderItemDTO[];
    address: AddressResponseDTO;
    payment?: PaymentResponseDTO;
    createdAt: string;
    updatedAt: string;
    canCancel?: boolean;
}

export interface OrderSummaryDTO {
    orderId: number;
    status: OrderStatus;
    statusDescription: string;
    totalAmount: number;
    shippingFee?: number;
    shippingMethodName?: string;
    totalItems: number;
    createdAt: string;
    paymentStatus?: string;
}

export interface BestsellingProductDTO {
    productId: number;
    productName: string;
    productImage: string;
    totalQuantitySold: number;
}

// Address related types
export interface AddressResponseDTO {
    addressId: number;
    userId: number;
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    phoneNumber: string;
    isDefault: boolean;
    fullAddress?: string;
}

// Payment related types
export interface PaymentResponseDTO {
    paymentId: number;
    orderId: number;
    paymentMethodName: string;
    paymentMethodCode: string;
    amount: number;
    transactionCode?: string;
    paymentStatus: string;
    paymentUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMethodDTO {
    methodId: number;
    name: string;
    code: string;
    description: string;
    status: boolean;
}

export interface PaymentRequestDTO {
    methodId: number;
    amount: number;
    orderId: number;
    bankCode?: string;
}

export interface UpdateOrderStatusDTO {
    status: OrderStatus;
}

export interface OrderStatisticsDTO {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

// Shipping method related types
export interface ShippingMethodDTO {
    id: number;
    name: string;
    estimatedDeliveryTime: string;
    baseFee: number;
    extraFeePerKg?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}