import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
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
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <section className="px-4 py-4 md:px-8 max-w-7xl mx-auto py-2  bg-white dark:bg-secondary rounded-lg">
            <div className="text-center mb-3">
                <motion.h2
                    className="text-2xl font-bold mb-1 text-primary"
                    initial={{ opacity: 0, y: -5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                >
                    Instagram Của Chúng Tôi
                </motion.h2>
                <motion.p
                    className="max-w-xl mx-auto text-secondary/80 dark:text-textLight/80 text-sm mb-3"
                    initial={{ opacity: 0, y: -5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    Theo dõi chúng tôi{' '}
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold inline-flex items-center gap-1 hover:text-primary/80 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        @AURAS
                    </a>{' '}
                    để cập nhật các xu hướng mới nhất
                </motion.p>
            </div>

            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
            >
                {instagramPosts.map((post) => (
                    <motion.a
                        key={post.id}
                        href="#"
                        className="relative group overflow-hidden aspect-square rounded-md shadow-sm border border-highlight/10 dark:border-secondary/30"
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredPost(post.id)}
                        onMouseLeave={() => setHoveredPost(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LazyLoadImage
                            src={post.image}
                            alt={`Ảnh Instagram ${post.id}`}
                            effect="blur"
                            className={`w-full h-full object-cover transition duration-500 ${
                                hoveredPost === post.id ? 'scale-110' : 'scale-100'
                            }`}
                            wrapperClassName="w-full h-full"
                            placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                        />
                        <div
                            className={`absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 flex flex-col items-center justify-center transition-opacity duration-300 p-2 ${
                                hoveredPost === post.id ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-white flex items-center gap-1 text-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    {post.likes}
                                </span>
                                <span className="text-white flex items-center gap-1 text-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    {post.comments}
                                </span>
                            </div>
                            <p className="text-white text-[10px] text-center line-clamp-2">
                                {post.caption}
                            </p>
                        </div>

                        {/* Instagram icon overlay when not hovered */}
                        <div
                            className={`absolute top-1 right-1 text-white bg-primary/70 p-0.5 rounded-full transition-opacity duration-300 ${
                                hoveredPost === post.id ? 'opacity-0' : 'opacity-100'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </div>
                    </motion.a>
                ))}
            </motion.div>

            <div className="text-center mt-3">
                <motion.a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-1.5 border border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-white transition duration-300 text-sm"
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Theo dõi @AURAS
                </motion.a>
            </div>
        </section>
    );
};

export default InstagramFeed;