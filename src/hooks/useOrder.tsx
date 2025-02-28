import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '../redux/store';
import {
    fetchOrderStart,
    fetchOrderSuccess,
    fetchOrderListSuccess,
    fetchOrderItemsSuccess,
    fetchShippingMethodsSuccess,
    fetchOrderFailure,
    createOrderSuccess,
    updateOrderFilter,
    cancelOrderSuccess,
    fetchPaymentSuccess,
    createPaymentSuccess,
    updatePaymentStatusSuccess,
    cancelPaymentSuccess,
    clearOrderError,
    resetCurrentOrder,
    resetShippingState,
    resetOrderState
} from '../redux/slices/orderSlice';
import {
    selectCurrentOrder,
    selectOrderList,
    selectOrderPagination,
    selectOrderItems,
    selectPayment,
    selectShippingMethods,
    selectShippingEstimate,
    selectOrderLoading,
    selectOrderError,
    selectOrderFilters,
    selectCurrentOrderItemCount,
    selectCurrentOrderTotal,
    selectCurrentOrderShippingFee,
    selectCurrentOrderShippingMethod,
    selectIsFreeShippingEligible,
    selectAmountForFreeShipping,
    selectIsCurrentOrderPaid,
    selectCanCancelOrder,
    selectOrderById,
    selectShippingMethodById,
    selectShippingMethodsWithDetails,
    selectOrdersByStatus,
    selectOrderCountByStatus,
    selectCurrentOrderPayment,
    selectCurrentOrderPaymentUrl,
    selectIsPaymentPending,
    selectIsPaymentCompleted,
    selectIsPaymentFailed,
    selectPendingOrderCount,
    selectRecentOrders,
    selectOrderStatusText,
    selectPaymentStatusText
} from '../redux/selectors/orderSelectors';
import OrderService from '../services/order.service';
import {
    OrderResponseDTO,
    OrderSummaryDTO,
    OrderItemDTO,
    PaymentResponseDTO,
    OrderStatus,
    CreateOrderDTO,
    CancelOrderDTO,
    PaymentRequestDTO,
    PaginatedResponse,
    ShippingMethodDTO,
    BestsellingProductDTO,
    PaymentMethodDTO
} from '../types/order.types';
import {useRef, useCallback} from 'react';
import {RootState} from '../redux/store';
import useAuth from './useAuth';
import {PaymentStatus} from "../enum/PaymentStatus.tsx";
import {ApiResponse} from "../types";

