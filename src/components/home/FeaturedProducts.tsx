import React from 'react';
import { Link } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew: boolean;
    rating: number;
}

const FeaturedProducts: React.FC = () => {
    const featuredProducts: Product[] = [
        {
            id: 1,
            name: 'Váy Mùa Hè Thanh Lịch',
            price: 1800000,
            image: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'váy',
            isNew: true,
            rating: 4.5,
        },
        {
            id: 2,
            name: 'Áo Khoác Denim Cá Tính',
            price: 2100000,
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'áo khoác',
            isNew: true,
            rating: 4.8,
        },
        {
            id: 3,
            name: 'Quần Jeans Dáng Cơ Bản',
            price: 1450000,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'quần',
            isNew: false,
            rating: 4.3,
        },
        {
            id: 4,
            name: 'Áo Sơ Mi Họa Tiết Hoa',
            price: 1250000,
            image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'áo',
            isNew: false,
            rating: 4.6,
        },
        {
            id: 5,
            name: 'Váy Maxi Dạ Hội',
            price: 2500000,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'váy',
            isNew: true,
            rating: 4.7,
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center mb-6 border-b border-primary/10 dark:border-primary/20 pb-3">
                <div data-aos="fade-right">
                    <h2 className="text-3xl font-bold text-primary tracking-tight">Sản Phẩm Nổi Bật</h2>
                    <p className="text-secondary/70 dark:text-textLight/70 mt-2 text-base">Khám phá những thiết kế thời thượng được yêu thích nhất</p>
                </div>
                <Link
                    to="/collection/featured"
                    className="text-primary hover:text-primary/80 transition flex items-center gap-2 font-semibold text-base"
                    data-aos="fade-left"
                >
                    Xem Tất Cả
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredProducts.map((product) => (
                    <div key={product.id} data-aos="fade-up" data-aos-delay={product.id * 100}>
                        <ProductCardVN product={product} formatPrice={formatPrice} />
                    </div>
                ))}
            </div>
        </section>
    );
};

const ProductCardVN: React.FC<{ product: Product; formatPrice: (price: number) => string }> = ({ product, formatPrice }) => {
    return (
        <div className="group bg-white dark:bg-secondary/10 rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-highlight/10 dark:border-secondary/30 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30">
            <div className="relative h-64 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                </Link>
                {product.isNew && (
                    <div className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        MỚI
                    </div>
                )}
                <button
                    className="absolute top-3 right-3 text-white hover:text-primary transition-colors duration-300 bg-darkBackground/50 p-1.5 rounded-full group-hover:bg-white/90"
                    aria-label="Thêm vào yêu thích"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div className="absolute inset-0 bg-primary/25 dark:bg-darkBackground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                        className="bg-white dark:bg-secondary text-primary dark:text-highlight px-5 py-2 rounded-full transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-primary hover:text-white shadow-sm"
                        aria-label="Thêm vào giỏ hàng"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="font-medium">Thêm vào giỏ</span>
                    </button>
                </div>
            </div>
            <div className="p-4">
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-textDark dark:text-textLight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 truncate">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-1 mt-2 text-accent">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={i < Math.floor(product.rating) ? 'fill-accent' : 'text-highlight/30 dark:text-gray-600'}
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    ))}
                    <span className="text-sm text-secondary/70 dark:text-gray-400 ml-1">{product.rating}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <p className="font-bold text-primary text-lg">{formatPrice(product.price)}</p>
                    <span className="text-sm text-secondary/60 dark:text-gray-400 capitalize bg-highlight/10 dark:bg-secondary/20 px-2.5 py-1 rounded-full group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300">{product.category}</span>
                </div>
            </div>
        </div>
    );
};

export default FeaturedProducts;