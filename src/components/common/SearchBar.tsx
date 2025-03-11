import React, { useEffect, useState, FormEvent, ChangeEvent, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch, FiX } from 'react-icons/fi';
import useProduct from '../../hooks/useProduct';
import { ProductResponseDTO } from '../../types/product.types';

interface SearchBarProps {
    isMobile?: boolean; // Xác định giao diện mobile hay desktop
    onClose?: () => void; // Callback để đóng menu mobile nếu cần
}

const SearchBar: React.FC<SearchBarProps> = ({ isMobile = false, onClose }) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<ProductResponseDTO[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { searchProducts } = useProduct();

    // Xử lý focus và click ngoài để đóng search
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

    // Lấy gợi ý sản phẩm khi searchTerm thay đổi
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

        const timer = setTimeout(fetchSuggestions, 300); // Debounce 300ms
        return () => clearTimeout(timer);
    }, [searchTerm, searchProducts]);

    // Xử lý submit form tìm kiếm
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsSearchActive(false);
            setSuggestions([]);
            if (onClose) onClose();
        } else {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
        }
    };

    return (
        <div className="relative" ref={searchRef}>
            {!isMobile ? (
                <>
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
                </>
            ) : (
                <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-secondary/20 rounded-full overflow-hidden w-full">
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
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-darkBackground shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                            {suggestions.map((product) => (
                                <NavLink
                                    key={product.productId}
                                    to={`/products/${product.slug}`}
                                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setSuggestions([]);
                                        if (onClose) onClose();
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
                </form>
            )}
        </div>
    );
};

export default SearchBar;