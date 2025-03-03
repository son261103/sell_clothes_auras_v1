import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew: boolean;
    rating: number;
    isFavorite?: boolean;
    discount?: number;
    colors?: string[];
}

const FeaturedProducts: React.FC = () => {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

    const featuredProducts: Product[] = [
        {
            id: 1,
            name: 'Váy Mùa Hè Thanh Lịch',
            price: 1800000,
            image: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'váy',
            isNew: true,
            rating: 4.5,
            discount: 15,
            colors: ['#f8e4dd', '#d1c2bb', '#5c4d42']
        },
        {
            id: 2,
            name: 'Áo Khoác Denim Cá Tính',
            price: 2100000,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'áo khoác',
            isNew: true,
            rating: 4.8,
            colors: ['#7b90ad', '#3f4f69', '#1a1c29']
        },
        {
            id: 3,
            name: 'Quần Jeans Dáng Cơ Bản',
            price: 1450000,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'quần',
            isNew: false,
            rating: 4.3,
            colors: ['#cbd5e0', '#2d3748', '#1a202c']
        },
        {
            id: 4,
            name: 'Áo Sơ Mi Họa Tiết Hoa',
            price: 1250000,
            image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'áo',
            isNew: false,
            rating: 4.6,
            discount: 10,
            colors: ['#facc15', '#0369a1', '#334155']
        },
        {
            id: 5,
            name: 'Váy Maxi Dạ Hội',
            price: 2500000,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'váy',
            isNew: true,
            rating: 4.7,
            colors: ['#7f1d1d', '#0f172a', '#1e293b']
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const calculateDiscountedPrice = (price: number, discount?: number) => {
        if (!discount) return price;
        return price - (price * discount / 100);
    };

    const toggleFavorite = (productId: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page

        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } else {
            setFavorites([...favorites, productId]);
            toast.success('Đã thêm vào danh sách yêu thích');
        }
    };

    const addToCart = (productName: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page
        toast.success(`Đã thêm ${productName} vào giỏ hàng`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="px-4 md:px-8 max-w-7xl bg-white dark:bg-secondary rounded-xl mx-auto py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-primary/10 dark:border-primary/20 pb-3">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl font-bold text-primary tracking-tight">Sản Phẩm Nổi Bật</h2>
                    <p className="text-secondary/70 dark:text-textLight/70 mt-1 text-sm max-w-xl">
                        Khám phá những thiết kế thời thượng được yêu thích nhất
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-3 md:mt-0"
                >
                    <Link
                        to="/collection/featured"
                        className="text-primary hover:text-primary/80 transition flex items-center gap-2 font-semibold text-sm group"
                    >
                        Xem Tất Cả
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transform group-hover:translate-x-1 transition-transform duration-300"
                        >
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </Link>
                </motion.div>
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {featuredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                    >
                        <ProductCardVN
                            product={product}
                            formatPrice={formatPrice}
                            calculateDiscountedPrice={calculateDiscountedPrice}
                            isFavorite={favorites.includes(product.id)}
                            isHovered={hoveredProduct === product.id}
                            onToggleFavorite={toggleFavorite}
                            onAddToCart={addToCart}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

interface ProductCardProps {
    product: Product;
    formatPrice: (price: number) => string;
    calculateDiscountedPrice: (price: number, discount?: number) => number;
    isFavorite: boolean;
    isHovered: boolean;
    onToggleFavorite: (productId: number, e: React.MouseEvent) => void;
    onAddToCart: (productName: string, e: React.MouseEvent) => void;
}

const ProductCardVN: React.FC<ProductCardProps> = ({
                                                       product,
                                                       formatPrice,
                                                       calculateDiscountedPrice,
                                                       isFavorite,
                                                       isHovered,
                                                       onToggleFavorite,
                                                       onAddToCart
                                                   }) => {
    return (
        <motion.div
            className="group bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-highlight/10 dark:border-secondary/30 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 h-full flex flex-col"
            whileHover={{ y: -3 }}
        >
            <div className="relative h-52 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover object-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                </Link>

                {/* Tags and badges */}
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
                    <div className="space-y-2">
                        {product.isNew && (
                            <div className="bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                MỚI
                            </div>
                        )}
                        {product.discount && (
                            <div className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                -{product.discount}%
                            </div>
                        )}
                    </div>

                    <button
                        className={`text-white hover:text-primary transition-colors duration-300 ${isFavorite ? 'bg-primary' : 'bg-darkBackground/50 hover:bg-white/90'} p-1 rounded-full z-20`}
                        aria-label="Thêm vào yêu thích"
                        onClick={(e) => onToggleFavorite(product.id, e)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>

                {/* Available colors */}
                {product.colors && (
                    <div className={`absolute bottom-2 left-2 flex gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        {product.colors.map((color, index) => (
                            <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-white shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                                style={{ backgroundColor: color }}
                                title={`Màu ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Add to cart overlay */}
                <div className={`absolute inset-0 bg-primary/25 dark:bg-darkBackground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        className="bg-white dark:bg-secondary text-primary dark:text-highlight px-4 py-1.5 rounded-full transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 hover:bg-primary hover:text-white shadow-sm text-sm"
                        aria-label="Thêm vào giỏ hàng"
                        onClick={(e) => onAddToCart(product.name, e)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="font-medium">Thêm vào giỏ</span>
                    </button>
                </div>
            </div>

            <div className="p-3 flex-grow flex flex-col">
                <Link to={`/product/${product.id}`} className="flex-grow">
                    <h3 className="text-base font-semibold text-textDark dark:text-textLight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2 h-12">{product.name}</h3>
                </Link>

                <div className="flex items-center gap-1 mt-2 text-accent">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={i < Math.floor(product.rating) ? 'fill-accent' : 'text-highlight/30 dark:text-gray-600'}
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    ))}
                    {/* Show half star if applicable */}
                    {product.rating % 1 >= 0.5 && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            className="text-accent"
                        >
                            <defs>
                                <linearGradient id={`halfStar${product.id}`}>
                                    <stop offset="50%" stopColor="currentColor" />
                                    <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                                </linearGradient>
                            </defs>
                            <polygon
                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                                fill={`url(#halfStar${product.id})`}
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    )}
                    <span className="text-xs text-secondary/70 dark:text-gray-400 ml-1">{product.rating.toFixed(1)}</span>
                </div>

                <div className="mt-2 flex justify-between items-center">
                    <div>
                        {product.discount ? (
                            <div className="flex flex-col">
                                <p className="font-bold text-primary text-base">
                                    {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                                </p>
                                <p className="text-xs text-secondary/60 dark:text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        ) : (
                            <p className="font-bold text-primary text-base">{formatPrice(product.price)}</p>
                        )}
                    </div>
                    <span className="text-xs text-secondary/60 dark:text-gray-400 capitalize bg-highlight/10 dark:bg-secondary/20 px-2 py-0.5 rounded-full group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300">
                        {product.category}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default FeaturedProducts;