import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';
import axios from 'axios';
import { createPortal } from 'react-dom';

import useProfile from '../../hooks/useProfile';
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
import EditProfileModal from '../../components/profile/EditProfileModal';
import AvatarUploadModal from '../../components/profile/AvatarUploadModal';

import { AddressResponseDTO } from '../../types/user.address.types';
import { ProfileUpdateDTO } from '../../types/profile.types';
import { ApiResponse } from "../../types";

// Create a portal container for modals
const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
modalRoot.style.position = 'relative';
modalRoot.style.zIndex = '99999';
document.body.appendChild(modalRoot);

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const {
        isAuthenticated,
        signOut
    } = useAuth();

    const {
        profile,
        loading: profileLoading,
        getProfile,
        updateProfile,
        uploadAvatar,
        updateAvatar,
        deleteAvatar,
        isUpdating
    } = useProfile();

    const { getUserOrders, loading: orderLoading, orderList } = useOrder();
    const { loading: addressLoading, getUserAddresses } = useUserAddress();

    const [activeTab, setActiveTab] = useState('profile');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<AddressResponseDTO | undefined>(undefined);
    const [dataFetched, setDataFetched] = useState(false);

    const isMounted = useRef(true);
    const isLoadingData = useRef(false);
    const isLoading = profileLoading || orderLoading || addressLoading;

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isAuthenticated || dataFetched || isLoadingData.current) return;
            isLoadingData.current = true;
            try {
                await getProfile();
                if (isMounted.current) {
                    await Promise.all([getUserOrders(0, 5), getUserAddresses()]);
                    setDataFetched(true);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Không thể tải thông tin người dùng');
            } finally {
                isLoadingData.current = false;
            }
        };
        fetchUserData();
    }, [isAuthenticated, getProfile, getUserOrders, getUserAddresses, dataFetched]);

    const handleTabChange = (tab: string) => setActiveTab(tab);

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

    const handleEditProfile = async (updatedProfile: ProfileUpdateDTO) => {
        try {
            await updateProfile(updatedProfile);
            toast.success('Cập nhật hồ sơ thành công');
            setShowEditProfileModal(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiResponse;
                toast.error(apiError?.message || 'Cập nhật hồ sơ thất bại');
            } else {
                toast.error('Cập nhật hồ sơ thất bại');
            }
        }
    };

    const handleDeleteProfile = async () => {
        try {
            // Use signOut as delete functionality is not implemented
            await signOut();
            toast.success('Đăng xuất thành công');
            navigate('/');
        } catch (error) {
            console.error('Error deleting profile:', error);
            toast.error('Thao tác thất bại');
        }
    };

    const handleAvatarUpload = async (file: File, isUpdate: boolean = false) => {
        try {
            if (isUpdate) {
                await updateAvatar(file);
            } else {
                await uploadAvatar(file);
            }
            setShowAvatarModal(false);
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Cập nhật ảnh đại diện thất bại');
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            await deleteAvatar();
            setShowAvatarModal(false);
            toast.success('Xóa ảnh đại diện thành công');
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast.error('Xóa ảnh đại diện thất bại');
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

    const renderModals = () => {
        return createPortal(
            <>
                {showEditProfileModal && (
                    <EditProfileModal
                        isOpen={showEditProfileModal}
                        user={profile}
                        onSave={handleEditProfile}
                        onClose={() => setShowEditProfileModal(false)}
                        onRequestDelete={() => setShowDeleteConfirm(true)}
                        isUpdating={isUpdating}
                    />
                )}

                {showAvatarModal && (
                    <AvatarUploadModal
                        isOpen={showAvatarModal}
                        currentAvatar={profile?.avatar}
                        onUpload={handleAvatarUpload}
                        onDelete={handleDeleteAvatar}
                        onClose={() => setShowAvatarModal(false)}
                    />
                )}

                {showDeleteConfirm && (
                    <ConfirmDialog
                        isOpen={showDeleteConfirm}
                        title="Xác nhận xóa hồ sơ"
                        message="Bạn có chắc chắn muốn xóa hồ sơ của mình? Hành động này không thể hoàn tác."
                        confirmText="Xóa"
                        cancelText="Hủy"
                        onConfirm={handleDeleteProfile}
                        onCancel={() => setShowDeleteConfirm(false)}
                    />
                )}

                {showAddressModal && (
                    <AddressModal
                        isOpen={showAddressModal}
                        address={addressToEdit}
                        onSuccess={handleAddressFormSuccess}
                        onClose={() => {
                            setShowAddressModal(false);
                            setAddressToEdit(undefined);
                        }}
                    />
                )}

                {showChangePasswordModal && (
                    <ChangePasswordModal
                        isOpen={showChangePasswordModal}
                        onClose={() => setShowChangePasswordModal(false)}
                    />
                )}

                {showLogoutConfirm && (
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
                )}
            </>,
            modalRoot
        );
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
        <>
            <motion.div
                className="min-h-screen transition-colors duration-300"
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
                            <div className="flex flex-col md:flex-row relative">
                                {/* Sticky sidebar */}
                                <div className="md:w-64 lg:w-72 md:sticky md:top-4 md:self-start">
                                    <ProfileSidebar
                                        user={profile}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        onLogout={() => setShowLogoutConfirm(true)}
                                        onAvatarClick={() => setShowAvatarModal(true)}
                                    />
                                </div>
                                <div className="flex-1 p-6">
                                    {activeTab === 'profile' && (
                                        <ProfileInfo
                                            user={profile}
                                            onEdit={() => setShowEditProfileModal(true)}
                                            onDelete={() => setShowDeleteConfirm(true)}
                                        />
                                    )}
                                    {activeTab === 'orders' && (
                                        <OrdersTab orders={orderList?.slice(0, 5) || []} navigate={navigate} />
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
                                        <SettingsTab onChangePassword={() => setShowChangePasswordModal(true)} />
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* Render modals through portal */}
            {renderModals()}
        </>
    );
};

export default ProfilePage;