const useOrder = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {isAuthenticated, user} = useAuth();

    // Selectors from state
    const currentOrder = useSelector(selectCurrentOrder);
    const orderList = useSelector(selectOrderList);
    const pagination = useSelector(selectOrderPagination);
    const orderItems = useSelector(selectOrderItems);
    const payment = useSelector(selectPayment);
    const shippingMethods = useSelector(selectShippingMethods);
    const shippingEstimate = useSelector(selectShippingEstimate);
    const loading = useSelector(selectOrderLoading);
    const error = useSelector(selectOrderError);
    const filters = useSelector(selectOrderFilters);

    // Derived selectors
    const currentOrderItemCount = useSelector(selectCurrentOrderItemCount);
    const currentOrderTotal = useSelector(selectCurrentOrderTotal);
    const currentOrderShippingFee = useSelector(selectCurrentOrderShippingFee);
    const currentOrderShippingMethod = useSelector(selectCurrentOrderShippingMethod);
    const isFreeShippingEligible = useSelector(selectIsFreeShippingEligible);
    const amountForFreeShipping = useSelector(selectAmountForFreeShipping);
    const isCurrentOrderPaid = useSelector(selectIsCurrentOrderPaid);
    const canCancelOrder = useSelector(selectCanCancelOrder);
    const pendingOrderCount = useSelector(selectPendingOrderCount);
    const recentOrders = useSelector(selectRecentOrders);
    const orderStatusCounts = useSelector(selectOrderCountByStatus);
    const currentOrderPayment = useSelector(selectCurrentOrderPayment);
    const currentOrderPaymentUrl = useSelector(selectCurrentOrderPaymentUrl);
    const isPaymentPending = useSelector(selectIsPaymentPending);
    const isPaymentCompleted = useSelector(selectIsPaymentCompleted);
    const isPaymentFailed = useSelector(selectIsPaymentFailed);
    const shippingMethodsWithDetails = useSelector(selectShippingMethodsWithDetails);

    // Request tracking to prevent duplicate requests
    const lastOrderRequestRef = useRef({
        userId: null as number | null,
        orderId: null as number | null,
        timestamp: 0,
        inProgress: false
    });

    // Get order by ID
    const getOrderById = useCallback(async (orderId: number): Promise<OrderResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem thông tin đơn hàng');
        }

        if (!orderId || isNaN(orderId)) {
            throw new Error('ID đơn hàng không hợp lệ');
        }

        const userId = user.userId;
        const currentTime = Date.now();
        const isSameRequest = orderId === lastOrderRequestRef.current.orderId &&
            userId === lastOrderRequestRef.current.userId;
        const isRecentRequest = currentTime - lastOrderRequestRef.current.timestamp < 2000;
        const isRequestInProgress = lastOrderRequestRef.current.inProgress;

        if ((isSameRequest && isRecentRequest) || (isSameRequest && isRequestInProgress)) {
            if (currentOrder && currentOrder.orderId === orderId) return currentOrder;
            throw new Error('Request already in progress or too frequent');
        }

        lastOrderRequestRef.current = {userId, orderId, timestamp: currentTime, inProgress: true};

        dispatch(fetchOrderStart());
        try {
            const orderData = await OrderService.getOrderById(userId, orderId);
            dispatch(fetchOrderSuccess(orderData));
            if (orderData.payment) {
                dispatch(fetchPaymentSuccess(orderData.payment));
            }
            lastOrderRequestRef.current.inProgress = false;
            return orderData;
        } catch (error) {
            lastOrderRequestRef.current.inProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy thông tin đơn hàng';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, currentOrder, isAuthenticated, user]);

    // Get user orders with pagination and optional filters
    const getUserOrders = useCallback(async (
        page: number = 0,
        size: number = 10,
        status?: OrderStatus
    ): Promise<PaginatedResponse<OrderSummaryDTO>> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem danh sách đơn hàng');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const orderListData = status
                ? await OrderService.getUserOrdersByStatus(userId, status, page, size)
                : await OrderService.getUserOrders(userId, page, size);
            dispatch(fetchOrderListSuccess(orderListData));
            if (status !== undefined && status !== filters.status) {
                dispatch(updateOrderFilter({status}));
            }
            return orderListData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy danh sách đơn hàng';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user, filters.status]);

    // Create a new order
    const createOrder = useCallback(async (orderData: CreateOrderDTO): Promise<OrderResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để tạo đơn hàng');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const newOrder = await OrderService.createOrder(userId, orderData);
            dispatch(createOrderSuccess(newOrder));
            return newOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể tạo đơn hàng';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Cancel an order
    const cancelOrder = useCallback(async (orderId: number, cancelData: CancelOrderDTO): Promise<OrderResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để hủy đơn hàng');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const cancelledOrder = await OrderService.cancelOrder(userId, orderId, cancelData);
            dispatch(cancelOrderSuccess(cancelledOrder));
            return cancelledOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể hủy đơn hàng';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get shipping methods
    const getShippingMethods = useCallback(async (): Promise<ShippingMethodDTO[]> => {
        dispatch(fetchOrderStart());
        try {
            const methods = await OrderService.getShippingMethods();
            dispatch(fetchShippingMethodsSuccess(methods));
            return methods;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy phương thức vận chuyển';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Estimate shipping (adjusted to match OrderService)
    const estimateOrderShipping = useCallback(async (
        orderTotal: number,
        shippingMethodId: number,
        totalWeight?: number
    ): Promise<ApiResponse> => {
        dispatch(fetchOrderStart());
        try {
            const estimate = await OrderService.estimateOrderShipping(orderTotal, shippingMethodId, totalWeight);
            // Note: This returns ApiResponse, not ShippingEstimateDTO
            // We won't dispatch fetchShippingEstimateSuccess since types don't match perfectly
            return estimate;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể ước tính phí vận chuyển';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Create payment
    const createPayment = useCallback(async (paymentRequest: PaymentRequestDTO): Promise<PaymentResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để tạo thanh toán');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const newPayment = await OrderService.createPayment(userId, paymentRequest);
            dispatch(createPaymentSuccess(newPayment));
            return newPayment;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể tạo thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Check payment status
    const checkPaymentStatus = useCallback(async (transactionId: string): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để kiểm tra trạng thái thanh toán');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const response = await OrderService.checkPaymentStatus(userId, transactionId);
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể kiểm tra trạng thái thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Cancel payment
    const cancelPayment = useCallback(async (paymentId: number): Promise<ApiResponse> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để hủy thanh toán');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const response = await OrderService.cancelPayment(userId, paymentId);
            dispatch(cancelPaymentSuccess());
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể hủy thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get order items
    const getOrderItems = useCallback(async (orderId: number): Promise<OrderItemDTO[]> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem chi tiết đơn hàng');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const items = await OrderService.getOrderItems(userId, orderId);
            dispatch(fetchOrderItemsSuccess(items));
            return items;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy chi tiết đơn hàng';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get payment by order ID
    const getPaymentByOrderId = useCallback(async (orderId: number): Promise<PaymentResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để xem thông tin thanh toán');
        }

        dispatch(fetchOrderStart());
        try {
            const userId = user.userId;
            const paymentData = await OrderService.getPaymentByOrderId(userId, orderId);
            dispatch(fetchPaymentSuccess(paymentData));
            return paymentData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy thông tin thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get payment methods
    const getPaymentMethods = useCallback(async (): Promise<PaymentMethodDTO[]> => {
        try {
            return await OrderService.getAvailablePaymentMethods();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy phương thức thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Open payment page
    const openPaymentPage = useCallback((paymentUrl: string): void => {
        OrderService.openPaymentPage(paymentUrl);
    }, []);

    // Verify payment callback
    const verifyPaymentCallback = useCallback(async (queryParams: URLSearchParams): Promise<PaymentResponseDTO> => {
        dispatch(fetchOrderStart());
        try {
            const verificationResult = await OrderService.verifyPaymentCallback(queryParams);
            dispatch(updatePaymentStatusSuccess(verificationResult));
            return verificationResult;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể xác minh thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Poll payment status
    const pollPaymentStatus = useCallback(async (
        orderId: number,
        intervalMs?: number,
        timeoutMs?: number
    ): Promise<PaymentResponseDTO> => {
        if (!isAuthenticated || !user?.userId) {
            throw new Error('Bạn cần đăng nhập để theo dõi trạng thái thanh toán');
        }

        try {
            const userId = user.userId;
            const paymentStatus = await OrderService.pollPaymentStatus(userId, orderId, intervalMs, timeoutMs);
            dispatch(updatePaymentStatusSuccess(paymentStatus));
            return paymentStatus;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể theo dõi trạng thái thanh toán';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch, isAuthenticated, user]);

    // Get bestselling products
    const getBestsellingProducts = useCallback(async (limit: number = 10): Promise<BestsellingProductDTO[]> => {
        try {
            return await OrderService.getBestsellingProducts(limit);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy danh sách sản phẩm bán chạy';
            dispatch(fetchOrderFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Helper methods
    const getOrderStatusText = useCallback((status: OrderStatus): string => {
        return selectOrderStatusText({} as RootState, status);
    }, []);

    const getPaymentStatusText = useCallback((status: PaymentStatus): string => {
        return selectPaymentStatusText({} as RootState, status);
    }, []);

    const getOrderByIdFromState = useCallback((orderId: number): OrderSummaryDTO | null => {
        return selectOrderById({order: {orderList}} as RootState, orderId);
    }, [orderList]);

    const getShippingMethodById = useCallback((methodId: number): ShippingMethodDTO | null => {
        return selectShippingMethodById({order: {shippingMethods}} as RootState, methodId);
    }, [shippingMethods]);

    const getOrdersByStatus = useCallback((status: OrderStatus): OrderSummaryDTO[] => {
        return selectOrdersByStatus({order: {orderList}} as RootState, status);
    }, [orderList]);

    const clearError = useCallback(() => {
        dispatch(clearOrderError());
    }, [dispatch]);

    const resetOrder = useCallback(() => {
        dispatch(resetCurrentOrder());
    }, [dispatch]);

    const resetShipping = useCallback(() => {
        dispatch(resetShippingState());
    }, [dispatch]);

    const resetOrderStateAction = useCallback(() => {
        dispatch(resetOrderState());
    }, [dispatch]);

    const getOrderSummary = useCallback(() => {
        return {
            totalOrders: orderStatusCounts.total,
            pendingOrders: orderStatusCounts[OrderStatus.PENDING],
            confirmedOrders: orderStatusCounts[OrderStatus.CONFIRMED],
            processingOrders: orderStatusCounts[OrderStatus.PROCESSING],
            shippingOrders: orderStatusCounts[OrderStatus.SHIPPING],
            completedOrders: orderStatusCounts[OrderStatus.COMPLETED],
            cancelledOrders: orderStatusCounts[OrderStatus.CANCELLED],
        };
    }, [orderStatusCounts]);

    return {
        // State values
        currentOrder,
        orderList,
        pagination,
        orderItems,
        payment,
        shippingMethods,
        shippingEstimate,
        loading,
        error,
        filters,

        // Derived values
        currentOrderItemCount,
        currentOrderTotal,
        currentOrderShippingFee,
        currentOrderShippingMethod,
        isFreeShippingEligible,
        amountForFreeShipping,
        isCurrentOrderPaid,
        canCancelOrder,
        pendingOrderCount,
        recentOrders,
        orderStatusCounts,
        currentOrderPayment,
        currentOrderPaymentUrl,
        isPaymentPending,
        isPaymentCompleted,
        isPaymentFailed,
        shippingMethodsWithDetails,

        // API methods (only those in OrderService)
        getOrderById,
        getUserOrders,
        createOrder,
        cancelOrder,
        getShippingMethods,
        estimateOrderShipping,
        createPayment,
        checkPaymentStatus,
        cancelPayment,
        getOrderItems,
        getPaymentByOrderId,
        getPaymentMethods,
        openPaymentPage,
        verifyPaymentCallback,
        pollPaymentStatus,
        getBestsellingProducts,

        // Helper methods
        getOrderStatusText,
        getPaymentStatusText,
        getOrderByIdFromState,
        getShippingMethodById,
        getOrdersByStatus,
        clearError,
        resetOrder,
        resetShipping,
        resetOrderState: resetOrderStateAction,
        getOrderSummary
    };
};

export default useOrder;