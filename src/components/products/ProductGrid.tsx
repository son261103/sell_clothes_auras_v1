import React from 'react';
import { ProductResponseDTO } from '../../types/product.types';
import ProductCard from './ProductCard';
import LoadingProductCard from './LoadingProductCard';
import { motion } from 'framer-motion';

interface ProductGridProps {
    products: ProductResponseDTO[];
    loading?: boolean;
    viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products,
                                                     loading = false,
                                                     viewMode = 'grid'
                                                 }) => {
    // If loading and we have products, show skeleton loaders for additional products
    const skeletonCount = loading && products.length > 0 ? 4 : 0;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    // Determine grid columns based on view mode
    const gridClassNames = viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        : "grid grid-cols-1 gap-4";

    return (
        <motion.div
            className={gridClassNames}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
        >
            {products.map((product) => (
                <motion.div
                    key={product.productId}
                    variants={itemVariants}
                >
                    <ProductCard product={product} viewMode={viewMode} />
                </motion.div>
            ))}

            {/* Skeleton loaders for when more products are being fetched */}
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <motion.div
                    key={`loading-${index}`}
                    variants={itemVariants}
                >
                    <LoadingProductCard viewMode={viewMode} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ProductGrid;