import React, { useMemo, useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
                                                                 currentPage,
                                                                 totalPages,
                                                                 onPageChange,
                                                                 isLoading = false,
                                                             }) => {
    // Add state to track when page changes are in progress
    const [changingPage, setChangingPage] = useState(false);

    // Reset changingPage when isLoading changes
    useEffect(() => {
        if (!isLoading) {
            setChangingPage(false);
        }
    }, [isLoading]);

    // Generate page numbers with an improved algorithm that works better with 15 products per page
    const pageNumbers = useMemo(() => {
        const visiblePageNumbers = [];
        const maxVisiblePages = 5; // Max number of page buttons to show (excluding prev/next)

        if (totalPages <= maxVisiblePages) {
            // If we have few pages, show all of them
            for (let i = 0; i < totalPages; i++) {
                visiblePageNumbers.push(i);
            }
        } else {
            // Always include first page
            visiblePageNumbers.push(0);

            // Calculate the range around current page
            let startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages - 2, currentPage + 1);

            // Add ellipsis after first page if needed
            if (startPage > 1) {
                visiblePageNumbers.push('ellipsis-start');
            } else if (startPage === 1) {
                visiblePageNumbers.push(1);
                startPage = 2;
            }

            // Add pages around current page
            for (let i = startPage; i <= endPage; i++) {
                visiblePageNumbers.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 2) {
                visiblePageNumbers.push('ellipsis-end');
            } else if (endPage === totalPages - 2) {
                visiblePageNumbers.push(totalPages - 2);
            }

            // Always include last page
            visiblePageNumbers.push(totalPages - 1);
        }

        return visiblePageNumbers;
    }, [currentPage, totalPages]);

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
        hidden: { opacity: 0, y: 5 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    // Handle page change with validation and debouncing
    const handlePageChange = (pageNumber: number) => {
        // Don't allow rapid page changes
        if (changingPage || isLoading) return;

        // Validate page number is within bounds
        if (pageNumber >= 0 && pageNumber < totalPages) {
            setChangingPage(true);
            onPageChange(pageNumber);
        }
    };

    // Don't show pagination if there's only one page
    if (totalPages <= 1) return null;

    return (
        <motion.nav
            className="flex justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-label="Pagination"
        >
            <motion.ul
                className={`flex items-center ${(isLoading || changingPage) ? 'opacity-60 pointer-events-none' : ''}`}
                data-testid="pagination-container"
            >
                {/* Previous page button */}
                <motion.li variants={itemVariants}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading || changingPage}
                        className={`flex items-center justify-center w-10 h-10 rounded-md mr-2 transition-colors duration-200 ${
                            currentPage === 0 || isLoading || changingPage
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20'
                        }`}
                        aria-label="Previous page"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                </motion.li>

                {/* Page numbers */}
                {pageNumbers.map((page) => {
                    // Handle ellipsis
                    if (typeof page === 'string' && page.startsWith('ellipsis')) {
                        return (
                            <motion.li key={page} variants={itemVariants}>
                                <span className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200">
                                    …
                                </span>
                            </motion.li>
                        );
                    }

                    // Handle numbered pages
                    const pageNumber = page as number;
                    const isCurrentPage = currentPage === pageNumber;

                    return (
                        <motion.li key={`page-${pageNumber}`} variants={itemVariants}>
                            <button
                                onClick={() => handlePageChange(pageNumber)}
                                disabled={isLoading || changingPage || isCurrentPage}
                                className={`flex items-center justify-center w-10 h-10 rounded-md mx-1 font-medium transition-all duration-300 ${
                                    isCurrentPage
                                        ? 'bg-primary text-white shadow-md transform scale-105'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20'
                                }`}
                                aria-label={`Page ${pageNumber + 1}`}
                                aria-current={isCurrentPage ? 'page' : undefined}
                            >
                                {pageNumber + 1}
                            </button>
                        </motion.li>
                    );
                })}

                {/* Next page button */}
                <motion.li variants={itemVariants}>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || isLoading || changingPage}
                        className={`flex items-center justify-center w-10 h-10 rounded-md ml-2 transition-colors duration-200 ${
                            currentPage >= totalPages - 1 || isLoading || changingPage
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20'
                        }`}
                        aria-label="Next page"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </motion.li>
            </motion.ul>
        </motion.nav>
    );
};

export default ProductPagination;