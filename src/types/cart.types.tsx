export interface CartResponseDTO {
    cartId: number;
    userId?: number | null;
    sessionId?: string | null;
    items: CartItemDTO[];
    createdAt: string;
    updatedAt: string;
}

// DTO cho một mục trong giỏ hàng
export interface CartItemDTO {
    itemId: number; // ID của mục trong giỏ hàng
    cartId: number;
    variantId: number; // ID của biến thể
    productId: number; // ID của sản phẩm
    productName: string; // Tên sản phẩm (thay vì product.name)
    quantity: number;
    isSelected: boolean;
    createdAt: string;
    updatedAt: string;
    unitPrice?: number; // Giá đơn vị
    totalPrice?: number; // Tổng giá
    color?: string; // Màu sắc từ variant
    size?: string; // Kích thước từ variant
    sku?: string; // SKU từ variant
    stockQuantity?: number; // Số lượng tồn kho từ variant
    imageUrl?: string | null; // URL hình ảnh từ variant
    status?: boolean; // Trạng thái từ variant
}

// DTO cho yêu cầu thêm sản phẩm vào giỏ hàng
export interface CartAddItemDTO {
    variantId: number;
    quantity: number;
}

// DTO cho yêu cầu cập nhật số lượng sản phẩm
export interface CartUpdateQuantityDTO {
    quantity: number;
}

// DTO cho yêu cầu cập nhật trạng thái chọn sản phẩm
export interface CartSelectionDTO {
    isSelected: boolean;
}

// DTO cho tổng quan giỏ hàng
export interface CartSummaryDTO {
    cartId: number;
    totalItems: number;
    totalPrice: number;
    selectedItems: number;
    selectedTotalPrice: number;
}

// Phản hồi API chung
export interface ApiResponse {
    success: boolean;
    message: string;
}