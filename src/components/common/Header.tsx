import React, { useEffect, useState, FormEvent, ChangeEvent, useRef, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import useAuth from '../../hooks/useAuth';
import useProfile from '../../hooks/useProfile';
import useCart from '../../hooks/useCart';
import useProduct from '../../hooks/useProduct';
import { GiStarSwirl } from 'react-icons/gi';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiSun, FiMoon, FiMenu, FiX, FiMail, FiLogOut, FiUserPlus, FiLogIn, FiPackage } from 'react-icons/fi';
import { ProductResponseDTO } from '../../types/product.types';
import GlobalAuthService from '../../services/global.service';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

// Check if a URL is a Google avatar URL
const isGoogleAvatarUrl = (url: string): boolean => {
    return url && (
        url.includes('googleusercontent.com') ||
        url.includes('google.com') ||
        url.includes('googleapis.com')
    );
};

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<ProductResponseDTO[]>([]);
    const [avatarError, setAvatarError] = useState(false);
    const [profileInitialized, setProfileInitialized] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0);

    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Auth và Profile hooks
    const { isAuthenticated, user, signOut, accessToken } = useAuth();
    const {
        profile,
        isLoading: isProfileLoading,
        getProfile
    } = useProfile();

    const { itemCount } = useCart();
    const { searchProducts } = useProduct();

    // Force profile refresh when auth state changes
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Reset profile initialized state when auth changes
            setProfileInitialized(false);

            // Force a refresh of the avatar by updating timestamp
            if (isAuthenticated) {
                sessionStorage.removeItem('avatarTimestamp');
                sessionStorage.setItem('avatarTimestamp', Date.now().toString());

                // Force re-render by updating state
                setForceRefresh(prev => prev + 1);

                // Reset avatar error state
                setAvatarError(false);
            }
        }
    }, [isAuthenticated, accessToken]);

    // Generate a stable avatar URL that only changes when needed
    const avatarUrl = useMemo(() => {
        const url = profile?.avatar || user?.avatar;
        if (!url || avatarError) return '';

        // Special handling for Google avatar URLs to prevent CORS issues
        if (isGoogleAvatarUrl(url)) {
            return url; // Google URLs should be used as-is without modifications
        }

        // For non-Google URLs, add cache busting
        const cacheBuster = sessionStorage.getItem('avatarTimestamp') || Date.now().toString();
        return url.includes('?') ? `${url}&t=${cacheBuster}` : `${url}?t=${cacheBuster}`;
    }, [profile?.avatar, user?.avatar, avatarError, forceRefresh]);

    // Proactively fetch profile
    useEffect(() => {
        const fetchProfileIfNeeded = async () => {
            if (isAuthenticated && accessToken && !profileInitialized && !isProfileLoading) {
                try {
                    console.log('Proactively fetching profile in Header');
                    await getProfile(true); // force=true to bypass cache
                    setProfileInitialized(true);
                } catch (err) {
                    console.error('Error fetching profile in Header:', err);
                }
            }
        };

        // Small delay to ensure auth state is fully updated
        const timer = setTimeout(() => {
            fetchProfileIfNeeded();
        }, 300);

        return () => clearTimeout(timer);
    }, [isAuthenticated, accessToken, getProfile, isProfileLoading, profileInitialized, forceRefresh]);

    // Reset profileInitialized on logout
    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            setProfileInitialized(false);
            // Clear avatar timestamp on logout
            sessionStorage.removeItem('avatarTimestamp');
        }
    }, [isAuthenticated, accessToken]);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (userMenuRef.current && !userMenuRef.current.contains(target) && isUserMenuOpen) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    // Handle search focus and outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (searchRef.current && !searchRef.current.contains(target) && isSearchActive) {
                setIsSearchActive(false);
                setSuggestions([]);
            }
        };
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchActive]);

    // Fetch search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length >= 3) {
                try {
                    const response = await searchProducts({
                        keyword: searchTerm,
                        page: 0,
                        size: 5,
                    });
                    setSuggestions(response.content || []);
                } catch (error) {
                    console.error('Failed to fetch suggestions:', error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, searchProducts]);

    // Handle search submission
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsSearchActive(false);
            setSuggestions([]);
        } else {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark', !isDarkMode);
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
        toast.success(`Đã chuyển sang chế độ ${isDarkMode ? 'sáng' : 'tối'}`);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            // Get email before logout to clear Google state
            const email = getUserEmail();

            await signOut();

            // Clear Google sign-in state if needed
            if (email) {
                GlobalAuthService.clearGoogleState(email);
            }

            toast.success('Đăng xuất thành công!');
            setIsUserMenuOpen(false);
            setAvatarError(false);
            sessionStorage.removeItem('avatarTimestamp');
            navigate('/');
        } catch (err) {
            toast.error('Đăng xuất thất bại.');
            console.error('Đăng xuất thất bại:', err);
        }
    };

    // Get username from profile or user
    const getUsername = (): string => {
        if (profile?.username) return profile.username;
        if (user?.username) return user.username;
        return 'User';
    };

    // Get email from profile or user
    const getUserEmail = (): string => {
        if (profile?.email) return profile.email;
        if (user?.email) return user.email;
        return '';
    };

    // Get join date
    const getJoinDate = (): string => {
        if (profile?.createdAt) {
            try {
                return new Date(profile.createdAt).toLocaleDateString('vi-VN');
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Không xác định';
            }
        }
        return 'Không xác định';
    };

    // Render avatar or default icon
    const renderAvatar = () => {
        if (isAuthenticated) {
            if (avatarUrl && !avatarError) {
                return (
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full object-cover border-2 border-primary"
                            onError={() => setAvatarError(true)}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-darkBackground"></span>
                    </div>
                );
            } else {
                // Avatar placeholder
                const username = getUsername();
                const initial = username ? username.charAt(0).toUpperCase() : 'U';

                return (
                    <div className="relative w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-2 border-primary">
                        {initial}
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-darkBackground"></span>
                    </div>
                );
            }
        } else {
            return <FiUser className="w-5 h-5" />;
        }
    };

    // Large avatar for dropdown menu
    const renderLargeAvatar = () => {
        if (avatarUrl && !avatarError) {
            return (
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    onError={() => setAvatarError(true)}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            );
        } else {
            // Large avatar placeholder
            const username = getUsername();
            const initial = username ? username.charAt(0).toUpperCase() : 'U';

            return (
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {initial}
                </div>
            );
        }
    };

    // Debug logging for profile state
    useEffect(() => {
        if (profile) {
            console.log('Profile state updated in Header:', {
                username: profile.username,
                hasAvatar: !!profile.avatar,
                joinDate: profile.createdAt
            });
        }
    }, [profile]);

    return (
        <header
            className={`relative w-full z-50 transition-all duration-300 border-b-2 border-primary ${
                isScrolled
                    ? 'bg-white/95 dark:bg-darkBackground/95 backdrop-blur-md shadow-md'
                    : 'bg-white dark:bg-darkBackground'
            }`}
            data-aos="fade-down"
            data-aos-duration="800"
        >
            <div className="bg-primary text-white text-center text-xs md:text-sm py-1.5 px-4 font-medium">
                <span className="hidden sm:inline">Miễn phí vận chuyển cho đơn hàng trên 1.000.000đ</span>
                <span className="sm:hidden">Miễn phí vận chuyển 1.000.000đ</span>
                <span className="mx-2 hidden md:inline">|</span>
                <span>Mã: WELCOME10 giảm 10%</span>
            </div>

            <div className="container mx-auto px-4 py-2.5 flex items-center justify-between relative">
                {/* Mobile menu button */}
                <button
                    className="md:hidden text-primary transition z-50 hover:text-accent"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>

                {/* Logo */}
                <div className="flex items-center">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wider text-primary relative group z-50 ${
                                isMenuOpen ? 'text-center' : 'text-left'
                            } ${isActive ? 'text-primary/80' : ''}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <GiStarSwirl className="w-8 h-8 md:w-10 md:h-10 text-primary hover:text-accent transition-colors duration-300 transform hover:scale-110" />
                                <span className="flex flex-col">
                                    <span>AURAS</span>
                                    <span
                                        className={`h-[2px] bg-primary transition-all duration-300 group-hover:w-full ${
                                            isActive ? 'w-full' : 'w-0'
                                        }`}
                                    ></span>
                                </span>
                            </>
                        )}
                    </NavLink>
                </div>

                <Navbar />

                {/* Right icons */}
                <div className="flex items-center space-x-1 md:space-x-3 z-50">
                    {/* Search */}
                    <div className="relative" ref={searchRef}>
                        <button
                            className="text-primary transition hover:text-accent p-1.5 rounded-full hover:bg-primary/10"
                            onClick={() => setIsSearchActive(!isSearchActive)}
                            aria-label={isSearchActive ? 'Đóng tìm kiếm' : 'Tìm kiếm'}
                        >
                            {isSearchActive ? <FiX className="w-5 h-5" /> : <FiSearch className="w-5 h-5" />}
                        </button>
                        <div
                            className={`absolute right-0 mt-2 w-72 md:w-80 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground rounded-md overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 ${
                                isSearchActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                        >
                            <form onSubmit={handleSearch} className="flex items-center border-b dark:border-gray-700">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full px-4 py-3 bg-transparent dark:text-textLight border-0 focus:outline-none focus:ring-0 text-sm"
                                />
                                <button type="submit" className="px-4 py-3 text-primary hover:text-accent transition">
                                    <FiSearch className="w-5 h-5" />
                                </button>
                            </form>
                            {suggestions.length > 0 && (
                                <div className="max-h-60 overflow-y-auto">
                                    {suggestions.map((product) => (
                                        <NavLink
                                            key={product.productId}
                                            to={`/products/${product.slug}`}
                                            className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                setSuggestions([]);
                                                setIsSearchActive(false);
                                            }}
                                        >
                                            {product.thumbnail && (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover mr-2 rounded-md"
                                                />
                                            )}
                                            <span className="text-sm">{product.name}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart */}
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `text-primary transition relative p-1.5 rounded-full hover:bg-primary/10 hover:text-accent ${
                                isActive ? 'text-primary/80 font-bold' : ''
                            }`
                        }
                        aria-label="Giỏ hàng"
                    >
                        {({ isActive }) => (
                            <div className="relative group">
                                <FiShoppingBag className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                                        {itemCount}
                                    </span>
                                )}
                                <span
                                    className={`absolute bottom-[-4px] left-0 right-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full ${
                                        isActive ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </div>
                        )}
                    </NavLink>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="text-primary transition hover:text-accent p-1.5 rounded-full hover:bg-primary/10"
                        aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                    >
                        {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                    </button>

                    {/* User menu - ENHANCED */}
                    <div className="relative user-menu-container" ref={userMenuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`text-primary transition hover:text-accent p-1 rounded-lg hover:bg-primary/10 flex items-center space-x-1 ${isUserMenuOpen ? 'bg-primary/10' : ''}`}
                            aria-label="Tài khoản"
                        >
                            {renderAvatar()}

                            {isAuthenticated && (
                                <span className="hidden sm:inline text-sm font-medium ml-1 max-w-[100px] truncate">
                                    {getUsername()}
                                </span>
                            )}

                            <svg
                                className={`hidden sm:block w-4 h-4 ml-1 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>

                        {/* Dropdown menu - Redesigned */}
                        <div
                            className={`absolute right-0 mt-2 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground rounded-lg overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 ${
                                isUserMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                            style={{ width: '250px' }}
                        >
                            {isAuthenticated ? (
                                <>
                                    {/* User info section */}
                                    <div className="px-4 py-3 bg-primary/5 dark:bg-primary/10 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            {renderLargeAvatar()}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                    {getUsername()}
                                                </p>
                                                {getUserEmail() && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center truncate">
                                                        <FiMail className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">{getUserEmail()}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Đã tham gia: {getJoinDate()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu options */}
                                    <div className="py-1">
                                        <NavLink
                                            to="/profile"
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                                    isActive ? 'bg-primary/10 dark:bg-primary/20 font-medium' : ''
                                                }`
                                            }
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiUser className="w-4 h-4 mr-3 text-primary" />
                                            Thông tin cá nhân
                                        </NavLink>

                                        <NavLink
                                            to="/order/list"
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                                    isActive ? 'bg-primary/10 dark:bg-primary/20 font-medium' : ''
                                                }`
                                            }
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiPackage className="w-4 h-4 mr-3 text-primary" />
                                            Đơn hàng của tôi
                                        </NavLink>

                                        <NavLink
                                            to="/wishlist"
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                                    isActive ? 'bg-primary/10 dark:bg-primary/20 font-medium' : ''
                                                }`
                                            }
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiHeart className="w-4 h-4 mr-3 text-primary" />
                                            Danh sách yêu thích
                                        </NavLink>
                                    </div>

                                    {/* Logout button */}
                                    <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <FiLogOut className="w-4 h-4 mr-3 text-red-500" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Not authenticated - sign in/sign up */}
                                    <div className="p-4">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Chào mừng đến với AURAS Shop
                                        </div>

                                        <NavLink
                                            to="/login"
                                            className="flex items-center justify-center w-full bg-primary text-white py-2.5 px-4 rounded-md hover:bg-primary/90 transition mb-2 text-sm font-medium"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiLogIn className="w-4 h-4 mr-2" />
                                            Đăng nhập
                                        </NavLink>

                                        <NavLink
                                            to="/register"
                                            className="flex items-center justify-center w-full border border-primary text-primary py-2.5 px-4 rounded-md hover:bg-primary/10 transition text-sm font-medium"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiUserPlus className="w-4 h-4 mr-2" />
                                            Đăng ký
                                        </NavLink>
                                    </div>

                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                                        Đăng nhập để theo dõi đơn hàng và nhận khuyến mãi đặc biệt!
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            ></div>
            <div
                className={`md:hidden fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white dark:bg-darkBackground shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                        <GiStarSwirl className="w-7 h-7 text-primary" />
                        <span>AURAS</span>
                    </NavLink>
                    <button onClick={() => setIsMenuOpen(false)} className="text-primary">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile search */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-secondary/20 rounded-full overflow-hidden">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full px-4 py-2 bg-transparent dark:text-textLight border-0 focus:outline-none focus:ring-0 text-sm"
                        />
                        <button type="submit" className="px-3 py-2 text-primary hover:text-accent transition">
                            <FiSearch className="w-5 h-5" />
                        </button>
                    </form>
                    {suggestions.length > 0 && (
                        <div className="mt-2 max-h-60 overflow-y-auto bg-white dark:bg-darkBackground shadow-lg rounded-md">
                            {suggestions.map((product) => (
                                <NavLink
                                    key={product.productId}
                                    to={`/products/${product.slug}`}
                                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setSuggestions([]);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {product.thumbnail && (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover mr-2 rounded-md"
                                        />
                                    )}
                                    <span>{product.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <Navbar isMobile onLinkClick={() => setIsMenuOpen(false)} />
                </div>

                {/* Mobile user section - ENHANCED */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                        <>
                            {/* User profile heading */}
                            <div className="px-2 py-3 bg-primary/5 dark:bg-primary/10 rounded-lg mb-3">
                                <div className="flex items-center space-x-3">
                                    {renderLargeAvatar()}
                                    <div>
                                        <div className="text-sm font-semibold">
                                            Xin chào, {getUsername()}
                                        </div>
                                        {getUserEmail() && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                                                <FiMail className="w-3 h-3 mr-1" />
                                                <span className="truncate max-w-[150px]">{getUserEmail()}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User menu options */}
                            <div className="space-y-1">
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        `flex items-center p-2.5 text-sm rounded-md ${
                                            isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FiUser className="w-4 h-4 mr-3" />
                                    Thông tin cá nhân
                                </NavLink>

                                <NavLink
                                    to="/order/list"
                                    className={({ isActive }) =>
                                        `flex items-center p-2.5 text-sm rounded-md ${
                                            isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FiPackage className="w-4 h-4 mr-3" />
                                    Đơn hàng của tôi
                                </NavLink>

                                <NavLink
                                    to="/wishlist"
                                    className={({ isActive }) =>
                                        `flex items-center p-2.5 text-sm rounded-md ${
                                            isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FiHeart className="w-4 h-4 mr-3" />
                                    Danh sách yêu thích
                                </NavLink>
                            </div>

                            {/* Logout button */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center justify-center p-2.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
                                >
                                    <FiLogOut className="w-4 h-4 mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-center py-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                                Đăng nhập để trải nghiệm đầy đủ các tính năng
                            </div>

                            <NavLink
                                to="/login"
                                className="flex items-center justify-center w-full bg-primary text-white p-2.5 rounded-md hover:bg-opacity-90 transition font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiLogIn className="w-4 h-4 mr-2" />
                                Đăng nhập
                            </NavLink>

                            <NavLink
                                to="/register"
                                className="flex items-center justify-center w-full border border-primary text-primary p-2.5 rounded-md hover:bg-primary/10 transition font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiUserPlus className="w-4 h-4 mr-2" />
                                Đăng ký
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;