import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useProduct from '../../hooks/useProduct';

interface SortOption {
    label: string;
    value: string;
    direction: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
    { label: 'Mới nhất', value: 'createdAt', direction: 'desc' },
    { label: 'Giá: Thấp đến cao', value: 'price', direction: 'asc' },
    { label: 'Giá: Cao đến thấp', value: 'price', direction: 'desc' },
    { label: 'Tên: A-Z', value: 'name', direction: 'asc' },
    { label: 'Tên: Z-A', value: 'name', direction: 'desc' },
    { label: 'Đánh giá cao nhất', value: 'rating', direction: 'desc' },
    { label: 'Phổ biến nhất', value: 'popularity', direction: 'desc' },
];

interface ProductSortingProps {
    isLoading?: boolean;
}

const ProductSorting: React.FC<ProductSortingProps> = ({ isLoading = false }) => {
    const { applyFilters, sortBy, sortDir } = useProduct();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
    const [isSorting, setIsSorting] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Animation variants
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: "easeIn"
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Sync with URL parameters
    useEffect(() => {
        const currentSortBy = searchParams.get('sortBy') || sortBy || 'createdAt';
        const currentSortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || sortDir || 'desc';

        const foundOption = sortOptions.find(
            option => option.value === currentSortBy && option.direction === currentSortDir
        );

        if (foundOption) {
            setSelectedSort(foundOption);
        }
    }, [searchParams, sortBy, sortDir]);

    const handleSortChange = (option: SortOption): void => {
        // Don't do anything if this option is already selected
        if (selectedSort.value === option.value && selectedSort.direction === option.direction) {
            setIsOpen(false);
            return;
        }

        setSelectedSort(option);
        setIsOpen(false);
        setIsSorting(true);

        // Update URL params
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', option.value);
        params.set('sortDir', option.direction);
        setSearchParams(params);

        // Apply sort to product list using the hook
        applyFilters({
            sortBy: option.value,
            sortDir: option.direction,
            page: 0 // Reset to first page when changing sort
        }).catch(err => {
            console.error('Error applying sort:', err);
        }).finally(() => {
            setIsSorting(false);
        });
    };

    return (
        <div className="relative inline-block text-left w-full" ref={dropdownRef}>
            <motion.button
                type="button"
                className={`inline-flex justify-between w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors duration-200 ${isLoading || isSorting ? 'opacity-75 cursor-wait' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ backgroundColor: 'rgba(var(--color-primary), 0.05)' }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                disabled={isLoading || isSorting}
            >
                <span className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Sắp xếp:</span>
                    <span>{selectedSort.label}</span>
                </span>
                <div className="flex items-center">
                    {(isLoading || isSorting) && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary dark:text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    <FiChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="origin-top-right absolute right-0 mt-2 w-full rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            {sortOptions.map((option) => (
                                <motion.button
                                    key={`${option.value}-${option.direction}`}
                                    className={`flex items-center w-full text-left px-4 py-2.5 text-sm ${
                                        selectedSort.value === option.value && selectedSort.direction === option.direction
                                            ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent font-medium'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    } transition-colors duration-200`}
                                    onClick={() => handleSortChange(option)}
                                    role="menuitem"
                                    whileHover={{
                                        backgroundColor:
                                            selectedSort.value === option.value &&
                                            selectedSort.direction === option.direction
                                                ? 'rgba(var(--color-primary), 0.15)'
                                                : 'rgba(var(--color-primary), 0.05)'
                                    }}
                                >
                                    <span className="mr-2 w-5 flex-shrink-0">
                                        {selectedSort.value === option.value && selectedSort.direction === option.direction && (
                                            <svg className="h-5 w-5 text-primary dark:text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductSorting;