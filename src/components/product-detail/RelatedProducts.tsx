import React from 'react';
import ProductGrid from '../../components/products/ProductGrid';
import { ProductResponseDTO } from '../../types/product.types';

interface RelatedProductsProps {
    relatedProducts: ProductResponseDTO[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ relatedProducts }) => (
    relatedProducts.length > 0 && (
        <div className="mt-12" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sản phẩm liên quan</h2>
            <ProductGrid products={relatedProducts} />
        </div>
    )
);

export default RelatedProducts;