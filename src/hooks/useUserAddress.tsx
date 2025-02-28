import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
    fetchAddressStart,
    fetchAddressesSuccess,
    fetchAddressByIdSuccess,
    fetchDefaultAddressSuccess,
    fetchAddressFailure,
    createAddressSuccess,
    updateAddressSuccess,
    deleteAddressSuccess,
    setDefaultAddressSuccess,
    clearAddressError,
    resetCurrentAddress,
    resetAddressState
} from '../redux/slices/userAddressSlice';
import {
    selectAddresses,
    selectCurrentAddress,
    selectDefaultAddress,
    selectAddressLoading,
    selectAddressError,
    selectLastAddressRequestTimestamp,
    selectAddressCount,
    selectHasAddresses,
    selectHasDefaultAddress,
    selectAddressById,
    selectDefaultOrFirstAddress,
    selectSortedAddresses,
    selectAllCities,
    selectAllDistricts,
    selectAllWards,
    selectAllPhoneNumbers,
    selectValidAddressesForOrder,
    selectIsDefaultAddress,
    selectFormattedAddress,
    selectFormattedAddressWithPhone,
    selectAddressHasPhone
} from '../redux/selectors/userAddressSelectors';
import UserAddressService from '../services/user.address.service';
import {
    AddressResponseDTO,
    AddressRequestDTO,
    UpdateAddressDTO
} from '../types/user.address.types';
import { ApiResponse } from '../types';
import { useRef, useCallback } from 'react';
import { RootState } from '../redux/store';
import useAuth from './useAuth';
import { toast } from 'react-hot-toast';

