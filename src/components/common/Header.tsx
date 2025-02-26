import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            toast.success(`Tìm kiếm: ${searchTerm}`);
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

    return (
        <header
            className={`relative w-full z-50 transition-all duration-300 border-b-2 border-primary
             ${
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
                    className="md:hidden text-primary transition z-50"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `text-xl md:text-2xl font-bold tracking-wider text-primary relative group z-50 ${
                            isMenuOpen ? 'text-center flex-grow' : 'text-left'
                        } ${isActive ? 'text-primary/80' : ''}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            AURAS
                            <span
                                className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full ${
                                    isActive ? 'w-full' : 'w-0'
                                }`}
                            ></span>
                        </>
                    )}
                </NavLink>

                <Navbar />

                <div className="flex items-center space-x-3 md:space-x-4 z-50">
                    {/* Search Button */}
                    <div className="relative">
                        <button
                            className="text-primary transition"
                            onClick={() => setIsSearchActive(!isSearchActive)}
                            aria-label={isSearchActive ? "Đóng tìm kiếm" : "Tìm kiếm"}
                        >
                            {isSearchActive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            )}
                        </button>

                        {/* Search Input */}
                        <div
                            className={`absolute top-[calc(100%+0.5rem)] right-0 md:left-0 md:right-auto mt-1 transition-all duration-300 z-50 ${
                                isSearchActive
                                    ? 'w-[90vw] md:w-64 opacity-100'
                                    : 'w-0 opacity-0 pointer-events-none'
                            }`}
                        >
                            <form onSubmit={handleSearch} className="flex items-center">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="w-full pr-2 pl-3 py-1.5 bg-white dark:bg-secondary/20 dark:text-textLight border border-primary/30 dark:border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm shadow-sm"
                                    autoFocus={isSearchActive}
                                />
                            </form>
                        </div>
                    </div>

                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            `text-primary transition hidden sm:block relative ${isActive ? 'text-primary/80' : ''}`
                        }
                        aria-label="Tài khoản"
                    >
                        {({ isActive }) => (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                        isActive ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/wishlist"
                        className={({ isActive }) =>
                            `text-primary transition hidden sm:block relative ${isActive ? 'text-primary/80' : ''}`
                        }
                        aria-label="Yêu thích"
                    >
                        {({ isActive }) => (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                        isActive ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `text-primary transition relative ${isActive ? 'text-primary/80' : ''}`
                        }
                        aria-label="Giỏ hàng"
                    >
                        {({ isActive }) => (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                                    3
                                </span>
                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ${
                                        isActive ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </>
                        )}
                    </NavLink>

                    <button
                        onClick={toggleTheme}
                        className="text-primary transition"
                        aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div
                className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-darkBackground shadow-lg transition-all duration-300 ${
                    isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                } overflow-hidden`}
            >
                <Navbar isMobile onLinkClick={() => setIsMenuOpen(false)} />
            </div>
        </header>
    );
};

export default Header;