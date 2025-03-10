import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
    fetchCouponStart,
    fetchValidCouponsSuccess,
    fetchCouponDetailsSuccess,
    validateCouponSuccess,
    applyCouponSuccess,
    fetchCouponFailure,
    clearAppliedCoupon,
    clearCouponError,
    resetCurrentCoupon,
    updateOrderWithCoupon,
    checkCouponExistsSuccess,
    resetCouponState
} from '../redux/slices/couponSlice';
import {
    selectValidCoupons,
    selectCurrentCoupon,
    selectAppliedCoupon,
    selectValidationResult,
    selectOrderWithCoupon,
    selectCouponLoading,
    selectCouponError,
    selectLastCouponRequestTimestamp,
    selectHasAppliedCoupon,
    selectAppliedCouponCode,
    selectAppliedCouponDiscountAmount,
    selectAppliedCouponType,
    selectCouponDiscountDisplay,
    selectIsCouponValid,
    selectCouponValidationMessage,
    selectIsCouponExpired,
    selectIsCouponFullyUsed,
    selectCouponUsageLimitInfo,
    selectCouponDateInfo,
    selectCouponHasMinOrderAmount,
    selectCouponMinOrderAmount,
    selectCouponHasMaxDiscountAmount,
    selectCouponMaxDiscountAmount,
    selectOrderSubtotalBeforeDiscount,
    selectOrderTotalDiscount,
    selectOrderTotalAfterDiscount,
    selectCouponByCode,
    selectActiveCoupons,
    selectSoonToExpireCoupons,
    selectCouponCountByType,
    selectCouponStatusText,
    selectCouponTypeText
} from '../redux/selectors/couponSelectors';
import CouponService from '../services/coupon.service';
import {
    CouponResponseDTO,
    CouponValidationDTO,
    CouponType,
    OrderWithCouponDTO
} from '../types/coupon.types';
import { useRef, useCallback } from 'react';

const useCoupon = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Selectors from state
    const validCoupons = useSelector(selectValidCoupons);
    const currentCoupon = useSelector(selectCurrentCoupon);
    const appliedCoupon = useSelector(selectAppliedCoupon);
    const validationResult = useSelector(selectValidationResult);
    const orderWithCoupon = useSelector(selectOrderWithCoupon);
    const loading = useSelector(selectCouponLoading);
    const error = useSelector(selectCouponError);
    const lastRequestTimestamp = useSelector(selectLastCouponRequestTimestamp);

    // Derived selectors
    const hasAppliedCoupon = useSelector(selectHasAppliedCoupon);
    const appliedCouponCode = useSelector(selectAppliedCouponCode);
    const appliedCouponDiscountAmount = useSelector(selectAppliedCouponDiscountAmount);
    const appliedCouponType = useSelector(selectAppliedCouponType);
    const couponDiscountDisplay = useSelector(selectCouponDiscountDisplay);
    const isCouponValid = useSelector(selectIsCouponValid);
    const couponValidationMessage = useSelector(selectCouponValidationMessage);
    const isCouponExpired = useSelector(selectIsCouponExpired);
    const isCouponFullyUsed = useSelector(selectIsCouponFullyUsed);
    const couponUsageLimitInfo = useSelector(selectCouponUsageLimitInfo);
    const couponDateInfo = useSelector(selectCouponDateInfo);
    const couponHasMinOrderAmount = useSelector(selectCouponHasMinOrderAmount);
    const couponMinOrderAmount = useSelector(selectCouponMinOrderAmount);
    const couponHasMaxDiscountAmount = useSelector(selectCouponHasMaxDiscountAmount);
    const couponMaxDiscountAmount = useSelector(selectCouponMaxDiscountAmount);
    const orderSubtotalBeforeDiscount = useSelector(selectOrderSubtotalBeforeDiscount);
    const orderTotalDiscount = useSelector(selectOrderTotalDiscount);
    const orderTotalAfterDiscount = useSelector(selectOrderTotalAfterDiscount);
    const activeCoupons = useSelector(selectActiveCoupons);
    const soonToExpireCoupons = useSelector(selectSoonToExpireCoupons);
    const couponCountByType = useSelector(selectCouponCountByType);

    // Request tracking để ngăn chặn các yêu cầu trùng lặp
    const requestLockRef = useRef(new Map<string, { inProgress: boolean; timestamp: number }>());

    // Lấy danh sách mã giảm giá có hiệu lực
    const getValidCoupons = useCallback(async (): Promise<CouponResponseDTO[]> => {
        const cacheKey = 'validCoupons';
        const lock = requestLockRef.current.get(cacheKey) || { inProgress: false, timestamp: 0 };
        const currentTime = Date.now();

        // Tránh các yêu cầu trùng lặp trong 10 giây
        if (lock.inProgress || (currentTime - lock.timestamp < 10000 && validCoupons.length > 0)) {
            return validCoupons;
        }

        requestLockRef.current.set(cacheKey, { inProgress: true, timestamp: currentTime });

        dispatch(fetchCouponStart());
        try {
            const coupons = await CouponService.getValidCoupons();
            dispatch(fetchValidCouponsSuccess(coupons));
            requestLockRef.current.set(cacheKey, { inProgress: false, timestamp: currentTime });
            return coupons;
        } catch (error) {
            requestLockRef.current.set(cacheKey, { inProgress: false, timestamp: currentTime });
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy danh sách mã giảm giá';
            dispatch(fetchCouponFailure(errorMessage));
            throw error;
        }
    }, [dispatch, validCoupons]);

    // Lấy thông tin chi tiết mã giảm giá theo code
    const getCouponByCode = useCallback(async (code: string): Promise<CouponResponseDTO> => {
        if (!code) {
            throw new Error('Mã giảm giá không hợp lệ');
        }

        // Nếu currentCoupon đã có và khớp với code, trả về ngay lập tức
        if (currentCoupon && currentCoupon.code === code) {
            return currentCoupon;
        }

        const cacheKey = `coupon-${code}`;
        const lock = requestLockRef.current.get(cacheKey) || { inProgress: false, timestamp: 0 };
        const currentTime = Date.now();

        if (lock.inProgress) {
            throw new Error('Yêu cầu đang được xử lý');
        }

        requestLockRef.current.set(cacheKey, { inProgress: true, timestamp: currentTime });

        dispatch(fetchCouponStart());
        try {
            const couponData = await CouponService.getCouponByCode(code);
            dispatch(fetchCouponDetailsSuccess(couponData));
            requestLockRef.current.set(cacheKey, { inProgress: false, timestamp: currentTime });
            return couponData;
        } catch (error) {
            requestLockRef.current.set(cacheKey, { inProgress: false, timestamp: currentTime });
            const errorMessage = error instanceof Error ? error.message : 'Không thể lấy thông tin mã giảm giá';
            dispatch(fetchCouponFailure(errorMessage));
            throw error;
        }
    }, [dispatch, currentCoupon]);

    // Kiểm tra xem mã giảm giá có tồn tại không
    const checkCouponExists = useCallback(async (code: string): Promise<boolean> => {
        if (!code) {
            return false;
        }

        dispatch(fetchCouponStart());
        try {
            const response = await CouponService.checkCouponExists(code);
            const exists = response.success;
            dispatch(checkCouponExistsSuccess(exists));
            return exists;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể kiểm tra mã giảm giá';
            dispatch(fetchCouponFailure(errorMessage));
            return false;
        }
    }, [dispatch]);

    // Xác thực mã giảm giá
    const validateCoupon = useCallback(async (code: string, orderAmount: number): Promise<CouponValidationDTO> => {
        if (!code) {
            throw new Error('Mã giảm giá không hợp lệ');
        }

        if (orderAmount <= 0) {
            throw new Error('Giá trị đơn hàng phải lớn hơn 0');
        }

        dispatch(fetchCouponStart());
        try {
            const validationData = await CouponService.validateCoupon(code, orderAmount);
            dispatch(validateCouponSuccess(validationData));
            return validationData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể xác thực mã giảm giá';
            dispatch(fetchCouponFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Áp dụng mã giảm giá cho đơn hàng
    const applyCoupon = useCallback(async (code: string, orderTotal: number): Promise<OrderWithCouponDTO> => {
        if (!code) {
            throw new Error('Mã giảm giá không hợp lệ');
        }

        if (orderTotal <= 0) {
            throw new Error('Giá trị đơn hàng phải lớn hơn 0');
        }

        dispatch(fetchCouponStart());
        try {
            const orderWithAppliedCoupon = await CouponService.applyCoupon(code, orderTotal);
            dispatch(applyCouponSuccess(orderWithAppliedCoupon));
            return orderWithAppliedCoupon;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể áp dụng mã giảm giá';
            dispatch(fetchCouponFailure(errorMessage));
            throw error;
        }
    }, [dispatch]);

    // Xóa mã giảm giá đã áp dụng
    const removeCoupon = useCallback(() => {
        dispatch(clearAppliedCoupon());
    }, [dispatch]);

    // Cập nhật thông tin đơn hàng (khi đơn hàng thay đổi)
    const updateCouponDiscount = useCallback((subtotalBeforeDiscount: number, totalDiscount: number) => {
        dispatch(updateOrderWithCoupon({ subtotalBeforeDiscount, totalDiscount }));
    }, [dispatch]);

    // Tính toán số tiền giảm giá dựa trên loại mã giảm giá
    const calculateDiscountAmount = useCallback((
        type: CouponType,
        value: number,
        orderAmount: number,
        maxDiscountAmount?: number
    ): number => {
        return CouponService.calculateDiscountAmount(type, value, orderAmount, maxDiscountAmount);
    }, []);

    // Tạo mã giảm giá ngẫu nhiên
    const generateRandomCouponCode = useCallback((length: number = 8): string => {
        return CouponService.generateRandomCouponCode(length);
    }, []);

    // Helper methods
    const getCouponStatusText = useCallback((coupon: CouponResponseDTO): string => {
        return selectCouponStatusText({ coupon: { currentCoupon: coupon } } as RootState);
    }, []);

    const getCouponTypeText = useCallback((type: CouponType): string => {
        return selectCouponTypeText({} as RootState, type);
    }, []);

    const getCouponByCodeFromState = useCallback((code: string): CouponResponseDTO | null => {
        return selectCouponByCode({ coupon: { validCoupons } } as RootState, code);
    }, [validCoupons]);

    const clearError = useCallback(() => {
        dispatch(clearCouponError());
    }, [dispatch]);

    const resetCoupon = useCallback(() => {
        dispatch(resetCurrentCoupon());
    }, [dispatch]);

    const resetCouponStateAction = useCallback(() => {
        dispatch(resetCouponState());
    }, [dispatch]);

    const getCouponSummary = useCallback(() => {
        return {
            totalCoupons: couponCountByType.total,
            percentageCoupons: couponCountByType[CouponType.PERCENTAGE],
            fixedAmountCoupons: couponCountByType[CouponType.FIXED_AMOUNT],
            activeCouponsCount: activeCoupons.length,
            soonToExpireCouponsCount: soonToExpireCoupons.length
        };
    }, [couponCountByType, activeCoupons.length, soonToExpireCoupons.length]);

    return {
        // State values
        validCoupons,
        currentCoupon,
        appliedCoupon,
        validationResult,
        orderWithCoupon,
        loading,
        error,
        lastRequestTimestamp,

        // Derived values
        hasAppliedCoupon,
        appliedCouponCode,
        appliedCouponDiscountAmount,
        appliedCouponType,
        couponDiscountDisplay,
        isCouponValid,
        couponValidationMessage,
        isCouponExpired,
        isCouponFullyUsed,
        couponUsageLimitInfo,
        couponDateInfo,
        couponHasMinOrderAmount,
        couponMinOrderAmount,
        couponHasMaxDiscountAmount,
        couponMaxDiscountAmount,
        orderSubtotalBeforeDiscount,
        orderTotalDiscount,
        orderTotalAfterDiscount,
        activeCoupons,
        soonToExpireCoupons,
        couponCountByType,

        // API methods
        getValidCoupons,
        getCouponByCode,
        checkCouponExists,
        validateCoupon,
        applyCoupon,
        removeCoupon,
        updateCouponDiscount,
        calculateDiscountAmount,
        generateRandomCouponCode,

        // Helper methods
        getCouponStatusText,
        getCouponTypeText,
        getCouponByCodeFromState,
        clearError,
        resetCoupon,
        resetCouponState: resetCouponStateAction,
        getCouponSummary,
    };
};

export default useCoupon;