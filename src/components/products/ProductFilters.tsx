import React, {useEffect, useState, useCallback, memo, useMemo, useRef} from 'react';
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
    expanded?: boolean; // For expanded state

    // Category and brand data
    categories?: CategoryResponseDTO[];
    brands?: BrandResponseDTO[];
    allCategories?: CategoryResponseDTO[]; // All categories including subcategories

    // Loading state
    isLoading?: boolean;

    // Đừng áp dụng bộ lọc ngay khi thay đổi - chỉ gọi filterChange để cập nhật UI
    dontApplyFiltersImmediately?: boolean;
}

const FilterSection: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number;
    badge?: number; // Selected count badge
    onClear?: () => void; // Clear action
    showClear?: boolean; // Whether to show clear button
    disabled?: boolean; // Disabled state
}> = ({
          title,
          children,
          defaultOpen = true,
          count,
          badge,
          onClear,
          showClear = false,
          disabled = false
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
                    className={`flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-accent transition-colors duration-200 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    type="button"
                    disabled={disabled}
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
                        className={`text-xs text-primary dark:text-accent hover:underline transition-colors duration-200 flex items-center ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                        type="button"
                        disabled={disabled}
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
                        <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                            {disabled && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg z-10"></div>
                            )}
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
    const inputRef = useRef<HTMLInputElement>(null);
    const lastValueRef = useRef<number | null>(value);

    // Update input value when props change
    useEffect(() => {
        if (value !== lastValueRef.current) {
            setInputValue(value?.toString() || '');
            lastValueRef.current = value;
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setInputValue(rawValue);
        // Don't immediately update for every keystroke
    };

    const handleBlur = () => {
        const numValue = inputValue ? parseInt(inputValue.replace(/\D/g, ''), 10) : null;
        if (numValue !== lastValueRef.current) {
            lastValueRef.current = numValue;
            onChange(numValue);
        }
        setInputValue(inputValue ? formatValue(inputValue) : '');
    };

    const formatValue = (value: string) => {
        if (!value) return '';
        const numericValue = value.replace(/\D/g, '');
        return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue, 10));
    };

    return (
        <input
            ref={inputRef}
            type="text"
            className={`w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
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
                                                                isLoading = false,
                                                                dontApplyFiltersImmediately = false
                                                            }) => {
    const [minPrice, setMinPrice] = useState<number | null>(priceRange.min);
    const [maxPrice, setMaxPrice] = useState<number | null>(priceRange.max);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [processedCategories, setProcessedCategories] = useState<CategoryResponseDTO[]>([]);
    const [expandedParentCategories, setExpandedParentCategories] = useState<Record<number, boolean>>({});
    const [isFiltering, setIsFiltering] = useState<boolean>(false);

    // Refs to track changes and prevent redundant operations
    const filterTimeoutRef = useRef<number | null>(null);
    const lastPriceRangeRef = useRef({ min: priceRange.min, max: priceRange.max });
    const lastCategoriesRef = useRef<number[]>([...selectedCategories]);
    const lastBrandsRef = useRef<number[]>([...selectedBrands]);
    const isUpdatingRef = useRef<boolean>(false);

    // Process categories when allCategories changes
    useEffect(() => {
        // Skip if no categories to process
        if (!allCategories || allCategories.length === 0) {
            setProcessedCategories([]);
            return;
        }

        console.log(`Processing ${allCategories.length} categories`);

        try {
            // Create a Map for faster lookups and to eliminate duplicates
            const categoryMap = new Map<number, CategoryResponseDTO>();

            // First pass: add all categories to the map with correct level
            allCategories.forEach((cat: CategoryResponseDTO) => {
                if (cat && cat.categoryId) {
                    // Create a deep copy to avoid mutation issues
                    const category = {
                        ...cat,
                        // Ensure level is set properly
                        level: cat.level !== undefined ? cat.level : (cat.parentId ? 1 : 0)
                    };

                    // Only add each category once (by ID)
                    categoryMap.set(category.categoryId, category);
                }
            });

            // Convert to array and sort
            const sorted = Array.from(categoryMap.values()).sort((a, b) => {
                // Sort by level first
                if (a.level !== b.level) return a.level - b.level;
                // Then by name
                return a.name.localeCompare(b.name);
            });

            console.log(`Processed ${sorted.length} unique categories`);
            setProcessedCategories(sorted);
        } catch (err) {
            console.error("Error processing categories:", err);
            // Fallback to simple processing
            const simpleSorted = [...allCategories].sort((a, b) => {
                const levelA = a.level !== undefined ? a.level : (a.parentId ? 1 : 0);
                const levelB = b.level !== undefined ? b.level : (b.parentId ? 1 : 0);
                if (levelA !== levelB) return levelA - levelB;
                return a.name.localeCompare(b.name);
            });
            setProcessedCategories(simpleSorted);
        }
    }, [allCategories]);

    // Update local state when props change
    useEffect(() => {
        if (isUpdatingRef.current) return;

        const priceChanged = priceRange.min !== lastPriceRangeRef.current.min ||
            priceRange.max !== lastPriceRangeRef.current.max;

        if (priceChanged) {
            setMinPrice(priceRange.min);
            setMaxPrice(priceRange.max);
            lastPriceRangeRef.current = { min: priceRange.min, max: priceRange.max };
        }
    }, [priceRange.min, priceRange.max]);

    // Auto-expand categories that have selected subcategories
    useEffect(() => {
        if (selectedCategories.length > 0 && processedCategories.length > 0) {
            const parentsToExpand = { ...expandedParentCategories };
            let changed = false;

            // Find selected subcategories
            processedCategories.forEach(cat => {
                if (selectedCategories.includes(cat.categoryId) && cat.parentId) {
                    // Auto-expand the parent of this selected subcategory
                    if (!parentsToExpand[cat.parentId]) {
                        parentsToExpand[cat.parentId] = true;
                        changed = true;
                    }
                }
            });

            // Only update state if changes were made
            if (changed) {
                setExpandedParentCategories(parentsToExpand);
            }
        }
    }, [selectedCategories, processedCategories, expandedParentCategories]);

    // Update brands ref when props change
    useEffect(() => {
        if (isUpdatingRef.current) return;

        const brandsChanged =
            selectedBrands.length !== lastBrandsRef.current.length ||
            selectedBrands.some(id => !lastBrandsRef.current.includes(id));

        if (brandsChanged) {
            lastBrandsRef.current = [...selectedBrands];
        }
    }, [selectedBrands]);

    // Apply filters with debounce
    const applyFiltersWithDebounce = useCallback((filters: FilterParams) => {
        if (isLoading || isFiltering) return;

        // Nếu không áp dụng ngay, chỉ gọi onFilterChange để cập nhật UI
        if (dontApplyFiltersImmediately) {
            onFilterChange(filters);
            return;
        }

        setIsFiltering(true);
        isUpdatingRef.current = true;

        // Clear any existing timeout
        if (filterTimeoutRef.current) {
            window.clearTimeout(filterTimeoutRef.current);
        }

        // Set a new timeout
        filterTimeoutRef.current = window.setTimeout(() => {
            onFilterChange(filters);

            // Reset after a delay to allow rendering to complete
            setTimeout(() => {
                setIsFiltering(false);
                isUpdatingRef.current = false;
            }, 300);
        }, 300);
    }, [onFilterChange, isLoading, isFiltering, dontApplyFiltersImmediately]);

    // Change price range with debounce
    useEffect(() => {
        if (isLoading || isFiltering || isUpdatingRef.current) return;

        if (minPrice !== lastPriceRangeRef.current.min || maxPrice !== lastPriceRangeRef.current.max) {
            // Update the reference immediately to prevent duplicate calls
            lastPriceRangeRef.current = { min: minPrice, max: maxPrice };

            // Create an object only with changed properties
            const updates: FilterParams = {};

            if (minPrice !== priceRange.min) {
                updates.minPrice = minPrice;
            }

            if (maxPrice !== priceRange.max) {
                updates.maxPrice = maxPrice;
            }

            if (Object.keys(updates).length > 0) {
                applyFiltersWithDebounce(updates);
            }
        }
    }, [minPrice, maxPrice, priceRange.min, priceRange.max, applyFiltersWithDebounce, isLoading, isFiltering]);

    // Toggle expanded state for a parent category
    const toggleCategoryExpand = useCallback((categoryId: number) => {
        if (isLoading || isFiltering) return;

        setExpandedParentCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    }, [isLoading, isFiltering]);

    // Handle category selection - supports multiple selections
    const handleCategoryChange = useCallback((categoryId: number) => {
        if (isLoading || isFiltering) return; // Prevent actions while loading

        // Toggle category in the array
        const newSelectedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId) // Remove category
            : [...selectedCategories, categoryId]; // Add new category

        // Update the reference to prevent duplicate updates
        lastCategoriesRef.current = [...newSelectedCategories];

        // Update filter with the new array
        applyFiltersWithDebounce({
            categoryIds: newSelectedCategories.length > 0 ? newSelectedCategories : null
        });
    }, [selectedCategories, applyFiltersWithDebounce, isLoading, isFiltering]);

    // Handle brand selection - supports multiple selections
    const handleBrandChange = useCallback((brandId: number) => {
        if (isLoading || isFiltering) return; // Prevent actions while loading

        // Toggle brand in the array
        const newSelectedBrands = selectedBrands.includes(brandId)
            ? selectedBrands.filter(id => id !== brandId) // Remove brand
            : [...selectedBrands, brandId]; // Add new brand

        // Update the reference to prevent duplicate updates
        lastBrandsRef.current = [...newSelectedBrands];

        // Update filter with the new array
        applyFiltersWithDebounce({
            brandIds: newSelectedBrands.length > 0 ? newSelectedBrands : null
        });
    }, [selectedBrands, applyFiltersWithDebounce, isLoading, isFiltering]);

    // Clear price range filter
    const handleClearPriceRange = useCallback(() => {
        if (isLoading || isFiltering) return; // Prevent actions while loading

        setMinPrice(null);
        setMaxPrice(null);

        // Update the reference
        lastPriceRangeRef.current = { min: null, max: null };

        // Create object with defined properties
        const updates: FilterParams = {
            minPrice: null,
            maxPrice: null
        };

        applyFiltersWithDebounce(updates);
    }, [applyFiltersWithDebounce, isLoading, isFiltering]);

    // Clear category selections
    const handleClearCategorySelections = useCallback(() => {
        if (isLoading || isFiltering) return; // Prevent actions while loading

        // Update the reference
        lastCategoriesRef.current = [];

        applyFiltersWithDebounce({
            categoryIds: null
        });
    }, [applyFiltersWithDebounce, isLoading, isFiltering]);

    // Clear brand selections
    const handleClearBrandSelections = useCallback(() => {
        if (isLoading || isFiltering) return; // Prevent actions while loading

        // Update the reference
        lastBrandsRef.current = [];

        applyFiltersWithDebounce({
            brandIds: null
        });
    }, [applyFiltersWithDebounce, isLoading, isFiltering]);

    // Group categories by parent
    const categoryGroups = useMemo(() => {
        if (!processedCategories.length) {
            return { parents: [], groups: {} as Record<number, CategoryResponseDTO[]> };
        }

        try {
            // Filter categories based on search term first
            const filteredCats = categorySearchTerm === ''
                ? processedCategories
                : processedCategories.filter(category =>
                    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                );

            // Get parent categories (level 0)
            const parents = filteredCats.filter(cat => cat.level === 0 || !cat.parentId);

            // Create groups object
            const groups: Record<number, CategoryResponseDTO[]> = {};

            // Initialize all parent groups with empty arrays
            parents.forEach(parent => {
                groups[parent.categoryId] = [];
            });

            // Group subcategories by parent
            filteredCats.forEach(cat => {
                if (cat.parentId && groups[cat.parentId] !== undefined) {
                    groups[cat.parentId].push(cat);
                }
            });

            // Sort subcategories by name in each group
            Object.keys(groups).forEach(parentId => {
                groups[Number(parentId)].sort((a, b) => a.name.localeCompare(b.name));
            });

            return { parents, groups };
        } catch (err) {
            console.error("Error creating category groups:", err);
            return { parents: [], groups: {} as Record<number, CategoryResponseDTO[]> };
        }
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (filterTimeoutRef.current) {
                window.clearTimeout(filterTimeoutRef.current);
            }
        };
    }, []);

    // Loading indicator
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Đang xử lý...</p>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {(isLoading || isFiltering) && <LoadingOverlay />}

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
                        className={`flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs ${(isLoading || isFiltering) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                        disabled={isLoading || isFiltering}
                    >
                        <FiRefreshCw className={`mr-1 h-3 w-3 ${(isLoading || isFiltering) ? 'animate-spin' : ''}`} />
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
                    disabled={isLoading || isFiltering}
                >
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            className={`w-full px-3 py-2 pl-9 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${(isLoading || isFiltering) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            placeholder="Tìm danh mục..."
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            disabled={isLoading || isFiltering}
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                        {categorySearchTerm && (
                            <button
                                className={`absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ${(isLoading || isFiltering) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCategorySearchTerm('')}
                                type="button"
                                disabled={isLoading || isFiltering}
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
                                                        disabled={isLoading || isFiltering}
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
                                                    className={`ml-auto p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${(isLoading || isFiltering) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isLoading || isFiltering}
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
                                                                            disabled={isLoading || isFiltering}
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
                    disabled={isLoading || isFiltering}
                >
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            className={`w-full px-3 py-2 pl-9 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-all duration-200 ${(isLoading || isFiltering) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            placeholder="Tìm thương hiệu..."
                            value={brandSearchTerm}
                            onChange={(e) => setBrandSearchTerm(e.target.value)}
                            disabled={isLoading || isFiltering}
                        />
                        <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                        {brandSearchTerm && (
                            <button
                                className={`absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ${(isLoading || isFiltering) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setBrandSearchTerm('')}
                                type="button"
                                disabled={isLoading || isFiltering}
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
                                                    disabled={isLoading || isFiltering}
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
                    disabled={isLoading || isFiltering}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <PriceRangeInput
                                value={minPrice}
                                onChange={setMinPrice}
                                placeholder="Từ"
                                disabled={isLoading || isFiltering}
                            />
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                            <PriceRangeInput
                                value={maxPrice}
                                onChange={setMaxPrice}
                                placeholder="Đến"
                                disabled={isLoading || isFiltering}
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Apply Filters Button for Mobile */}
                {isMobile && !dontApplyFiltersImmediately && (
                    <motion.div
                        className="pt-4 border-t border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            onClick={onClose}
                            className={`w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-colors duration-200 ${(isLoading || isFiltering) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="button"
                            disabled={isLoading || isFiltering}
                        >
                            {(isLoading || isFiltering) ? (
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