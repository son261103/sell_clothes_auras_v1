import React from 'react';
import { ProductResponseDTO } from '../../types/product.types';
import ProductCard from './ProductCard';
import LoadingProductCard from './LoadingProductCard';

interface ProductGridProps {
    products: ProductResponseDTO[];
    loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
    // If loading and we have products, show skeleton loaders for additional products
    // If loading and we don't have products, this case is handled by the parent component
    const skeletonCount = loading && products.length > 0 ? 4 : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
            ))}

            {/* Skeleton loaders for when more products are being fetched */}
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <LoadingProductCard key={`loading-${index}`} />
            ))}
        </div>
    );
};

export default ProductGrid;