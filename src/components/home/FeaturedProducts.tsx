import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.2 });

    // Parallax scroll effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

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
            toast.success('Đã xóa khỏi danh sách yêu thích', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#e11d48',
                    secondary: '#FFFAEE',
                },
            });
        } else {
            setFavorites([...favorites, productId]);
            toast.success('Đã thêm vào danh sách yêu thích', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#e11d48',
                    secondary: '#FFFAEE',
                },
            });
        }
    };

    const addToCart = (productName: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page

        // Add a bouncing animation to the cart icon
        // This would be implemented in the actual cart component

        toast.success(`Đã thêm ${productName} vào giỏ hàng`, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
            iconTheme: {
                primary: '#10b981',
                secondary: '#FFFAEE',
            },
        });
    };

    // Quick view product
    const openQuickView = (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        setSelectedProduct(productId);
    };

    // Filter products
    const filteredProducts = activeFilter === 'all'
        ? featuredProducts
        : featuredProducts.filter(product => product.category === activeFilter);

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
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", stiffness: 100 }
        }
    };

    // Product filter categories
    const categories = ['all', 'váy', 'áo', 'quần', 'áo khoác'];

    return (
        <section
            className="px-4 md:px-8 max-w-7xl bg-white dark:bg-secondary rounded-xl mx-auto py-8"
            ref={containerRef}
        >
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-primary/10 dark:border-primary/20 pb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div>
                    <motion.h2
                        className="text-3xl font-bold text-primary tracking-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Sản Phẩm Nổi Bật
                    </motion.h2>
                    <motion.p
                        className="text-secondary/70 dark:text-textLight/70 mt-1 text-sm max-w-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Khám phá những thiết kế thời thượng được yêu thích nhất
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-3 md:mt-0 flex items-center gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.button
                            className="text-primary hover:text-primary/80 transition flex items-center gap-2 font-semibold text-sm bg-primary/10 px-4 py-2 rounded-full"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
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
                            >
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            Lọc Sản Phẩm
                        </motion.button>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/collection/featured"
                            className="text-primary hover:text-primary/80 transition flex items-center gap-2 font-semibold text-sm group bg-primary/10 px-4 py-2 rounded-full"
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
                </motion.div>
            </motion.div>

            {/* Filter bar */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        className="mb-6 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex gap-3 items-center flex-wrap">
                            <p className="text-sm font-medium text-primary">Danh mục:</p>

                            {categories.map((category) => (
                                <motion.button
                                    key={category}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        activeFilter === category
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white border border-primary/20 text-primary'
                                    }`}
                                    onClick={() => setActiveFilter(category)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {category === 'all' ? 'Tất cả' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{ y }}
            >
                {filteredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        layout
                    >
                        <ProductCardVN
                            product={product}
                            formatPrice={formatPrice}
                            calculateDiscountedPrice={calculateDiscountedPrice}
                            isFavorite={favorites.includes(product.id)}
                            isHovered={hoveredProduct === product.id}
                            onToggleFavorite={toggleFavorite}
                            onAddToCart={addToCart}
                            onQuickView={openQuickView}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick view modal */}
            <AnimatePresence>
                {selectedProduct !== null && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            className="bg-white dark:bg-secondary rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                className="absolute top-4 right-4 bg-white/10 text-white rounded-full p-2"
                                onClick={() => setSelectedProduct(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            {/* Quick view content would go here */}
                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold text-primary">Xem nhanh sản phẩm</h3>
                                <p className="text-gray-600 dark:text-gray-300">Chi tiết sản phẩm {selectedProduct}</p>
                                <div className="mt-4 flex justify-center">
                                    <motion.button
                                        className="bg-primary text-white px-6 py-2 rounded-full font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            const product = featuredProducts.find(p => p.id === selectedProduct);
                                            if (product) {
                                                addToCart(product.name, e);
                                            }
                                            setSelectedProduct(null);
                                        }}
                                    >
                                        Thêm vào giỏ hàng
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    onQuickView: (productId: number, e: React.MouseEvent) => void;
}

const ProductCardVN: React.FC<ProductCardProps> = ({
                                                       product,
                                                       formatPrice,
                                                       calculateDiscountedPrice,
                                                       isFavorite,
                                                       isHovered,
                                                       onToggleFavorite,
                                                       onAddToCart,
                                                       onQuickView
                                                   }) => {
    return (
        <motion.div
            className="group bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-highlight/10 dark:border-secondary/30 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30 h-full flex flex-col relative"
            whileHover={{ y: -5 }}
            layout
        >
            <div className="relative h-52 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700"
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                    />
                </Link>

                {/* Tags and badges */}
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
                    <motion.div className="space-y-2" layout>
                        {product.isNew && (
                            <motion.div
                                className="bg-accent text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                MỚI
                            </motion.div>
                        )}
                        {product.discount && (
                            <motion.div
                                className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                -{product.discount}%
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.button
                        className={`text-white hover:text-primary transition-colors duration-300 ${isFavorite ? 'bg-primary' : 'bg-darkBackground/50 hover:bg-white/90'} p-1.5 rounded-full z-20`}
                        aria-label="Thêm vào yêu thích"
                        onClick={(e) => onToggleFavorite(product.id, e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </motion.button>
                </div>

                {/* Available colors */}
                {product.colors && (
                    <motion.div
                        className="absolute bottom-2 left-2 flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {product.colors.map((color, index) => (
                            <motion.div
                                key={index}
                                className="w-4 h-4 rounded-full border border-white shadow-sm cursor-pointer"
                                style={{ backgroundColor: color }}
                                title={`Màu ${index + 1}`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Action buttons overlay */}
                <motion.div
                    className="absolute inset-0 bg-primary/25 dark:bg-darkBackground/60 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-2">
                        <motion.button
                            className="bg-white dark:bg-secondary text-primary dark:text-highlight px-4 py-2 rounded-full transform transition-all duration-300 flex items-center gap-1.5 hover:bg-primary hover:text-white shadow-sm text-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => onAddToCart(product.name, e)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span className="font-medium">Thêm vào giỏ</span>
                        </motion.button>

                        <motion.button
                            className="bg-white/80 dark:bg-secondary/80 text-primary dark:text-highlight px-4 py-2 rounded-full transform transition-all duration-300 flex items-center gap-1.5 hover:bg-primary hover:text-white shadow-sm text-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => onQuickView(product.id, e)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span className="font-medium">Xem nhanh</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <Link to={`/product/${product.id}`} className="flex-grow">
                    <motion.h3
                        className="text-base font-semibold text-textDark dark:text-textLight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 line-clamp-2 h-12"
                        layout
                    >
                        {product.name}
                    </motion.h3>
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
                    <span className="text-xs text-secondary/70 dark:text-gray-400 ml-1">{product.rating.toFixed(1)}</span>
                </div>

                <div className="mt-2 flex justify-between items-center">
                    <div>
                        {product.discount ? (
                            <div className="flex flex-col">
                                <motion.p
                                    className="font-bold text-primary text-base"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                                </motion.p>
                                <motion.p
                                    className="text-xs text-secondary/60 dark:text-gray-400 line-through"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    {formatPrice(product.price)}
                                </motion.p>
                            </div>
                        ) : (
                            <motion.p
                                className="font-bold text-primary text-base"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {formatPrice(product.price)}
                            </motion.p>
                        )}
                    </div>

                    <motion.span
                        className="text-xs text-secondary/60 dark:text-gray-400 capitalize bg-highlight/10 dark:bg-secondary/20 px-2 py-1 rounded-full group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                    >
                        {product.category}
                    </motion.span>
                </div>
            </div>

            {/* Progress bar for limited items */}
            {product.isNew && (
                <motion.div
                    className="h-1 bg-gray-200 dark:bg-gray-700 w-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                    ></motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FeaturedProducts;