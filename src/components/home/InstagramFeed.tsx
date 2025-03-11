import React, { useState, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface InstagramPost {
    id: number;
    image: string;
    likes: number;
    comments: number;
    caption: string;
}

const InstagramFeed: React.FC = () => {
    const [hoveredPost, setHoveredPost] = useState<number | null>(null);
    const [expandedPost, setExpandedPost] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.2 });

    // Parallax scroll effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

    const instagramPosts: InstagramPost[] = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 123,
            comments: 14,
            caption: 'Phong cách mùa hè đầy năng động #AURAS #SummerCollection'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 87,
            comments: 9,
            caption: 'Váy hoa xinh xắn cho ngày nắng #AURAS #FashionStyle'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 245,
            comments: 31,
            caption: 'Thiết kế mới nhất đã có mặt tại cửa hàng #AURAS #NewArrival'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 167,
            comments: 24,
            caption: 'Mix & match với phong cách đường phố #AURAS #StreetStyle'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 92,
            comments: 8,
            caption: 'Thời trang công sở thanh lịch #AURAS #OfficeWear'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 134,
            comments: 19,
            caption: 'Phụ kiện hoàn hảo cho mọi outfit #AURAS #Accessories'
        },
    ];

    // Animation variants for staggered children
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 100
            }
        }
    };

    const handleExpand = (id: number) => {
        setExpandedPost(expandedPost === id ? null : id);
    };

    return (
        <section
            className="px-4 py-8 md:px-8 max-w-7xl mx-auto bg-white dark:bg-secondary rounded-xl overflow-hidden"
            ref={containerRef}
        >
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2
                    className="text-3xl font-bold mb-2 text-primary inline-flex items-center gap-2"
                    animate={{
                        scale: [1, 1.03, 1],
                        transition: { duration: 3, repeat: Infinity }
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-accent"
                    >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Instagram Của Chúng Tôi
                </motion.h2>
                <motion.p
                    className="max-w-xl mx-auto text-secondary/80 dark:text-textLight/80 text-base mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Theo dõi chúng tôi{' '}
                    <motion.a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold inline-flex items-center gap-1 hover:text-primary/80 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        @AURAS
                    </motion.a>{' '}
                    để cập nhật các xu hướng mới nhất và cơ hội nhận quà
                </motion.p>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                style={{ y }}
            >
                {instagramPosts.map((post) => (
                    <motion.div
                        key={post.id}
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredPost(post.id)}
                        onMouseLeave={() => setHoveredPost(null)}
                        layoutId={`post-${post.id}`}
                        onClick={() => handleExpand(post.id)}
                    >
                        <motion.div
                            className="relative overflow-hidden aspect-square rounded-xl shadow-md border border-highlight/10 dark:border-secondary/30 cursor-pointer group"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <LazyLoadImage
                                src={post.image}
                                alt={`Ảnh Instagram ${post.id}`}
                                effect="blur"
                                className="w-full h-full object-cover transition duration-700"
                                wrapperClassName="w-full h-full"
                                placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                                style={{
                                    transform: hoveredPost === post.id ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />

                            {/* Overlay on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex flex-col items-center justify-center p-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredPost === post.id ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <motion.span
                                        className="text-white flex items-center gap-1 text-sm"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        {post.likes}
                                    </motion.span>
                                    <motion.span
                                        className="text-white flex items-center gap-1 text-sm"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                        </svg>
                                        {post.comments}
                                    </motion.span>
                                </div>
                                <p className="text-white text-sm text-center line-clamp-3">
                                    {post.caption}
                                </p>
                            </motion.div>

                            {/* Instagram icon and pulse effect */}
                            <motion.div
                                className="absolute top-2 right-2 text-white bg-primary/70 p-1 rounded-full"
                                initial={{ opacity: 1 }}
                                animate={{
                                    opacity: hoveredPost === post.id ? 0 : 1,
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    opacity: { duration: 0.3 },
                                    scale: { duration: 2, repeat: Infinity }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Follow button */}
            <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <motion.a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition duration-300 text-base group"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
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
                        className="group-hover:rotate-12 transition-transform duration-300"
                    >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Theo dõi @AURAS
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-1 transition-transform duration-300"
                    >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </motion.svg>
                </motion.a>
            </motion.div>

            {/* Expanded post modal */}
            <AnimatePresence>
                {expandedPost !== null && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedPost(null)}
                    >
                        <motion.div
                            layoutId={`post-${expandedPost}`}
                            className="bg-white dark:bg-secondary rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Image */}
                                <div className="md:w-2/3 relative overflow-hidden">
                                    <LazyLoadImage
                                        src={instagramPosts.find(post => post.id === expandedPost)?.image || ''}
                                        alt={`Instagram post ${expandedPost}`}
                                        effect="blur"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="md:w-1/3 p-4 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                            A
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">@AURAS</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Official Account</p>
                                        </div>
                                        <button
                                            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                            onClick={() => setExpandedPost(null)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Caption */}
                                    <div className="py-4 flex-grow overflow-auto">
                                        <p className="text-gray-800 dark:text-white text-sm">
                                            {instagramPosts.find(post => post.id === expandedPost)?.caption}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                            <span>{instagramPosts.find(post => post.id === expandedPost)?.likes} likes</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                            </svg>
                                            <span>{instagramPosts.find(post => post.id === expandedPost)?.comments} comments</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default InstagramFeed;