import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
    isMobile?: boolean;
    onLinkClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isMobile = false, onLinkClick }) => {
    const navItems = [
        { to: '/', label: 'Trang Chủ' },
        { to: '/products', label: 'Sản Phẩm' },
        { to: '/news', label: 'Tin Tức' },
        { to: '/about', label: 'Giới Thiệu' },
        { to: '/contact', label: 'Liên Hệ' },
    ];

    const mobileOnlyItems = [
        { to: '/account', label: 'Tài Khoản', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )},
        { to: '/wishlist', label: 'Yêu Thích', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            )},
    ];

    return (
        <nav className={`${isMobile ? 'flex flex-col p-4 space-y-2.5' : 'hidden md:flex items-center space-x-6'}`}>
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `text-primary transition font-medium relative group ${
                            isMobile ? 'py-2 border-b border-gray-100 dark:border-gray-700 text-sm' : 'text-base'
                        } ${isActive ? 'text-primary/80 font-bold' : ''}`
                    }
                    onClick={onLinkClick}
                >
                    {({ isActive }) => (
                        <>
                            {item.label}
                            <span className={`absolute bottom-[-4px] left-[0px] right-[-10px] h-[2px] bg-primary transition-all  group-hover:w-full ${
                                isMobile ? 'left-0 right-0' : 'w-0'
                            } ${isActive ? 'w-full left-[-2px] right-[-2px]' : ''}`}
                            ></span>
                        </>
                    )}
                </NavLink>
            ))}

            {isMobile && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    {mobileOnlyItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `text-primary transition py-2 font-medium flex items-center gap-2 text-sm relative group ${
                                    item.to === '/account' ? 'border-b border-gray-100 dark:border-gray-700' : ''
                                } ${isActive ? 'text-primary/80 font-bold' : ''}`
                            }
                            onClick={onLinkClick}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="w-5 h-5 flex items-center justify-center">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    <span
                                        className={`absolute bottom-[-4px] left-[-2px] right-[-2px] h-[2px] bg-primary transition-all duration-300 group-hover:w-full ${
                                            isActive ? 'w-full' : 'w-0'
                                        }`}
                                    ></span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;