import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
    fetchShippingStart,
    fetchShippingMethodsSuccess,
    fetchShippingMethodByIdSuccess,
    fetchShippingEstimateSuccess,
    checkFreeShippingEligibilitySuccess,
    fetchShippingFailure,
    selectShippingMethod,
    clearShippingError,
    resetCurrentShippingMethod,
    resetShippingEstimate,
    resetSelectedShippingMethod,
    resetShippingState
} from '../redux/slices/shippingSlice';
import {
    selectShippingMethods,
    selectCurrentShippingMethod,
    selectSelectedShippingMethod,
    selectShippingEstimate,
    selectFreeShippingThreshold,
    selectShippingLoading,
    selectShippingError,
    selectLastShippingRequestTimestamp,
    selectShippingMethodCount,
    selectHasShippingMethods,
    selectShippingMethodsWithDisplay,
    selectCurrentShippingFee,
    selectIsFreeShippingEligible,
    selectCheapestShippingMethod,
    selectFastestShippingMethod,
    selectDefaultShippingMethod,
    selectFreeShippingThresholdDisplay,
    selectAmountNeededForFreeShipping,
    selectFreeShippingMessage
} from '../redux/selectors/shippingSelectors';
import ShippingService from '../services/shipping.service';
import { ShippingMethodDTO, ShippingEstimateDTO } from '../types/shipping.types';
import { useCallback } from 'react';
import useAuth from './useAuth';
import { ApiResponse } from "../types";

const useShipping = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useAuth();

    // Selectors from state
    const shippingMethods = useSelector(selectShippingMethods);
    const currentShippingMethod = useSelector(selectCurrentShippingMethod);
    const selectedShippingMethod = useSelector(selectSelectedShippingMethod);
    const shippingEstimate = useSelector(selectShippingEstimate);
    const freeShippingThreshold = useSelector(selectFreeShippingThreshold);
    const loading = useSelector(selectShippingLoading);
    const error = useSelector(selectShippingError);
    const lastRequestTimestamp = useSelector(selectLastShippingRequestTimestamp);

    // Derived selectors
    const shippingMethodCount = useSelector(selectShippingMethodCount);
    const hasShippingMethods = useSelector(selectHasShippingMethods);
    const shippingMethodsWithDisplay = useSelector(selectShippingMethodsWithDisplay);
    const currentShippingFee = useSelector(selectCurrentShippingFee);
    const isFreeShippingEligible = useSelector(selectIsFreeShippingEligible);
    const cheapestShippingMethod = useSelector(selectCheapestShippingMethod);
    const fastestShippingMethod = useSelector(selectFastestShippingMethod);
    const defaultShippingMethod = useSelector(selectDefaultShippingMethod);
    const freeShippingThresholdDisplay = useSelector(selectFreeShippingThresholdDisplay);
    const amountNeededForFreeShipping = useSelector(selectAmountNeededForFreeShipping);
    const freeShippingMessage = useSelector(selectFreeShippingMessage);

    // Get all shipping methods
    const getAllShippingMethods = useCallback(async (): Promise<ShippingMethodDTO[]> => {
        dispatch(fetchShippingStart());
        try {
            const methods = await ShippingService.getAllShippingMethods();
            dispatch(fetchShippingMethodsSuccess(methods));
            return methods;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy danh sách phương thức vận chuyển';
            dispatch(fetchShippingFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Get shipping method by ID
    const getShippingMethodById = useCallback(async (id: number): Promise<ShippingMethodDTO> => {
        dispatch(fetchShippingStart());
        try {
            const method = await ShippingService.getShippingMethodById(id);
            dispatch(fetchShippingMethodByIdSuccess(method));
            return method;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy thông tin phương thức vận chuyển';
            dispatch(fetchShippingFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Estimate shipping (public version)
    const estimateShipping = useCallback(async (
        orderTotal: number,
        methodId: number,
        totalWeight?: number
    ): Promise<ShippingEstimateDTO> => {
        dispatch(fetchShippingStart());
        try {
            const estimate = await ShippingService.estimateShipping(orderTotal, methodId, totalWeight);
            dispatch(fetchShippingEstimateSuccess(estimate));
            return estimate;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể ước tính phí vận chuyển';
            dispatch(fetchShippingFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Estimate shipping for authenticated user
    const estimateShippingForUser = useCallback(async (
        orderTotal: number,
        methodId: number,
        totalWeight?: number
    ): Promise<ShippingEstimateDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để ước tính phí vận chuyển');
        }

        dispatch(fetchShippingStart());
        try {
            const userId = user.userId;
            const estimate = await ShippingService.estimateShippingForUser(userId, orderTotal, methodId, totalWeight);
            dispatch(fetchShippingEstimateSuccess(estimate));
            return estimate;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể ước tính phí vận chuyển cho người dùng';
            dispatch(fetchShippingFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Check free shipping eligibility
    const checkFreeShippingEligibility = useCallback(async (orderTotal: number): Promise<ApiResponse> => {
        dispatch(fetchShippingStart());
        try {
            const response = await ShippingService.checkFreeShippingEligibility(orderTotal);
            dispatch(checkFreeShippingEligibilitySuccess(response));
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể kiểm tra điều kiện miễn phí vận chuyển';
            dispatch(fetchShippingFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Select a shipping method
    const selectShippingMethodById = useCallback((methodId: number): void => {
        dispatch(selectShippingMethod(methodId));
    }, [dispatch]);

    // Get shipping method from state (moved from useSelector to useCallback)
    const getShippingMethodByIdFromState = useCallback((methodId: number): ShippingMethodDTO | undefined => {
        return shippingMethods.find(method => method.id === methodId);
    }, [shippingMethods]);

    // Helper methods
    const clearError = useCallback((): void => {
        dispatch(clearShippingError());
    }, [dispatch]);

    const resetCurrent = useCallback((): void => {
        dispatch(resetCurrentShippingMethod());
    }, [dispatch]);

    const resetEstimate = useCallback((): void => {
        dispatch(resetShippingEstimate());
    }, [dispatch]);

    const resetSelected = useCallback((): void => {
        dispatch(resetSelectedShippingMethod());
    }, [dispatch]);

    const resetShipping = useCallback((): void => {
        dispatch(resetShippingState());
    }, [dispatch]);

    return {
        // State values
        shippingMethods,
        currentShippingMethod,
        selectedShippingMethod,
        shippingEstimate,
        freeShippingThreshold,
        loading,
        error,
        lastRequestTimestamp,

        // Derived values
        shippingMethodCount,
        hasShippingMethods,
        shippingMethodsWithDisplay,
        currentShippingFee,
        isFreeShippingEligible,
        cheapestShippingMethod,
        fastestShippingMethod,
        defaultShippingMethod,
        freeShippingThresholdDisplay,
        amountNeededForFreeShipping,
        freeShippingMessage,

        // API methods (public only)
        getAllShippingMethods,
        getShippingMethodById,
        estimateShipping,
        estimateShippingForUser,
        checkFreeShippingEligibility,

        // Helper methods
        selectShippingMethodById,
        getShippingMethodByIdFromState,
        clearError,
        resetCurrent,
        resetEstimate,
        resetSelected,
        resetShipping
    };
};

export default useShipping;