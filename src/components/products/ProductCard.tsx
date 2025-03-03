import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ProductResponseDTO } from '../../types/product.types';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useFavorite from '../../hooks/useFavorite';

interface ProductCardProps {
    product: ProductResponseDTO;
    viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const { isAuthenticated } = useAuth();
    const { addItemToUserCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorite(product.productId);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
            return;
        }

        const result = toggleFavorite();
        if (result) {
            toast.success(isFavorite
                ? `Đã xóa ${product.name} khỏi danh sách yêu thích`
                : `Đã thêm ${product.name} vào danh sách yêu thích`
            );
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            return;
        }

        const variantId = product.productId;

        try {
            setIsAddingToCart(true);
            await addItemToUserCart({
                variantId: variantId,
                quantity: 1
            });
            toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
        } catch (error) {
            let message = 'Không thể thêm vào giỏ hàng';
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(message);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const navigateToDetail = () => {
        navigate(`/products/${product.slug || product.productId}`);
    };

    const brandName = product.brand?.name || 'Unknown Brand';
    const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
        : 0;

    // For list view
    if (viewMode === 'list') {
        return (
            <motion.div
                className="group bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-highlight/10 dark:border-secondary/30 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 flex flex-col sm:flex-row cursor-pointer"
                whileHover={{ y: -3 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={navigateToDetail}
            >
                {/* Product Image */}
                <div className="relative h-52 sm:h-auto sm:w-48 md:w-56 lg:w-64 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full">
                        {product.thumbnail ? (
                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className={`w-full h-full object-cover object-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-500">No image</span>
                            </div>
                        )}
                    </div>

                    {/* Tags and badges */}
                    <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
                        <div className="space-y-2">
                            {product.status && (
                                <div className="bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                    MỚI
                                </div>
                            )}
                            {hasDiscount && (
                                <div className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>

                        <button
                            className={`text-white hover:text-primary transition-colors duration-300 ${isFavorite ? 'bg-primary' : 'bg-black/50 hover:bg-white/90'} p-1.5 rounded-full z-20`}
                            aria-label="Thêm vào yêu thích"
                            onClick={handleToggleFavorite}
                        >
                            <FiHeart fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to cart overlay */}
                    <div className={`absolute inset-0 bg-primary/25 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button
                            className="bg-white dark:bg-secondary text-primary dark:text-highlight px-3 py-1.5 rounded-full transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 hover:bg-primary hover:text-white shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed z-30"
                            aria-label="Thêm vào giỏ hàng"
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                        >
                            {isAddingToCart ? (
                                <span className="animate-pulse">Đang thêm...</span>
                            ) : (
                                <>
                                    <FiShoppingBag className="w-3.5 h-3.5" />
                                    <span className="font-medium">Thêm vào giỏ</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-4 flex-grow flex flex-col">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-secondary/60 dark:text-gray-400 capitalize bg-highlight/10 dark:bg-secondary/20 px-2 py-0.5 rounded-full">
                            {product.category?.name || 'Uncategorized'}
                        </span>
                        <div className="flex items-center gap-1 text-accent">
                            <FiStar className="w-3.5 h-3.5 fill-accent" />
                            <span className="text-xs text-secondary/70 dark:text-gray-400">4.5</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-textDark dark:text-textLight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-3">
                        {product.description?.substring(0, 100) || `${brandName}: ${product.name}`}
                    </p>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            {hasDiscount ? (
                                <div className="flex flex-col">
                                    <p className="font-bold text-primary text-lg">
                                        {formatPrice(product.salePrice || 0)}
                                    </p>
                                    <p className="text-xs text-secondary/60 dark:text-gray-400 line-through">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            ) : (
                                <p className="font-bold text-primary text-lg">{formatPrice(product.price)}</p>
                            )}
                        </div>

                        <button
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-accent rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed z-30"
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                        >
                            {isAddingToCart ? (
                                <span className="animate-pulse">Đang thêm...</span>
                            ) : (
                                <>
                                    <FiShoppingBag className="w-4 h-4" />
                                    <span className="font-medium">Thêm vào giỏ</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid view (default)
    return (
        <motion.div
            className="group bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-highlight/10 dark:border-secondary/30 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 h-full flex flex-col cursor-pointer"
            whileHover={{ y: -3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={navigateToDetail}
        >
            <div className="relative h-52 overflow-hidden">
                <div>
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className={`w-full h-full object-cover object-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500">No image</span>
                        </div>
                    )}
                </div>

                {/* Tags and badges */}
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
                    <div className="space-y-2">
                        {product.status && (
                            <div className="bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                MỚI
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>

                    <button
                        className={`text-white hover:text-primary transition-colors duration-300 ${isFavorite ? 'bg-primary' : 'bg-black/50 hover:bg-white/90'} p-1.5 rounded-full z-20`}
                        aria-label="Thêm vào yêu thích"
                        onClick={handleToggleFavorite}
                    >
                        <FiHeart
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                        />
                    </button>
                </div>

                {/* Add to cart overlay */}
                <div className={`absolute inset-0 bg-primary/25 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        className="bg-white dark:bg-secondary text-primary dark:text-highlight px-4 py-1.5 rounded-full transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 hover:bg-primary hover:text-white shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed z-30"
                        aria-label="Thêm vào giỏ hàng"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? (
                            <span className="animate-pulse">Đang thêm...</span>
                        ) : (
                            <>
                                <FiShoppingBag className="w-3.5 h-3.5" />
                                <span className="font-medium">Thêm vào giỏ</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-3 flex-grow flex flex-col">
                <h3 className="text-base font-semibold text-textDark dark:text-textLight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2 h-12">
                    {product.name}
                </h3>

                <div className="flex items-center gap-1 mt-2 text-accent">
                    {[...Array(5)].map((_, i) => (
                        <FiStar
                            key={i}
                            className={`w-3 h-3 ${i < 4 ? 'fill-accent' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                    ))}
                    <span className="text-xs text-secondary/70 dark:text-gray-400 ml-1">4.5</span>
                </div>

                <div className="mt-2 flex justify-between items-center">
                    <div>
                        {hasDiscount ? (
                            <div className="flex flex-col">
                                <p className="font-bold text-primary text-base">
                                    {formatPrice(product.salePrice || 0)}
                                </p>
                                <p className="text-xs text-secondary/60 dark:text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        ) : (
                            <p className="font-bold text-primary text-base">{formatPrice(product.price)}</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;