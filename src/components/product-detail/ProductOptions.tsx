import React from 'react';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';
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
        <div className="w-full flex flex-col gap-4" data-aos="fade-left" data-aos-delay="100">
            {/* Phần thông tin cơ bản */}
            <div>
                <Link
                    to={`/products?brand=${product.brand.brandId}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors inline-block"
                >
                    {product.brand.name}
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 mb-3 line-clamp-2">{product.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                    {product.salePrice !== null && product.salePrice !== undefined ? (
                        <>
                            <span className="text-xl md:text-2xl font-bold text-accent">{formatPrice(product.salePrice)}</span>
                            <span className="text-md md:text-lg text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price)}</span>
                            {calculateDiscount && (
                                <span className="text-sm bg-yellow-500/20 text-yellow-600 px-3 py-1 rounded-full">
                                    Tiết kiệm {calculateDiscount}%
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                    )}
                </div>
            </div>

            {/* Kích thước và Màu sắc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kích thước */}
                {availableSizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Kích thước</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(size => {
                                const isAvailable = productVariants.some(v => v.size === size && v.stockQuantity > 0 && v.status);
                                const variant = productVariants.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
                                return (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        disabled={!isAvailable}
                                        className={`
                                            relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                                            ${selectedSize === size
                                            ? 'bg-primary text-white'
                                            : isAvailable
                                                ? 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-primary/10'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 pointer-events-none border border-gray-300 dark:border-gray-600 relative'
                                        }
                                        `}
                                    >
                                        {size}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-md overflow-hidden">
                                                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 opacity-70"></div>
                                                <div className="absolute w-full h-0.5 bg-gray-400 dark:bg-gray-500 rotate-45 transform"></div>
                                            </div>
                                        )}
                                        {variant && isAvailable && (
                                            <span className="absolute -top-2 -right-2 text-xs bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                {variant.stockQuantity}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Màu sắc */}
                {availableColors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Màu sắc</h3>
                        <div className="flex flex-wrap gap-2">
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
                                            relative w-8 h-8 rounded-full border-2 transition-all duration-200
                                            ${selectedColor === color
                                            ? 'border-primary dark:border-accent scale-110'
                                            : isAvailable
                                                ? 'border-transparent hover:border-primary'
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
                                            <span className="absolute -top-2 -right-2 text-xs bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                {variant.stockQuantity}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Số lượng và Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Số lượng */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Số lượng</h3>
                    <div className="flex items-center">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md w-28">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"
                                disabled={quantity <= 1}
                            >
                                <FiMinus className="w-3 h-3" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                className="w-12 h-8 text-center bg-transparent text-gray-900 dark:text-white border-none focus:outline-none"
                                min={1}
                                max={activeVariant?.stockQuantity || 999}
                            />
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"
                                disabled={activeVariant && quantity >= activeVariant.stockQuantity || true}
                            >
                                <FiPlus className="w-3 h-3" />
                            </button>
                        </div>
                        {activeVariant && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                                Còn lại: {activeVariant.stockQuantity} sản phẩm
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 mt-2">
                <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-2.5 px-4 rounded-md text-white font-medium flex items-center justify-center transition-all duration-200 ${
                        isVariantAvailable() ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!isVariantAvailable()}
                >
                    <FiShoppingBag className="w-4 h-4 mr-2" /> Thêm vào giỏ hàng
                </button>
                <button
                    onClick={handleAddToWishlist}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
                >
                    <FiHeart className="w-4 h-4" />
                </button>
            </div>

            {/* Thông tin thêm */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 text-sm">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                    <span className="text-gray-900 dark:text-white">{activeVariant?.sku || 'N/A'}</span>

                    <span className="text-gray-500 dark:text-gray-400">Tình trạng:</span>
                    <span className={isVariantAvailable() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {isVariantAvailable() ? 'Còn hàng' : 'Hết hàng'}
                    </span>

                    <span className="text-gray-500 dark:text-gray-400">Danh mục:</span>
                    <span className="text-gray-900 dark:text-white">{product.category.name}</span>

                    <span className="text-gray-500 dark:text-gray-400">Thương hiệu:</span>
                    <span className="text-gray-900 dark:text-white">{product.brand.name}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductOptions;