// File: pages/order/OrderPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useOrder from '../../hooks/useOrder';
import useUserAddress from '../../hooks/useUserAddress';
import useShipping from '../../hooks/useShipping';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiPlus, FiTruck, FiPackage, FiMap, FiMessageSquare } from 'react-icons/fi';
import { AddressResponseDTO } from '../../types/user.address.types';

// Import Components
import OrderItem from '../../components/order/OrderItem';
import EnhancedAddressCard from '../../components/order/EnhancedAddressCard';
import OrderSummary from '../../components/order/OrderSummary';
import OrderPreview from '../../components/order/OrderPreview';
import AddressForm from '../../components/order/AddressForm';
import ShippingMethodForm from '../../components/order/ShippingMethodForm';

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

// Main component
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

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAddressListModal, setShowAddressListModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addressToEdit, setAddressToEdit] = useState<AddressResponseDTO | undefined>(undefined);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
    const [orderNote, setOrderNote] = useState('');
    const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);

    const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
    const selectedShippingMethod = shippingMethods.find(method => method.id === selectedShippingMethodId);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
            mirror: false
        });
    }, []);

    // Lấy dữ liệu địa chỉ chỉ khi chưa fetch
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
    }, [shippingMethods, selectedShippingMethodId, totalPrice]);

    // Cập nhật phí vận chuyển khi thay đổi phương thức
    useEffect(() => {
        if (selectedShippingMethod) {
            setShippingFee(selectedShippingMethod.baseFee);
        }
    }, [selectedShippingMethod, totalPrice]);

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
        setShowOrderConfirmModal(true);
    };

    const handleCreateOrder = async () => {
        setShowOrderConfirmModal(false);

        if (!selectedAddressId || !selectedShippingMethodId) {
            toast.error('Vui lòng chọn địa chỉ và phương thức vận chuyển');
            return;
        }

        setProcessingOrder(true);
        try {
            const orderData = {
                addressId: selectedAddressId,
                shippingMethodId: selectedShippingMethodId,
                note: orderNote.trim() || undefined,
            };
            const createdOrder = await createOrder(orderData);
            toast.success('Đơn hàng đã được tạo thành công!');
            navigate(`/payment/${createdOrder.orderId}`);
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

    const validCartItems = cartItems.filter(item => item && item.itemId && item.productName);

    if ((cartLoading || addressLoading || shippingLoading) && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lightBackground dark:bg-darkBackground">
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
            <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <EmptyState
                            title="Vui lòng đăng nhập"
                            description="Bạn cần đăng nhập để tiến hành đặt hàng."
                            action={{ label: 'Đăng nhập ngay', onClick: () => navigate('/login') }}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    if (validCartItems.length === 0) {
        return (
            <div className="min-h-screen bg-lightBackground dark:bg-darkBackground py-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <EmptyState
                            title="Giỏ hàng trống"
                            description="Bạn cần có sản phẩm trong giỏ hàng để tiến hành đặt hàng."
                            action={{ label: 'Quay lại cửa hàng', onClick: () => navigate('/products') }}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <FiPackage className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-primary tracking-tight">Đặt Hàng</h1>
                        </div>
                        <button
                            onClick={() => navigate('/cart')}
                            className="flex items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-full shadow-sm text-primary border border-primary/20 transition-colors duration-200"
                        >
                            <FiChevronLeft className="mr-1" /> Quay lại giỏ hàng
                        </button>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        <div className="lg:col-span-7 space-y-6">
                            {/* Địa chỉ nhận hàng */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-4 shadow-sm"
                                data-aos="fade-up"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 items-center">
                                    <div className="flex items-center">
                                        <div className="bg-primary/10 p-2 rounded-full mr-2">
                                            <FiMap className="w-5 h-5 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold text-textDark dark:text-textLight">Địa chỉ nhận hàng</h2>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            className="text-primary text-sm font-medium flex items-center bg-primary/5 px-3 py-1 rounded-full"
                                            onClick={() => {
                                                setAddressToEdit(undefined);
                                                setShowAddressModal(true);
                                            }}
                                        >
                                            <FiPlus className="mr-1" /> Thêm địa chỉ mới
                                        </button>
                                    </div>
                                </div>

                                {selectedAddress ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg"
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
                                        <p className="text-grey-600 dark:text-grey-300 mb-3 text-sm">Bạn chưa chọn địa chỉ nào.</p>
                                        <button
                                            className="px-3 py-1.5 bg-primary text-white rounded-full text-sm font-medium"
                                            onClick={() => setShowAddressListModal(true)}
                                        >
                                            <FiMap className="inline mr-1" /> Chọn địa chỉ
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Phương thức vận chuyển */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                                data-aos="fade-up"
                                data-aos-delay="100"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
                                    <div className="flex items-center">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                                            <FiTruck className="w-5 h-5 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold text-textDark dark:text-textLight">Phương thức vận chuyển</h2>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-full transition-colors duration-200"
                                            onClick={() => setShowShippingModal(true)}
                                        >
                                            <FiTruck className="mr-1" /> Chọn phương thức
                                        </button>
                                    </div>
                                </div>

                                {selectedShippingMethod ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                                                    <FiTruck className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-textDark dark:text-textLight text-lg">{selectedShippingMethod.name}</span>
                                                    <span className="text-sm text-secondary/70 dark:text-textLight/70">• {selectedShippingMethod.estimatedDeliveryTime}</span>
                                                </div>
                                            </div>
                                            <span className="inline-block text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedShippingMethod.baseFee)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="mb-4">
                                            <FiTruck className="w-10 h-10 text-primary mx-auto" />
                                        </div>
                                        <p className="text-grey-600 dark:text-grey-300 mb-4 text-sm">Vui lòng chọn phương thức vận chuyển.</p>
                                        <button
                                            className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                                            onClick={() => setShowShippingModal(true)}
                                        >
                                            <FiTruck className="inline mr-1" /> Chọn phương thức vận chuyển
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Ghi chú đơn hàng */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4 flex items-center">
                                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                                        <FiMessageSquare className="w-5 h-5 text-primary" />
                                    </div>
                                    Ghi chú đơn hàng
                                </h2>
                                <textarea
                                    placeholder="Nhập ghi chú cho đơn hàng (tuỳ chọn). Ví dụ: Thời gian giao hàng, hướng dẫn giao hàng..."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-textLight resize-none transition-all duration-300"
                                    rows={4}
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                />
                            </motion.div>

                            {/* Sản phẩm */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-primary/10 dark:border-primary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >
                                <h2 className="text-xl font-bold text-textDark dark:text-textLight mb-4 flex items-center">
                                    <div className="bg-primary/10 p-2 rounded-full mr-2">
                                        <FiPackage className="w-5 h-5 text-primary" />
                                    </div>
                                    Sản phẩm ({validCartItems.length})
                                </h2>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {validCartItems.map((item, index) => (
                                        <motion.div
                                            key={item.itemId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                        >
                                            <OrderItem item={item} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:col-span-5 space-y-6">
                            <motion.div
                                variants={itemVariants}
                                data-aos="fade-left"
                                data-aos-delay="100"
                            >
                                <OrderPreview
                                    orderItems={validCartItems}
                                    subtotal={totalPrice}
                                    shippingFee={shippingFee}
                                    totalAmount={totalPrice + shippingFee}
                                    address={selectedAddress || null}
                                    orderNote={orderNote}
                                    shippingMethod={selectedShippingMethod || null}
                                />
                            </motion.div>
                            <motion.div
                                variants={itemVariants}
                                data-aos="fade-left"
                                data-aos-delay="200"
                            >
                                <OrderSummary
                                    itemCount={validCartItems.length}
                                    subtotal={totalPrice}
                                    shippingFee={shippingFee}
                                    totalPrice={totalPrice + shippingFee}
                                    onCreateOrder={handleInitiateOrder}
                                    loading={processingOrder || orderLoading}
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
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
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg m-4"
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
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg m-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-textDark dark:text-textLight">Chọn địa chỉ nhận hàng</h2>
                                <button
                                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center bg-primary/5 px-3 py-1.5 rounded-full transition-colors duration-200"
                                    onClick={() => {
                                        setAddressToEdit(undefined);
                                        setShowAddressModal(true);
                                        setShowAddressListModal(false);
                                    }}
                                >
                                    <FiPlus className="mr-1" /> Thêm địa chỉ mới
                                </button>
                            </div>
                            <div className="max-h-96 space-y-4">
                                {sortedAddresses.length > 0 ? (
                                    sortedAddresses.map((address, index) => (
                                        <motion.div
                                            key={address.addressId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
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
                                    <div className="text-center py-8">
                                        <p className="text-grey-600 dark:text-grey-300 mb-4">Bạn chưa có địa chỉ nào.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                    onClick={() => setShowAddressListModal(false)}
                                >
                                    Đóng
                                </button>
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
                message={`Bạn có chắc chắn muốn đặt đơn hàng với tổng giá trị ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice + shippingFee)}?`}
                confirmText="Đặt hàng ngay"
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
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg m-4"
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
        </div>
    );
};

export default OrderPage;