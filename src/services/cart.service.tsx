import api from './api';
import {
    CartResponseDTO,
    CartItemDTO,
    CartAddItemDTO,
    CartUpdateQuantityDTO,
    CartSelectionDTO,
    CartSummaryDTO,
    ApiResponse,
} from '../types/cart.types';
import { AxiosError } from 'axios';

const CartService = {
    async getUserCart(userId: number): Promise<CartResponseDTO> {
        try {
            const response = await api.get<CartResponseDTO>('/public/cart', {
                headers: { 'X-User-Id': userId },
            });
            console.log('Cart data received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user cart:', error);
            throw error;
        }
    },

    async getCartSummary(userId: number): Promise<CartSummaryDTO> {
        try {
            const response = await api.get<CartSummaryDTO>('/public/cart/summary', {
                headers: { 'X-User-Id': userId },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching cart summary:', error);
            throw error;
        }
    },

    async addItemToUserCart(userId: number, item: CartAddItemDTO): Promise<CartItemDTO> {
        try {
            const response = await api.post<CartItemDTO>('/public/cart/add', item, {
                headers: { 'X-User-Id': userId },
            });
            console.log('Added item to cart:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error adding item to user cart:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data?.message || 'Failed to add item to cart';
        }
    },

    async updateCartItemQuantity(itemId: number, update: CartUpdateQuantityDTO): Promise<CartItemDTO> {
        try {
            const response = await api.put<CartItemDTO>(
                `/public/cart/item/${itemId}/quantity`,
                update
            );
            console.log('Updated quantity for itemId:', itemId, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating cart item quantity for ${itemId}:`, error);
            throw error;
        }
    },

    async updateCartItemSelection(itemId: number, selection: CartSelectionDTO): Promise<CartItemDTO> {
        try {
            const response = await api.put<CartItemDTO>(
                `/public/cart/item/${itemId}/select`,
                selection
            );
            console.log('Updated selection for itemId:', itemId, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating cart item selection for ${itemId}:`, error);
            throw error;
        }
    },

    async removeCartItem(itemId: number): Promise<ApiResponse> {
        if (!itemId || isNaN(itemId)) {
            console.error('Invalid cart item ID for removal:', itemId);
            throw new Error('Invalid cart item ID');
        }
        try {
            const response = await api.delete<ApiResponse>(`/public/cart/item/${itemId}`);
            console.log('Removed cart item with itemId:', itemId);
            return response.data;
        } catch (error) {
            console.error(`Error removing cart item ${itemId}:`, error);
            throw error;
        }
    },

    async clearUserCart(userId: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>('/public/cart/clear', {
                headers: { 'X-User-Id': userId },
            });
            console.log('Cleared cart for userId:', userId);
            return response.data;
        } catch (error) {
            console.error('Error clearing user cart:', error);
            throw error;
        }
    },

    async selectAllUserCartItems(userId: number): Promise<ApiResponse> {
        try {
            const response = await api.put<ApiResponse>('/public/cart/select-all', {}, {
                headers: { 'X-User-Id': userId },
            });
            console.log('Selected all items for userId:', userId);
            return response.data;
        } catch (error) {
            console.error('Error selecting all user cart items:', error);
            throw error;
        }
    },

    async deselectAllUserCartItems(userId: number): Promise<ApiResponse> {
        try {
            const response = await api.put<ApiResponse>('/public/cart/deselect-all', {}, {
                headers: { 'X-User-Id': userId },
            });
            console.log('Deselected all items for userId:', userId);
            return response.data;
        } catch (error) {
            console.error('Error deselecting all user cart items:', error);
            throw error;
        }
    },

    async getUserCartItems(userId: number): Promise<CartItemDTO[]> {
        try {
            const response = await api.get<CartItemDTO[]>('/public/cart/items', {
                headers: { 'X-User-Id': userId },
            });
            console.log('Fetched user cart items for userId:', userId, response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user cart items:', error);
            throw error;
        }
    },

    async getSelectedUserCartItems(userId: number): Promise<CartItemDTO[]> {
        try {
            const response = await api.get<CartItemDTO[]>('/public/cart/selected', {
                headers: { 'X-User-Id': userId },
            });
            console.log('Fetched selected user cart items for userId:', userId, response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching selected user cart items:', error);
            throw error;
        }
    },

    async countUserCartItems(userId: number): Promise<number> {
        try {
            const response = await api.get<number>('/public/cart/count', {
                headers: { 'X-User-Id': userId },
            });
            console.log('Counted cart items for userId:', userId, response.data);
            return response.data;
        } catch (error) {
            console.error('Error counting user cart items:', error);
            throw error;
        }
    },
};

export default CartService;