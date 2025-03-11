import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.2 });

    // Parallax scroll effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

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

    // Toggle expanded category
    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (expandedCategory === id) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(id);
        }
    };

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
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", stiffness: 100 }
        }
    };

    return (
        <section
            className="px-4 md:px-8 max-w-7xl bg-white dark:bg-secondary rounded-xl mx-auto py-8 overflow-hidden"
            ref={containerRef}
        >
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
                        Danh Mục Sản Phẩm
                    </motion.h2>
                    <motion.p
                        className="text-secondary/70 dark:text-textLight/70 mt-1 text-sm max-w-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Khám phá những bộ sưu tập dành riêng cho bạn
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-3 md:mt-0"
                >
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

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{ y }}
            >
                {categories.map((category) => {
                    const isExpanded = expandedCategory === category.id;

                    return (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <motion.div
                                className={`group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-all duration-500 ${
                                    isExpanded ? 'h-80' : 'h-64'
                                }`}
                                layoutId={`container-${category.id}`}
                                onClick={(e) => toggleExpand(category.id, e)}
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                }}
                            >
                                <Link
                                    to={`/category/${category.name.toLowerCase()}`}
                                    className="block w-full h-full"
                                    onClick={e => {
                                        // Only prevent default if we're expanding, otherwise navigate
                                        if (!isExpanded) e.preventDefault();
                                    }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent z-10 transition-colors duration-500"
                                        animate={{
                                            opacity: hoveredCategory === category.id || isExpanded ? 1 : 0.7
                                        }}
                                    ></motion.div>

                                    <LazyLoadImage
                                        src={category.image}
                                        alt={category.displayName}
                                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700"
                                        wrapperClassName="absolute inset-0 w-full h-full"
                                        placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                                        effect="blur"
                                        style={{
                                            transform: hoveredCategory === category.id || isExpanded ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    />

                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white"
                                        layoutId={`content-${category.id}`}
                                    >
                                        <motion.h3
                                            className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md"
                                            layoutId={`title-${category.id}`}
                                        >
                                            {category.displayName}
                                        </motion.h3>

                                        <motion.div
                                            className="overflow-hidden"
                                            animate={{
                                                height: isExpanded ? 'auto' : 0,
                                                opacity: isExpanded ? 1 : 0
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {category.description && (
                                                <motion.p className="text-sm text-white/90 mt-2 max-w-xs">
                                                    {category.description}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        <motion.div
                                            className="flex items-center justify-between mt-2"
                                            layoutId={`info-${category.id}`}
                                        >
                                            <p className="text-xs md:text-sm text-white/90 font-medium">
                                                {category.count} sản phẩm
                                            </p>

                                            <motion.div
                                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                                                whileTap={{ scale: 0.9 }}
                                                animate={{
                                                    rotate: isExpanded ? 180 : 0
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
                                                </svg>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Category tag */}
                                    <motion.div
                                        className="absolute top-4 left-4 z-20"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <motion.span
                                            className="bg-primary/80 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--color-primary), 0.9)" }}
                                        >
                                            {category.displayName}
                                        </motion.span>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Floating navigation dots */}
            <motion.div
                className="flex justify-center mt-8 gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {categories.map((category) => (
                    <motion.button
                        key={`nav-${category.id}`}
                        className={`w-3 h-3 rounded-full ${expandedCategory === category.id ? 'bg-primary' : 'bg-primary/30'}`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpandedCategory(category.id)}
                    />
                ))}
            </motion.div>
        </section>
    );
};

export default FeaturedCategories;