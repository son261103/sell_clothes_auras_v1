import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useProduct from '../../hooks/useProduct';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProductImages from '../../components/product-detail/ProductImages';
import ProductInfo from '../../components/product-detail/ProductInfo';
import ProductOptions from '../../components/product-detail/ProductOptions';
import ProductReviews from '../../components/product-detail/ProductReviews';
import RelatedProducts from '../../components/product-detail/RelatedProducts';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FiChevronRight, FiArrowLeft, FiShoppingCart, FiHeart, FiAlertCircle } from 'react-icons/fi';
import { ProductImageDTO, ProductVariantDTO } from '../../types/product.types';
import { CartAddItemDTO } from '../../types/cart.types';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [hasFetched, setHasFetched] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    // Create a ref to track if component is mounted
    const isMounted = useRef<boolean>(true);

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

    const { addItemToUserCart, getUserCart } = useCart();

    // Initialize AOS animation library
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            easing: 'ease-out-cubic',
            delay: 50
        });

        // Cleanup function to avoid memory leaks
        return () => {
            AOS.refresh();
            // Mark component as unmounted to prevent state updates after unmounting
            isMounted.current = false;
        };
    }, []);

    // Fetch product data once
    useEffect(() => {
        if (!slug || hasFetched) return;

        const fetchData = async () => {
            try {
                await getProductBySlug(slug);

                // Only fetch cart if user is authenticated
                if (isAuthenticated) await getUserCart();

                // Only update state if component is still mounted
                if (isMounted.current) {
                    setHasFetched(true);
                }
            } catch (err) {
                console.error('Error fetching product:', err);

                // Only show toast and update state if component is still mounted
                if (isMounted.current) {
                    toast.error('Không thể tải thông tin sản phẩm', {
                        icon: <FiAlertCircle className="text-red-500" />,
                    });
                    setHasFetched(false);
                }
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            // Reset hasFetched when slug changes or component unmounts
            setHasFetched(false);
        };
    }, [slug, getProductBySlug, getUserCart, isAuthenticated]);

    // Collect all available product images
    const images: string[] = useMemo(() => {
        if (!selectedProduct) return [];

        const imageList: string[] = [selectedProduct.thumbnail].filter((url): url is string =>
            url !== null && url !== undefined
        ) as string[];

        productImages.forEach((img: ProductImageDTO) => {
            if (!imageList.includes(img.imageUrl)) imageList.push(img.imageUrl);
        });

        productVariants.forEach((variant: ProductVariantDTO) => {
            if (variant.imageUrl && !imageList.includes(variant.imageUrl))
                imageList.push(variant.imageUrl);
        });

        return imageList;
    }, [selectedProduct, productImages, productVariants]);

    // Set active image index when images change
    useEffect(() => {
        if (images.length > 0) {
            const primaryImageIndex = productImages.findIndex((img: ProductImageDTO) => img.isPrimary);
            setActiveImageIndex(primaryImageIndex >= 0 ? primaryImageIndex : 0);
        }
    }, [images, productImages]);

    // Find active variant based on selection
    const activeVariant: ProductVariantDTO | null = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;

        return (
            productVariants.find(
                (v: ProductVariantDTO) =>
                    v.size === selectedSize &&
                    v.color === selectedColor &&
                    v.stockQuantity > 0 &&
                    v.status
            ) || null
        );
    }, [selectedSize, selectedColor, productVariants]);

    // Set default size and color when available options change
    useEffect(() => {
        if (availableSizes.length > 0 && !selectedSize)
            setSelectedSize(availableSizes[0]);

        if (availableColors.length > 0 && !selectedColor)
            setSelectedColor(availableColors[0]);
    }, [availableSizes, availableColors, selectedSize, selectedColor]);

    // Update quantity and image when active variant changes
    useEffect(() => {
        if (activeVariant) {
            // Ensure quantity doesn't exceed stock
            setQuantity((prev) =>
                (prev > activeVariant.stockQuantity ? activeVariant.stockQuantity : prev)
            );

            // Show variant image if available
            if (activeVariant.imageUrl) {
                const variantImageIndex = images.findIndex((img) => img === activeVariant.imageUrl);
                if (variantImageIndex >= 0) setActiveImageIndex(variantImageIndex);
            }
        }
    }, [activeVariant, images]);

    // Check if selected variant is available
    const isVariantAvailable = (): boolean =>
        !!selectedSize &&
        !!selectedColor &&
        !!productVariants.some(
            (v: ProductVariantDTO) =>
                v.size === selectedSize &&
                v.color === selectedColor &&
                v.stockQuantity > 0 &&
                v.status
        );

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!selectedProduct || !activeVariant) return;

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
            navigate('/login');
            return;
        }

        if (!isVariantAvailable()) {
            setShowAlert(true);
            setTimeout(() => {
                if (isMounted.current) {
                    setShowAlert(false);
                }
            }, 5000);
            return;
        }

        try {
            const cartItem: CartAddItemDTO = {
                variantId: activeVariant.variantId ?? 0,
                quantity
            };
            await addItemToUserCart(cartItem);

            toast.success(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ hàng`, {
                icon: <FiShoppingCart className="text-green-500" />,
            });
        } catch (error) {
            console.error('Error adding item to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng', {
                icon: <FiAlertCircle className="text-red-500" />,
            });
        }
    };

    // Handle add to wishlist
    const handleAddToWishlist = () => {
        if (!selectedProduct) return;

        toast.success(`Đã thêm ${selectedProduct.name} vào danh sách yêu thích`, {
            icon: <FiHeart className="text-red-500" />,
        });
    };

    // Format price with Vietnamese currency
    const formatPrice = (price: number): string =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);

    // Calculate discount percentage
    const calculateDiscount: number | null = useMemo(() => {
        if (!selectedProduct?.salePrice || selectedProduct.salePrice === null)
            return null;

        const salePrice = selectedProduct.salePrice ?? 0;
        return Math.round(
            ((selectedProduct.price - salePrice) / selectedProduct.price) * 100
        );
    }, [selectedProduct]);

    // Show loading spinner while product is loading
    if (loading && !selectedProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Show error state if product not found
    if (error || !selectedProduct) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <EmptyState
                        title="Không tìm thấy sản phẩm"
                        description="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
                        action={{ label: 'Quay lại cửa hàng', onClick: () => navigate('/products') }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md flex items-center">
                            <FiAlertCircle className="w-5 h-5 mr-2" />
                            <span>Sản phẩm này hiện không có sẵn với lựa chọn này</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center text-sm mb-8 text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm"
                    data-aos="fade-down"
                >
                    <Link to="/" className="hover:text-primary dark:hover:text-accent transition-colors">
                        Trang chủ
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                    <Link to="/products" className="hover:text-primary dark:hover:text-accent transition-colors">
                        Sản phẩm
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                    <Link
                        to={`/products?category=${selectedProduct.category.categoryId}`}
                        className="hover:text-primary dark:hover:text-accent transition-colors"
                    >
                        {selectedProduct.category.name}
                    </Link>
                    <FiChevronRight className="mx-2 w-4 h-4 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-md">
                        {selectedProduct.name}
                    </span>
                </motion.nav>

                {/* Back Button for Mobile */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => navigate(-1)}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại
                </motion.button>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    data-aos="fade-up"
                >
                    <div className="flex flex-col lg:flex-row">
                        {/* Product Images */}
                        <div
                            className="lg:w-1/2 p-6 flex justify-center border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700"
                            data-aos="fade-right"
                            data-aos-delay="100"
                        >
                            <ProductImages
                                images={images}
                                activeImageIndex={activeImageIndex}
                                setActiveImageIndex={setActiveImageIndex}
                                discount={calculateDiscount}
                                productName={selectedProduct.name}
                            />
                        </div>

                        {/* Product Options */}
                        <div
                            className="lg:w-1/2 p-6 md:p-8"
                            data-aos="fade-left"
                            data-aos-delay="200"
                        >
                            <ProductOptions
                                availableSizes={availableSizes}
                                availableColors={availableColors}
                                productVariants={productVariants}
                                selectedSize={selectedSize}
                                setSelectedSize={setSelectedSize}
                                selectedColor={selectedColor}
                                setSelectedColor={setSelectedColor}
                                quantity={quantity}
                                setQuantity={setQuantity}
                                activeVariant={activeVariant}
                                handleAddToCart={handleAddToCart}
                                handleAddToWishlist={handleAddToWishlist}
                                isVariantAvailable={isVariantAvailable}
                                formatPrice={formatPrice}
                                product={selectedProduct}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Product Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mt-8"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Thông tin sản phẩm
                    </h2>
                    <ProductInfo
                        product={selectedProduct}
                        formatPrice={formatPrice}
                    />
                </motion.div>

                {/* Product Reviews Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    data-aos="fade-up"
                    data-aos-delay="250"
                >
                    {/* Pass a key to force ProductReviews to remount when product changes */}
                    <ProductReviews
                        key={`review-${selectedProduct.productId}`}
                        productId={selectedProduct.productId}
                        productName={selectedProduct.name}
                    />
                </motion.div>

                {/* Related Products */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12"
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Sản phẩm liên quan
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                        <RelatedProducts relatedProducts={relatedProducts} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetailPage;