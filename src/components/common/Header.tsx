import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import useAuth from '../../hooks/useAuth';
import { GiStarSwirl } from 'react-icons/gi';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiSun, FiMoon, FiMenu, FiX, FiMail } from 'react-icons/fi';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { isAuthenticated, user, signOut, getUserProfile, accessToken } = useAuth();

    // Fetch user profile if we have token but no user data
    useEffect(() => {
        const fetchUserIfNeeded = async () => {
            if (accessToken && (!user || !user.username)) {
                try {
                    await getUserProfile();
                } catch (err) {
                    console.error('Không thể lấy thông tin người dùng:', err);
                }
            }
        };

        fetchUserIfNeeded();
    }, [accessToken, user, getUserProfile]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Đóng menu người dùng khi click ra ngoài
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu-container') && isUserMenuOpen) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    useEffect(() => {
        // Đóng tìm kiếm khi click ra ngoài
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (searchRef.current && !searchRef.current.contains(target) && isSearchActive) {
                setIsSearchActive(false);
            }
        };

        // Focus vào input khi mở tìm kiếm
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchActive]);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            toast.success(`Tìm kiếm: ${searchTerm}`);
            // Thực hiện tìm kiếm ở đây
            setSearchTerm('');
            setIsSearchActive(false);
        } else {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        toast.success(`Đã chuyển sang chế độ ${isDarkMode ? 'sáng' : 'tối'}`);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Đăng xuất thành công!');
            setIsUserMenuOpen(false);
        } catch (err) {
            toast.error('Đăng xuất thất bại.');
            console.error('Đăng xuất thất bại:', err);
        }
    };

    return (
        <header
            className={`relative w-full z-50 transition-all duration-300 border-b-2 border-primary ${
                isScrolled
                    ? 'bg-white/95 dark:bg-darkBackground/95 backdrop-blur-md shadow-md'
                    : 'bg-transparent'
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
                <button
                    className="md:hidden text-primary transition z-50 hover:text-accent"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isMenuOpen ? (
                        <FiX className="w-5 h-5" />
                    ) : (
                        <FiMenu className="w-5 h-5" />
                    )}
                </button>

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

                <div className="flex items-center space-x-2 md:space-x-3 z-50">
                    {/* Search Component */}
                    <div className="relative" ref={searchRef}>
                        <button
                            className="text-primary transition hover:text-accent p-1.5 rounded-full hover:bg-primary/10"
                            onClick={() => setIsSearchActive(!isSearchActive)}
                            aria-label={isSearchActive ? 'Đóng tìm kiếm' : 'Tìm kiếm'}
                        >
                            {isSearchActive ? (
                                <FiX className="w-5 h-5" />
                            ) : (
                                <FiSearch className="w-5 h-5" />
                            )}
                        </button>

                        {/* Desktop Search Dropdown */}
                        <div
                            className={`absolute right-0 mt-2 w-72 md:w-80 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground shadow-lg rounded-md overflow-hidden
                            ${isSearchActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
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
                                <button
                                    type="submit"
                                    className="px-4 py-3 text-primary hover:text-accent transition"
                                >
                                    <FiSearch className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                                Tìm kiếm phổ biến: Áo, Váy, Quần
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `text-primary transition relative p-1.5 rounded-full hover:bg-primary/10 hover:text-accent ${isActive ? 'text-primary/80' : ''}`
                        }
                        aria-label="Giỏ hàng"
                    >
                        {({ isActive }) => (
                            <div className="relative">
                                <FiShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                                    3
                                </span>
                                <span
                                    className={`absolute bottom-0 left-0 right-0 h-[2px] bg-primary transition-all duration-300 ${
                                        isActive ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </div>
                        )}
                    </NavLink>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="text-primary transition hover:text-accent p-1.5 rounded-full hover:bg-primary/10"
                        aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                    >
                        {isDarkMode ? (
                            <FiSun className="w-5 h-5" />
                        ) : (
                            <FiMoon className="w-5 h-5" />
                        )}
                    </button>

                    {/* User Section */}
                    <div className="relative user-menu-container">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="text-primary transition hover:text-accent p-1.5 rounded-full hover:bg-primary/10 flex items-center space-x-1"
                            aria-label="Tài khoản"
                        >
                            <FiUser className="w-5 h-5" />
                            {isAuthenticated && user && (
                                <span className="hidden sm:inline text-sm font-medium ml-1">
                                    {user?.username || 'User'}
                                </span>
                            )}
                        </button>

                        {/* User Menu Dropdown */}
                        <div
                            className={`absolute right-0 mt-2 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground shadow-lg rounded-md overflow-hidden
                            ${isUserMenuOpen
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-95 pointer-events-none'}`}
                            style={{width: '220px'}}
                        >
                            <div className="py-2">
                                {isAuthenticated && user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Xin chào, {user?.username || 'User'}
                                            </p>
                                            {user?.email && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                    <FiMail className="w-3 h-3 mr-1" /> {user.email}
                                                </p>
                                            )}
                                        </div>
                                        <NavLink
                                            to="/profile"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Hồ sơ cá nhân
                                        </NavLink>
                                        <NavLink
                                            to="/orders"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Đơn hàng của tôi
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20"
                                        >
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/login"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Đăng nhập
                                        </NavLink>
                                        <NavLink
                                            to="/register"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Đăng ký
                                        </NavLink>
                                    </>
                                )}
                            </div>
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

                {/* Mobile Search Form */}
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
                </div>

                <div className="p-4">
                    <Navbar isMobile onLinkClick={() => setIsMenuOpen(false)} />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated && user ? (
                        <>
                            <div className="py-2 px-2 text-primary mb-2">
                                <div className="flex items-center space-x-2 text-sm">
                                    <FiUser className="w-4 h-4" />
                                    <span>Xin chào, {user?.username || 'User'}</span>
                                </div>
                                {user?.email && (
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-6">
                                        <FiMail className="w-3 h-3 mr-1" /> {user.email}
                                    </div>
                                )}
                            </div>
                            <NavLink
                                to="/profile"
                                className="block py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Hồ sơ cá nhân
                            </NavLink>
                            <NavLink
                                to="/wishlist"
                                className="flex items-center space-x-2 py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1 sm:hidden"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiHeart className="w-4 h-4" />
                                <span>Danh sách yêu thích</span>
                            </NavLink>
                            <NavLink
                                to="/orders"
                                className="block py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Đơn hàng của tôi
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="w-full py-2 px-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <NavLink
                                to="/login"
                                className="w-full p-2.5 bg-primary text-white rounded-md hover:bg-opacity-90 transition block text-center mb-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Đăng nhập
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="w-full p-2.5 border border-primary text-primary hover:bg-primary/10 rounded-md transition block text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
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