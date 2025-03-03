import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCategories, selectBrands } from '../../redux/selectors/productSelectors';
import { motion } from 'framer-motion';

// Updated ProductFiltersProps interface with improved typing
interface ProductFiltersProps {
    selectedCategory: number | null;
    selectedBrand: number | null;
    priceRange: {
        min: number | null;
        max: number | null;
    };
    onFilterChange: (filters: {
        categoryId?: number | null;
        brandId?: number | null;
        minPrice?: number | null;
        maxPrice?: number | null;
    }) => void;
    onResetFilters: () => void;
    isMobile?: boolean;
    onClose?: () => void;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
                                                                                                          title,
                                                                                                          children,
                                                                                                          defaultOpen = true,
                                                                                                      }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <button
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-accent transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                <FiChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`mt-2 transition-all duration-300 ${
                    isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                {children}
            </div>
        </motion.div>
    );
};

const PriceRangeInput: React.FC<{
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder: string;
}> = ({ value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState(value?.toString() || '');

    useEffect(() => {
        setInputValue(value?.toString() || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setInputValue(rawValue);
        const numValue = rawValue ? parseInt(rawValue.replace(/\D/g, ''), 10) : null;
        if (numValue !== value) {
            onChange(numValue);
        }
    };

    const formatValue = (value: string) => {
        if (!value) return '';
        const numericValue = value.replace(/\D/g, '');
        return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue, 10));
    };

    return (
        <input
            type="text"
            className="w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onBlur={() => setInputValue(inputValue ? formatValue(inputValue) : '')}
        />
    );
};

const ProductFilters: React.FC<ProductFiltersProps> = ({
                                                           selectedCategory,
                                                           selectedBrand,
                                                           priceRange,
                                                           onFilterChange,
                                                           onResetFilters,
                                                           isMobile,
                                                           onClose,
                                                       }) => {
    const categories = useSelector(selectCategories);
    const brands = useSelector(selectBrands);
    const [minPrice, setMinPrice] = useState<number | null>(priceRange.min);
    const [maxPrice, setMaxPrice] = useState<number | null>(priceRange.max);

    useEffect(() => {
        if (minPrice !== priceRange.min || maxPrice !== priceRange.max) {
            const timer = setTimeout(() => {
                onFilterChange({ minPrice, maxPrice });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [minPrice, maxPrice, onFilterChange, priceRange.min, priceRange.max]);

    useEffect(() => {
        setMinPrice(priceRange.min);
        setMaxPrice(priceRange.max);
    }, [priceRange.min, priceRange.max]);

    const handleCategoryChange = (categoryId: number) => {
        onFilterChange({
            categoryId: selectedCategory === categoryId ? null : categoryId,
        });
    };

    const handleBrandChange = (brandId: number) => {
        onFilterChange({
            brandId: selectedBrand === brandId ? null : brandId,
        });
    };

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bộ lọc</h3>
                <div className="flex gap-2">
                    {isMobile && onClose && (
                        <button
                            onClick={onClose}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            Đóng
                        </button>
                    )}
                    <button
                        onClick={onResetFilters}
                        className="text-xs text-primary dark:text-accent hover:underline transition-colors duration-200"
                    >
                        Xóa tất cả
                    </button>
                </div>
            </div>

            {/* Categories */}
            <FilterSection title="Danh mục">
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {categories && categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.categoryId} className="flex items-center">
                                <input
                                    id={`category-${category.categoryId}`}
                                    type="checkbox"
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                                    checked={selectedCategory === category.categoryId}
                                    onChange={() => handleCategoryChange(category.categoryId)}
                                />
                                <label
                                    htmlFor={`category-${category.categoryId}`}
                                    className="ml-2 text-sm text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-accent transition-colors duration-200"
                                >
                                    {category.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Không có danh mục</p>
                    )}
                </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection title="Thương hiệu">
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {brands && brands.length > 0 ? (
                        brands.map((brand) => (
                            <div key={brand.brandId} className="flex items-center">
                                <input
                                    id={`brand-${brand.brandId}`}
                                    type="checkbox"
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                                    checked={selectedBrand === brand.brandId}
                                    onChange={() => handleBrandChange(brand.brandId)}
                                />
                                <label
                                    htmlFor={`brand-${brand.brandId}`}
                                    className="ml-2 text-sm text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-accent transition-colors duration-200"
                                >
                                    {brand.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Không có thương hiệu</p>
                    )}
                </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Khoảng giá">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <PriceRangeInput value={minPrice} onChange={setMinPrice} placeholder="Từ" />
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                        <PriceRangeInput value={maxPrice} onChange={setMaxPrice} placeholder="Đến" />
                    </div>
                    {(minPrice || maxPrice) && (
                        <button
                            onClick={() => {
                                setMinPrice(null);
                                setMaxPrice(null);
                                onFilterChange({ minPrice: null, maxPrice: null });
                            }}
                            className="text-xs text-primary dark:text-accent hover:underline transition-colors duration-200"
                        >
                            Xóa khoảng giá
                        </button>
                    )}
                </div>
            </FilterSection>

            {/* Apply Filters Button for Mobile */}
            {isMobile && (
                <motion.div
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <button
                        onClick={onClose}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                        Áp dụng bộ lọc
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

// Add custom scrollbar styles
const styleElement = document.createElement('style');
styleElement.textContent = `
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}
`;
document.head.appendChild(styleElement);

export default ProductFilters;