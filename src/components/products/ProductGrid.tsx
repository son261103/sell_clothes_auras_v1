import React, { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react';
import { ProductResponseDTO } from '../../types/product.types';
import ProductCard from './ProductCard';
import LoadingProductCard from './LoadingProductCard';
import { motion } from 'framer-motion';
import { CategoryResponseDTO } from '../../types/category.types';
import { BrandResponseDTO } from '../../types/brand.types';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
    products: ProductResponseDTO[];
    loading?: boolean;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    categories?: CategoryResponseDTO[];
    brands?: BrandResponseDTO[];
    expanded?: boolean; // For expanding the grid width
}

const ProductGrid: React.FC<ProductGridProps> = memo(({
                                                          products,
                                                          loading = false,
                                                          viewMode = 'grid',
                                                          categories = [],
                                                          brands = [],
                                                          expanded = true
                                                      }) => {
    const navigate = useNavigate();
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const brandDropdownRef = useRef<HTMLDivElement>(null);

    // If loading and we have products, show skeleton loaders for additional products
    const skeletonCount = loading && products.length > 0 ? 4 : 0;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
            if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
                setShowBrandDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Navigate to category page - using useCallback to avoid unnecessary re-renders
    const handleCategoryClick = useCallback((slug: string) => {
        navigate(`/category/${slug}`);
        setShowCategoryDropdown(false);
    }, [navigate]);

    // Navigate to brand page
    const handleBrandClick = useCallback((slug: string) => {
        navigate(`/brand/${slug}`);
        setShowBrandDropdown(false);
    }, [navigate]);

    // Organize categories by hierarchy
    const organizedCategories = useMemo(() => {
        // Create a map of parent categories
        const parentCategories = categories.filter(cat => cat.level === 0);

        // Create a map to organize subcategories by parent ID
        const categoryMap = new Map<number, CategoryResponseDTO[]>();

        // Group subcategories by parent ID
        categories.forEach(cat => {
            if (cat.level > 0 && cat.parentId) {
                if (!categoryMap.has(cat.parentId)) {
                    categoryMap.set(cat.parentId, []);
                }
                const subcategories = categoryMap.get(cat.parentId);
                if (subcategories) {
                    subcategories.push(cat);
                }
            }
        });

        // Return organized structure with explicit type
        return {
            parents: parentCategories,
            children: categoryMap
        };
    }, [categories]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, type: "spring", stiffness: 100 }
        }
    };

    // Get the 5 most used brands (could be extended with actual usage data)
    const topBrands = useMemo(() => {
        return brands.slice(0, 5);
    }, [brands]);

    // Get the 5 most used parent categories
    const topCategories = useMemo(() => {
        return organizedCategories.parents.slice(0, 5);
    }, [organizedCategories.parents]);

    // Determine grid columns based on view mode and expanded state
    const getGridClassNames = () => {
        if (viewMode === 'list') {
            return "grid grid-cols-1 gap-5";
        }

        // Adjusted grid to make cards slightly wider than original but not too wide
        if (expanded) {
            // Adjusted column counts: one less column at xl and 2xl breakpoints
            return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6";
        } else {
            // Kept same count for smaller screens but increased gap
            return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6";
        }
    };

    // Category dropdown content
    const renderCategoryDropdown = () => {
        if (!showCategoryDropdown) return null;

        return (
            <div
                ref={categoryDropdownRef}
                className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 p-3 custom-scrollbar overflow-y-auto max-h-80 border border-gray-200 dark:border-gray-700"
                style={{ top: "100%", left: 0 }}
            >
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Categories</h3>
                <div className="space-y-2">
                    {organizedCategories.parents.map(category => (
                        <div key={category.categoryId} className="transition-colors duration-200">
                            <button
                                onClick={() => handleCategoryClick(category.slug)}
                                className="text-left w-full py-1 px-2 rounded hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-800 dark:text-gray-200 font-medium"
                            >
                                {category.name}
                            </button>

                            {/* Subcategories */}
                            {organizedCategories.children.has(category.categoryId) && (
                                <div className="pl-4 mt-1 space-y-1">
                                    {organizedCategories.children.get(category.categoryId)?.map(subcat => (
                                        <button
                                            key={subcat.categoryId}
                                            onClick={() => handleCategoryClick(subcat.slug)}
                                            className="text-left w-full py-1 px-2 rounded hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-600 dark:text-gray-400 text-sm"
                                        >
                                            {subcat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Brand dropdown content
    const renderBrandDropdown = () => {
        if (!showBrandDropdown) return null;

        return (
            <div
                ref={brandDropdownRef}
                className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 p-3 custom-scrollbar overflow-y-auto max-h-80 border border-gray-200 dark:border-gray-700"
                style={{ top: "100%", left: 0 }}
            >
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Brands</h3>
                <div className="space-y-1 grid grid-cols-2">
                    {brands.map(brand => (
                        <button
                            key={brand.brandId}
                            onClick={() => handleBrandClick(brand.slug)}
                            className="text-left py-1 px-2 rounded hover:bg-accent/10 dark:hover:bg-accent/20 text-gray-800 dark:text-gray-200"
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-8">
            {/* Mobile quick filters */}
            <div className="md:hidden mb-5 space-y-3">
                {topCategories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {topCategories.map(category => (
                            <motion.button
                                key={category.categoryId}
                                className="px-3.5 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent text-sm rounded-full whitespace-nowrap flex-shrink-0 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-200 shadow-sm border border-primary/10 dark:border-primary/30"
                                onClick={() => handleCategoryClick(category.slug)}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category.name}
                            </motion.button>
                        ))}

                        {organizedCategories.parents.length > 5 && (
                            <motion.button
                                className="px-3.5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full whitespace-nowrap flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
                                onClick={() => setShowCategoryDropdown(true)}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Xem thêm...
                            </motion.button>
                        )}
                    </div>
                )}

                {topBrands.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {topBrands.map(brand => (
                            <motion.button
                                key={brand.brandId}
                                className="px-3.5 py-2 bg-accent/10 dark:bg-accent/20 text-accent text-sm rounded-full whitespace-nowrap flex-shrink-0 hover:bg-accent/20 dark:hover:bg-accent/30 transition-all duration-200 shadow-sm border border-accent/10 dark:border-accent/30"
                                onClick={() => handleBrandClick(brand.slug)}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {brand.name}
                            </motion.button>
                        ))}

                        {brands.length > 5 && (
                            <motion.button
                                className="px-3.5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full whitespace-nowrap flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
                                onClick={() => setShowBrandDropdown(true)}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Xem thêm...
                            </motion.button>
                        )}
                    </div>
                )}

                {/* Render dropdown content if they're open */}
                <div className="relative">
                    {renderCategoryDropdown()}
                    {renderBrandDropdown()}
                </div>
            </div>

            {/* Products Grid */}
            <motion.div
                className={getGridClassNames()}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {products.map((product) => (
                    <motion.div
                        key={product.productId}
                        variants={itemVariants}
                        className="h-full transform transition-transform" // Ensure equal heights with hover effect
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.2 }
                        }}
                    >
                        <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                ))}

                {/* Skeleton loaders for when more products are being fetched */}
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <motion.div
                        key={`loading-${index}`}
                        variants={itemVariants}
                        className="h-full" // Ensure equal heights
                    >
                        <LoadingProductCard viewMode={viewMode} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Add custom scrollbar and animation styles */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
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
                
                @keyframes pulse-shadow {
                    0% {
                        box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(var(--color-primary), 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(var(--color-primary), 0);
                    }
                }
                
                @keyframes soft-fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .product-card {
                    animation: soft-fade-in 0.3s ease-out;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .product-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }
                
                .dark .product-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
});

// Assign display name to component after memo
ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;