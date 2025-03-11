import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useProduct from '../../hooks/useProduct';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProductImages from '../../components/product-detail/ProductImages';
import ProductInfo from '../../components/product-detail/ProductInfo';
import ProductOptions from '../../components/product-detail/ProductOptions';
import RelatedProducts from '../../components/product-detail/RelatedProducts';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FiChevronRight, FiArrowLeft } from 'react-icons/fi';
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

    useEffect(() => {
        AOS.init({ duration: 800, once: false, mirror: true });
        return () => AOS.refresh();
    }, []);

    useEffect(() => {
        if (!slug || hasFetched) return;
        const fetchData = async () => {
            try {
                await getProductBySlug(slug);
                if (isAuthenticated) await getUserCart();
                setHasFetched(true);
            } catch (err) {
                console.error('Error fetching product:', err);
                toast.error('Không thể tải thông tin sản phẩm');
                setHasFetched(false);
            }
        };
        fetchData();
    }, [slug, getProductBySlug, getUserCart, isAuthenticated, hasFetched]);

    const images: string[] = useMemo(() => {
        if (!selectedProduct) return [];
        const imageList: string[] = [selectedProduct.thumbnail].filter((url): url is string => url !== null && url !== undefined) as string[];
        productImages.forEach((img: ProductImageDTO) => {
            if (!imageList.includes(img.imageUrl)) imageList.push(img.imageUrl);
        });
        productVariants.forEach((variant: ProductVariantDTO) => {
            if (variant.imageUrl && !imageList.includes(variant.imageUrl)) imageList.push(variant.imageUrl);
        });
        return imageList;
    }, [selectedProduct, productImages, productVariants]);

    useEffect(() => {
        if (images.length > 0) {
            const primaryImageIndex = productImages.findIndex((img: ProductImageDTO) => img.isPrimary);
            setActiveImageIndex(primaryImageIndex >= 0 ? primaryImageIndex : 0);
        }
    }, [images, productImages]);

    const activeVariant: ProductVariantDTO | null = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return (
            productVariants.find(
                (v: ProductVariantDTO) => v.size === selectedSize && v.color === selectedColor && v.stockQuantity > 0 && v.status
            ) || null
        );
    }, [selectedSize, selectedColor, productVariants]);

    useEffect(() => {
        if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
        if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
    }, [availableSizes, availableColors]);

    useEffect(() => {
        if (activeVariant) {
            setQuantity((prev) => (prev > activeVariant.stockQuantity ? activeVariant.stockQuantity : prev));
            if (activeVariant.imageUrl) {
                const variantImageIndex = images.findIndex((img) => img === activeVariant.imageUrl);
                if (variantImageIndex >= 0) setActiveImageIndex(variantImageIndex);
            }
        }
    }, [activeVariant, images]);

    const isVariantAvailable = (): boolean =>
        !!selectedSize &&
        !!selectedColor &&
        !!productVariants.some((v: ProductVariantDTO) => v.size === selectedSize && v.color === selectedColor && v.stockQuantity > 0 && v.status);

    const handleAddToCart = async () => {
        if (!selectedProduct || !activeVariant) return;
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            navigate('/login');
            return;
        }
        if (!isVariantAvailable()) {
            toast.error('Sản phẩm này hiện không có sẵn với lựa chọn này');
            return;
        }
        try {
            const cartItem: CartAddItemDTO = { variantId: activeVariant.variantId ?? 0, quantity };
            await addItemToUserCart(cartItem);
            toast.success(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ hàng`);
        } catch (error) {
            console.error('Error adding item to cart:', error);
            toast.error('Không thể thêm sản phẩm vào giỏ hàng');
        }
    };

    const handleAddToWishlist = () => {
        if (!selectedProduct) return;
        toast.success(`Đã thêm ${selectedProduct.name} vào danh sách yêu thích`);
    };

    const formatPrice = (price: number): string =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

    const calculateDiscount: number | null = useMemo(() => {
        if (!selectedProduct?.salePrice || selectedProduct.salePrice === null) return null;
        const salePrice = selectedProduct.salePrice ?? 0;
        return Math.round(((selectedProduct.price - salePrice) / selectedProduct.price) * 100);
    }, [selectedProduct]);

    if (loading && !selectedProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <nav
                    className="flex items-center text-sm mb-8 text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap"
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
                </nav>

                {/* Back Button for Mobile */}
                <button
                    onClick={() => navigate(-1)}
                    className="md:hidden flex items-center text-primary dark:text-accent mb-6 hover:underline transition-colors"
                    data-aos="fade-right"
                >
                    <FiArrowLeft className="mr-2 w-5 h-5" /> Quay lại
                </button>

                {/* Main Content */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center"
                    data-aos="fade-up"
                >
                    {/* Product Images */}
                    <div className="lg:w-1/2 flex justify-center">
                        <ProductImages
                            images={images}
                            activeImageIndex={activeImageIndex}
                            setActiveImageIndex={setActiveImageIndex}
                            discount={calculateDiscount}
                            productName={selectedProduct.name}
                        />
                    </div>

                    {/* Product Options */}
                    <div className="lg:w-1/2 flex flex-col gap-6">
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

                {/* Product Info Section */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mt-8"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    <ProductInfo
                        product={selectedProduct}
                        formatPrice={formatPrice}
                    />
                </div>

                {/* Related Products */}
                <div className="mt-12">
                    <RelatedProducts relatedProducts={relatedProducts} />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;