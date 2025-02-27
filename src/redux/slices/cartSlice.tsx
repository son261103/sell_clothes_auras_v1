import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CartResponseDTO,
    CartItemDTO,
    CartSummaryDTO,
} from '../../types/cart.types';

interface CartState {
    cart: CartResponseDTO | null; // Giỏ hàng đầy đủ
    summary: CartSummaryDTO | null; // Tổng quan giỏ hàng
    loading: boolean; // Trạng thái tải
    error: string | null; // Lỗi nếu có
    lastRequestTimestamp: number; // Thời gian yêu cầu cuối cùng
}

const initialState: CartState = {
    cart: null,
    summary: null,
    loading: false,
    error: null,
    lastRequestTimestamp: 0,
};

// Hàm hỗ trợ để đảm bảo dữ liệu giỏ hàng hợp lệ
const ensureCartData = (cart: CartResponseDTO): CartResponseDTO => {
    if (!cart) return cart;
    return {
        ...cart,
        userId: cart.userId || 0, // Đảm bảo userId luôn tồn tại
        items: Array.isArray(cart.items) ? cart.items.map(item => {
            if (!item) return item;

            return {
                ...item,
                productName: item.productName || 'Unknown Product', // Sử dụng productName
                imageUrl: item.imageUrl || null,
            };
        }) : [],
    };
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Bắt đầu tải dữ liệu giỏ hàng
        fetchCartStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },

        // Thành công khi lấy giỏ hàng
        fetchCartSuccess(state, action: PayloadAction<CartResponseDTO>) {
            state.loading = false;
            try {
                if (action.payload && Array.isArray(action.payload.items)) {
                    state.cart = ensureCartData(action.payload);
                    console.log('Cart data stored in Redux:', state.cart);
                } else {
                    console.warn('Received invalid cart data:', action.payload);
                    state.error = 'Dữ liệu giỏ hàng không hợp lệ';
                }
            } catch (error) {
                console.error('Error processing cart data:', error);
                state.error = 'Lỗi xử lý dữ liệu giỏ hàng';
            }
        },

        // Thất bại khi lấy giỏ hàng
        fetchCartFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Thành công khi lấy tổng quan giỏ hàng
        fetchCartSummarySuccess(state, action: PayloadAction<CartSummaryDTO>) {
            state.loading = false;
            state.summary = action.payload;
        },

        // Thêm sản phẩm vào giỏ hàng thành công
        addItemToCartSuccess(state, action: PayloadAction<CartItemDTO>) {
            state.loading = false;
            if (state.cart) {
                const existingItemIndex = state.cart.items.findIndex(
                    item => item && item.itemId === action.payload.itemId // Sử dụng itemId
                );
                if (existingItemIndex >= 0) {
                    state.cart.items[existingItemIndex] = action.payload;
                } else {
                    state.cart.items.push(action.payload);
                }
            } else {
                state.cart = {
                    cartId: action.payload.cartId,
                    userId: 0, // Sẽ được cập nhật từ dữ liệu thực tế
                    items: [action.payload],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
            console.log('Added item to cart:', action.payload);
        },

        // Cập nhật số lượng sản phẩm trong giỏ hàng thành công
        updateCartItemQuantitySuccess(state, action: PayloadAction<CartItemDTO>) {
            state.loading = false;
            if (state.cart) {
                const itemIndex = state.cart.items.findIndex(
                    item => item && item.itemId === action.payload.itemId // Sử dụng itemId
                );
                if (itemIndex >= 0) {
                    state.cart.items[itemIndex] = action.payload;
                }
            }
            console.log('Updated quantity for itemId:', action.payload.itemId);
        },

        // Cập nhật trạng thái chọn sản phẩm thành công
        updateCartItemSelectionSuccess(state, action: PayloadAction<CartItemDTO>) {
            state.loading = false;
            if (state.cart) {
                const itemIndex = state.cart.items.findIndex(
                    item => item && item.itemId === action.payload.itemId // Sử dụng itemId
                );
                if (itemIndex >= 0) {
                    state.cart.items[itemIndex] = action.payload;
                }
            }
            console.log('Updated selection for itemId:', action.payload.itemId);
        },

        // Xóa sản phẩm khỏi giỏ hàng thành công
        removeCartItemSuccess(state, action: PayloadAction<number>) {
            state.loading = false;
            if (state.cart) {
                state.cart.items = state.cart.items.filter(
                    item => item && item.itemId !== action.payload // Sử dụng itemId
                );
            }
            console.log('Removed item with itemId:', action.payload);
        },

        // Xóa toàn bộ giỏ hàng thành công
        clearCartSuccess(state) {
            state.loading = false;
            if (state.cart) {
                state.cart.items = [];
            }
            state.summary = null;
            console.log('Cleared cart');
        },

        // Chọn tất cả sản phẩm trong giỏ hàng
        selectAllCartItemsSuccess(state) {
            state.loading = false;
            if (state.cart) {
                state.cart.items = state.cart.items.map(item => item ? {
                    ...item,
                    isSelected: true,
                } : item);
            }
            console.log('Selected all items in cart');
        },

        // Bỏ chọn tất cả sản phẩm trong giỏ hàng
        deselectAllCartItemsSuccess(state) {
            state.loading = false;
            if (state.cart) {
                state.cart.items = state.cart.items.map(item => item ? {
                    ...item,
                    isSelected: false,
                } : item);
            }
            console.log('Deselected all items in cart');
        },

        // Xóa lỗi
        clearError(state) {
            state.error = null;
        },

        // Reset trạng thái giỏ hàng
        resetCart(state) {
            state.cart = null;
            state.summary = null;
            state.loading = false;
            state.error = null;
            state.lastRequestTimestamp = 0;
            console.log('Reset cart state');
        },
    },
});

export const {
    fetchCartStart,
    fetchCartSuccess,
    fetchCartFailure,
    fetchCartSummarySuccess,
    addItemToCartSuccess,
    updateCartItemQuantitySuccess,
    updateCartItemSelectionSuccess,
    removeCartItemSuccess,
    clearCartSuccess,
    selectAllCartItemsSuccess,
    deselectAllCartItemsSuccess,
    clearError,
    resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;