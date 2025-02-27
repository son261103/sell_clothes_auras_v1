import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
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
];

const ProductSorting: React.FC = () => {
    const { applyFilters } = useProduct();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);

    useEffect(() => {
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortDir = searchParams.get('sortDir') || 'desc';
        const foundOption = sortOptions.find(option => option.value === sortBy && option.direction === sortDir);
        if (foundOption) setSelectedSort(foundOption);
    }, [searchParams]);

    const handleSortChange = (option: SortOption) => {
        setSelectedSort(option);
        setIsOpen(false);

        // Cập nhật URL
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', option.value);
        params.set('sortDir', option.direction);
        setSearchParams(params);

        // Áp dụng sort vào danh sách sản phẩm
        applyFilters({
            sortBy: option.value,
            sortDir: option.direction,
            page: 0 // Reset về trang đầu khi thay đổi sort
        }).catch(err => {
            console.error('Error applying sort:', err);
        });
    };

    return (
        <div className="relative inline-block text-left w-full">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-accent"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>Sắp xếp: {selectedSort.label}</span>
                    <FiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            {sortOptions.map((option) => (
                                <button
                                    key={`${option.value}-${option.direction}`}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                        selectedSort.value === option.value && selectedSort.direction === option.direction
                                            ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent font-medium'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                    onClick={() => handleSortChange(option)}
                                    role="menuitem"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductSorting;