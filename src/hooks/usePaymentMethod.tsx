import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store'; // Đảm bảo RootState được import
import {
    fetchPaymentMethodStart,
    fetchPaymentMethodsSuccess,
    fetchPaymentMethodByIdSuccess,
    fetchSupportedBanksSuccess,
    fetchPaymentMethodFailure,
    clearPaymentMethodError,
    resetCurrentMethod,
    resetPaymentMethodState
} from '../redux/slices/paymentMethodSlice';
import {
    selectPaymentMethods,
    selectCurrentPaymentMethod,
    selectSupportedBanks,
    selectPaymentMethodLoading,
    selectPaymentMethodError,
    selectLastPaymentMethodRequestTimestamp,
    selectPaymentMethodCount,
    selectHasPaymentMethods,
    selectActivePaymentMethods,
    selectInactivePaymentMethods,
    selectSortedPaymentMethods,
    selectMethodSupportsBanks,
    selectFormattedPaymentMethod
} from '../redux/selectors/paymentMethodSelectors';
import PaymentMethodService from '../services/payment.method.service';
import { PaymentMethodDTO } from '../types/payment.method.types';
import { ApiResponse } from '../types';
import { useRef, useCallback } from 'react';

const usePaymentMethod = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Basic selectors
    const paymentMethods = useSelector(selectPaymentMethods);
    const currentMethod = useSelector(selectCurrentPaymentMethod);
    const supportedBanks = useSelector(selectSupportedBanks);
    const loading = useSelector(selectPaymentMethodLoading);
    const error = useSelector(selectPaymentMethodError);
    const lastRequestTimestamp = useSelector(selectLastPaymentMethodRequestTimestamp);

    // Derived selectors
    const paymentMethodCount = useSelector(selectPaymentMethodCount);
    const hasPaymentMethods = useSelector(selectHasPaymentMethods);
    const activePaymentMethods = useSelector(selectActivePaymentMethods);
    const inactivePaymentMethods = useSelector(selectInactivePaymentMethods);
    const sortedPaymentMethods = useSelector(selectSortedPaymentMethods);

    // Request tracking to prevent duplicate requests
    const lastMethodRequestRef = useRef({
        methodId: null as number | null,
        timestamp: 0,
        inProgress: false
    });

    // Get all active payment methods
    const getActivePaymentMethods = useCallback(async (): Promise<PaymentMethodDTO[]> => {
        const currentTime = Date.now();
        const isRecentRequest = currentTime - lastRequestTimestamp < 2000;
        const isRequestInProgress = lastMethodRequestRef.current.inProgress;

        if ((isRecentRequest && paymentMethods.length > 0) || isRequestInProgress) {
            console.log('Skipping duplicate payment methods request');
            return activePaymentMethods;
        }

        lastMethodRequestRef.current = {
            methodId: null,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchPaymentMethodStart());
        try {
            console.log('Fetching active payment methods');
            const methods = await PaymentMethodService.getActivePaymentMethods();

            if (!Array.isArray(methods)) {
                throw new Error('Invalid payment methods data received from server');
            }

            console.log('Payment methods received:', methods);
            dispatch(fetchPaymentMethodsSuccess(methods));

            lastMethodRequestRef.current.inProgress = false;
            return methods;
        } catch (error) {
            lastMethodRequestRef.current.inProgress = false;
            const message = error instanceof Error ? error.message : 'Failed to fetch payment methods';
            console.error('Payment methods fetch error:', error);
            dispatch(fetchPaymentMethodFailure(message));
            throw error;
        }
    }, [dispatch, paymentMethods, activePaymentMethods, lastRequestTimestamp]);

    // Get payment method by ID
    const getPaymentMethodById = useCallback(async (methodId: number): Promise<PaymentMethodDTO> => {
        if (!methodId || isNaN(methodId)) {
            throw new Error('ID phương thức thanh toán không hợp lệ');
        }

        const currentTime = Date.now();
        const isSameRequest = methodId === lastMethodRequestRef.current.methodId;
        const isRecentRequest = currentTime - lastRequestTimestamp < 2000;
        const isRequestInProgress = lastMethodRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            console.log('Skipping duplicate payment method request for methodId:', methodId);
            if (currentMethod && currentMethod.methodId === methodId) return currentMethod;

            const existingMethod = paymentMethods.find(m => m.methodId === methodId);
            if (existingMethod) {
                dispatch(fetchPaymentMethodByIdSuccess(existingMethod));
                return existingMethod;
            }
        }

        lastMethodRequestRef.current = {
            methodId,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchPaymentMethodStart());
        try {
            console.log('Fetching payment method for methodId:', methodId);
            const method = await PaymentMethodService.getPaymentMethodById(methodId);

            if (!method || !method.methodId) {
                throw new Error('Invalid payment method data received from server');
            }

            console.log('Payment method received:', method);
            dispatch(fetchPaymentMethodByIdSuccess(method));

            lastMethodRequestRef.current.inProgress = false;
            return method;
        } catch (error) {
            lastMethodRequestRef.current.inProgress = false;
            const message = error instanceof Error ? error.message : 'Failed to fetch payment method';
            console.error('Payment method fetch error:', error);
            dispatch(fetchPaymentMethodFailure(message));
            throw error;
        }
    }, [dispatch, currentMethod, paymentMethods, lastRequestTimestamp]);

    // Get supported banks for a payment method
    const getSupportedBanks = useCallback(async (methodId: number): Promise<string[]> => {
        if (!methodId || isNaN(methodId)) {
            throw new Error('ID phương thức thanh toán không hợp lệ');
        }

        dispatch(fetchPaymentMethodStart());
        try {
            console.log('Fetching supported banks for methodId:', methodId);
            const banks = await PaymentMethodService.getSupportedBanks(methodId);

            if (!Array.isArray(banks)) {
                throw new Error('Invalid supported banks data received from server');
            }

            console.log('Supported banks received:', banks);
            dispatch(fetchSupportedBanksSuccess(banks));
            return banks;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch supported banks';
            console.error('Supported banks fetch error:', error);
            dispatch(fetchPaymentMethodFailure(message));
            throw error;
        }
    }, [dispatch]);

    // Check payment method status
    const checkPaymentMethodStatus = useCallback(async (methodId: number): Promise<ApiResponse> => {
        if (!methodId || isNaN(methodId)) {
            throw new Error('ID phương thức thanh toán không hợp lệ');
        }

        try {
            console.log('Checking status for methodId:', methodId);
            const response = await PaymentMethodService.checkPaymentMethodStatus(methodId);

            console.log('Payment method status:', response);
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể kiểm tra trạng thái phương thức thanh toán';
            console.error('Payment method status check error:', error);
            throw new Error(message);
        }
    }, []);

    // Get formatted payment method info
    const getFormattedPaymentMethod = useCallback((methodId: number): string => {
        return selectFormattedPaymentMethod(
            { paymentMethod: { paymentMethods, currentMethod, supportedBanks, loading, error, lastRequestTimestamp } } as RootState,
            methodId
        );
    }, [paymentMethods, currentMethod, supportedBanks, loading, error, lastRequestTimestamp]);

    // Check if method supports banks
    const supportsBanks = useCallback((methodId: number): boolean => {
        return selectMethodSupportsBanks(
            { paymentMethod: { paymentMethods, currentMethod, supportedBanks, loading, error, lastRequestTimestamp } } as RootState,
            methodId
        );
    }, [paymentMethods, currentMethod, supportedBanks, loading, error, lastRequestTimestamp]);

    // Clear error state
    const clearError = useCallback(() => {
        dispatch(clearPaymentMethodError());
    }, [dispatch]);

    // Reset current method
    const resetMethod = useCallback(() => {
        dispatch(resetCurrentMethod());
    }, [dispatch]);

    // Reset entire payment method state
    const resetPaymentMethodStateAction = useCallback(() => {
        dispatch(resetPaymentMethodState());
    }, [dispatch]);

    return {
        // State values
        paymentMethods,
        currentMethod,
        supportedBanks,
        loading,
        error,
        lastRequestTimestamp,

        // Derived values
        paymentMethodCount,
        hasPaymentMethods,
        activePaymentMethods,
        inactivePaymentMethods,
        sortedPaymentMethods,

        // API methods
        getActivePaymentMethods,
        getPaymentMethodById,
        getSupportedBanks,
        checkPaymentMethodStatus,

        // Helper methods
        getFormattedPaymentMethod,
        supportsBanks,
        clearError,
        resetMethod,
        resetPaymentMethodState: resetPaymentMethodStateAction
    };
};

export default usePaymentMethod;