const useUserAddress = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useAuth();

    // Basic selectors
    const addresses = useSelector(selectAddresses);
    const currentAddress = useSelector(selectCurrentAddress);
    const defaultAddress = useSelector(selectDefaultAddress);
    const loading = useSelector(selectAddressLoading);
    const error = useSelector(selectAddressError);
    const lastRequestTimestamp = useSelector(selectLastAddressRequestTimestamp);

    // Derived selectors
    const addressCount = useSelector(selectAddressCount);
    const hasAddresses = useSelector(selectHasAddresses);
    const hasDefaultAddress = useSelector(selectHasDefaultAddress);
    const sortedAddresses = useSelector(selectSortedAddresses);
    const defaultOrFirstAddress = useSelector(selectDefaultOrFirstAddress);
    const allCities = useSelector(selectAllCities);
    const allDistricts = useSelector(selectAllDistricts);
    const allWards = useSelector(selectAllWards);
    const allPhoneNumbers = useSelector(selectAllPhoneNumbers);
    const validAddressesForOrder = useSelector(selectValidAddressesForOrder);

    // Request tracking to prevent duplicate requests
    const lastAddressRequestRef = useRef({
        userId: null as number | null,
        addressId: null as number | null,
        timestamp: 0,
        inProgress: false
    });

    // Get all user addresses
    const getUserAddresses = useCallback(async (): Promise<AddressResponseDTO[]> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem danh sách địa chỉ');
        }

        const userId = user.userId;
        const currentTime = Date.now();
        const isSameRequest = userId === lastAddressRequestRef.current.userId;
        const isRecentRequest = currentTime - lastAddressRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastAddressRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate address request for userId:', userId);
            if (addresses.length > 0) return addresses;
        }

        lastAddressRequestRef.current = {
            userId,
            addressId: null,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchAddressStart());
        try {
            console.log('Fetching addresses for userId:', userId);
            const addressData = await UserAddressService.getUserAddresses(userId);

            if (!Array.isArray(addressData)) {
                throw new Error('Invalid address data received from server');
            }

            console.log('Address data received:', addressData);
            dispatch(fetchAddressesSuccess(addressData));

            lastAddressRequestRef.current.inProgress = false;
            return addressData;
        } catch (error) {
            lastAddressRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch addresses';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Address fetch error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            throw error;
        }
    }, [dispatch, addresses, isAuthenticated, user]);

    // Get address by ID
    const getAddressById = useCallback(async (addressId: number): Promise<AddressResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem thông tin địa chỉ');
        }

        if (!addressId || isNaN(addressId)) {
            throw new Error('ID địa chỉ không hợp lệ');
        }

        const userId = user.userId;
        const currentTime = Date.now();
        const isSameRequest = addressId === lastAddressRequestRef.current.addressId &&
            userId === lastAddressRequestRef.current.userId;
        const isRecentRequest = currentTime - lastAddressRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastAddressRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate address request for addressId:', addressId);
            if (currentAddress && currentAddress.addressId === addressId) return currentAddress;

            // Check if address exists in the current list
            const existingAddress = addresses.find(addr => addr.addressId === addressId);
            if (existingAddress) {
                dispatch(fetchAddressByIdSuccess(existingAddress));
                return existingAddress;
            }
        }

        lastAddressRequestRef.current = {
            userId,
            addressId,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchAddressStart());
        try {
            console.log('Fetching address details for addressId:', addressId);
            const address = await UserAddressService.getUserAddressById(userId, addressId);

            if (!address || !address.addressId) {
                throw new Error('Invalid address data received from server');
            }

            console.log('Address data received:', address);
            dispatch(fetchAddressByIdSuccess(address));

            lastAddressRequestRef.current.inProgress = false;
            return address;
        } catch (error) {
            lastAddressRequestRef.current.inProgress = false;
            let errorMessage = 'Failed to fetch address details';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Address fetch error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            throw error;
        }
    }, [dispatch, currentAddress, addresses, isAuthenticated, user]);

    // Get default address
    const getDefaultAddress = useCallback(async (): Promise<AddressResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem địa chỉ mặc định');
        }

        const userId = user.userId;

        dispatch(fetchAddressStart());
        try {
            console.log('Fetching default address for userId:', userId);
            const address = await UserAddressService.getDefaultAddress(userId);

            if (!address || !address.addressId) {
                throw new Error('Invalid default address data received from server');
            }

            console.log('Default address data received:', address);
            dispatch(fetchDefaultAddressSuccess(address));
            return address;
        } catch (error) {
            let errorMessage = 'Failed to fetch default address';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Default address fetch error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Create new address
    const createAddress = useCallback(async (addressData: AddressRequestDTO): Promise<AddressResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để tạo địa chỉ mới');
        }

        dispatch(fetchAddressStart());
        try {
            const userId = user.userId;
            console.log('Creating address for userId:', userId, addressData);

            const newAddress = await UserAddressService.createAddress(userId, addressData);

            if (!newAddress || !newAddress.addressId) {
                throw new Error('Invalid address data received from server after creation');
            }

            console.log('Address created successfully:', newAddress);
            dispatch(createAddressSuccess(newAddress));
            toast.success('Đã thêm địa chỉ mới thành công');
            return newAddress;
        } catch (error) {
            let errorMessage = 'Không thể tạo địa chỉ mới';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Address creation error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            toast.error(errorMessage);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Update address
    const updateAddress = useCallback(async (addressId: number, updateData: UpdateAddressDTO): Promise<AddressResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để cập nhật địa chỉ');
        }

        if (!addressId || isNaN(addressId)) {
            throw new Error('ID địa chỉ không hợp lệ');
        }

        dispatch(fetchAddressStart());
        try {
            const userId = user.userId;
            console.log('Updating address:', addressId, updateData);

            const updatedAddress = await UserAddressService.updateAddress(userId, addressId, updateData);

            if (!updatedAddress || !updatedAddress.addressId) {
                throw new Error('Invalid address data received from server after update');
            }

            console.log('Address updated successfully:', updatedAddress);
            dispatch(updateAddressSuccess(updatedAddress));
            toast.success('Đã cập nhật địa chỉ thành công');
            return updatedAddress;
        } catch (error) {
            let errorMessage = 'Không thể cập nhật địa chỉ';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Address update error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            toast.error(errorMessage);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Delete address
    const deleteAddress = useCallback(async (addressId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xóa địa chỉ');
        }

        if (!addressId || isNaN(addressId)) {
            throw new Error('ID địa chỉ không hợp lệ');
        }

        dispatch(fetchAddressStart());
        try {
            const userId = user.userId;
            console.log('Deleting address:', addressId);

            const response = await UserAddressService.deleteAddress(userId, addressId);

            console.log('Address deleted successfully');
            dispatch(deleteAddressSuccess(addressId));
            toast.success('Đã xóa địa chỉ thành công');
            return response;
        } catch (error) {
            let errorMessage = 'Không thể xóa địa chỉ';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Address deletion error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            toast.error(errorMessage);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Set default address
    const setAsDefaultAddress = useCallback(async (addressId: number): Promise<AddressResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để đặt địa chỉ mặc định');
        }

        if (!addressId || isNaN(addressId)) {
            throw new Error('ID địa chỉ không hợp lệ');
        }

        dispatch(fetchAddressStart());
        try {
            const userId = user.userId;
            console.log('Setting address as default:', addressId);

            const updatedAddress = await UserAddressService.setDefaultAddress(userId, addressId);

            if (!updatedAddress || !updatedAddress.addressId) {
                throw new Error('Invalid address data received from server after setting as default');
            }

            console.log('Address set as default successfully:', updatedAddress);
            dispatch(setDefaultAddressSuccess(updatedAddress));
            toast.success('Đã đặt địa chỉ mặc định thành công');
            return updatedAddress;
        } catch (error) {
            let errorMessage = 'Không thể đặt địa chỉ mặc định';
            if (error instanceof Error) errorMessage = error.message;
            console.error('Set default address error:', error);
            dispatch(fetchAddressFailure(errorMessage));
            toast.error(errorMessage);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Count addresses
    const countAddresses = useCallback(async (): Promise<number> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để đếm số lượng địa chỉ');
        }

        try {
            const userId = user.userId;
            return await UserAddressService.getAddressCount(userId);
        } catch (error) {
            console.error('Error counting addresses:', error);
            throw error;
        }
    }, [isAuthenticated, user]);

    // Validate address for order
    const validateAddressForOrder = useCallback(async (addressId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để kiểm tra địa chỉ');
        }

        try {
            const userId = user.userId;
            return await UserAddressService.validateAddressForOrder(userId, addressId);
        } catch (error) {
            console.error('Error validating address for order:', error);
            throw error;
        }
    }, [isAuthenticated, user]);

    // Check if address belongs to user
    const checkAddressBelongsToUser = useCallback(async (addressId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để kiểm tra quyền sở hữu địa chỉ');
        }

        try {
            const userId = user.userId;
            return await UserAddressService.checkAddressBelongsToUser(userId, addressId);
        } catch (error) {
            console.error('Error checking address ownership:', error);
            throw error;
        }
    }, [isAuthenticated, user]);

    // Get the formatted address string
    const getFormattedAddress = useCallback((addressId: number): string => {
        return selectFormattedAddress({
            userAddress: {
                addresses,
                currentAddress,
                defaultAddress,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, addressId);
    }, [addresses, currentAddress, defaultAddress, loading, error, lastRequestTimestamp]);

    // Get formatted address with phone number
    const getFormattedAddressWithPhone = useCallback((addressId: number): string => {
        return selectFormattedAddressWithPhone({
            userAddress: {
                addresses,
                currentAddress,
                defaultAddress,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, addressId);
    }, [addresses, currentAddress, defaultAddress, loading, error, lastRequestTimestamp]);

    // Check if address has phone number
    const hasPhoneNumber = useCallback((addressId: number): boolean => {
        return selectAddressHasPhone({
            userAddress: {
                addresses,
                currentAddress,
                defaultAddress,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, addressId);
    }, [addresses, currentAddress, defaultAddress, loading, error, lastRequestTimestamp]);

    // Check if address is default
    const isDefaultAddress = useCallback((addressId: number): boolean => {
        return selectIsDefaultAddress({
            userAddress: {
                addresses,
                currentAddress,
                defaultAddress,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, addressId);
    }, [addresses, currentAddress, defaultAddress, loading, error, lastRequestTimestamp]);

    // Get address by ID from state
    const getAddressByIdFromState = useCallback((addressId: number): AddressResponseDTO | null => {
        return selectAddressById({
            userAddress: {
                addresses,
                currentAddress,
                defaultAddress,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, addressId);
    }, [addresses, currentAddress, defaultAddress, loading, error, lastRequestTimestamp]);

    // Clear error state
    const clearError = useCallback(() => {
        dispatch(clearAddressError());
    }, [dispatch]);

    // Reset current address
    const resetAddress = useCallback(() => {
        dispatch(resetCurrentAddress());
    }, [dispatch]);

    // Reset entire address state
    const resetAddressStateAction = useCallback(() => {
        dispatch(resetAddressState());
    }, [dispatch]);

    return {
        // State values
        addresses,
        currentAddress,
        defaultAddress,
        loading,
        error,
        lastRequestTimestamp,

        // Derived values
        addressCount,
        hasAddresses,
        hasDefaultAddress,
        sortedAddresses,
        defaultOrFirstAddress,
        allCities,
        allDistricts,
        allWards,
        allPhoneNumbers,
        validAddressesForOrder,

        // API methods
        getUserAddresses,
        getAddressById,
        getDefaultAddress,
        createAddress,
        updateAddress,
        deleteAddress,
        setAsDefaultAddress,
        countAddresses,
        validateAddressForOrder,
        checkAddressBelongsToUser,

        // Helper methods
        getFormattedAddress,
        getFormattedAddressWithPhone,
        hasPhoneNumber,
        isDefaultAddress,
        getAddressByIdFromState,
        clearError,
        resetAddress,
        resetAddressState: resetAddressStateAction
    };
};

export default useUserAddress;