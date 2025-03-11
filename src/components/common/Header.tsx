import React, { useEffect, useState, FormEvent, ChangeEvent, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useProduct from '../../hooks/useProduct';
import { GiStarSwirl } from 'react-icons/gi';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiSun, FiMoon, FiMenu, FiX, FiMail } from 'react-icons/fi';
import { AxiosError } from 'axios';
import { ApiResponse } from '../../types/auth.types';
import { ProductResponseDTO } from '../../types/product.types';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Trạng thái tìm kiếm cục bộ
    const [suggestions, setSuggestions] = useState<ProductResponseDTO[]>([]); // Gợi ý sản phẩm
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { isAuthenticated, user, signOut, getUserProfile, accessToken } = useAuth();
    const { itemCount } = useCart();
    const { searchProducts } = useProduct();

    // Fetch user profile if needed
    useEffect(() => {
        const fetchUserIfNeeded = async () => {
            if (accessToken && (!user || !user.username)) {
                try {
                    await getUserProfile();
                    console.log('User profile fetched successfully');
                } catch (err) {
                    const axiosError = err as AxiosError<ApiResponse>;
                    console.error('Không thể lấy thông tin người dùng:', axiosError);
                    const currentPath = window.location.pathname;
                    if (axiosError.response?.status === 401 && !currentPath.includes('/profile')) {
                        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                        await signOut();
                    } else if (axiosError.response?.status === 400) {
                        toast.error(axiosError.response?.data?.message || 'Yêu cầu không hợp lệ.');
                    } else {
                        toast.error('Không thể tải thông tin người dùng.');
                    }
                }
            }
        };
        fetchUserIfNeeded();
    }, [accessToken, getUserProfile, signOut, user]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu-container') && isUserMenuOpen) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    // Handle search input focus and click outside
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

    // Fetch product suggestions when search term changes (chỉ cho gợi ý, không áp dụng bộ lọc)
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

        const timer = setTimeout(fetchSuggestions, 300); // Debounce API call by 300ms
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle search form submission
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Điều hướng đến trang kết quả tìm kiếm mà không thay đổi trạng thái toàn cục
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

                {/* Right-side icons */}
                <div className="flex items-center space-x-2 md:space-x-3 z-50">
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
                            className={`absolute right-0 mt-2 w-72 md:w-80 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground shadow-lg rounded-md overflow-hidden ${
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
                                                    className="w-10 h-10 object-cover mr-2"
                                                />
                                            )}
                                            <span>{product.name}</span>
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

                    {/* User menu */}
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
                        <div
                            className={`absolute right-0 mt-2 origin-top-right transition-all duration-300 transform z-50 bg-white dark:bg-darkBackground shadow-lg rounded-md overflow-hidden ${
                                isUserMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                            style={{ width: '220px' }}
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
                                            className={({ isActive }) =>
                                                `block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 ${
                                                    isActive ? 'text-primary/80 font-bold' : ''
                                                }`
                                            }
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Hồ sơ cá nhân
                                        </NavLink>
                                        <NavLink
                                            to="/order/list"
                                            className={({ isActive }) =>
                                                `block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 ${
                                                    isActive ? 'text-primary/80 font-bold' : ''
                                                }`
                                            }
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
                                            className={({ isActive }) =>
                                                `block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 ${
                                                    isActive ? 'text-primary/80 font-bold' : ''
                                                }`
                                            }
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Đăng nhập
                                        </NavLink>
                                        <NavLink
                                            to="/register"
                                            className={({ isActive }) =>
                                                `block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 ${
                                                    isActive ? 'text-primary/80 font-bold' : ''
                                                }`
                                            }
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
                                            className="w-10 h-10 object-cover mr-2"
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
                                className={({ isActive }) =>
                                    `block py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1 ${
                                        isActive ? 'text-primary/80 font-bold' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Hồ sơ cá nhân
                            </NavLink>
                            <NavLink
                                to="/wishlist"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1 sm-hidden ${
                                        isActive ? 'text-primary/80 font-bold' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiHeart className="w-4 h-4" />
                                <span>Danh sách yêu thích</span>
                            </NavLink>
                            <NavLink
                                to="/order/list"
                                className={({ isActive }) =>
                                    `block py-2 px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20 rounded mb-1 ${
                                        isActive ? 'text-primary/80 font-bold' : ''
                                    }`
                                }
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
                                className={({ isActive }) =>
                                    `w-full p-2.5 bg-primary text-white rounded-md hover:bg-opacity-90 transition block text-center mb-2 ${
                                        isActive ? 'bg-opacity-90 font-bold' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Đăng nhập
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `w-full p-2.5 border border-primary text-primary hover:bg-primary/10 rounded-md transition block text-center ${
                                        isActive ? 'bg-primary/10 font-bold' : ''
                                    }`
                                }
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