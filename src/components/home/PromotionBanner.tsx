import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';

const PromotionBanner: React.FC = () => {
    const promotionImageUrl = "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80";

    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-4 bg-white dark:bg-secondary rounded-lg">
            <motion.div
                className="relative h-56 md:h-64 rounded-lg overflow-hidden shadow-sm border border-accent/10"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-primary/40 z-10" />
                <LazyLoadImage
                    src={promotionImageUrl}
                    alt="Khuyến mãi mùa hè"
                    effect="blur"
                    className="absolute inset-0 w-full h-full object-cover object-center transition duration-700 hover:scale-105"
                    wrapperClassName="absolute inset-0 w-full h-full"
                    placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                />
                <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <div className="bg-accent/90 px-4 py-1 rounded-lg mb-2 text-xs font-bold shadow-sm transform hover:scale-105 transition duration-300">
                            ƯU ĐÃI CÓ HẠN
                        </div>
                    </motion.div>

                    <motion.h2
                        className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        SALE HÈ 2025
                    </motion.h2>

                    <motion.p
                        className="text-sm md:text-base mb-4 text-white max-w-md drop-shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        Giảm giá lên đến 50% cho các sản phẩm được chọn. Đừng bỏ lỡ cơ hội này!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    >
                        <Link
                            to="/collection/sale"
                            className="bg-white text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-full transition duration-300 shadow-sm flex items-center gap-2 font-medium text-sm group"
                        >
                            <span>Mua Ngay</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="transform group-hover:translate-x-1 transition-transform duration-300"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>

                    {/* Timer countdown */}
                    <motion.div
                        className="absolute bottom-3 left-0 right-0 flex justify-center gap-2"
                        initial={{ opacity: 0, y: 5 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <div className="bg-black/50 px-2 py-1 rounded text-xs flex flex-col items-center">
                            <span className="font-bold">05</span>
                            <span className="text-[10px] text-white/80">Ngày</span>
                        </div>
                        <div className="bg-black/50 px-2 py-1 rounded text-xs flex flex-col items-center">
                            <span className="font-bold">12</span>
                            <span className="text-[10px] text-white/80">Giờ</span>
                        </div>
                        <div className="bg-black/50 px-2 py-1 rounded text-xs flex flex-col items-center">
                            <span className="font-bold">45</span>
                            <span className="text-[10px] text-white/80">Phút</span>
                        </div>
                        <div className="bg-black/50 px-2 py-1 rounded text-xs flex flex-col items-center">
                            <span className="font-bold">30</span>
                            <span className="text-[10px] text-white/80">Giây</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default PromotionBanner;