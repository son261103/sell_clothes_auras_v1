import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
                                                                 currentPage,
                                                                 totalPages,
                                                                 onPageChange,
                                                             }) => {
    // Don't show pagination if there's only one page
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pageNumbers = [];

        // Always include the first page
        pageNumbers.push(0);

        // Include pages around current page
        for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
            if (!pageNumbers.includes(i)) {
                pageNumbers.push(i);
            }
        }

        // Always include the last page
        if (totalPages > 1) {
            pageNumbers.push(totalPages - 1);
        }

        // Sort and add ellipses
        pageNumbers.sort((a, b) => a - b);

        const result = [];
        for (let i = 0; i < pageNumbers.length; i++) {
            if (i > 0 && pageNumbers[i] - pageNumbers[i - 1] > 1) {
                result.push('ellipsis');
            }
            result.push(pageNumbers[i]);
        }

        return result;
    };

    return (
        <nav className="flex justify-center">
            <ul className="flex items-center">
                {/* Previous page button */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`flex items-center justify-center w-10 h-10 rounded-md mr-2 ${
                            currentPage === 0
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20'
                        }`}
                        aria-label="Previous page"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                </li>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <li key={`ellipsis-${index}`}>
                <span className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200">
                  ...
                </span>
                            </li>
                        );
                    }

                    const pageNumber = page as number;
                    return (
                        <li key={pageNumber}>
                            <button
                                onClick={() => onPageChange(pageNumber)}
                                className={`flex items-center justify-center w-10 h-10 rounded-md mx-1 font-medium ${
                                    currentPage === pageNumber
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20'
                                }`}
                                aria-label={`Page ${pageNumber + 1}`}
                                aria-current={currentPage === pageNumber ? 'page' : undefined}
                            >
                                {pageNumber + 1}
                            </button>
                        </li>
                    );
                })}

                {/* Next page button */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className={`flex items-center justify-center w-10 h-10 rounded-md ml-2 ${
                            currentPage >= totalPages - 1
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-secondary/20'
                        }`}
                        aria-label="Next page"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default ProductPagination;