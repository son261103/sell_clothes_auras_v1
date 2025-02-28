import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store'; // Đảm bảo RootState được import
import {
    fetchPaymentStart,
    fetchPaymentByIdSuccess,
    createPaymentSuccess,
    cancelPaymentSuccess,
    fetchPaymentHistorySuccess,
    fetchPaymentFailure,
    clearPaymentError,
    resetCurrentPayment,
    resetPaymentState
} from '../redux/slices/paymentSlice';
import {
    selectPayments,
    selectCurrentPayment,
    selectPaymentHistory,
    selectPaymentLoading,
    selectPaymentError,
    selectLastPaymentRequestTimestamp,
    selectPaymentCount,
    selectHasPayments,
    selectPaymentByOrderId,
    selectSortedPayments,
    selectPendingPayments,
    selectCompletedPayments,
    selectFailedPayments,
    selectTotalCompletedAmount,
    selectPaymentHasUrl,
    selectFormattedPaymentInfo
} from '../redux/selectors/paymentSelectors';
import PaymentService from '../services/payment.service';
import {PaymentRequestDTO, PaymentResponseDTO, PaymentHistoryDTO} from '../types/payment.types';
import {ApiResponse} from '../types';
import {useRef, useCallback} from 'react';
import useAuth from './useAuth';
import {toast} from 'react-hot-toast';

const usePayment = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {isAuthenticated, user} = useAuth();

    // Basic selectors
    const payments = useSelector(selectPayments);
    const currentPayment = useSelector(selectCurrentPayment);
    const paymentHistory = useSelector(selectPaymentHistory);
    const loading = useSelector(selectPaymentLoading);
    const error = useSelector(selectPaymentError);
    const lastRequestTimestamp = useSelector(selectLastPaymentRequestTimestamp);

    // Derived selectors
    const paymentCount = useSelector(selectPaymentCount);
    const hasPayments = useSelector(selectHasPayments);
    const sortedPayments = useSelector(selectSortedPayments);
    const pendingPayments = useSelector(selectPendingPayments);
    const completedPayments = useSelector(selectCompletedPayments);
    const failedPayments = useSelector(selectFailedPayments);
    const totalCompletedAmount = useSelector(selectTotalCompletedAmount);

    // Request tracking to prevent duplicate requests
    const lastPaymentRequestRef = useRef({
        userId: null as number | null,
        paymentId: null as number | null,
        timestamp: 0,
        inProgress: false
    });

    // Create a new payment
    const createPayment = useCallback(async (paymentData: PaymentRequestDTO): Promise<PaymentResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để tạo giao dịch thanh toán');
        }

        dispatch(fetchPaymentStart());
        try {
            const userId = user.userId;
            console.log('Creating payment for userId:', userId, paymentData);

            const newPayment = await PaymentService.createPayment(userId, paymentData);

            if (!newPayment || !newPayment.paymentId) {
                throw new Error('Invalid payment data received from server after creation');
            }

            console.log('Payment created successfully:', newPayment);
            dispatch(createPaymentSuccess(newPayment));
            toast.success('Đã tạo giao dịch thanh toán thành công');
            return newPayment;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tạo giao dịch thanh toán';
            console.error('Payment creation error:', error);
            dispatch(fetchPaymentFailure(message));
            toast.error(message);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get payment by order ID
    const getPaymentByOrderId = useCallback(async (orderId: number): Promise<PaymentResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem thông tin thanh toán');
        }

        if (!orderId || isNaN(orderId)) {
            throw new Error('ID đơn hàng không hợp lệ');
        }

        const userId = user.userId;
        const currentTime = Date.now();
        const existingPayment = selectPaymentByOrderId({payment: {payments}} as RootState, orderId);
        const isRecentRequest = currentTime - lastRequestTimestamp < 2000;

        if (existingPayment && isRecentRequest) {
            console.log('Skipping duplicate payment request for orderId:', orderId);
            return existingPayment;
        }

        lastPaymentRequestRef.current = {
            userId,
            paymentId: null,
            timestamp: currentTime,
            inProgress: true
        };

        dispatch(fetchPaymentStart());
        try {
            console.log('Fetching payment for orderId:', orderId);
            const payment = await PaymentService.getPaymentByOrderId(userId, orderId);

            if (!payment || !payment.paymentId) {
                throw new Error('Invalid payment data received from server');
            }

            console.log('Payment data received:', payment);
            dispatch(fetchPaymentByIdSuccess(payment));

            lastPaymentRequestRef.current.inProgress = false;
            return payment;
        } catch (error) {
            lastPaymentRequestRef.current.inProgress = false;
            const message = error instanceof Error ? error.message : 'Failed to fetch payment';
            console.error('Payment fetch error:', error);
            dispatch(fetchPaymentFailure(message));
            throw error;
        }
    }, [dispatch, payments, lastRequestTimestamp, isAuthenticated, user]);

    // Cancel a payment
    const cancelPayment = useCallback(async (paymentId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để hủy giao dịch thanh toán');
        }

        if (!paymentId || isNaN(paymentId)) {
            throw new Error('ID thanh toán không hợp lệ');
        }

        dispatch(fetchPaymentStart());
        try {
            const userId = user.userId;
            console.log('Canceling payment:', paymentId);

            const response = await PaymentService.cancelPayment(userId, paymentId);

            console.log('Payment canceled successfully');
            dispatch(cancelPaymentSuccess(paymentId));
            toast.success('Đã hủy giao dịch thanh toán thành công');
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể hủy giao dịch thanh toán';
            console.error('Payment cancellation error:', error);
            dispatch(fetchPaymentFailure(message));
            toast.error(message);
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Check payment status
    const checkPaymentStatus = useCallback(async (transactionId: string): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để kiểm tra trạng thái thanh toán');
        }

        if (!transactionId) {
            throw new Error('Mã giao dịch không hợp lệ');
        }

        try {
            const userId = user.userId;
            console.log('Checking payment status for transactionId:', transactionId);

            const response = await PaymentService.checkPaymentStatus(userId, transactionId);
            console.log('Payment status:', response);
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể kiểm tra trạng thái thanh toán';
            console.error('Payment status check error:', error);
            throw new Error(message);
        }
    }, [isAuthenticated, user]);

    // Get payment history by order ID
    const getPaymentHistoryByOrderId = useCallback(async (orderId: number): Promise<PaymentHistoryDTO[]> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem lịch sử thanh toán');
        }

        if (!orderId || isNaN(orderId)) {
            throw new Error('ID đơn hàng không hợp lệ');
        }

        dispatch(fetchPaymentStart());
        try {
            const userId = user.userId;
            console.log('Fetching payment history for orderId:', orderId);

            const history = await PaymentService.getPaymentHistoryByOrderId(userId, orderId);

            if (!Array.isArray(history)) {
                throw new Error('Invalid payment history data received from server');
            }

            console.log('Payment history received:', history);
            dispatch(fetchPaymentHistorySuccess(history));
            return history;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch payment history';
            console.error('Payment history fetch error:', error);
            dispatch(fetchPaymentFailure(message));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Confirm payment (VNPay callback)
    const confirmPayment = useCallback(async (vnpayParams: Record<string, string>): Promise<ApiResponse> => {
        try {
            console.log('Confirming payment with VNPay params:', vnpayParams);

            const response = await PaymentService.confirmPayment(vnpayParams);

            console.log('Payment confirmed successfully:', response);
            toast.success('Xác nhận thanh toán thành công');
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể xác nhận thanh toán';
            console.error('Payment confirmation error:', error);
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Get formatted payment info
    const getFormattedPaymentInfo = useCallback((paymentId: number): string => {
        return selectFormattedPaymentInfo({
            payment: {
                payments,
                currentPayment,
                paymentHistory,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, paymentId);
    }, [payments, currentPayment, paymentHistory, loading, error, lastRequestTimestamp]);

    // Check if payment has URL
    const hasPaymentUrl = useCallback((paymentId: number): boolean => {
        return selectPaymentHasUrl({
            payment: {
                payments,
                currentPayment,
                paymentHistory,
                loading,
                error,
                lastRequestTimestamp
            }
        } as RootState, paymentId);
    }, [payments, currentPayment, paymentHistory, loading, error, lastRequestTimestamp]);

    // Clear error state
    const clearError = useCallback(() => {
        dispatch(clearPaymentError());
    }, [dispatch]);

    // Reset current payment
    const resetPayment = useCallback(() => {
        dispatch(resetCurrentPayment());
    }, [dispatch]);

    // Reset entire payment state
    const resetPaymentStateAction = useCallback(() => {
        dispatch(resetPaymentState());
    }, [dispatch]);

    return {
        // State values
        payments,
        currentPayment,
        paymentHistory,
        loading,
        error,
        lastRequestTimestamp,

        // Derived values
        paymentCount,
        hasPayments,
        sortedPayments,
        pendingPayments,
        completedPayments,
        failedPayments,
        totalCompletedAmount,

        // API methods
        createPayment,
        getPaymentByOrderId,
        cancelPayment,
        checkPaymentStatus,
        getPaymentHistoryByOrderId,
        confirmPayment,

        // Helper methods
        getFormattedPaymentInfo,
        hasPaymentUrl,
        clearError,
        resetPayment,
        resetPaymentState: resetPaymentStateAction
    };
};

export default usePayment;