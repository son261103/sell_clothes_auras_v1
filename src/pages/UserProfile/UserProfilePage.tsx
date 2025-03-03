// File: components/profile/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';

import useAuth from '../../hooks/useAuth';
import useOrder from '../../hooks/useOrder';
import useUserAddress from '../../hooks/useUserAddress';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ProfileInfo from '../../components/profile/ProfileInfo';
import OrdersTab from '../../components/profile/OrdersTab';
import AddressesTab from '../../components/profile/AddressesTab';
import SettingsTab from '../../components/profile/SettingsTab';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AddressModal from '../../components/profile/AddressModal';

import { AddressResponseDTO } from '../../types/user.address.types';

// Animation variants
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

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        user,
        loading: authLoading,
        signOut,
        getUserProfile
    } = useAuth();

    const {
        getUserOrders,
        loading: orderLoading,
        orderList
    } = useOrder();

    const {
        loading: addressLoading,
        getUserAddresses
    } = useUserAddress();

    // State
    const [activeTab, setActiveTab] = useState('profile');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<AddressResponseDTO | undefined>(undefined);

    // Loading state
    const isLoading = authLoading || orderLoading || addressLoading;

    // Fetch user data
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserData = async () => {
                try {
                    await getUserProfile();
                    await getUserOrders(0, 5);
                    await getUserAddresses();
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast.error('Không thể tải thông tin người dùng');
                }
            };
            fetchUserData();
        }
    }, [isAuthenticated, getUserProfile, getUserOrders, getUserAddresses]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Đăng xuất thành công');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
        }
    };

    const handleEditAddress = (address: AddressResponseDTO) => {
        setAddressToEdit(address);
        setShowAddressModal(true);
    };

    const handleAddressFormSuccess = () => {
        setShowAddressModal(false);
        setAddressToEdit(undefined);
        toast.success(addressToEdit ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
    };

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
                            description="Bạn cần đăng nhập để xem thông tin cá nhân."
                            action={{ label: 'Đăng nhập ngay', onClick: () => navigate('/login') }}
                            icon={<FiUser className="w-16 h-16" />}
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
                            <FiUser className="mr-2" />
                            Thông tin cá nhân
                        </h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center p-20">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row">
                            {/* Sidebar */}
                            <ProfileSidebar
                                user={user}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                onLogout={() => setShowLogoutConfirm(true)}
                            />

                            {/* Main content */}
                            <div className="flex-1 p-6">
                                {activeTab === 'profile' && (
                                    <ProfileInfo user={user} />
                                )}

                                {activeTab === 'orders' && (
                                    <OrdersTab
                                        orders={orderList?.slice(0, 5) || []}
                                        navigate={navigate}
                                    />
                                )}

                                {activeTab === 'addresses' && (
                                    <AddressesTab
                                        onAddAddress={() => {
                                            setAddressToEdit(undefined);
                                            setShowAddressModal(true);
                                        }}
                                        onEditAddress={handleEditAddress}
                                    />
                                )}

                                {activeTab === 'settings' && (
                                    <SettingsTab
                                        onChangePassword={() => setShowChangePasswordModal(true)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Address Modal */}
            <AddressModal
                isOpen={showAddressModal}
                address={addressToEdit}
                onSuccess={handleAddressFormSuccess}
                onClose={() => {
                    setShowAddressModal(false);
                    setAddressToEdit(undefined);
                }}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />

            {/* Logout Confirmation */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
                confirmText="Đăng xuất"
                cancelText="Hủy"
                type="info"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </motion.div>
    );
};

export default ProfilePage;