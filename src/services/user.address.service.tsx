// user.address.service.ts

import api from './api';
import { AddressResponseDTO, AddressRequestDTO, UpdateAddressDTO } from '../types/user.address.types';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

/**
 * Service for managing user addresses
 */
const UserAddressService = {
    /**
     * Get all addresses for a user
     * @param userId - The ID of the user
     * @returns Promise containing an array of user addresses
     */
    async getUserAddresses(userId: number): Promise<AddressResponseDTO[]> {
        try {
            const response = await api.get<AddressResponseDTO[]>('/public/address', {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user addresses:', error);
            throw error;
        }
    },

    /**
     * Get a specific address by ID
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to retrieve
     * @returns Promise containing the address information
     */
    async getUserAddressById(userId: number, addressId: number): Promise<AddressResponseDTO> {
        try {
            const response = await api.get<AddressResponseDTO>(`/public/address/${addressId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching address ${addressId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new address for a user
     * @param userId - The ID of the user
     * @param addressData - The address data to create (including phone number)
     * @returns Promise containing the created address
     */
    async createAddress(userId: number, addressData: AddressRequestDTO): Promise<AddressResponseDTO> {
        try {
            const response = await api.post<AddressResponseDTO>('/public/address', addressData, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error creating address:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
            throw axiosError.response?.data?.message || 'Failed to create address';
        }
    },

    /**
     * Update an existing address
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to update
     * @param updateData - The new address data (can include phone number)
     * @returns Promise containing the updated address
     */
    async updateAddress(userId: number, addressId: number, updateData: UpdateAddressDTO): Promise<AddressResponseDTO> {
        try {
            const response = await api.put<AddressResponseDTO>(`/public/address/${addressId}`, updateData, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating address ${addressId}:`, error);
            throw error;
        }
    },

    /**
     * Delete an address
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to delete
     * @returns Promise containing the API response
     */
    async deleteAddress(userId: number, addressId: number): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>(`/public/address/${addressId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting address ${addressId}:`, error);
            throw error;
        }
    },

    /**
     * Set an address as the default
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to set as default
     * @returns Promise containing the updated address
     */
    async setDefaultAddress(userId: number, addressId: number): Promise<AddressResponseDTO> {
        try {
            const response = await api.put<AddressResponseDTO>(`/public/address/${addressId}/default`, {}, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error setting address ${addressId} as default:`, error);
            throw error;
        }
    },

    /**
     * Get the default address for a user
     * @param userId - The ID of the user
     * @returns Promise containing the default address
     */
    async getDefaultAddress(userId: number): Promise<AddressResponseDTO> {
        try {
            const response = await api.get<AddressResponseDTO>('/public/address/default', {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching default address:', error);
            throw error;
        }
    },

    /**
     * Count the number of addresses for a user
     * @param userId - The ID of the user
     * @returns Promise containing the count of addresses
     */
    async getAddressCount(userId: number): Promise<number> {
        try {
            const response = await api.get<number>('/public/address/count', {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error counting addresses:', error);
            throw error;
        }
    },

    /**
     * Validate if an address is valid for creating an order
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to validate
     * @returns Promise containing the validation result
     */
    async validateAddressForOrder(userId: number, addressId: number): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>('/public/address/validate', {
                headers: { 'X-User-Id': userId },
                params: { addressId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error validating address ${addressId} for order:`, error);
            throw error;
        }
    },

    /**
     * Check if an address belongs to a user
     * @param userId - The ID of the user
     * @param addressId - The ID of the address to check
     * @returns Promise containing a boolean indicating ownership
     */
    async checkAddressBelongsToUser(userId: number, addressId: number): Promise<ApiResponse> {
        try {
            const response = await api.get<ApiResponse>(`/public/address/check/${addressId}`, {
                headers: { 'X-User-Id': userId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error checking if address ${addressId} belongs to user:`, error);
            throw error;
        }
    }
};

export default UserAddressService;