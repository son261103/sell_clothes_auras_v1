import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductResponseDTO } from '../../types/product.types';
import { FiHeart, FiShoppingBag, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
    product: ProductResponseDTO;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    };

    const handleAddToWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success(`Đã thêm ${product.name} vào danh sách yêu thích`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    };

    const calculateDiscount = () => {
        if (!product.salePrice) return null;
        const discount = ((product.price - product.salePrice) / product.price) * 100;
        return Math.round(discount);
    };

    const discount = calculateDiscount();
    const brandName = product.brand?.name || 'Unknown Brand';

    return (
        <div
            className="group relative bg-white dark:bg-darkBackground rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image with Link */}
            <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500">No image</span>
                        </div>
                    )}
                    {discount && (
                        <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                        </div>
                    )}
                </div>
            </Link>

            {/* Action Buttons */}
            <div
                className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center gap-2 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <button
                    onClick={handleAddToCart}
                    className="p-2 bg-white dark:bg-darkBackground text-primary hover:text-accent dark:text-white dark:hover:text-accent rounded-full shadow-md transition-all duration-300 transform hover:scale-110"
                    aria-label="Add to cart"
                >
                    <FiShoppingBag className="w-5 h-5" />
                </button>
                <button
                    onClick={handleAddToWishlist}
                    className="p-2 bg-white dark:bg-darkBackground text-primary hover:text-accent dark:text-white dark:hover:text-accent rounded-full shadow-md transition-all duration-300 transform hover:scale-110"
                    aria-label="Add to wishlist"
                >
                    <FiHeart className="w-5 h-5" />
                </button>
                <Link
                    to={`/products/${product.slug}`}
                    className="p-2 bg-white dark:bg-darkBackground text-primary hover:text-accent dark:text-white dark:hover:text-accent rounded-full shadow-md transition-all duration-300 transform hover:scale-110"
                    aria-label="Quick view"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FiEye className="w-5 h-5" />
                </Link>
            </div>

            {/* Product Info */}
            <div className="px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{brandName}</p>
                <Link to={`/products/${product.slug}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 h-10">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-2 flex items-center">
                    {product.salePrice ? (
                        <>
                            <span className="text-accent font-semibold">
                                {formatPrice(product.salePrice)}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-primary dark:text-white font-semibold">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;