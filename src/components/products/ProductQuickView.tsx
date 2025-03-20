import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiShoppingBag, FiMinus, FiPlus, FiTag, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import useProduct from '../../hooks/useProduct';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useFavorite from '../../hooks/useFavorite';
import { ProductResponseDTO, ProductVariantDTO, ProductImageDTO } from '../../types/product.types';
import { CartAddItemDTO } from '../../types/cart.types';

interface ProductQuickViewProps {
    product: ProductResponseDTO;
    isOpen: boolean;
    onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorite(product.productId);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    // Control body overflow when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    const {
        productImages,
        productVariants,
        getProductBySlug,
        availableSizes,
        availableColors,
    } = useProduct();

    const { addItemToUserCart } = useCart();

    // Fetch product details when the modal opens
    useEffect(() => {
        if (isOpen && product.slug) {
            const fetchData = async () => {
                try {
                    await getProductBySlug(product.slug);
                } catch (err) {
                    console.error('Error fetching product details:', err);
                    toast.error('Không thể tải thông tin sản phẩm', {
                        icon: <FiAlertCircle className="text-red-500" />,
                    });
                }
            };
            fetchData();
        }
    }, [isOpen, product.slug, getProductBySlug]);

    // Set default size and color when options are available
    useEffect(() => {
        if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
        if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
    }, [availableSizes, availableColors, selectedSize, selectedColor]);

    // Calculate available images
    const images: string[] = useMemo(() => {
        if (!product) return [];
        const imageList: string[] = [product.thumbnail].filter((url): url is string => url !== null && url !== undefined) as string[];
        productImages.forEach((img: ProductImageDTO) => {
            if (!imageList.includes(img.imageUrl)) imageList.push(img.imageUrl);
        });
        productVariants.forEach((variant: ProductVariantDTO) => {
            if (variant.imageUrl && !imageList.includes(variant.imageUrl)) imageList.push(variant.imageUrl);
        });
        return imageList;
    }, [product, productImages, productVariants]);

    // Set primary image when images change
    useEffect(() => {
        if (images.length > 0) {
            const primaryImageIndex = productImages.findIndex((img: ProductImageDTO) => img.isPrimary);
            setActiveImageIndex(primaryImageIndex >= 0 ? primaryImageIndex : 0);
        }
    }, [images, productImages]);

    // Find active variant based on selected size and color
    const activeVariant: ProductVariantDTO | null = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return (
            productVariants.find(
                (v: ProductVariantDTO) => v.size === selectedSize && v.color === selectedColor && v.stockQuantity > 0 && v.status
            ) || null
        );
    }, [selectedSize, selectedColor, productVariants]);

    // Update quantity and image when active variant changes
    useEffect(() => {
        if (activeVariant) {
            setQuantity((prev) => (prev > activeVariant.stockQuantity ? activeVariant.stockQuantity : prev));
            if (activeVariant.imageUrl) {
                const variantImageIndex = images.findIndex((img) => img === activeVariant.imageUrl);
                if (variantImageIndex >= 0) setActiveImageIndex(variantImageIndex);
            }
        }
    }, [activeVariant, images]);

    // Format price with currency
    const formatPrice = (price: number): string =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

    // Calculate discount percentage
    const calculateDiscount = useMemo(() => {
        if (!product?.salePrice || product.salePrice === null) return null;
        return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }, [product]);

    // Check if the selected variant is available
    const isVariantAvailable = (): boolean =>
        !!selectedSize &&
        !!selectedColor &&
        !!productVariants.some((v: ProductVariantDTO) => v.size === selectedSize && v.color === selectedColor && v.stockQuantity > 0 && v.status);

    // Handle size selection
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

    // Handle color selection
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

    // Handle quantity changes
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

    // Handle adding to cart
    const handleAddToCart = async () => {
        if (!product || !activeVariant) return;
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
            navigate('/login');
            onClose();
            return;
        }
        if (!isVariantAvailable()) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
            return;
        }
        try {
            const cartItem: CartAddItemDTO = { variantId: activeVariant.variantId ?? 0, quantity };
            await addItemToUserCart(cartItem);
            toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, {
                icon: <FiShoppingBag className="text-green-500" />,
            });
            onClose();
        } catch (error) {
            console.error('Error adding item to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
        }
    };

    // Handle adding to wishlist
    const handleAddToWishlist = () => {
        if (!product) return;
        const result = toggleFavorite();
        if (result) {
            toast.success(isFavorite
                ? `Đã xóa ${product.name} khỏi danh sách yêu thích`
                : `Đã thêm ${product.name} vào danh sách yêu thích`, {
                icon: <FiHeart className="text-red-500" />,
            });
        }
    };

    // Navigate to product detail page
    const handleViewDetails = () => {
        navigate(`/products/${product.slug}`);
        onClose();
    };

    // Use React Portal to render the modal at the root level with AnimatePresence for exit animations
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6">
                    <AnimatePresence>
                        {showAlert && (
                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100000] w-full max-w-md"
                            >
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md flex items-center">
                                    <FiAlertCircle className="w-5 h-5 mr-2" />
                                    <span>Sản phẩm này hiện không có sẵn với lựa chọn này</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden relative w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label="Close"
                        >
                            <FiX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>

                        <div className="flex flex-col lg:flex-row overflow-hidden max-h-[90vh]">
                            {/* Product Images */}
                            <div className="lg:w-1/2 p-4 bg-gray-50 dark:bg-gray-900 flex flex-col">
                                {/* Main Image */}
                                <div className="h-64 sm:h-80 md:h-96 relative overflow-hidden rounded-lg mb-4">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[activeImageIndex]}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-gray-400 dark:text-gray-500">No image</span>
                                        </div>
                                    )}

                                    {/* Discount Badge */}
                                    {calculateDiscount && (
                                        <div className="absolute top-2 left-2 bg-primary text-white text-xs md:text-sm font-semibold px-2 py-1 rounded-full shadow-sm z-10">
                                            -{calculateDiscount}%
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Images */}
                                {images.length > 1 && (
                                    <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
                                        {images.map((img, index) => (
                                            <button
                                                key={index}
                                                className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                                    index === activeImageIndex
                                                        ? 'border-primary dark:border-accent scale-105 shadow-sm'
                                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => setActiveImageIndex(index)}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} - View ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="lg:w-1/2 p-6 overflow-y-auto">
                                {/* Product Info */}
                                <div className="mb-4">
                                    <Link
                                        to={`/products?brand=${product.brand.brandId}`}
                                        className="text-sm font-medium text-primary dark:text-accent hover:underline transition-colors inline-flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FiTag className="w-3.5 h-3.5" />
                                        {product.brand.name}
                                    </Link>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-3">{product.name}</h2>

                                    {/* Price Display */}
                                    <div className="flex items-center gap-3 mb-2">
                                        {product.salePrice !== null && product.salePrice !== undefined ? (
                                            <>
                                                <span className="text-xl font-bold text-accent">{formatPrice(product.salePrice)}</span>
                                                <span className="text-md text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                {calculateDiscount && (
                                                    <span className="text-sm bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded-full font-medium">
                                                Tiết kiệm {calculateDiscount}%
                                            </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                                        )}
                                    </div>

                                    {/* Stock Status */}
                                    <div className="mb-4">
                                <span className={`inline-flex items-center text-sm ${isVariantAvailable() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-1.5 ${isVariantAvailable() ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></span>
                                    {isVariantAvailable() ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-4"></div>

                                {/* Sizes and Colors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Sizes */}
                                    {availableSizes.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                                Kích thước
                                                {selectedSize && (
                                                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                                {selectedSize}
                                            </span>
                                                )}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {availableSizes.map(size => {
                                                    const isAvailable = productVariants.some(v => v.size === size && v.stockQuantity > 0 && v.status);
                                                    return (
                                                        <button
                                                            key={size}
                                                            onClick={() => handleSizeChange(size)}
                                                            disabled={!isAvailable}
                                                            className={`
                                                        relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
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
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Colors */}
                                    {availableColors.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                                Màu sắc
                                                {selectedColor && (
                                                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                                {selectedColor}
                                            </span>
                                                )}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {availableColors.map(color => {
                                                    const isAvailable = productVariants.some(v => v.color === color && v.stockQuantity > 0 && v.status);
                                                    const isLightColor = ['white', 'yellow', 'cream', 'beige'].includes(color.toLowerCase());
                                                    return (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleColorChange(color)}
                                                            disabled={!isAvailable}
                                                            className={`
                                                        group relative w-8 h-8 rounded-full border-2 transition-all duration-200
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
                                                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white bg-black/30 dark:bg-black/50 rounded-full transition-opacity duration-200">{color}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Số lượng</h3>
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
                                <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-4"></div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all duration-200 ${
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
                                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm"
                                        title="Thêm vào yêu thích"
                                    >
                                        <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={handleViewDetails}
                                    className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg flex items-center justify-center transition-all duration-200"
                                >
                                    Xem chi tiết sản phẩm <FiChevronRight className="ml-1 w-4 h-4" />
                                </button>

                                {/* Product Description (short) */}
                                {product.description && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Mô tả sản phẩm</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Thông tin sản phẩm</h3>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
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
                        </div>
                    </motion.div>

                    {/* Add custom styles for the hide-scrollbar */}
                    <style>
                        {`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                body.modal-open {
                    overflow: hidden;
                }
                `}
                    </style>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ProductQuickView;