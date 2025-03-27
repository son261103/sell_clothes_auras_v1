import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPackage, FiMapPin, FiSettings, FiLogOut, FiCamera } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { UserProfile } from '../../types/profile.types';

interface ProfileSidebarProps {
    user: UserProfile | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    onAvatarClick: () => void;
    timestamp?: number;
    isUpdatingAvatar?: boolean;
    tempAvatarUrl?: string | null;
    isCheckingAvailability?: boolean;
    onGoogleLogin?: () => void;
    onFacebookLogin?: () => void;
    isGoogleLinked: boolean; // Make this explicitly required and boolean
    isFacebookLinked: boolean; // Make this explicitly required and boolean
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
                                                           user,
                                                           activeTab,
                                                           onTabChange,
                                                           onLogout,
                                                           onAvatarClick,
                                                           timestamp = Date.now(),
                                                           isUpdatingAvatar = false,
                                                           tempAvatarUrl = null,
                                                           isCheckingAvailability = false,
                                                           onGoogleLogin,
                                                           onFacebookLogin,
                                                           isGoogleLinked = false,
                                                           isFacebookLinked = false
                                                       }) => {
    const [avatarError, setAvatarError] = useState(false);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [isAvatarLoading, setIsAvatarLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 1; // Reduced from 3 to 1 to limit excessive retries
    const retryTimeoutRef = useRef<number | null>(null);

    // Track if component is mounted to prevent state updates after unmounting
    const isMounted = useRef(true);

    // Animation variants
    const avatarVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const userInfoVariants = {
        initial: { opacity: 0, y: 10 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.4
            }
        }
    };

    const tabsContainerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                delay: 0.1,
                staggerChildren: 0.08,
                when: "beforeChildren"
            }
        }
    };

    const tabItemVariants = {
        initial: { opacity: 0, x: -15 },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    };

    const socialButtonVariants = {
        initial: { opacity: 0, y: 10 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: { scale: 0.95 }
    };

    // Helper to check if a URL is a Google avatar URL
    const isGoogleAvatarUrl = (url: string): "" | boolean => {
        return url && (
            url.includes('googleusercontent.com') ||
            url.includes('google.com') ||
            url.includes('googleapis.com')
        );
    };

    // Memoized function to get avatar URL with timestamp
    const getAvatarUrl = useCallback((url?: string, forceNewTimestamp = false): string => {
        if (!url) return '';

        // For Google avatar URLs, handle differently to prevent CORS issues
        if (isGoogleAvatarUrl(url)) {
            // Return Google URLs without any modifications
            return url;
        }

        try {
            if (url.startsWith('/')) {
                const baseUrl = window.location.origin;
                url = `${baseUrl}${url}`;
            }

            const urlObj = new URL(url, window.location.origin);
            urlObj.searchParams.delete('t');
            urlObj.searchParams.delete('_t');
            urlObj.searchParams.delete('timestamp');
            urlObj.searchParams.delete('cache');

            const timeValue = forceNewTimestamp ? Date.now() : timestamp;
            urlObj.searchParams.append('t', timeValue.toString());

            if (forceNewTimestamp) {
                urlObj.searchParams.append('cache', Math.random().toString().slice(2));
            }

            return urlObj.toString();
        } catch (error) {
            console.error('Error processing avatar URL:', error);

            // Don't modify Google URLs
            if (isGoogleAvatarUrl(url)) {
                return url;
            }

            const separator = url.includes('?') ? '&' : '?';
            const timeValue = forceNewTimestamp ? Date.now() : timestamp;
            let result = `${url}${separator}t=${timeValue}`;
            if (forceNewTimestamp) {
                result += `&cache=${Math.random().toString().slice(2)}`;
            }
            return result;
        }
    }, [timestamp]);

    // Function to create a placeholder avatar with initials
    const getInitialsAvatar = useCallback(() => {
        setAvatarError(true);
        setIsAvatarLoading(false);
    }, []);

    // Memoized function to load avatar image with limited retry logic
    const loadAvatarImage = useCallback((url: string) => {
        if (!isMounted.current) return;

        // Skip loading for Google avatars - we'll handle them directly in the component
        if (isGoogleAvatarUrl(url)) {
            setIsAvatarLoading(false);
            return;
        }

        const img = new Image();

        img.onload = () => {
            if (!isMounted.current) return;
            console.log("ProfileSidebar: Avatar image loaded successfully");
            setIsAvatarLoading(false);
            setAvatarError(false);
            setRetryCount(0);
        };

        img.onerror = () => {
            if (!isMounted.current) return;
            console.error(`ProfileSidebar: Failed to load avatar image (attempt ${retryCount + 1}/${maxRetries}):`, url);

            // For Google avatar URLs, just use the initials avatar
            if (isGoogleAvatarUrl(url)) {
                getInitialsAvatar();
                return;
            }

            if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                const retryDelay = 1000; // Fixed delay of 1 second
                console.log(`Retrying in ${retryDelay}ms...`);

                if (retryTimeoutRef.current) {
                    window.clearTimeout(retryTimeoutRef.current);
                }

                retryTimeoutRef.current = window.setTimeout(() => {
                    if (!isMounted.current) return;

                    // Try one more time with a new timestamp
                    const retryUrl = getAvatarUrl(user?.avatar || '', true);
                    setAvatarUrl(retryUrl);

                    // Just try one final direct load
                    const finalImg = new Image();
                    finalImg.onload = () => {
                        if (!isMounted.current) return;
                        setIsAvatarLoading(false);
                        setAvatarError(false);
                    };
                    finalImg.onerror = () => {
                        if (!isMounted.current) return;
                        getInitialsAvatar();
                    };
                    finalImg.src = retryUrl;
                }, retryDelay);
            } else {
                getInitialsAvatar();
            }
        };

        img.src = url;
    }, [retryCount, maxRetries, user?.avatar, getAvatarUrl, getInitialsAvatar, isGoogleAvatarUrl]);

    // Set isMounted to false when component unmounts
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (retryTimeoutRef.current) {
                window.clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    // Reset avatar error state and set loading state when update begins
    useEffect(() => {
        if (isUpdatingAvatar || isCheckingAvailability) {
            setIsAvatarLoading(true);
            setAvatarError(false);
        }
    }, [isUpdatingAvatar, isCheckingAvailability]);

    // Handle temp avatar URL if provided
    useEffect(() => {
        if (tempAvatarUrl) {
            setAvatarUrl(tempAvatarUrl);
            setIsAvatarLoading(false);
            setAvatarError(false);
        }
    }, [tempAvatarUrl]);

    // Update avatar URL when user or timestamp changes
    useEffect(() => {
        if (tempAvatarUrl) return;
        if (!isMounted.current) return;

        // Reset states
        setRetryCount(0);
        setAvatarError(false);
        setIsAvatarLoading(true);

        if (user?.avatar) {
            // Determine if this is a Google avatar URL
            if (isGoogleAvatarUrl(user.avatar)) {
                // For Google avatar URLs, just set the URL directly without processing
                setAvatarUrl(user.avatar);
                setIsAvatarLoading(false);
            } else {
                // For normal avatar URLs, process with timestamp
                const newAvatarUrl = getAvatarUrl(user.avatar);
                setAvatarUrl(newAvatarUrl);
                loadAvatarImage(newAvatarUrl);
            }
        } else {
            setIsAvatarLoading(false);
            setAvatarUrl(undefined);
        }
    }, [user?.avatar, timestamp, tempAvatarUrl, getAvatarUrl, loadAvatarImage, isGoogleAvatarUrl]);

    const tabs = [
        { id: 'profile', label: 'Hồ sơ', icon: <FiUser />, delay: 0 },
        { id: 'orders', label: 'Đơn hàng của tôi', icon: <FiPackage />, delay: 0.05 },
        { id: 'addresses', label: 'Địa chỉ', icon: <FiMapPin />, delay: 0.1 },
        { id: 'settings', label: 'Cài đặt', icon: <FiSettings />, delay: 0.15 },
    ];

    // Get user initials for avatar fallback
    const getUserInitials = (): string => {
        if (!user?.fullName) return 'U';

        const nameParts = user.fullName.trim().split(' ');
        if (nameParts.length === 0) return 'U';

        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    // Simplified handler for image error
    const handleImageError = () => {
        if (avatarUrl && isGoogleAvatarUrl(avatarUrl)) {
            // For Google avatars, immediately switch to initials
            getInitialsAvatar();
        } else if (retryCount >= maxRetries) {
            getInitialsAvatar();
        }
    };

    const handleImageLoaded = () => {
        setIsAvatarLoading(false);
        setAvatarError(false);
    };

    return (
        <div className="border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 md:h-full md:bg-gray-50/50 dark:md:bg-gray-800/50">
            <div className="flex flex-col items-center py-8 px-6" data-aos="fade-up">
                <motion.div
                    className="relative cursor-pointer group"
                    onClick={onAvatarClick}
                    variants={avatarVariants}
                    initial="initial"
                    animate="animate"
                >
                    <div className="relative">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                            <AnimatePresence>
                                {(isAvatarLoading || isUpdatingAvatar || isCheckingAvailability) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 z-10"
                                    >
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        {isCheckingAvailability && (
                                            <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white bg-black bg-opacity-50 py-1">
                                                Đang xử lý...
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {avatarUrl && !avatarError ? (
                                <img
                                    src={avatarUrl}
                                    alt={user?.fullName || 'User Avatar'}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        isAvatarLoading || isUpdatingAvatar || isCheckingAvailability ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    onError={handleImageError}
                                    onLoad={handleImageLoaded}
                                    key={`sidebar-avatar-${timestamp}`}
                                    crossOrigin="anonymous"
                                    referrerPolicy="no-referrer"
                                    onDoubleClick={(e) => {
                                        if (e.detail >= 3) {
                                            e.preventDefault();
                                            setShowDebugInfo(!showDebugInfo);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-accent dark:from-primary/80 dark:to-accent/80 flex items-center justify-center">
                                    <span className="text-white text-3xl font-bold">
                                        {getUserInitials()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0">
                            <motion.div
                                className="bg-primary text-white rounded-full p-2 shadow-md"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiCamera className="w-4 h-4" />
                            </motion.div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">
                            Thay đổi
                        </span>
                    </div>
                </motion.div>
                <AnimatePresence>
                    {showDebugInfo && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-xs text-gray-400 w-full break-words max-h-36 overflow-auto bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
                        >
                            <span className="font-semibold">Avatar URL (original):</span><br/>
                            {user?.avatar || 'No avatar URL'}<br/>
                            <span className="font-semibold">Avatar URL (with timestamp):</span><br/>
                            {avatarUrl || 'No processed URL'}<br/>
                            <span className="font-semibold">Temp URL:</span><br/>
                            {tempAvatarUrl || 'No temp URL'}<br/>
                            <span className="font-semibold">Error state:</span> {avatarError ? 'Error' : 'No error'}<br/>
                            <span className="font-semibold">Loading state:</span> {isAvatarLoading ? 'Loading' : 'Not loading'}<br/>
                            <span className="font-semibold">Is Google Avatar:</span> {user?.avatar && isGoogleAvatarUrl(user.avatar) ? 'Yes' : 'No'}<br/>
                            <span className="font-semibold">Updating:</span> {isUpdatingAvatar ? 'Yes' : 'No'}<br/>
                            <span className="font-semibold">Checking:</span> {isCheckingAvailability ? 'Yes' : 'No'}<br/>
                            <span className="font-semibold">Retry count:</span> {retryCount}/{maxRetries}<br/>
                            <span className="font-semibold">Timestamp:</span> {timestamp}<br/>
                            <button
                                className="mt-1 bg-primary/10 p-1 rounded text-primary"
                                onClick={() => {
                                    setAvatarError(false);
                                    setRetryCount(0);
                                    setIsAvatarLoading(true);
                                    setTimeout(() => {
                                        if (user?.avatar) {
                                            const refreshedUrl = getAvatarUrl(user.avatar, true);
                                            setAvatarUrl(refreshedUrl);
                                            loadAvatarImage(refreshedUrl);
                                        } else {
                                            setIsAvatarLoading(false);
                                        }
                                    }, 100);
                                }}
                            >
                                Force Reload
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    variants={userInfoVariants}
                    initial="initial"
                    animate="animate"
                    className="mt-4 text-center"
                >
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">{user?.fullName || 'User'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email || ''}</p>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <motion.nav
                className="mt-4 pb-6"
                variants={tabsContainerVariants}
                initial="initial"
                animate="animate"
                data-aos="fade-up"
                data-aos-delay="300"
            >
                <ul className="space-y-2 px-4">
                    {tabs.map((tab) => (
                        <motion.li
                            key={tab.id}
                            variants={tabItemVariants}
                            custom={tab.delay}
                            data-aos="fade-right"
                            data-aos-delay={tab.delay * 1000}
                        >
                            <button
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="mr-3">{tab.icon}</span>
                                <span className="font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-2 h-2 rounded-full bg-white"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    />
                                )}
                            </button>
                        </motion.li>
                    ))}

                    {/* Social Login Buttons */}
                    <motion.div
                        className="mt-6 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        variants={tabItemVariants}
                        custom={0.2}
                        data-aos="fade-up"
                        data-aos-delay="500"
                    >
                        <div className="px-2">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Liên kết tài khoản</h4>
                            <div className="flex space-x-2">
                                <motion.button
                                    onClick={onGoogleLogin}
                                    className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-300 ${
                                        isGoogleLinked
                                            ? "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                            : "bg-white text-[#4285F4] border border-[#4285F4] hover:bg-[#4285F4]/10 dark:bg-gray-800 dark:border-[#4285F4]/70"
                                    }`}
                                    variants={socialButtonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <FaGoogle className="mr-2" />
                                    <span className="text-sm font-medium truncate">
                                        {isGoogleLinked ? "Đã liên kết" : "Google"}
                                    </span>
                                </motion.button>

                                <motion.button
                                    onClick={onFacebookLogin}
                                    className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-300 ${
                                        isFacebookLinked
                                            ? "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                            : "bg-white text-[#1877F2] border border-[#1877F2] hover:bg-[#1877F2]/10 dark:bg-gray-800 dark:border-[#1877F2]/70"
                                    }`}
                                    variants={socialButtonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <FaFacebookF className="mr-2" />
                                    <span className="text-sm font-medium truncate">
                                        {isFacebookLinked ? "Đã liên kết" : "Facebook"}
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Logout Button */}
                    <motion.li
                        variants={tabItemVariants}
                        custom={0.2}
                        data-aos="fade-right"
                        data-aos-delay="400"
                    >
                        <motion.button
                            onClick={onLogout}
                            className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <FiLogOut className="mr-3" />
                            <span className="font-medium">Đăng xuất</span>
                        </motion.button>
                    </motion.li>
                </ul>
            </motion.nav>
        </div>
    );
};

export default ProfileSidebar;