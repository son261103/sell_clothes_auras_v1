import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';
import axios from 'axios';
import { createPortal } from 'react-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.6,
            when: "beforeChildren",
            staggerChildren: 0.15,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.4,
            when: "afterChildren"
        }
    },
};

const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: {
            duration: 0.3
        }
    },
};

const tabVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 28
        }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: {
            duration: 0.2
        }
    },
};

// Helper function to create object URLs from Files
const createObjectUrlFromFile = (file: File): string => {
    return URL.createObjectURL(file);
};

// Helper function to check if an image is accessible
const checkImageExists = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        const timeoutId = setTimeout(() => {
            img.onload = null;
            img.onerror = null;
            resolve(false);
        }, 10000); // 10 second timeout

        img.onload = () => {
            clearTimeout(timeoutId);
            resolve(true);
        };

        img.onerror = () => {
            clearTimeout(timeoutId);
            resolve(false);
        };

        // Add timestamp to prevent caching
        const urlWithTimestamp = url.includes('?')
            ? `${url}&t=${Date.now()}`
            : `${url}?t=${Date.now()}`;

        img.src = urlWithTimestamp;
    });
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
    const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);

    // New states for handling avatar availability
    const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
    const [isCheckingAvatarAvailability, setIsCheckingAvatarAvailability] = useState(false);
    const [avatarCheckAttempts, setAvatarCheckAttempts] = useState(0);
    const MAX_AVATAR_CHECK_ATTEMPTS = 10; // Maximum number of attempts to check if avatar is available
    const avatarPollingInterval = useRef<number | null>(null); // Fixed line here

    const isMounted = useRef(true);
    const isLoadingData = useRef(false);
    const isLoading = profileLoading || orderLoading || addressLoading;

    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            easing: 'ease-in-out',
        });
    }, []);

    // Cleanup effect when component unmounts
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            // Clean up any object URLs
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
            }
            // Clear any polling intervals
            if (avatarPollingInterval.current) {
                clearInterval(avatarPollingInterval.current);
            }
        };
    }, [tempAvatarUrl]);

    // Fetch user data
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

        // Handle the promise
        (async () => {
            try {
                await fetchUserData();
            } catch (error) {
                console.error('Error in fetchUserData:', error);
            }
        })();
    }, [isAuthenticated, getProfile, getUserOrders, getUserAddresses, dataFetched]);

    // Effect to poll for new avatar availability
    useEffect(() => {
        if (!newAvatarUrl || !isCheckingAvatarAvailability) return;

        const checkAvatar = async () => {
            if (avatarCheckAttempts >= MAX_AVATAR_CHECK_ATTEMPTS) {
                console.log('Max avatar check attempts reached, stopping polling');
                setIsCheckingAvatarAvailability(false);
                setAvatarCheckAttempts(0);
                setNewAvatarUrl(null);
                return;
            }

            console.log(`Checking avatar availability (attempt ${avatarCheckAttempts + 1}/${MAX_AVATAR_CHECK_ATTEMPTS}):`, newAvatarUrl);
            const exists = await checkImageExists(newAvatarUrl);

            if (exists) {
                console.log('Avatar is now available:', newAvatarUrl);
                setIsCheckingAvatarAvailability(false);
                setAvatarCheckAttempts(0);

                // Update timestamp to force refresh with now-available image
                const finalTimestamp = Date.now();
                setAvatarTimestamp(finalTimestamp);
                console.log("Avatar is now ready with timestamp:", finalTimestamp);

                // Clear polling interval
                if (avatarPollingInterval.current) {
                    clearInterval(avatarPollingInterval.current);
                    avatarPollingInterval.current = null;
                }
            } else {
                // Increment attempt counter
                setAvatarCheckAttempts(prev => prev + 1);
            }
        };

        // Start polling
        if (!avatarPollingInterval.current) {
            // Check immediately
            checkAvatar();

            // Then set up interval for subsequent checks
            avatarPollingInterval.current = setInterval(checkAvatar, 2000);
        }

        // Cleanup
        return () => {
            if (avatarPollingInterval.current) {
                clearInterval(avatarPollingInterval.current);
                avatarPollingInterval.current = null;
            }
        };
    }, [newAvatarUrl, isCheckingAvatarAvailability, avatarCheckAttempts]);

    // Refresh AOS when tab changes
    useEffect(() => {
        AOS.refresh();
    }, [activeTab]);

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
            setIsUpdatingAvatar(true);

            // Create and set a temporary object URL for immediate UI feedback
            const objectUrl = createObjectUrlFromFile(file);
            setTempAvatarUrl(objectUrl);

            // Update timestamp to trigger re-renders with the temporary image
            const initialTimestamp = Date.now();
            setAvatarTimestamp(initialTimestamp);
            console.log("ProfilePage: Starting avatar upload with timestamp:", initialTimestamp);

            // Perform the actual upload to the server
            let result;
            if (isUpdate) {
                result = await updateAvatar(file);
            } else {
                result = await uploadAvatar(file);
            }

            console.log("ProfilePage: Avatar upload/update response:", result);

            // After successful upload, refresh the profile data
            await getProfile();

            // Extract the newly uploaded avatar URL from the refreshed profile
            const avatarUrl = profile?.avatar;
            if (avatarUrl) {
                // Set new avatar URL and start checking for availability
                setNewAvatarUrl(avatarUrl);
                setIsCheckingAvatarAvailability(true);
                setAvatarCheckAttempts(0);

                console.log("Starting to check availability of new avatar:", avatarUrl);
            }

            // Close modal and show success message
            setShowAvatarModal(false);
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data as ApiResponse;
                toast.error(apiError?.message || 'Cập nhật ảnh đại diện thất bại');
            } else {
                toast.error('Cập nhật ảnh đại diện thất bại');
            }

            // Refresh the profile to ensure correct state
            await getProfile();
            setAvatarTimestamp(Date.now());
        } finally {
            setIsUpdatingAvatar(false);

            // Clean up temporary object URL
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
                setTempAvatarUrl(null);
            }
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            setIsUpdatingAvatar(true);

            // Update timestamp to trigger immediate UI update
            const initialTimestamp = Date.now();
            setAvatarTimestamp(initialTimestamp);

            // Clear any temporary avatar URL and polling
            if (tempAvatarUrl) {
                URL.revokeObjectURL(tempAvatarUrl);
                setTempAvatarUrl(null);
            }

            setIsCheckingAvatarAvailability(false);
            setNewAvatarUrl(null);
            if (avatarPollingInterval.current) {
                clearInterval(avatarPollingInterval.current);
                avatarPollingInterval.current = null;
            }

            // Perform the actual deletion on server
            await deleteAvatar();

            // Refresh profile data
            await getProfile();

            // Update timestamp again to ensure UI is current
            const finalTimestamp = Date.now();
            setAvatarTimestamp(finalTimestamp);

            setShowAvatarModal(false);
            toast.success('Xóa ảnh đại diện thành công');
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast.error('Xóa ảnh đại diện thất bại');

            // Refresh the profile to ensure correct state
            await getProfile();
            setAvatarTimestamp(Date.now());
        } finally {
            setIsUpdatingAvatar(false);
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
                <AnimatePresence>
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
                            currentAvatar={tempAvatarUrl || profile?.avatar}
                            onUpload={handleAvatarUpload}
                            onDelete={handleDeleteAvatar}
                            onClose={() => setShowAvatarModal(false)}
                            timestamp={avatarTimestamp}
                            isUpdating={isUpdatingAvatar}
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
                </AnimatePresence>
            </>,
            modalRoot
        );
    };

    if (!isAuthenticated) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-secondary dark:to-gray-900 py-12"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
            >
                <div className="container mx-auto px-4">
                    <motion.div variants={cardVariants} data-aos="fade-up">
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
                className="min-h-screen from-gray-50 to-gray-100 dark:from-secondary dark:to-gray-900 py-4"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.div
                        className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        variants={cardVariants}
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                <FiUser className="mr-3 text-primary" />
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
                                <div className="md:w-64 lg:w-72 md:sticky md:top-4 md:self-start" data-aos="fade-right" data-aos-delay="300">
                                    <ProfileSidebar
                                        user={profile}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        onLogout={() => setShowLogoutConfirm(true)}
                                        onAvatarClick={() => setShowAvatarModal(true)}
                                        timestamp={avatarTimestamp}
                                        isUpdatingAvatar={isUpdatingAvatar || isCheckingAvatarAvailability}
                                        tempAvatarUrl={tempAvatarUrl}
                                        isCheckingAvailability={isCheckingAvatarAvailability}
                                    />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        className="flex-1 p-6"
                                        variants={tabVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        data-aos="fade-up"
                                        data-aos-delay="400"
                                    >
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
                                    </motion.div>
                                </AnimatePresence>
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