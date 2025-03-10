import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useOrder from '../../hooks/useOrder';
import useUserAddress from '../../hooks/useUserAddress';
import useShipping from '../../hooks/useShipping';
import usePaymentMethod from '../../hooks/usePaymentMethod';
import useAuth from '../../hooks/useAuth';
import useCoupon from '../../hooks/useCoupon';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiPlus, FiTruck, FiPackage, FiMap, FiMessageSquare, FiCreditCard, FiShoppingBag } from 'react-icons/fi';
import { AddressResponseDTO } from '../../types/user.address.types';

// Import Components
import OrderItem from '../../components/order/OrderItem';
import EnhancedAddressCard from '../../components/order/EnhancedAddressCard';
import OrderSummary from '../../components/order/OrderSummary';
import OrderPreview from '../../components/order/OrderPreview';
import AddressForm from '../../components/order/AddressForm';
import ShippingMethodForm from '../../components/order/ShippingMethodForm';
import PaymentMethodForm from '../../components/payment/PaymentMethodForm';
import CouponInput from '../../components/order/CouponInput';

// Animation variants for sections
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const OrderPage: React.FC = () => {
    const navigate = useNavigate();
    const [isInitialized, setIsInitialized] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const { cartItems, loading: cartLoading, totalPrice, getUserCart } = useCart();
    const { createOrder, loading: orderLoading } = useOrder();
    const {
        addresses,
        sortedAddresses,
        defaultAddress,
        loading: addressLoading,
        getUserAddresses,
        deleteAddress,
        setAsDefaultAddress
    } = useUserAddress();
    const { shippingMethods, getAllShippingMethods, loading: shippingLoading } = useShipping();
    const { paymentMethods, getActivePaymentMethods, loading: paymentMethodLoading } = usePaymentMethod();
    const {
        hasAppliedCoupon,
        appliedCouponCode,
        appliedCouponDiscountAmount,
    } = useCoupon();

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAddressListModal, setShowAddressListModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addressToEdit, setAddressToEdit] = useState<AddressResponseDTO | undefined>(undefined);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
    const [orderNote, setOrderNote] = useState('');
    const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
    const selectedShippingMethod = shippingMethods.find(method => method.id === selectedShippingMethodId);
    const selectedPaymentMethod = paymentMethods.find(method => method.methodId === selectedPaymentMethodId);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
            mirror: false
        });
    }, []);

    // Update coupon discount when the applied coupon changes
    useEffect(() => {
        if (hasAppliedCoupon && appliedCouponDiscountAmount) {
            setCouponDiscount(appliedCouponDiscountAmount);
        } else {
            setCouponDiscount(0);
        }
    }, [hasAppliedCoupon, appliedCouponDiscountAmount]);

    // Lấy dữ liệu địa chỉ
    useEffect(() => {
        if (isAuthenticated && user?.userId && !hasFetchedAddresses && !addressLoading) {
            const fetchAddresses = async () => {
                try {
                    await getUserAddresses();
                    setHasFetchedAddresses(true);
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                    toast.error('Không thể tải danh sách địa chỉ');
                }
            };
            fetchAddresses();
        }
    }, [isAuthenticated, user, getUserAddresses, hasFetchedAddresses, addressLoading]);

    // Chọn địa chỉ mặc định
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(defaultAddress?.addressId || addresses[0].addressId);
        }
    }, [addresses, defaultAddress, selectedAddressId]);

    // Lấy danh sách phương thức vận chuyển
    useEffect(() => {
        const fetchShippingMethods = async () => {
            try {
                await getAllShippingMethods();
            } catch (error) {
                console.error('Error fetching shipping methods:', error);
                toast.error('Không thể tải danh sách phương thức vận chuyển');
            }
        };
        if (!shippingMethods.length && !shippingLoading) {
            fetchShippingMethods();
        }
    }, [getAllShippingMethods, shippingMethods, shippingLoading]);

    // Chọn phương thức vận chuyển mặc định và cập nhật phí
    useEffect(() => {
        if (shippingMethods.length > 0 && !selectedShippingMethodId) {
            const defaultMethod = shippingMethods[0];
            setSelectedShippingMethodId(defaultMethod.id);
            setShippingFee(defaultMethod.baseFee);
        }
    }, [shippingMethods, selectedShippingMethodId]);

    // Cập nhật phí vận chuyển khi thay đổi phương thức
    useEffect(() => {
        if (selectedShippingMethod) {
            setShippingFee(selectedShippingMethod.baseFee);
        }
    }, [selectedShippingMethod]);

    // Lấy danh sách phương thức thanh toán
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                await getActivePaymentMethods();
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                toast.error('Không thể tải danh sách phương thức thanh toán');
            }
        };
        if (!paymentMethods.length && !paymentMethodLoading) {
            fetchPaymentMethods();
        }
    }, [getActivePaymentMethods, paymentMethods, paymentMethodLoading]);

    // Chọn phương thức thanh toán mặc định
    useEffect(() => {
        if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
            setSelectedPaymentMethodId(paymentMethods[0].methodId);
        }
    }, [paymentMethods, selectedPaymentMethodId]);

    // Lấy dữ liệu giỏ hàng
    useEffect(() => {
        const fetchCartData = async () => {
            if (!isAuthenticated) {
                setIsInitialized(true);
                navigate('/login');
                return;
            }
            try {
                await getUserCart();
            } catch (error) {
                console.error('Error fetching cart data:', error);
                toast.error('Không thể tải dữ liệu giỏ hàng');
            } finally {
                setIsInitialized(true);
            }
        };
        if (!isInitialized && !cartLoading) {
            fetchCartData();
        }
    }, [getUserCart, isAuthenticated, navigate, isInitialized, cartLoading]);

    const handleInitiateOrder = () => {
        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ nhận hàng');
            return;
        }
        if (!selectedShippingMethodId) {
            toast.error('Vui lòng chọn phương thức vận chuyển');
            return;
        }
        if (!selectedPaymentMethodId) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }
        setShowOrderConfirmModal(true);
    };

    const handleCouponApplied = (discount: number) => {
        setCouponDiscount(discount);
    };

    const handleCreateOrder = async () => {
        setShowOrderConfirmModal(false);

        if (!selectedAddressId || !selectedShippingMethodId || !selectedPaymentMethodId) {
            toast.error('Vui lòng chọn đầy đủ địa chỉ, phương thức vận chuyển và thanh toán');
            return;
        }

        if (totalPrice === undefined || shippingFee === undefined) {
            toast.error('Không thể tính tổng tiền đơn hàng');
            return;
        }

        const totalAmount = totalPrice + shippingFee - couponDiscount;

        setProcessingOrder(true);
        try {
            const orderData = {
                addressId: selectedAddressId,
                shippingMethodId: selectedShippingMethodId,
                note: orderNote.trim() || undefined,
                totalAmount: totalAmount,
                paymentMethodId: selectedPaymentMethodId,
                couponCode: appliedCouponCode || undefined
            };
            const createdOrder = await createOrder(orderData);
            toast.success('Đơn hàng đã được tạo thành công!');
            navigate(`/payment/${createdOrder.orderId}`, {
                state: {
                    orderId: createdOrder.orderId,
                    totalAmount: totalAmount,
                    paymentMethodId: selectedPaymentMethodId
                }
            });
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setProcessingOrder(false);
        }
    };

    const handleAddressFormSuccess = (address: AddressResponseDTO) => {
        setShowAddressModal(false);
        setHasFetchedAddresses(false);
        setAddressToEdit(undefined);
        if (addresses.length === 0 || address.isDefault) {
            setSelectedAddressId(address.addressId);
        }
        toast.success(addressToEdit ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
    };

    const handleEditAddress = (address: AddressResponseDTO) => {
        setAddressToEdit(address);
        setShowAddressModal(true);
    };

    const handleDeleteAddress = (addressId: number) => {
        setAddressToDelete(addressId);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;

        try {
            await deleteAddress(addressToDelete);
            setShowDeleteConfirmModal(false);
            setAddressToDelete(null);
            toast.success('Đã xóa địa chỉ thành công!');

            if (selectedAddressId === addressToDelete) {
                if (addresses.length > 1) {
                    const remainingAddresses = addresses.filter(a => a.addressId !== addressToDelete);
                    const newSelectedAddress = remainingAddresses.find(a => a.isDefault) || remainingAddresses[0];
                    setSelectedAddressId(newSelectedAddress.addressId);
                } else {
                    setSelectedAddressId(null);
                }
            }

            setHasFetchedAddresses(false);
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Không thể xóa địa chỉ. Vui lòng thử lại sau.');
        }
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            await setAsDefaultAddress(addressId);
            setHasFetchedAddresses(false);
            toast.success('Đã đặt địa chỉ mặc định thành công');
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Không thể đặt địa chỉ mặc định. Vui lòng thử lại sau.');
        }
    };

    const handleShippingMethodSuccess = () => {
        setShowShippingModal(false);
        toast.success('Đã cập nhật phương thức vận chuyển!');
    };

    const handleSelectShippingMethod = (methodId: number) => {
        setSelectedShippingMethodId(methodId);
    };

    const handleSelectPaymentMethod = (methodId: number) => {
        setSelectedPaymentMethodId(methodId);
    };

    const handlePaymentMethodSuccess = () => {
        setShowPaymentMethodModal(false);
        toast.success('Đã chọn phương thức thanh toán!');
    };

    const validCartItems = cartItems.filter(item => item && item.itemId && item.productName);

    if ((cartLoading || addressLoading || shippingLoading || paymentMethodLoading) && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LoadingSpinner size="large" />
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 dark:bg-secondary py-12"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={itemVariants}>
                        <EmptyState
                            title="Vui lòng đăng nhập"
                            description="Bạn cần đăng nhập để tiến hành đặt hàng."
                            action={{ label: 'Đăng nhập ngay', onClick: () => navigate('/login') }}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                            }
                        />
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    if (validCartItems.length === 0) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 dark:bg-secondary py-12"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={itemVariants}>
                        <EmptyState
                            title="Giỏ hàng trống"
                            description="Bạn cần có sản phẩm trong giỏ hàng để tiến hành đặt hàng."
                            action={{ label: 'Quay lại cửa hàng', onClick: () => navigate('/products') }}
                            icon={<FiShoppingBag className="w-16 h-16" />}
                        />
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-secondary transition-colors duration-300"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="container mx-auto px-4 sm:px-8 py-6">
                <motion.div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    variants={itemVariants}
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <FiPackage className="mr-2" />
                            Đặt Hàng
                            <motion.button
                                onClick={() => navigate('/cart')}
                                className="ml-auto flex items-center text-primary text-base font-normal hover:underline"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiChevronLeft className="mr-1" />
                                Quay lại giỏ hàng
                            </motion.button>
                        </h1>
                    </div>

                    <div className="p-6">
                        <motion.div
                            variants={containerVariants}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            <div className="lg:col-span-7 space-y-6">
                                {/* Địa chỉ nhận hàng */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                            <div className="bg-primary/10 p-2 rounded-full mr-2">
                                                <FiMap className="w-5 h-5 text-primary" />
                                            </div>
                                            Địa chỉ nhận hàng
                                        </h2>
                                        <motion.button
                                            className="text-primary text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                            onClick={() => {
                                                setAddressToEdit(undefined);
                                                setShowAddressModal(true);
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiPlus className="mr-1.5" /> Thêm địa chỉ mới
                                        </motion.button>
                                    </div>

                                    {selectedAddress ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg"
                                        >
                                            <EnhancedAddressCard
                                                address={selectedAddress}
                                                selected={true}
                                                onSelect={() => setShowAddressListModal(true)}
                                                onEdit={() => handleEditAddress(selectedAddress)}
                                                onDelete={() => handleDeleteAddress(selectedAddress.addressId)}
                                                onSetDefault={handleSetDefaultAddress}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="mb-3">
                                                <FiMap className="w-8 h-8 text-primary mx-auto" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Bạn chưa chọn địa chỉ nào.</p>
                                            <motion.button
                                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                                                onClick={() => setShowAddressListModal(true)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiMap className="inline mr-1.5" /> Chọn địa chỉ
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Phương thức vận chuyển */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                            <div className="bg-primary/10 p-2 rounded-full mr-2">
                                                <FiTruck className="w-5 h-5 text-primary" />
                                            </div>
                                            Phương thức vận chuyển
                                        </h2>
                                        <motion.button
                                            className="text-primary text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                            onClick={() => setShowShippingModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiTruck className="mr-1.5" /> Chọn phương thức
                                        </motion.button>
                                    </div>

                                    {selectedShippingMethod ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                                                        <FiTruck className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedShippingMethod.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedShippingMethod.estimatedDeliveryTime}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-block text-sm bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedShippingMethod.baseFee)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="mb-3">
                                                <FiTruck className="w-8 h-8 text-primary mx-auto" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Vui lòng chọn phương thức vận chuyển.</p>
                                            <motion.button
                                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                                                onClick={() => setShowShippingModal(true)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiTruck className="inline mr-1.5" /> Chọn phương thức vận chuyển
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Phương thức thanh toán */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                            <div className="bg-primary/10 p-2 rounded-full mr-2">
                                                <FiCreditCard className="w-5 h-5 text-primary" />
                                            </div>
                                            Phương thức thanh toán
                                        </h2>
                                        <motion.button
                                            className="text-primary text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                            onClick={() => setShowPaymentMethodModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiCreditCard className="mr-1.5" /> Chọn phương thức
                                        </motion.button>
                                    </div>

                                    {selectedPaymentMethod ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                                                        <FiCreditCard className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedPaymentMethod.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPaymentMethod.code}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-block text-sm bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                                    {selectedPaymentMethod.status ? 'Hoạt động' : 'Bảo trì'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="mb-3">
                                                <FiCreditCard className="w-8 h-8 text-primary mx-auto" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Vui lòng chọn phương thức thanh toán.</p>
                                            <motion.button
                                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                                                onClick={() => setShowPaymentMethodModal(true)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiCreditCard className="inline mr-1.5" /> Chọn phương thức thanh toán
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Ghi chú đơn hàng */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <div className="bg-primary/10 p-2 rounded-full mr-2">
                                            <FiMessageSquare className="w-5 h-5 text-primary" />
                                        </div>
                                        Ghi chú đơn hàng
                                    </h2>
                                    <textarea
                                        placeholder="Nhập ghi chú cho đơn hàng (tuỳ chọn). Ví dụ: Thời gian giao hàng, hướng dẫn giao hàng..."
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-300"
                                        rows={4}
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    />
                                </motion.div>

                                {/* Sản phẩm */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 shadow-md"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <div className="bg-primary/10 p-2 rounded-full mr-2">
                                            <FiPackage className="w-5 h-5 text-primary" />
                                        </div>
                                        Sản phẩm ({validCartItems.length})
                                    </h2>
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                        <AnimatePresence>
                                            {validCartItems.map((item, index) => (
                                                <motion.div
                                                    key={item.itemId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                >
                                                    <OrderItem item={item} />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-5 space-y-6">
                                <motion.div
                                    variants={itemVariants}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="sticky top-6"
                                >
                                    <OrderPreview
                                        orderItems={validCartItems}
                                        subtotal={totalPrice}
                                        shippingFee={shippingFee}
                                        couponDiscount={couponDiscount}
                                        couponCode={appliedCouponCode}
                                        totalAmount={totalPrice + shippingFee}
                                        address={selectedAddress || null}
                                        orderNote={orderNote}
                                        shippingMethod={selectedShippingMethod || null}
                                        paymentMethod={selectedPaymentMethod || null}
                                    />
                                </motion.div>

                                {/* Coupon Input Component */}
                                <motion.div
                                    variants={itemVariants}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="sticky top-6 mt-6"
                                >
                                    <CouponInput orderTotal={totalPrice} onCouponApplied={handleCouponApplied} />
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="sticky top-6 mt-6"
                                >
                                    <OrderSummary
                                        itemCount={validCartItems.length}
                                        subtotal={totalPrice}
                                        shippingFee={shippingFee}
                                        couponDiscount={couponDiscount}
                                        totalPrice={totalPrice + shippingFee}
                                        onCreateOrder={handleInitiateOrder}
                                        loading={processingOrder || orderLoading}
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Địa chỉ modal - Add or Edit */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowAddressModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl m-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AddressForm
                                address={addressToEdit}
                                isEdit={!!addressToEdit}
                                onSuccess={handleAddressFormSuccess}
                                onCancel={() => {
                                    setShowAddressModal(false);
                                    setAddressToEdit(undefined);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Danh sách địa chỉ modal */}
            <AnimatePresence>
                {showAddressListModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowAddressListModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl m-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                                        <FiMap className="w-5 h-5 text-primary" />
                                    </div>
                                    Chọn địa chỉ nhận hàng
                                </h2>
                                <motion.button
                                    className="text-primary text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                    onClick={() => {
                                        setAddressToEdit(undefined);
                                        setShowAddressModal(true);
                                        setShowAddressListModal(false);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPlus className="mr-1.5" /> Thêm địa chỉ mới
                                </motion.button>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                                {sortedAddresses.length > 0 ? (
                                    sortedAddresses.map((address, index) => (
                                        <motion.div
                                            key={address.addressId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <EnhancedAddressCard
                                                address={address}
                                                selected={selectedAddressId === address.addressId}
                                                onSelect={() => {
                                                    setSelectedAddressId(address.addressId);
                                                    setShowAddressListModal(false);
                                                }}
                                                onEdit={() => handleEditAddress(address)}
                                                onDelete={() => handleDeleteAddress(address.addressId)}
                                                onSetDefault={handleSetDefaultAddress}
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-gray-600 dark:text-gray-300">Bạn chưa có địa chỉ nào.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <motion.button
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => setShowAddressListModal(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Đóng
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Xác nhận xóa địa chỉ modal */}
            <ConfirmDialog
                isOpen={showDeleteConfirmModal}
                title="Xác nhận xóa địa chỉ"
                message="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
                confirmText="Xóa địa chỉ"
                cancelText="Hủy"
                type="error"
                onConfirm={confirmDeleteAddress}
                onCancel={() => {
                    setShowDeleteConfirmModal(false);
                    setAddressToDelete(null);
                }}
            />

            {/* Xác nhận đặt hàng modal */}
            <ConfirmDialog
                isOpen={showOrderConfirmModal}
                title="Xác nhận đặt hàng"
                message={`Bạn có chắc chắn muốn đặt đơn hàng với tổng giá trị ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice + shippingFee - couponDiscount)}${couponDiscount > 0 ? ` (đã giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(couponDiscount)})` : ''}?`}
                confirmText="Đặt hàng và thanh toán"
                cancelText="Hủy"
                type="success"
                onConfirm={handleCreateOrder}
                onCancel={() => setShowOrderConfirmModal(false)}
            />

            {/* Phương thức vận chuyển modal */}
            <AnimatePresence>
                {showShippingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowShippingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl m-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ShippingMethodForm
                                shippingMethods={shippingMethods}
                                selectedMethodId={selectedShippingMethodId}
                                onSelect={handleSelectShippingMethod}
                                onCancel={() => setShowShippingModal(false)}
                                onSuccess={handleShippingMethodSuccess}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phương thức thanh toán modal */}
            <AnimatePresence>
                {showPaymentMethodModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={(e) => e.target === e.currentTarget && setShowPaymentMethodModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl m-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PaymentMethodForm
                                paymentMethods={paymentMethods}
                                selectedMethodId={selectedPaymentMethodId}
                                onSelect={handleSelectPaymentMethod}
                                onCancel={() => setShowPaymentMethodModal(false)}
                                onSuccess={handlePaymentMethodSuccess}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OrderPage;