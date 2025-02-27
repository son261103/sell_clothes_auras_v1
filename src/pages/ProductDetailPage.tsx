import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import useProduct from '../hooks/useProduct';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ProductGrid from '../components/products/ProductGrid';
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';
import {
    FiChevronRight,
    FiHeart,
    FiShoppingBag,
    FiMinus,
    FiPlus,
    FiArrowLeft,
    FiChevronLeft,
    FiZoomIn
} from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Lightbox from 'react-spring-lightbox';

interface ButtonProps {
    canPrev?: boolean;
    canNext?: boolean;
}

const ProductDetailPage: React.FC = () => {
    const {slug} = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true
        });
    }, []);

    const {
        selectedProduct,
        productImages,
        productVariants,
        relatedProducts,
        loading,
        error,
        getProductBySlug,
        availableSizes,
        availableColors,
    } = useProduct();

    // Fetch product data when slug changes
    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            try {
                await getProductBySlug(slug);
            } catch (err) {
                console.error('Error fetching product details:', err);
                toast.error('Không thể tải thông tin sản phẩm');
            }
        };

        fetchProduct();
    }, [slug, getProductBySlug]);

    // Define images array using useMemo to prevent circular references and optimize performance
    const images = useMemo(() => {
        if (!selectedProduct) return [];

        // Start with thumbnail if it exists
        const imageList: string[] = [];

        if (selectedProduct.thumbnail) {
            imageList.push(selectedProduct.thumbnail);
        }

        // Add images from productImages
        productImages.forEach(img => {
            if (!imageList.includes(img.imageUrl)) {
                imageList.push(img.imageUrl);
            }
        });

        // Add unique variant images
        productVariants.forEach(variant => {
            if (variant.imageUrl && !imageList.includes(variant.imageUrl)) {
                imageList.push(variant.imageUrl);
            }
        });

        return imageList;
    }, [selectedProduct, productImages, productVariants]);

    // Set initial active image index when images or product changes
    useEffect(() => {
        if (images.length > 0) {
            const primaryImageIndex = productImages.findIndex(img => img.isPrimary);
            setActiveImageIndex(primaryImageIndex >= 0 ? primaryImageIndex : 0);
        }
    }, [images, productImages]);

    // Get the active variant based on selected size and color
    const activeVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;

        return productVariants.find(
            v => v.size === selectedSize &&
                v.color === selectedColor &&
                v.stockQuantity > 0 &&
                Boolean(v.status)
        ) || null;
    }, [selectedSize, selectedColor, productVariants]);

    // Update available sizes for the selected color
    const availableSizesForColor = useMemo(() => {
        if (!selectedColor) return availableSizes;

        return availableSizes.filter(size =>
            productVariants.some(v =>
                v.color === selectedColor &&
                v.size === size &&
                v.stockQuantity > 0 &&
                Boolean(v.status)
            )
        );
    }, [selectedColor, availableSizes, productVariants]);

    // Update available colors for the selected size
    const availableColorsForSize = useMemo(() => {
        if (!selectedSize) return availableColors;

        return availableColors.filter(color =>
            productVariants.some(v =>
                v.size === selectedSize &&
                v.color === color &&
                v.stockQuantity > 0 &&
                Boolean(v.status)
            )
        );
    }, [selectedSize, availableColors, productVariants]);

    // Set default size and color when available options change
    useEffect(() => {
        // Only set default values if they haven't been selected yet
        if (availableSizes.length > 0 && !selectedSize) {
            setSelectedSize(availableSizes[0]);
        }

        // Only set default color if it hasn't been selected yet
        if (availableColors.length > 0 && !selectedColor) {
            setSelectedColor(availableColors[0]);
        }
    }, [availableSizes, availableColors, selectedSize, selectedColor]);

    // Update quantity and image when active variant changes
    useEffect(() => {
        if (activeVariant) {
            // Update quantity based on stock
            setQuantity(prev => (prev > activeVariant.stockQuantity ? activeVariant.stockQuantity : prev));

            // Update image if variant has an image
            if (activeVariant.imageUrl) {
                const variantImageIndex = images.findIndex(img => img === activeVariant.imageUrl);
                if (variantImageIndex >= 0) {
                    setActiveImageIndex(variantImageIndex);
                }
            }
        }
    }, [activeVariant, images]);

    const isVariantAvailable = useCallback(() => {
        if (!selectedSize || !selectedColor || !selectedProduct) return false;

        return productVariants.some(
            variant =>
                variant.size === selectedSize &&
                variant.color === selectedColor &&
                variant.stockQuantity > 0 &&
                Boolean(variant.status)
        );
    }, [selectedSize, selectedColor, selectedProduct, productVariants]);

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        if (!selectedSize || !selectedColor) {
            toast.error('Vui lòng chọn kích thước và màu sắc');
            return;
        }

        if (!isVariantAvailable()) {
            toast.error('Sản phẩm này hiện không có sẵn với lựa chọn này');
            return;
        }

        toast.success(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ hàng`);
    };

    const handleAddToWishlist = () => {
        if (!selectedProduct) return;
        toast.success(`Đã thêm ${selectedProduct.name} vào danh sách yêu thích`);
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!activeVariant) {
            setQuantity(newQuantity < 1 ? 1 : newQuantity);
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

    const handleSizeChange = (size: string) => {
        // Always update the selected size
        setSelectedSize(size);

        // Find a valid color for this size if current color isn't available
        if (selectedColor) {
            const isColorValidForSize = productVariants.some(
                v => v.size === size && v.color === selectedColor && v.stockQuantity > 0 && Boolean(v.status)
            );

            // If current color is not valid for this size, select the first valid color
            if (!isColorValidForSize) {
                const validColors = availableColors.filter(color =>
                    productVariants.some(
                        v => v.size === size && v.color === color && v.stockQuantity > 0 && Boolean(v.status)
                    )
                );

                if (validColors.length > 0) {
                    setSelectedColor(validColors[0]);
                }
            }
        } else if (availableColors.length > 0) {
            // If no color is selected yet, select the first available color
            setSelectedColor(availableColors[0]);
        }
    };

    const handleColorChange = (color: string) => {
        // Always update the selected color
        setSelectedColor(color);

        // Find a valid size for this color if current size isn't available
        if (selectedSize) {
            const isSizeValidForColor = productVariants.some(
                v => v.color === color && v.size === selectedSize && v.stockQuantity > 0 && Boolean(v.status)
            );

            // If current size is not valid for this color, select the first valid size
            if (!isSizeValidForColor) {
                const validSizes = availableSizes.filter(size =>
                    productVariants.some(
                        v => v.color === color && v.size === size && v.stockQuantity > 0 && Boolean(v.status)
                    )
                );

                if (validSizes.length > 0) {
                    setSelectedSize(validSizes[0]);
                }
            }
        } else if (availableSizes.length > 0) {
            // If no size is selected yet, select the first available size
            setSelectedSize(availableSizes[0]);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const calculateDiscount = () => {
        if (!selectedProduct?.salePrice) return null;
        const discount = ((selectedProduct.price - selectedProduct.salePrice) / selectedProduct.price) * 100;
        return Math.round(discount);
    };

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index: number) => {
        setActiveImageIndex(index);
    };

    // Lightbox controls
    const openLightbox = () => {
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    // Custom header for lightbox
    const renderHeader = () => (
        <div className="absolute top-0 right-0 p-4 z-10">
            <button
                onClick={closeLightbox}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200"
                aria-label="Close lightbox"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );

    // Custom prev button for lightbox
    const renderPrevButton = ({ canPrev }: ButtonProps) => (
        <button
            onClick={handlePrevImage}
            disabled={!canPrev}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 ${!canPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Previous image"
        >
            <FiChevronLeft className="w-6 h-6"/>
        </button>
    );

    // Custom next button for lightbox
    const renderNextButton = ({ canNext }: ButtonProps) => (
        <button
            onClick={handleNextImage}
            disabled={!canNext}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 ${!canNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Next image"
        >
            <FiChevronRight className="w-6 h-6"/>
        </button>
    );

    if (loading && !selectedProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large"/>
            </div>
        );
    }

    if (error || !selectedProduct) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="container mx-auto px-4">
                    <EmptyState
                        title="Không tìm thấy sản phẩm"
                        description="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
                        action={{
                            label: 'Quay lại cửa hàng',
                            onClick: () => navigate('/products'),
                        }}
                    />
                </div>
            </div>
        );
    }

    const discount = calculateDiscount();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
                {/* Breadcrumb navigation */}
                <nav className="flex items-center text-sm mb-6 text-gray-600 dark:text-gray-300 overflow-x-auto"
                     data-aos="fade-down">
                    <Link to="/"
                          className="hover:text-primary dark:hover:text-accent transition-colors duration-200 whitespace-nowrap">
                        Trang chủ
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0"/>
                    <Link to="/products"
                          className="hover:text-primary dark:hover:text-accent transition-colors duration-200 whitespace-nowrap">
                        Sản phẩm
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0"/>
                    <Link
                        to={`/products?category=${selectedProduct.category.categoryId}`}
                        className="hover:text-primary dark:hover:text-accent transition-colors duration-200 whitespace-nowrap"
                    >
                        {selectedProduct.category.name}
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0"/>
                    <span className="text-gray-900 dark:text-white truncate max-w-xs">{selectedProduct.name}</span>
                </nav>

                {/* Back button for mobile */}
                <button
                    onClick={() => navigate(-1)}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5"/>
                    Quay lại
                </button>

                {/* Main product details card */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8"
                    data-aos="fade-up">
                    {/* Product images section */}
                    <div className="md:w-1/2" data-aos="fade-right" data-aos-delay="100">
                        <div className="relative">
                            {images.length > 0 ? (
                                <div className="group relative">
                                    <TransformWrapper initialScale={1} minScale={1} maxScale={3} wheel={{step: 0.1}}
                                                      doubleClick={{mode: 'toggle'}}>
                                        <TransformComponent>
                                            <div
                                                className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square relative">
                                                <img
                                                    src={images[activeImageIndex]}
                                                    alt={`${selectedProduct.name} - Image ${activeImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {discount && (
                                                    <div
                                                        className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                                                        -{discount}%
                                                    </div>
                                                )}
                                            </div>
                                        </TransformComponent>
                                    </TransformWrapper>

                                    {/* Zoom icon overlay */}
                                    <button
                                        onClick={openLightbox}
                                        className="absolute top-4 right-4 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        aria-label="Open full screen view"
                                    >
                                        <FiZoomIn className="w-5 h-5"/>
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="w-full h-full aspect-square flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    No image
                                </div>
                            )}

                            {/* Navigation arrows for images */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full transition-all duration-200"
                                        aria-label="Previous image"
                                    >
                                        <FiChevronLeft className="w-5 h-5"/>
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-800 text-white p-2 rounded-full transition-all duration-200"
                                        aria-label="Next image"
                                    >
                                        <FiChevronRight className="w-5 h-5"/>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail images */}
                        {images.length > 1 && (
                            <div className="flex flex-wrap gap-2 mt-4 justify-center" data-aos="fade-up"
                                 data-aos-delay="200">
                                {images.map((image: string, index: number) => (
                                    <button
                                        key={`thumb-${index}`}
                                        onClick={() => handleThumbnailClick(index)}
                                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                            activeImageIndex === index
                                                ? 'border-primary dark:border-accent'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-accent/50'
                                        }`}
                                        aria-label={`View image ${index + 1}`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${selectedProduct.name} - Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product info section */}
                    <div className="md:w-1/2 flex flex-col" data-aos="fade-left" data-aos-delay="100">
                        {/* Brand */}
                        <Link
                            to={`/products?brand=${selectedProduct.brand.brandId}`}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent mb-2 transition-colors duration-200"
                        >
                            {selectedProduct.brand.name}
                        </Link>

                        {/* Product name */}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedProduct.name}</h1>

                        {/* Price display */}
                        <div className="flex items-center gap-3 mb-6" data-aos="fade-up" data-aos-delay="150">
                            {selectedProduct.salePrice ? (
                                <>
                                    <span
                                        className="text-3xl font-bold text-accent">{formatPrice(selectedProduct.salePrice)}</span>
                                    <span
                                        className="text-lg text-gray-500 dark:text-gray-400 line-through">{formatPrice(selectedProduct.price)}</span>
                                    {discount && (
                                        <span
                                            className="text-sm bg-accent/10 text-accent px-2 py-1 rounded">Tiết kiệm {discount}%</span>
                                    )}
                                </>
                            ) : (
                                <span
                                    className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(selectedProduct.price)}</span>
                            )}
                        </div>

                        {/* Size selection */}
                        {availableSizes.length > 0 && (
                            <div className="mb-6" data-aos="fade-up" data-aos-delay="200">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Kích thước</h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((size: string) => {
                                        // Check if this size is available with the currently selected color
                                        const isAvailable = selectedColor
                                            ? availableSizesForColor.includes(size)
                                            : productVariants.some(v => v.size === size && v.stockQuantity > 0 && Boolean(v.status));

                                        return (
                                            <button
                                                key={`size-${size}`}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                    selectedSize === size
                                                        ? 'bg-primary text-white'
                                                        : isAvailable
                                                            ? 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-primary/10 dark:hover:bg-accent/20'
                                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                                                }`}
                                                onClick={() => isAvailable && handleSizeChange(size)}
                                                disabled={!isAvailable}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color selection */}
                        {availableColors.length > 0 && (
                            <div className="mb-6" data-aos="fade-up" data-aos-delay="250">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Màu sắc</h3>
                                <div className="flex flex-wrap gap-3">
                                    {availableColors.map((color: string) => {
                                        // Check if this color is available with the currently selected size
                                        const isAvailable = selectedSize
                                            ? availableColorsForSize.includes(color)
                                            : productVariants.some(v => v.color === color && v.stockQuantity > 0 && Boolean(v.status));

                                        // Determine if this is a light color (to ensure visible border)
                                        const isLightColor = ['white', 'yellow', 'cream', 'beige'].includes(color.toLowerCase());

                                        return (
                                            <button
                                                key={`color-${color}`}
                                                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                                    selectedColor === color
                                                        ? 'border-primary dark:border-accent scale-110'
                                                        : isAvailable
                                                            ? 'border-transparent hover:border-primary dark:hover:border-accent'
                                                            : 'opacity-50 cursor-not-allowed border-gray-300'
                                                }`}
                                                style={{
                                                    backgroundColor: color.toLowerCase(),
                                                    borderColor: isLightColor ? '#e5e7eb' : undefined,
                                                }}
                                                onClick={() => isAvailable && handleColorChange(color)}
                                                disabled={!isAvailable}
                                                title={color}
                                                aria-label={`Color: ${color}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity selector */}
                        <div className="mb-6" data-aos="fade-up" data-aos-delay="300">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Số lượng</h3>
                            <div
                                className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md w-32">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <FiMinus className="w-4 h-4"/>
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="w-12 h-10 text-center bg-transparent text-gray-900 dark:text-white border-none focus:outline-none"
                                    min={1}
                                    max={activeVariant?.stockQuantity || 99}
                                    aria-label="Quantity"
                                />
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"
                                    disabled={activeVariant && quantity >= activeVariant.stockQuantity || false}
                                    aria-label="Increase quantity"
                                >
                                    <FiPlus className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-4 mb-6" data-aos="fade-up" data-aos-delay="350">
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 py-3 px-6 rounded-md text-white font-medium flex items-center justify-center transition-all duration-200 ${
                                    isVariantAvailable()
                                        ? 'bg-primary hover:bg-primary/90'
                                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                }`}
                                disabled={!isVariantAvailable()}
                            >
                                <FiShoppingBag className="w-5 h-5 mr-2"/>
                                Thêm vào giỏ hàng
                            </button>
                            <button
                                onClick={handleAddToWishlist}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
                                aria-label="Add to wishlist"
                            >
                                <FiHeart className="w-5 h-5 mr-2"/>
                                Yêu thích
                            </button>
                        </div>

                        {/* Product description */}
                        <div className="mb-6" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mô tả sản phẩm</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {selectedProduct.description || 'Không có mô tả cho sản phẩm này.'}
                            </p>
                        </div>

                        {/* Product metadata */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm" data-aos="fade-up" data-aos-delay="450">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                                <span className="text-gray-900 dark:text-white">
            {activeVariant?.sku || 'N/A'}
        </span>
                                <span className="text-gray-500 dark:text-gray-400">Danh mục:</span>
                                <Link
                                    to={`/products?category=${selectedProduct.category.categoryId}`}
                                    className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-accent"
                                >
                                    {selectedProduct.category.name}
                                </Link>
                                <span className="text-gray-500 dark:text-gray-400">Thương hiệu:</span>
                                <Link
                                    to={`/products?brand=${selectedProduct.brand.brandId}`}
                                    className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-accent"
                                >
                                    {selectedProduct.brand.name}
                                </Link>
                                <span className="text-gray-500 dark:text-gray-400">Tình trạng:</span>
                                <span
                                    className={
                                        isVariantAvailable()
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }
                                >
            {isVariantAvailable() ? 'Còn hàng' : 'Hết hàng'}
        </span>
                                {activeVariant && (
                                    <>
                                        <span className="text-gray-500 dark:text-gray-400">Tồn kho:</span>
                                        <span className="text-gray-900 dark:text-white">
                    {activeVariant.stockQuantity}
                </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related products section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12" data-aos="fade-up" data-aos-delay="100">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sản phẩm liên quan</h2>
                        <ProductGrid products={relatedProducts}/>
                    </div>
                )}
            </div>

            {/* Lightbox for full-screen image viewing */}
            {lightboxOpen && images.length > 0 && (
                <Lightbox
                    isOpen={lightboxOpen}
                    onClose={closeLightbox}
                    images={images.map((src, index) => ({
                        src,
                        alt: selectedProduct?.name ? `${selectedProduct.name} - Image ${index + 1}` : `Product Image ${index + 1}`
                    }))}
                    currentIndex={activeImageIndex}
                    onNext={handleNextImage}
                    onPrev={handlePrevImage}
                    renderHeader={renderHeader}
                    renderPrevButton={renderPrevButton}
                    renderNextButton={renderNextButton}
                />
            )}
        </div>
    );
};

export default ProductDetailPage;