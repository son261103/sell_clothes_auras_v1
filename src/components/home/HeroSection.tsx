import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const HeroSection: React.FC = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const sectionRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Nghệ thuật và thời trang cao cấp hơn
    const heroImages = [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90",
        "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90"
    ];

    // Enhanced parallax effect setup
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 800], [0, 280]);
    const opacity = useTransform(scrollY, [0, 300, 500], [1, 0.7, 0.2]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.15]);
    const textY = useTransform(scrollY, [0, 400], [0, 120]);
    const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Improved image preloading with progress tracking
    useEffect(() => {
        let loadedCount = 0;
        const totalImages = heroImages.length;

        const preloadImages = () => {
            heroImages.forEach(src => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    loadedCount++;
                    setLoadingProgress((loadedCount / totalImages) * 100);

                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                        // Smoother text reveal after images are loaded
                        setTimeout(() => {
                            setIsTextVisible(true);
                        }, 500);
                    }
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${src}`);
                    loadedCount++;
                    setLoadingProgress((loadedCount / totalImages) * 100);

                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                        setTimeout(() => {
                            setIsTextVisible(true);
                        }, 500);
                    }
                };
            });
        };

        preloadImages();
    }, []);

    // Enhanced carousel effect with smoother transitions
    useEffect(() => {
        if (!imagesLoaded) return;

        const interval = setInterval(() => {
            setIsTextVisible(false);

            setTimeout(() => {
                setCurrentImage((prev) => (prev + 1) % heroImages.length);

                setTimeout(() => {
                    setIsTextVisible(true);
                }, 600);
            }, 800);
        }, 8000); // Longer display time for better user experience

        return () => clearInterval(interval);
    }, [imagesLoaded]);

    // Improved animation variants for smoother transitions
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25,
                delayChildren: 0.4,
                ease: "easeOut",
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 1,
                ease: "easeOut",
                type: "spring",
                stiffness: 80,
                damping: 18
            }
        }
    };

    const arrowAnimation = {
        y: [0, 10, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "loop" as const,
            ease: "easeInOut"
        }
    };

    return (
        <motion.section
            ref={sectionRef}
            className="relative h-[100vh] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Enhanced loading state with progress indicator */}
            {!imagesLoaded && (
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <motion.div className="relative w-20 h-20">
                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            className="absolute inset-0"
                        >
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="8"
                                fill="none"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="white"
                                strokeWidth="8"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: loadingProgress / 100 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                            />
                        </motion.svg>
                    </motion.div>
                    <motion.p
                        className="text-white mt-4 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {Math.round(loadingProgress)}%
                    </motion.p>
                </div>
            )}

            {/* Enhanced gradient overlay with smoother transitions */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-primary/40 z-10"
                style={{ opacity }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            ></motion.div>

            {/* Background image carousel with enhanced parallax effect */}
            <div ref={carouselRef} className="absolute inset-0">
                <AnimatePresence mode="wait">
                    {imagesLoaded && (
                        <motion.div
                            key={`image-${currentImage}`}
                            className="absolute inset-0 bg-cover bg-center h-[110%]" // Extra height for parallax
                            style={{
                                backgroundImage: `url(${heroImages[currentImage]})`,
                                backgroundPosition: 'center 30%', // Adjust vertical position to better frame subject
                                y,
                                scale
                            }}
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(8px)" }}
                            transition={{
                                duration: 1.5,
                                ease: [0.645, 0.045, 0.355, 1.000], // Custom cubic bezier
                            }}
                        ></motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Image indicators/dots */}
            {imagesLoaded && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                    {heroImages.map((_, index) => (
                        <motion.button
                            key={index}
                            type="button"
                            className={`w-2.5 h-2.5 rounded-full ${
                                currentImage === index ? "bg-white" : "bg-white/40"
                            }`}
                            onClick={() => {
                                setIsTextVisible(false);
                                setTimeout(() => {
                                    setCurrentImage(index);
                                    setTimeout(() => {
                                        setIsTextVisible(true);
                                    }, 600);
                                }, 400);
                            }}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 1.5 + index * 0.1,
                                duration: 0.5
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Enhanced Hero content with better animations */}
            <motion.div
                className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4 text-center"
                variants={containerVariants}
                initial="hidden"
                animate={isTextVisible ? "visible" : "hidden"}
                style={{ y: textY, opacity: textOpacity }}
            >
                <AnimatePresence mode="wait">
                    {isTextVisible && (
                        <motion.div
                            key={`text-${currentImage}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8 max-w-4xl mx-auto"
                        >
                            {/* Text content without background */}
                            <div className="text-center mt-[-50px]">
                                <motion.h1
                                    className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] tracking-wide"
                                    variants={itemVariants}
                                >
                                    Phong Cách Mỗi Ngày
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] font-light max-w-2xl mx-auto"
                                    variants={itemVariants}
                                >
                                    Khám phá bộ sưu tập mới kết hợp giữa phong cách, sự thoải mái và tính bền vững.
                                </motion.p>
                            </div>

                            {/* Removed buttons as requested */}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced discover more section */}
                <motion.div
                    className="absolute bottom-32 md:bottom-36 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1 }}
                >
                    <motion.p className="text-white/90 text-base font-medium mb-2 drop-shadow-md">
                        Khám phá thêm
                    </motion.p>
                    <motion.div
                        animate={arrowAnimation}
                        whileHover={{ scale: 1.2 }}
                        className="cursor-pointer"
                        onClick={() => {
                            if (sectionRef.current) {
                                const nextSection = sectionRef.current.nextElementSibling;
                                if (nextSection) {
                                    nextSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white drop-shadow-md"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Decorative floating particles effect */}
            {imagesLoaded && (
                <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-white/30 backdrop-blur-sm"
                            initial={{
                                x: Math.random() * 100 + "%",
                                y: Math.random() * 100 + "%",
                                opacity: Math.random() * 0.5 + 0.2
                            }}
                            animate={{
                                y: [0, -100, 0],
                                x: [0, Math.random() > 0.5 ? 20 : -20, 0],
                                opacity: [0.2, Math.random() * 0.7 + 0.3, 0.2]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                scale: Math.random() * 2 + 0.5,
                                filter: `blur(${Math.random() > 0.8 ? "1px" : "0px"})`
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.section>
    );
};

export default HeroSection;