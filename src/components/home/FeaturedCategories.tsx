import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface Category {
    id: number;
    name: string;
    displayName: string;
    image: string;
    count: number;
    description?: string;
}

const FeaturedCategories: React.FC = () => {
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

    const categories: Category[] = [
        {
            id: 1,
            name: 'dresses',
            displayName: 'Váy',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 42,
            description: 'Từ váy dự tiệc đến váy hàng ngày, tất cả đều thể hiện sự thanh lịch và phong cách.',
        },
        {
            id: 2,
            name: 'tops',
            displayName: 'Áo',
            image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 56,
            description: 'Những chiếc áo đa dạng với nhiều phong cách khác nhau từ basic đến sành điệu.',
        },
        {
            id: 3,
            name: 'bottoms',
            displayName: 'Quần',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 38,
            description: 'Quần jeans, quần tây, quần short... đa dạng kiểu dáng cho mọi dịp.',
        },
        {
            id: 4,
            name: 'outerwear',
            displayName: 'Áo Khoác',
            image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 24,
            description: 'Áo khoác phong cách, vừa giữ ấm vừa tôn lên vẻ đẹp thời trang của bạn.',
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.2
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
        <section className="px-4 md:px-8 max-w-7xl bg-white dark:dark:bg-secondary rounded-xl mx-auto py-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-primary/10 dark:border-primary/20 pb-3">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl font-bold text-primary tracking-tight">Danh Mục Sản Phẩm</h2>
                    <p className="text-secondary/70 dark:text-textLight/70 mt-1 text-sm max-w-xl">
                        Khám phá những bộ sưu tập dành riêng cho bạn
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {categories.map((category) => (
                    <motion.div
                        key={category.id}
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <Link
                            to={`/category/${category.name.toLowerCase()}`}
                            className="group block transition-all duration-300 ease-out"
                        >
                            <motion.div
                                className="relative h-56 md:h-64 rounded-lg overflow-hidden shadow-sm border border-highlight/10 dark:border-secondary/30 bg-white dark:bg-secondary/10 group-hover:shadow-md group-hover:border-primary/20 dark:group-hover:border-primary/30 transition-all duration-300"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent z-10 transition-colors duration-500 ${
                                    hoveredCategory === category.id ? 'from-primary/50 via-primary/20' : ''
                                }`}></div>

                                <LazyLoadImage
                                    src={category.image}
                                    alt={category.displayName}
                                    className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ${
                                        hoveredCategory === category.id ? 'scale-110' : 'scale-100'
                                    }`}
                                    wrapperClassName="absolute inset-0 w-full h-full"
                                    placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                                    effect="blur"
                                />

                                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white bg-gradient-to-t from-black/60 to-transparent transition-transform duration-500">
                                    <h3 className="text-lg md:text-xl font-bold tracking-tight drop-shadow-md">{category.displayName}</h3>

                                    {category.description && (
                                        <motion.p
                                            className={`text-xs text-white/90 mt-1 max-w-xs line-clamp-2 transition-opacity duration-300 ${
                                                hoveredCategory === category.id ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: hoveredCategory === category.id ? 1 : 0,
                                                height: hoveredCategory === category.id ? 'auto' : 0,
                                                marginTop: hoveredCategory === category.id ? 4 : 0
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {category.description}
                                        </motion.p>
                                    )}

                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs md:text-sm text-white/90 font-medium">
                                            {category.count} sản phẩm
                                        </p>
                                        <span className={`w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 transform ${
                                            hoveredCategory === category.id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18l6-6-6-6"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {/* Category tag */}
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-primary/80 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                                        {category.displayName}
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default FeaturedCategories;