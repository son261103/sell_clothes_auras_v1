import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
    // Hero image URL from Unsplash (royalty-free)
    const heroImageUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80";

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section className="relative h-[90vh] overflow-hidden">
            {/* Gradient overlay with reduced opacity */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-primary/20 z-10"></div>

            {/* Background image with parallax effect */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageUrl})` }}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5, ease: "easeOut" }}
            ></motion.div>

            {/* Hero content */}
            <motion.div
                className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4 text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-md"
                    variants={itemVariants}
                >
                    Phong Cách Mỗi Ngày
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl mb-6 max-w-2xl text-white drop-shadow-sm"
                    variants={itemVariants}
                >
                    Khám phá bộ sưu tập mới kết hợp giữa phong cách, sự thoải mái và tính bền vững.
                </motion.p>

                <motion.div
                    className="flex gap-4 flex-wrap justify-center"
                    variants={itemVariants}
                >
                    <Link
                        to="/collection/new"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full transition duration-300 shadow-md transform hover:translate-y-[-2px]"
                    >
                        Hàng Mới Về
                    </Link>
                    <Link
                        to="/collection/all"
                        className="bg-transparent border-2 border-white hover:bg-white/20 text-white px-8 py-3 rounded-full transition duration-300 shadow-md transform hover:translate-y-[-2px]"
                    >
                        Xem Bộ Sưu Tập
                    </Link>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
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
                    >
                        <path d="M7 13l5 5 5-5"></path>
                        <path d="M7 6l5 5 5-5"></path>
                    </svg>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;