import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useProduct from '../../hooks/useProduct';

type SortOption = {
    label: string;
    value: string;
    direction: 'asc' | 'desc';
};

const sortOptions: SortOption[] = [
    { label: 'Mới nhất', value: 'createdAt', direction: 'desc' },
    { label: 'Giá: Thấp đến cao', value: 'price', direction: 'asc' },
    { label: 'Giá: Cao đến thấp', value: 'price', direction: 'desc' },
    { label: 'Tên: A-Z', value: 'name', direction: 'asc' },
    { label: 'Tên: Z-A', value: 'name', direction: 'desc' },
    { label: 'Đánh giá cao nhất', value: 'rating', direction: 'desc' },
    { label: 'Phổ biến nhất', value: 'popularity', direction: 'desc' },
];

const ProductSorting: React.FC = () => {
    const { applyFilters, sortBy, sortDir } = useProduct();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);

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

    const handleSortChange = (option: SortOption) => {
        setSelectedSort(option);
        setIsOpen(false);

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
        });
    };

    return (
        <div className="relative inline-block text-left w-full">
            <motion.button
                type="button"
                className="inline-flex justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-secondary text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-accent transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ backgroundColor: 'rgba(var(--color-primary), 0.05)' }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <span>Sắp xếp: {selectedSort.label}</span>
                <FiChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-secondary ring-1 ring-black ring-opacity-5 z-20"
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                {sortOptions.map((option) => (
                                    <motion.button
                                        key={`${option.value}-${option.direction}`}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                            selectedSort.value === option.value && selectedSort.direction === option.direction
                                                ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent font-medium'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-secondary/80'
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
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductSorting;