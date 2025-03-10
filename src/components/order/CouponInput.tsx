import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import useCoupon from '../../hooks/useCoupon';
import { toast } from 'react-hot-toast';

interface CouponInputProps {
    orderTotal: number;
    onCouponApplied: (discount: number) => void;
    className?: string;
}

const CouponInput: React.FC<CouponInputProps> = ({ orderTotal, onCouponApplied, className = '' }) => {
    const [couponCode, setCouponCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState('');

    const {
        validateCoupon,
        applyCoupon,
        removeCoupon,
        hasAppliedCoupon,
        appliedCouponCode,
        appliedCouponDiscountAmount,
        couponDiscountDisplay,
        loading
    } = useCoupon();

    // Reset error when coupon code changes
    useEffect(() => {
        if (validationError) {
            setValidationError('');
        }
    }, [couponCode]);

    // Notify parent component when discount changes
    useEffect(() => {
        if (hasAppliedCoupon && appliedCouponDiscountAmount) {
            onCouponApplied(appliedCouponDiscountAmount);
        } else {
            onCouponApplied(0);
        }
    }, [hasAppliedCoupon, appliedCouponDiscountAmount, onCouponApplied]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setValidationError('Vui lòng nhập mã giảm giá');
            return;
        }

        if (orderTotal <= 0) {
            setValidationError('Không thể áp dụng mã giảm giá cho đơn hàng trống');
            return;
        }

        setIsValidating(true);
        setValidationError('');

        try {
            // First validate the coupon
            const validationResult = await validateCoupon(couponCode.trim(), orderTotal);

            if (validationResult.valid) {
                // If valid, apply the coupon to the order
                await applyCoupon(couponCode.trim(), orderTotal);
                toast.success('Đã áp dụng mã giảm giá thành công!');
                setCouponCode('');
            } else {
                setValidationError(validationResult.message || 'Mã giảm giá không hợp lệ');
                toast.error(validationResult.message || 'Mã giảm giá không hợp lệ');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể áp dụng mã giảm giá';
            setValidationError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        toast.success('Đã xóa mã giảm giá');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApplyCoupon();
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 ${className}`}>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <FiTag className="w-4 h-4 mr-2 text-primary" />
                Mã giảm giá
            </h3>

            <AnimatePresence mode="wait">
                {!hasAppliedCoupon ? (
                    <motion.div
                        key="coupon-input"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Nhập mã giảm giá"
                                disabled={isValidating || loading}
                                onKeyDown={handleKeyDown}
                                className={`w-full p-2 pr-8 border ${validationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm uppercase disabled:opacity-70 disabled:cursor-not-allowed`}
                            />
                            {couponCode && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    onClick={() => setCouponCode('')}
                                    disabled={isValidating || loading}
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <motion.button
                            onClick={handleApplyCoupon}
                            disabled={isValidating || loading || !couponCode.trim()}
                            className="min-w-20 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isValidating || loading ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Áp dụng</>
                            )}
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="coupon-applied"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-md p-3"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="bg-green-100 dark:bg-green-800/30 p-1.5 rounded-full mr-2">
                                    <FiCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appliedCouponCode}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        {couponDiscountDisplay}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleRemoveCoupon}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {validationError && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 flex items-start text-red-500 dark:text-red-400 text-xs"
                >
                    <FiAlertCircle className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
                    <span>{validationError}</span>
                </motion.div>
            )}
        </div>
    );
};

export default CouponInput;