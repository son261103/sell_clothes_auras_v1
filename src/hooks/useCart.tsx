import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
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
    resetCart
} from '../redux/slices/cartSlice';
import {
    selectCart,
    selectCartSummary,
    selectCartLoading,
    selectCartError,
    selectCartItems,
    selectHasCartItems,
    selectCartItemCount,
    selectSelectedCartItemCount,
    selectCartTotalPrice,
    selectSelectedCartTotalPrice,
    selectSelectedCartItems,
    selectCartItemById,
    selectIsVariantInCart,
    selectCartItemQuantityByVariantId,
    selectLastCartRequestTimestamp
} from '../redux/selectors/cartSelectors';
import CartService from '../services/cart.service';
import {
    CartResponseDTO,
    CartItemDTO,
    CartAddItemDTO,
    CartUpdateQuantityDTO,
    CartSelectionDTO,
    ApiResponse,
} from '../types/cart.types';
import { useRef, useCallback } from 'react';
import { RootState } from '../redux/store';
import useAuth from './useAuth';

const useCart = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useAuth();

    const cart = useSelector(selectCart);
    const cartSummary = useSelector(selectCartSummary);
    const loading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);
    const cartItems = useSelector(selectCartItems);
    const hasItems = useSelector(selectHasCartItems);
    const itemCount = useSelector(selectCartItemCount);
    const selectedItemCount = useSelector(selectSelectedCartItemCount);
    const totalPrice = useSelector(selectCartTotalPrice);
    const selectedTotalPrice = useSelector(selectSelectedCartTotalPrice);
    const selectedItems = useSelector(selectSelectedCartItems);
    const lastRequestTimestamp = useSelector(selectLastCartRequestTimestamp);

    const lastCartRequestRef = useRef({
        userId: null as number | null,
        timestamp: 0,
        inProgress: false
    });

    const getUserCart = useCallback(async (): Promise<CartResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem giỏ hàng');
        }

        const userId = user.userId;
        const currentTime = Date.now();
        const isSameRequest = userId === lastCartRequestRef.current.userId;
        const isRecentRequest = currentTime - lastCartRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastCartRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate user cart request for userId:', userId);
            if (cart) return cart;
        }

        lastCartRequestRef.current = {
            userId,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchCartStart());
        try {
            console.log('Fetching user cart for userId:', userId);
            const cartData = await CartService.getUserCart(userId);

            if (!cartData || !Array.isArray(cartData.items)) {
                throw new Error('Invalid cart data received from server');
            }

            // Log và xử lý dữ liệu mới
            console.log('Cart data received:', cartData);
            cartData.items.forEach(item => {
                console.log('Cart item received:', {
                    itemId: item.itemId,
                    productName: item.productName, // Sử dụng productName trực tiếp
                    imageUrl: item.imageUrl, // Sử dụng imageUrl trực tiếp từ item
                    price: item.unitPrice || 0, // Sử dụng unitPrice
                    color: item.color,
                    size: item.size,
                    sku: item.sku,
                    stockQuantity: item.stockQuantity,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice
                });
            });

            dispatch(fetchCartSuccess(cartData));

            try {
                const cartSummary = await CartService.getCartSummary(userId);
                dispatch(fetchCartSummarySuccess(cartSummary));
            } catch (summaryError) {
                console.error('Error fetching cart summary:', summaryError);
            }

            lastCartRequestRef.current.inProgress = false;
            return cartData;
        } catch (error) {
            lastCartRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch user cart';
            if (error instanceof Error) errorMessage = error.message;
            console.error('User cart fetch error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, cart, isAuthenticated, user]);

    const addItemToUserCart = useCallback(async (item: CartAddItemDTO): Promise<CartItemDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
        }

        const userId = user.userId;
        dispatch(fetchCartStart());
        try {
            const cartItem = await CartService.addItemToUserCart(userId, item);
            console.log('Added cart item:', cartItem);
            dispatch(addItemToCartSuccess(cartItem));

            try {
                const cartSummary = await CartService.getCartSummary(userId);
                dispatch(fetchCartSummarySuccess(cartSummary));
            } catch (summaryError) {
                console.error('Error updating cart summary after adding item:', summaryError);
            }

            return cartItem;
        } catch (error) {
            let errorMessage = 'Không thể thêm sản phẩm vào giỏ hàng';
            if (typeof error === 'string') {
                errorMessage = error; // Sử dụng thông báo lỗi từ server nếu có
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Add to cart error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw new Error(errorMessage);
        }
    }, [dispatch, isAuthenticated, user]);

    const updateCartItemQuantity = useCallback(async (itemId: number, update: CartUpdateQuantityDTO): Promise<CartItemDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để cập nhật giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            const cartItem = await CartService.updateCartItemQuantity(itemId, update);
            console.log('Updated cart item quantity for itemId:', itemId, cartItem);
            dispatch(updateCartItemQuantitySuccess(cartItem));

            if (cart?.userId) {
                try {
                    const cartSummary = await CartService.getCartSummary(cart.userId);
                    dispatch(fetchCartSummarySuccess(cartSummary));
                } catch (error) {
                    console.error('Error updating user cart summary:', error);
                }
            }

            return cartItem;
        } catch (error) {
            let errorMessage = 'Failed to update cart item quantity';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Update quantity error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, cart, isAuthenticated, user]);

    const updateCartItemSelection = useCallback(async (itemId: number, selection: CartSelectionDTO): Promise<CartItemDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để cập nhật giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            const cartItem = await CartService.updateCartItemSelection(itemId, selection);
            console.log('Updated cart item selection for itemId:', itemId, cartItem);
            dispatch(updateCartItemSelectionSuccess(cartItem));

            if (cart?.userId) {
                try {
                    const cartSummary = await CartService.getCartSummary(cart.userId);
                    dispatch(fetchCartSummarySuccess(cartSummary));
                } catch (error) {
                    console.error('Error updating user cart summary:', error);
                }
            }

            return cartItem;
        } catch (error) {
            let errorMessage = 'Failed to update cart item selection';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Update selection error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, cart, isAuthenticated, user]);

    const removeCartItem = useCallback(async (itemId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng');
        }

        if (!itemId || isNaN(itemId)) {
            const errorMessage = 'Invalid cart item ID provided';
            console.error(errorMessage, itemId);
            dispatch(fetchCartFailure(errorMessage));
            throw new Error(errorMessage);
        }

        dispatch(fetchCartStart());
        try {
            const response = await CartService.removeCartItem(itemId);
            console.log('Removed cart item with itemId:', itemId);
            dispatch(removeCartItemSuccess(itemId));

            if (cart?.userId) {
                try {
                    const cartSummary = await CartService.getCartSummary(cart.userId);
                    dispatch(fetchCartSummarySuccess(cartSummary));
                } catch (error) {
                    console.error('Error updating user cart summary:', error);
                }
            }

            return response;
        } catch (error) {
            let errorMessage = 'Failed to remove cart item';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Remove cart item error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, cart, isAuthenticated, user]);

    const clearCart = useCallback(async (): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xóa giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            const response = await CartService.clearUserCart(user.userId);
            console.log('Cleared cart for userId:', user.userId);
            dispatch(clearCartSuccess());
            return response;
        } catch (error) {
            let errorMessage = 'Failed to clear cart';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Clear cart error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    const getUserCartItems = useCallback(async (): Promise<CartItemDTO[]> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để lấy danh sách sản phẩm trong giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            const items = await CartService.getUserCartItems(user.userId);
            console.log('Fetched user cart items:', items);
            return items;
        } catch (error) {
            let errorMessage = 'Failed to get user cart items';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Get user cart items error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    const getSelectedUserCartItems = useCallback(async (): Promise<CartItemDTO[]> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để lấy danh sách sản phẩm đã chọn');
        }

        dispatch(fetchCartStart());
        try {
            const items = await CartService.getSelectedUserCartItems(user.userId);
            console.log('Fetched selected user cart items:', items);
            return items;
        } catch (error) {
            let errorMessage = 'Failed to get selected user cart items';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Get selected user cart items error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    const countUserCartItems = useCallback(async (): Promise<number> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để đếm số lượng sản phẩm trong giỏ hàng');
        }

        try {
            return await CartService.countUserCartItems(user.userId);
        } catch (error) {
            console.error('Error counting user cart items:', error);
            throw error;
        }
    }, [isAuthenticated, user]);

    const selectAllUserCartItems = useCallback(async (): Promise<void> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để chọn tất cả sản phẩm trong giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            await CartService.selectAllUserCartItems(user.userId);
            console.log('Selected all user cart items for userId:', user.userId);
            dispatch(selectAllCartItemsSuccess());

            try {
                const cartSummary = await CartService.getCartSummary(user.userId);
                dispatch(fetchCartSummarySuccess(cartSummary));
            } catch (error) {
                console.error('Error updating user cart summary:', error);
            }
        } catch (error) {
            let errorMessage = 'Failed to select all user cart items';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Select all user cart items error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    const deselectAllUserCartItems = useCallback(async (): Promise<void> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để bỏ chọn tất cả sản phẩm trong giỏ hàng');
        }

        dispatch(fetchCartStart());
        try {
            await CartService.deselectAllUserCartItems(user.userId);
            console.log('Deselected all user cart items for userId:', user.userId);
            dispatch(deselectAllCartItemsSuccess());

            try {
                const cartSummary = await CartService.getCartSummary(user.userId);
                dispatch(fetchCartSummarySuccess(cartSummary));
            } catch (error) {
                console.error('Error updating user cart summary:', error);
            }
        } catch (error) {
            let errorMessage = 'Failed to deselect all user cart items';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Deselect all user cart items error:', error);
            dispatch(fetchCartFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    const getCartItemById = useCallback((itemId: number): CartItemDTO | null => {
        return selectCartItemById(
            { cart: { cart, summary: cartSummary, loading, error, lastRequestTimestamp } } as RootState,
            itemId
        );
    }, [cart, cartSummary, loading, error, lastRequestTimestamp]);

    const checkVariantInCart = useCallback((variantId: number): boolean => {
        return selectIsVariantInCart(
            { cart: { cart, summary: cartSummary, loading, error, lastRequestTimestamp } } as RootState,
            variantId
        );
    }, [cart, cartSummary, loading, error, lastRequestTimestamp]);

    const getVariantQuantityInCart = useCallback((variantId: number): number => {
        return selectCartItemQuantityByVariantId(
            { cart: { cart, summary: cartSummary, loading, error, lastRequestTimestamp } } as RootState,
            variantId
        );
    }, [cart, cartSummary, loading, error, lastRequestTimestamp]);

    const selectAllItems = useCallback(async (): Promise<void> => {
        if (!cart?.userId) throw new Error('Bạn cần đăng nhập để chọn tất cả sản phẩm');
        await selectAllUserCartItems();
    }, [cart, selectAllUserCartItems]);

    const deselectAllItems = useCallback(async (): Promise<void> => {
        if (!cart?.userId) throw new Error('Bạn cần đăng nhập để bỏ chọn tất cả sản phẩm');
        await deselectAllUserCartItems();
    }, [cart, deselectAllUserCartItems]);

    const clearCartError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const resetCartState = useCallback(() => {
        dispatch(resetCart());
    }, [dispatch]);

    const isItemAvailable = useCallback((item: CartItemDTO): boolean => {
        if (!item) return false;
        return Boolean(item.status);
    }, []);

    const getCartSummaryInfo = useCallback((): {
        totalItems: number;
        selectedItems: number;
        totalPrice: number;
        selectedTotalPrice: number;
    } => {
        return {
            totalItems: itemCount,
            selectedItems: selectedItemCount,
            totalPrice: totalPrice,
            selectedTotalPrice: selectedTotalPrice
        };
    }, [itemCount, selectedItemCount, totalPrice, selectedTotalPrice]);

    return {
        cart,
        cartSummary,
        cartItems,
        loading,
        error,
        hasItems,
        itemCount,
        selectedItemCount,
        totalPrice,
        selectedTotalPrice,
        selectedItems,

        getUserCart,
        addItemToUserCart,
        getUserCartItems,
        getSelectedUserCartItems,
        countUserCartItems,
        selectAllUserCartItems,
        deselectAllUserCartItems,

        updateCartItemQuantity,
        updateCartItemSelection,
        removeCartItem,
        clearCart,
        selectAllItems,
        deselectAllItems,

        checkVariantInCart,
        getVariantQuantityInCart,
        getCartItemById,
        isItemAvailable,
        getCartSummaryInfo,

        clearCartError,
        resetCartState
    };
};

export default useCart;