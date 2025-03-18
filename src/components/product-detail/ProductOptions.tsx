import React from 'react';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { ProductVariantDTO, ProductResponseDTO } from '../../types/product.types';
import { Link } from "react-router-dom";

interface ProductOptionsProps {
    availableSizes: string[];
    availableColors: string[];
    productVariants: ProductVariantDTO[];
    selectedSize: string | null;
    setSelectedSize: (size: string | null) => void;
    selectedColor: string | null;
    setSelectedColor: (color: string | null) => void;
    quantity: number;
    setQuantity: (qty: number) => void;
    activeVariant: ProductVariantDTO | null;
    handleAddToCart: () => void;
    handleAddToWishlist: () => void;
    isVariantAvailable: () => boolean;
    formatPrice: (price: number) => string;
    product: ProductResponseDTO;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
                                                           availableSizes,
                                                           availableColors,
                                                           productVariants,
                                                           selectedSize,
                                                           setSelectedSize,
                                                           selectedColor,
                                                           setSelectedColor,
                                                           quantity,
                                                           setQuantity,
                                                           activeVariant,
                                                           handleAddToCart,
                                                           handleAddToWishlist,
                                                           isVariantAvailable,
                                                           formatPrice,
                                                           product,
                                                       }) => {

    const handleSizeChange = (size: string) => {
        const isValidWithCurrentColor = selectedColor
            ? productVariants.some(v => v.size === size && v.color === selectedColor && v.stockQuantity > 0 && v.status)
            : true;

        if (!isValidWithCurrentColor) {
            const validColors = productVariants
                .filter(v => v.size === size && v.stockQuantity > 0 && v.status)
                .map(v => v.color);
            setSelectedColor(validColors[0] || null);
        }
        setSelectedSize(size);
    };

    const handleColorChange = (color: string) => {
        const isValidWithCurrentSize = selectedSize
            ? productVariants.some(v => v.color === color && v.size === selectedSize && v.stockQuantity > 0 && v.status)
            : true;

        if (!isValidWithCurrentSize) {
            const validSizes = productVariants
                .filter(v => v.color === color && v.stockQuantity > 0 && v.status)
                .map(v => v.size);
            setSelectedSize(validSizes[0] || null);
        }
        setSelectedColor(color);
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!activeVariant) {
            setQuantity(Math.max(1, newQuantity));
            return;
        }
        const maxAvailable = activeVariant.stockQuantity;
        if (newQuantity > maxAvailable) {
            toast.error(`Chỉ còn ${maxAvailable} sản phẩm trong kho`);
            setQuantity(maxAvailable);
        } else if (newQuantity < 1) {
            setQuantity(1);
        } else {
            setQuantity(newQuantity);
        }
    };

    const calculateDiscount = product.salePrice !== null && product.salePrice !== undefined
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : null;

    return (
        <div className="w-full flex flex-col gap-5" data-aos="fade-left" data-aos-delay="100">
            {/* Brand and Product Name */}
            <div>
                <Link
                    to={`/products?brand=${product.brand.brandId}`}
                    className="text-sm font-medium text-primary dark:text-accent hover:underline transition-colors inline-flex items-center gap-1"
                >
                    <FiTag className="w-3.5 h-3.5" />
                    {product.brand.name}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1.5 mb-3">{product.name}</h1>

                {/* Price Display */}
                <div className="flex items-center gap-3 mb-1">
                    {product.salePrice !== null && product.salePrice !== undefined ? (
                        <>
                            <span className="text-xl md:text-2xl font-bold text-accent">{formatPrice(product.salePrice)}</span>
                            <span className="text-md md:text-lg text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price)}</span>
                            {calculateDiscount && (
                                <span className="text-sm bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-3 py-1 rounded-full font-medium">
                                    Tiết kiệm {calculateDiscount}%
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                    )}
                </div>

                {/* Stock Status Indicator */}
                <div className="mb-4">
                    <span className={`inline-flex items-center text-sm ${isVariantAvailable() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${isVariantAvailable() ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></span>
                        {isVariantAvailable() ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>

            {/* Sizes and Colors Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sizes */}
                {availableSizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            Kích thước
                            {selectedSize && (
                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                    {selectedSize}
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                            {availableSizes.map(size => {
                                const isAvailable = productVariants.some(v => v.size === size && v.stockQuantity > 0 && v.status);
                                const variant = productVariants.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
                                return (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        disabled={!isAvailable}
                                        className={`
                                            relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${selectedSize === size
                                            ? 'bg-primary text-white shadow-sm'
                                            : isAvailable
                                                ? 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 hover:border-primary/60 dark:hover:border-accent/60'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 pointer-events-none border border-gray-300 dark:border-gray-600 relative'
                                        }
                                        `}
                                    >
                                        {size}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                                                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 opacity-70"></div>
                                                <div className="absolute w-full h-0.5 bg-gray-400 dark:bg-gray-500 rotate-45 transform"></div>
                                            </div>
                                        )}
                                        {variant && isAvailable && (
                                            <span className="absolute -top-1.5 -right-1.5 text-xs bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                                {variant.stockQuantity}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            Màu sắc
                            {selectedColor && (
                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                    {selectedColor}
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map(color => {
                                const isAvailable = productVariants.some(v => v.color === color && v.stockQuantity > 0 && v.status);
                                const variant = productVariants.find(v => v.color === color && (!selectedSize || v.size === selectedSize));
                                const isLightColor = ['white', 'yellow', 'cream', 'beige'].includes(color.toLowerCase());
                                return (
                                    <button
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        disabled={!isAvailable}
                                        className={`
                                            group relative w-9 h-9 rounded-full border-2 transition-all duration-200
                                            ${selectedColor === color
                                            ? 'border-primary dark:border-accent scale-110 shadow-sm'
                                            : isAvailable
                                                ? 'border-transparent hover:border-primary/60 dark:hover:border-accent/60 hover:scale-105'
                                                : 'opacity-50 pointer-events-none border-gray-300 relative'
                                        }
                                        `}
                                        style={{
                                            backgroundColor: color.toLowerCase(),
                                            borderColor: isLightColor && (selectedColor !== color) ? '#e5e7eb' : undefined
                                        }}
                                        title={color}
                                    >
                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                                                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 opacity-50"></div>
                                                <div className="absolute w-full h-0.5 bg-gray-400 dark:bg-gray-500 rotate-45 transform"></div>
                                            </div>
                                        )}
                                        {variant && isAvailable && (
                                            <span className="absolute -top-1.5 -right-1.5 text-xs bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                                {variant.stockQuantity}
                                            </span>
                                        )}
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white bg-black/30 dark:bg-black/50 rounded-full transition-opacity duration-200">{color}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Quantity */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Số lượng</h3>
                <div className="flex items-center">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm w-32 bg-white dark:bg-gray-700">
                        <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                            disabled={quantity <= 1}
                        >
                            <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span
                            className="w-12 h-10 flex items-center justify-center bg-transparent text-gray-900 dark:text-white font-medium select-none pointer-events-none"
                            aria-label="Số lượng"
                        >
                            {quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                            disabled={activeVariant && quantity >= activeVariant.stockQuantity || false}
                        >
                            <FiPlus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {activeVariant && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                            Còn lại: <span className="font-medium text-gray-900 dark:text-white">{activeVariant.stockQuantity}</span> sản phẩm
                        </p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-1">
                <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all duration-200 ${
                        isVariantAvailable()
                            ? 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!isVariantAvailable()}
                >
                    <FiShoppingBag className="w-5 h-5 mr-2" /> Thêm vào giỏ hàng
                </button>
                <button
                    onClick={handleAddToWishlist}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                    title="Thêm vào yêu thích"
                >
                    <FiHeart className="w-5 h-5" />
                </button>
            </div>

            {/* Product Details */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Thông tin sản phẩm</h3>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">SKU:</div>
                    <div className="text-gray-900 dark:text-white font-medium">{activeVariant?.sku || 'N/A'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Danh mục:</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                        <Link to={`/products?category=${product.category.categoryId}`} className="hover:text-primary dark:hover:text-accent hover:underline transition-colors">
                            {product.category.name}
                        </Link>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">Thương hiệu:</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                        <Link to={`/products?brand=${product.brand.brandId}`} className="hover:text-primary dark:hover:text-accent hover:underline transition-colors">
                            {product.brand.name}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOptions;