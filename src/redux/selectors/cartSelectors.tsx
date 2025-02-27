import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors không dùng createSelector - chỉ truy cập trực tiếp state
const getCartData = (state: RootState) => state.cart.cart;
const getCartSummaryData = (state: RootState) => state.cart.summary;
const getCartLoadingState = (state: RootState) => state.cart.loading;
const getCartErrorState = (state: RootState) => state.cart.error;
const getLastRequestTimestamp = (state: RootState) => state.cart.lastRequestTimestamp;

// Selectors cơ bản
export const selectCart = getCartData;
export const selectCartSummary = getCartSummaryData;
export const selectCartLoading = getCartLoadingState;
export const selectCartError = getCartErrorState;
export const selectLastCartRequestTimestamp = getLastRequestTimestamp;

// Selector lấy danh sách items trong giỏ hàng
export const selectCartItems = createSelector(
    [getCartData],
    (cart) => {
        if (!cart) return [];
        return cart.items.filter(item => item !== null && item !== undefined);
    }
);

// Kiểm tra có items trong giỏ hàng không
export const selectHasCartItems = createSelector(
    [selectCartItems],
    (items) => items.length > 0
);

// Đếm tổng số sản phẩm trong giỏ hàng
export const selectCartItemCount = createSelector(
    [selectCartItems],
    (items) => {
        return items.reduce((total, item) => {
            if (!item) return total;
            return total + (item.quantity || 0);
        }, 0);
    }
);

// Đếm số sản phẩm đã chọn
export const selectSelectedCartItemCount = createSelector(
    [selectCartItems],
    (items) => {
        return items.reduce((total, item) => {
            if (!item || !item.isSelected) return total;
            return total + (item.quantity || 0);
        }, 0);
    }
);

// Tính tổng giá trị giỏ hàng
export const selectCartTotalPrice = createSelector(
    [selectCartItems],
    (items) => {
        return items.reduce((total, item) => {
            if (!item) return total;
            const price = item.unitPrice || 0; // Sử dụng unitPrice từ item
            return total + (item.quantity * price);
        }, 0);
    }
);

// Tính tổng giá trị các sản phẩm đã chọn
export const selectSelectedCartTotalPrice = createSelector(
    [selectCartItems],
    (items) => {
        return items.reduce((total, item) => {
            if (!item || !item.isSelected) return total;
            const price = item.unitPrice || 0; // Sử dụng unitPrice từ item
            return total + (item.quantity * price);
        }, 0);
    }
);

// Lấy danh sách sản phẩm đã chọn
export const selectSelectedCartItems = createSelector(
    [selectCartItems],
    (items) => items.filter(item => item && item.isSelected)
);

// Selector tìm item bởi ID
export const selectCartItemById = createSelector(
    [
        (state: RootState) => selectCartItems(state),
        (_: RootState, itemId: number) => itemId // Sử dụng itemId
    ],
    (items, itemId) => {
        const foundItem = items.find(item => item && item.itemId === itemId); // Sử dụng itemId
        return foundItem || null;
    }
);

// Selector tìm items bởi variantId
export const selectCartItemsByVariantId = createSelector(
    [
        (state: RootState) => selectCartItems(state),
        (_: RootState, variantId: number) => variantId
    ],
    (items, variantId) => {
        return items.filter(item => item && item.variantId === variantId); // Sử dụng variantId trực tiếp
    }
);

// Kiểm tra variant có trong giỏ hàng không
export const selectIsVariantInCart = createSelector(
    [
        (state: RootState) => selectCartItems(state),
        (_: RootState, variantId: number) => variantId
    ],
    (items, variantId) => {
        return items.some(item => item && item.variantId === variantId); // Sử dụng variantId trực tiếp
    }
);

// Đếm số lượng của variant trong giỏ hàng
export const selectCartItemQuantityByVariantId = createSelector(
    [
        (state: RootState) => selectCartItems(state),
        (_: RootState, variantId: number) => variantId
    ],
    (items, variantId) => {
        return items.reduce((total, item) => {
            if (!item) return total;
            return item.variantId === variantId ? total + (item.quantity || 0) : total;
        }, 0);
    }
);