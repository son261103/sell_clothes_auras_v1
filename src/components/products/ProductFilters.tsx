import React, {useEffect, useState, useCallback, memo, useMemo} from 'react';
import { FiChevronDown, FiSearch, FiX, FiCheck, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryResponseDTO } from '../../types/category.types';
import { BrandResponseDTO } from '../../types/brand.types';

// Interface for filter parameters - supports multiple selection
interface FilterParams {
    categoryIds?: number[] | null;
    brandIds?: number[] | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    searchTerm?: string;

    // Keep for backward compatibility
    categoryId?: number | null;
    brandId?: number | null;
}

interface ProductFiltersProps {
    // Arrays for multiple selections
    selectedCategories: number[];
    selectedBrands: number[];
    priceRange: {
        min: number | null;
        max: number | null;
    };
    onFilterChange: (filters: FilterParams) => void;
    onResetFilters: () => void;
    isMobile?: boolean;
    onClose?: () => void;
    expanded?: boolean; // New prop for expanded state

    // Modified to accept all categories and brands, not just active ones
    categories?: CategoryResponseDTO[];
    brands?: BrandResponseDTO[];

    // Subcategories are now loaded from the full hierarchy
    allCategories?: CategoryResponseDTO[]; // All categories including subcategories

    // Loading state
    isLoading?: boolean;
}

const FilterSection: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number;
    badge?: number; // New prop for selected count badge
    onClear?: () => void; // New prop for clear action
    showClear?: boolean; // Whether to show clear button
}> = ({
          title,
          children,
          defaultOpen = true,
          count,
          badge,
          onClear,
          showClear = false
      }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div
            className="mb-8" // Increased spacing for better visual separation
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-2">
                <button
                    className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-accent transition-colors duration-200"
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                >
                    <div className="flex items-center">
                        <span className="text-base">{title}</span>
                        {count !== undefined && (
                            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                {count}
                            </span>
                        )}
                        {badge !== undefined && badge > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/20 dark:bg-primary/30 text-primary dark:text-accent font-bold text-xs rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    <FiChevronDown
                        className={`h-4 w-4 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {showClear && badge !== undefined && badge > 0 && onClear && (
                    <button
                        onClick={onClear}
                        className="text-xs text-primary dark:text-accent hover:underline transition-colors duration-200 flex items-center"
                        type="button"
                    >
                        <FiX size={14} className="mr-1" />
                        Xóa
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PriceRangeInput: React.FC<{
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder: string;
    disabled?: boolean;
}> = ({ value, onChange, placeholder, disabled = false }) => {
    const [inputValue, setInputValue] = useState(value?.toString() || '');

    // Update input value when props change
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
            className={`w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onBlur={() => setInputValue(inputValue ? formatValue(inputValue) : '')}
            disabled={disabled}
        />
    );
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

const ProductFilters: React.FC<ProductFiltersProps> = memo(({
                                                                selectedCategories = [],
                                                                selectedBrands = [],
                                                                priceRange,
                                                                onFilterChange,
                                                                onResetFilters,
                                                                isMobile,
                                                                onClose,
                                                                brands = [],
                                                                allCategories = [],
                                                                expanded = false,
                                                                isLoading = false
                                                            }) => {
    const [minPrice, setMinPrice] = useState<number | null>(priceRange.min);
    const [maxPrice, setMaxPrice] = useState<number | null>(priceRange.max);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [processedCategories, setProcessedCategories] = useState<CategoryResponseDTO[]>([]);
    const [expandedParentCategories, setExpandedParentCategories] = useState<Record<number, boolean>>({});

    // Process categories when allCategories changes
    useEffect(() => {
        // Verify we have categories to work with
        if (!allCategories || allCategories.length === 0) {
            console.log('No categories available');
            setProcessedCategories([]);
            return;
        }

        console.log(`Processing ${allCategories.length} categories`);

        // Create new objects instead of modifying the originals
        const categoriesWithValidLevels = allCategories.map(cat => ({
            ...cat,
            level: cat.level !== undefined ? cat.level : (cat.parentId ? 1 : 0)
        }));

        // Sort categories by level and then by name
        const sortedCategories = [...categoriesWithValidLevels].sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });

        console.log(`Processed ${sortedCategories.length} categories`);

        // Sample output for debugging
        if (sortedCategories.length > 0) {
            console.log('Sample categories:', sortedCategories.slice(0, 3).map(c => ({
                id: c.categoryId,
                name: c.name,
                level: c.level,
                parentId: c.parentId
            })));
        }

        setProcessedCategories(sortedCategories);
    }, [allCategories]);

    // Update local state when props change
    useEffect(() => {
        setMinPrice(priceRange.min);
        setMaxPrice(priceRange.max);
    }, [priceRange.min, priceRange.max]);

    // Auto-expand categories that have selected subcategories
    useEffect(() => {
        if (selectedCategories.length > 0 && processedCategories.length > 0) {
            // Find selected subcategories
            const selectedSubcategories = processedCategories.filter(
                cat => selectedCategories.includes(cat.categoryId) && cat.parentId !== null
            );

            // If there are selected subcategories, expand their parent categories
            if (selectedSubcategories.length > 0) {
                const parentsToExpand: Record<number, boolean> = { ...expandedParentCategories };

                selectedSubcategories.forEach(subcat => {
                    if (subcat.parentId) {
                        parentsToExpand[subcat.parentId] = true;
                    }
                });

                setExpandedParentCategories(parentsToExpand);
            }

            console.log(`Found ${selectedSubcategories.length} selected subcategories`);
        }
    }, [selectedCategories, processedCategories, expandedParentCategories]);

    // Change price range with debounce
    useEffect(() => {
        if (minPrice !== priceRange.min || maxPrice !== priceRange.max) {
            const timer = setTimeout(() => {
                // Create an object only with changed properties
                const updates: FilterParams = {};

                if (minPrice !== priceRange.min) {
                    updates.minPrice = minPrice;
                }

                if (maxPrice !== priceRange.max) {
                    updates.maxPrice = maxPrice;
                }

                if (Object.keys(updates).length > 0) {
                    onFilterChange(updates);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [minPrice, maxPrice, priceRange.min, priceRange.max, onFilterChange]);

    // Toggle expanded state for a parent category
    const toggleCategoryExpand = useCallback((categoryId: number) => {
        setExpandedParentCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    }, []);

    // Handle category selection - supports multiple selections
    const handleCategoryChange = useCallback((categoryId: number) => {
        if (isLoading) return; // Prevent actions while loading

        // Toggle category in the array
        const newSelectedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId) // Remove category
            : [...selectedCategories, categoryId]; // Add new category

        // Update filter with the new array
        onFilterChange({
            categoryIds: newSelectedCategories.length > 0 ? newSelectedCategories : null
        });
    }, [selectedCategories, onFilterChange, isLoading]);

    // Handle brand selection - supports multiple selections
    const handleBrandChange = useCallback((brandId: number) => {
        if (isLoading) return; // Prevent actions while loading

        // Toggle brand in the array
        const newSelectedBrands = selectedBrands.includes(brandId)
            ? selectedBrands.filter(id => id !== brandId) // Remove brand
            : [...selectedBrands, brandId]; // Add new brand

        // Update filter with the new array
        onFilterChange({
            brandIds: newSelectedBrands.length > 0 ? newSelectedBrands : null
        });
    }, [selectedBrands, onFilterChange, isLoading]);

    // Clear price range filter
    const handleClearPriceRange = useCallback(() => {
        if (isLoading) return; // Prevent actions while loading

        setMinPrice(null);
        setMaxPrice(null);

        // Create object with defined properties
        const updates: FilterParams = {
            minPrice: null,
            maxPrice: null
        };

        onFilterChange(updates);
    }, [onFilterChange, isLoading]);

    // Clear category selections
    const handleClearCategorySelections = useCallback(() => {
        if (isLoading) return; // Prevent actions while loading

        onFilterChange({
            categoryIds: null
        });
    }, [onFilterChange, isLoading]);

    // Clear brand selections
    const handleClearBrandSelections = useCallback(() => {
        if (isLoading) return; // Prevent actions while loading

        onFilterChange({
            brandIds: null
        });
    }, [onFilterChange, isLoading]);

    // Group categories by parent
    const categoryGroups = useMemo(() => {
        // Filter categories based on search term first
        const filteredCats = categorySearchTerm === ''
            ? processedCategories
            : processedCategories.filter(category =>
                category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
            );

        // Get all parent categories (level 0)
        const parents = filteredCats.filter(cat => cat.level === 0);

        // Group subcategories by parent
        const groups: Record<number, CategoryResponseDTO[]> = {};

        parents.forEach(parent => {
            groups[parent.categoryId] = filteredCats.filter(
                cat => cat.parentId === parent.categoryId
            );
        });

        return { parents, groups };
    }, [processedCategories, categorySearchTerm]);

    // Filter brands based on search term
    const filteredBrands = useMemo(() => {
        return brands.filter(
            brand => brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
        );
    }, [brands, brandSearchTerm]);

    // Count selected categories and brands
    const selectedCategoryCount = selectedCategories.length;
    const selectedBrandCount = selectedBrands.length;

    // Loading indicator
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Đang áp dụng...</p>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {isLoading && <LoadingOverlay />}

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-primary dark:text-accent" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bộ lọc</h3>
                    </div>
                    <button
                        onClick={onResetFilters}
                        className={`flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        Đặt lại
                    </button>
                </div>

                {/* Categories */}
                <FilterSection
                    title="Danh mục"
                    count={processedCategories.length}
                    badge={selectedCategoryCount}
                    onClear={handleClearCategorySelections}
                    showClear={true}
                >
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            className={`w-full px-3 py-2 pl-9 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            placeholder="Tìm danh mục..."
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                        {categorySearchTerm && (
                            <button
                                className={`absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCategorySearchTerm('')}
                                type="button"
                                disabled={isLoading}
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    {/* Show categories in a hierarchical structure */}
                    <div className={`space-y-1 overflow-y-auto custom-scrollbar pr-2 ${expanded ? 'max-h-96' : 'max-h-64'}`}>
                        {categoryGroups.parents.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-2"
                            >
                                {categoryGroups.parents.map(parent => (
                                    <motion.div key={parent.categoryId} variants={itemVariants} className="mb-3">
                                        {/* Parent category */}
                                        <div className="flex items-center p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                                            <label className="flex items-center w-full cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input
                                                        id={`category-${parent.categoryId}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                                                        checked={selectedCategories.includes(parent.categoryId)}
                                                        onChange={() => handleCategoryChange(parent.categoryId)}
                                                        disabled={isLoading}
                                                    />
                                                    {selectedCategories.includes(parent.categoryId) && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <FiCheck className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`ml-2 text-sm hover:text-primary dark:hover:text-accent transition-colors duration-200 ${
                                                    selectedCategories.includes(parent.categoryId)
                                                        ? 'text-primary dark:text-accent font-medium'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {parent.name}
                                                </span>
                                            </label>

                                            {categoryGroups.groups[parent.categoryId]?.length > 0 && (
                                                <button
                                                    onClick={() => toggleCategoryExpand(parent.categoryId)}
                                                    className={`ml-auto p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isLoading}
                                                >
                                                    <FiChevronDown
                                                        className={`h-3 w-3 transition-transform duration-300 ${
                                                            expandedParentCategories[parent.categoryId] ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        {/* Subcategories */}
                                        <AnimatePresence>
                                            {categoryGroups.groups[parent.categoryId]?.length > 0 &&
                                                expandedParentCategories[parent.categoryId] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="ml-6 mt-1 space-y-1 overflow-hidden border-l-2 border-gray-100 dark:border-gray-700 pl-2"
                                                    >
                                                        {categoryGroups.groups[parent.categoryId].map(subcat => (
                                                            <div key={subcat.categoryId} className="flex items-center py-0.5 px-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                                                                <label className="flex items-center w-full cursor-pointer">
                                                                    <div className="relative flex items-center">
                                                                        <input
                                                                            id={`category-${subcat.categoryId}`}
                                                                            type="checkbox"
                                                                            className="h-3.5 w-3.5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                                                                            checked={selectedCategories.includes(subcat.categoryId)}
                                                                            onChange={() => handleCategoryChange(subcat.categoryId)}
                                                                            disabled={isLoading}
                                                                        />
                                                                        {selectedCategories.includes(subcat.categoryId) && (
                                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                                <FiCheck className="h-2.5 w-2.5 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className={`ml-2 text-xs hover:text-primary dark:hover:text-accent transition-colors duration-200 ${
                                                                        selectedCategories.includes(subcat.categoryId)
                                                                            ? 'text-primary dark:text-accent font-medium'
                                                                            : 'text-gray-600 dark:text-gray-300'
                                                                    }`}>
                                                                        {subcat.name}
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                {categorySearchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Không có danh mục nào'}
                            </p>
                        )}
                    </div>
                </FilterSection>

                {/* Brands */}
                <FilterSection
                    title="Thương hiệu"
                    count={filteredBrands.length}
                    badge={selectedBrandCount}
                    onClear={handleClearBrandSelections}
                    showClear={true}
                >
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            className={`w-full px-3 py-2 pl-9 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            placeholder="Tìm thương hiệu..."
                            value={brandSearchTerm}
                            onChange={(e) => setBrandSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                        {brandSearchTerm && (
                            <button
                                className={`absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setBrandSearchTerm('')}
                                type="button"
                                disabled={isLoading}
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                    <div className={`space-y-2 overflow-y-auto custom-scrollbar pr-2 ${expanded ? 'max-h-80' : 'max-h-48'}`}>
                        {filteredBrands.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 gap-1"
                            >
                                {filteredBrands.map((brand) => (
                                    <motion.div
                                        key={brand.brandId}
                                        className="flex items-center py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                                        variants={itemVariants}
                                    >
                                        <label className="flex items-center w-full cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    id={`brand-${brand.brandId}`}
                                                    type="checkbox"
                                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                                                    checked={selectedBrands.includes(brand.brandId)}
                                                    onChange={() => handleBrandChange(brand.brandId)}
                                                    disabled={isLoading}
                                                />
                                                {selectedBrands.includes(brand.brandId) && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <FiCheck className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-2 flex items-center">
                                                {brand.logo && (
                                                    <img
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        className="h-5 w-5 mr-2 object-contain rounded-full bg-white p-0.5"
                                                    />
                                                )}
                                                <span className={`text-sm hover:text-primary dark:hover:text-accent transition-colors duration-200 ${
                                                    selectedBrands.includes(brand.brandId)
                                                        ? 'text-primary dark:text-accent font-medium'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {brand.name}
                                                </span>
                                            </div>
                                        </label>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                {brandSearchTerm ? 'Không tìm thấy thương hiệu phù hợp' : 'Không có thương hiệu nào'}
                            </p>
                        )}
                    </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection
                    title="Khoảng giá"
                    onClear={handleClearPriceRange}
                    showClear={minPrice !== null || maxPrice !== null}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <PriceRangeInput value={minPrice} onChange={setMinPrice} placeholder="Từ" disabled={isLoading} />
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                            <PriceRangeInput value={maxPrice} onChange={setMaxPrice} placeholder="Đến" disabled={isLoading} />
                        </div>
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
                            className={`w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang áp dụng...
                                </span>
                            ) : (
                                'Áp dụng bộ lọc'
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Add custom scrollbar styles */}
                <style>{`
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
                `}</style>
            </motion.div>
        </div>
    );
});

// Assign display name to component after memo
ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;