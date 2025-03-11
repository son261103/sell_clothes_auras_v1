import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';

interface Testimonial {
    id: number;
    name: string;
    avatar: string;
    role: string;
    content: string;
    rating: number;
}

const TestimonialSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    const [isHovered, setIsHovered] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });

    // Parallax scroll effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Nguyễn Thị Minh",
            avatar: "/api/placeholder/50/50",
            role: "Khách hàng thân thiết",
            content: "Tôi đã mua sắm ở AURAS được hơn một năm và cực kỳ hài lòng với chất lượng sản phẩm. Váy của họ luôn vừa vặn hoàn hảo và bền đẹp qua nhiều lần giặt. Dịch vụ khách hàng cũng xuất sắc!",
            rating: 5
        },
        {
            id: 2,
            name: "Trần Văn Hoàng",
            avatar: "/api/placeholder/50/50",
            role: "Nhà thiết kế thời trang",
            content: "AURAS không chỉ cung cấp những thiết kế thời trang mà còn cam kết với sự bền vững. Tôi đánh giá cao cách họ sử dụng vải thân thiện với môi trường và quy trình sản xuất có trách nhiệm.",
            rating: 4
        },
        {
            id: 3,
            name: "Lê Thu Hà",
            avatar: "/api/placeholder/50/50",
            role: "Blogger thời trang",
            content: "Bộ sưu tập mùa hè của AURAS là điểm sáng trong tủ đồ của tôi. Những mẫu áo sơ mi họa tiết luôn nhận được lời khen mỗi khi tôi diện chúng. Giá cả phải chăng cho chất lượng tuyệt vời.",
            rating: 5
        },
        {
            id: 4,
            name: "Phạm Minh Tuấn",
            avatar: "/api/placeholder/50/50",
            role: "Nhiếp ảnh gia thời trang",
            content: "Tôi thường xuyên lựa chọn trang phục từ AURAS cho các buổi chụp hình. Chất liệu vải cao cấp và thiết kế tinh tế luôn mang lại kết quả tuyệt vời trong mỗi bức ảnh.",
            rating: 5
        },
        {
            id: 5,
            name: "Võ Thị Thanh Hà",
            avatar: "/api/placeholder/50/50",
            role: "Người mẫu thời trang",
            content: "AURAS luôn mang đến những thiết kế vừa thời thượng vừa thoải mái. Khi mặc trang phục của họ, tôi cảm thấy tự tin và thoải mái trong mỗi bước đi trên sàn catwalk.",
            rating: 4
        }
    ];

    // Auto-scroll testimonials (slower when hovered)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isHovered) {
                nextTestimonial();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex, isHovered]);

    const prevTestimonial = () => {
        setDirection(-1);
        setActiveIndex(prevIndex => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };

    const nextTestimonial = () => {
        setDirection(1);
        setActiveIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    };

    const goToTestimonial = (index: number) => {
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    // Animation variants for main card
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? 15 : -15
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? -15 : 15
        })
    };

    // Decorative background testimonial cards
    const generateBackgroundCards = () => {
        return Array.from({ length: 8 }).map((_, index) => {
            const xOffset = Math.random() * 140 - 70; // Between -70 and 70
            const yOffset = Math.random() * 80 - 40; // Between -40 and 40
            const scale = 0.7 + Math.random() * 0.2; // Between 0.7 and 0.9
            const rotation = Math.random() * 20 - 10; // Between -10 and 10 degrees

            return (
                <motion.div
                    key={`bg-card-${index}`}
                    className="absolute bg-white/30 dark:bg-primary/5 w-full h-full rounded-xl"
                    style={{
                        top: `${yOffset}px`,
                        left: `${xOffset}px`,
                        scale: scale,
                        rotate: rotation,
                        zIndex: index
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                ></motion.div>
            );
        });
    };

    // Rating star animation
    const starVariants = {
        initial: { scale: 0, opacity: 0 },
        animate: (index: number) => ({
            scale: 1,
            opacity: 1,
            transition: {
                delay: 0.2 + index * 0.1,
                duration: 0.3,
                type: "spring",
                stiffness: 300
            }
        })
    };

    return (
        <section
            className="px-4 py-8 md:px-8 max-w-7xl mx-auto bg-white dark:bg-secondary rounded-xl overflow-hidden"
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-primary/10 dark:border-primary/20 pb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
            >
                <div>
                    <motion.h2
                        className="text-3xl font-bold text-primary tracking-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Khách Hàng Nói Gì
                    </motion.h2>
                    <motion.p
                        className="text-secondary/70 dark:text-textLight/70 mt-1 text-base"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Những đánh giá chân thực từ khách hàng về trải nghiệm mua sắm tại AURAS
                    </motion.p>
                </div>

                <motion.div
                    className="mt-3 md:mt-0 flex gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.button
                        onClick={prevTestimonial}
                        className="bg-primary/10 text-primary p-2 rounded-full transition hover:bg-primary hover:text-white"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </motion.button>
                    <motion.button
                        onClick={nextTestimonial}
                        className="bg-primary/10 text-primary p-2 rounded-full transition hover:bg-primary hover:text-white"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </motion.button>
                </motion.div>
            </motion.div>

            <motion.div
                className="relative mt-8 md:mt-12 min-h-[300px] md:min-h-[250px]"
                style={{ y, opacity }}
            >
                {/* Background decorative cards */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {generateBackgroundCards()}
                </div>

                {/* Main testimonial container */}
                <div className="relative overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={activeIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.3 },
                                rotateY: { duration: 0.6 }
                            }}
                            className="w-full md:max-w-3xl mx-auto perspective-1000"
                        >
                            <div className="bg-white dark:bg-secondary/30 rounded-xl p-6 shadow-xl border border-highlight/10 dark:border-primary/20 transform-gpu backface-hidden">
                                {/* Quote mark */}
                                <div className="relative">
                                    <motion.div
                                        className="absolute -top-6 -left-2 text-6xl text-primary/20 font-serif"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        "
                                    </motion.div>

                                    <div className="flex flex-col md:flex-row gap-6 pt-4">
                                        {/* Avatar and info */}
                                        <motion.div
                                            className="flex-shrink-0 flex flex-col items-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        >
                                            <div className="relative">
                                                <motion.div
                                                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <img
                                                        src={testimonials[activeIndex].avatar}
                                                        alt={testimonials[activeIndex].name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </motion.div>
                                                <motion.div
                                                    className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-md"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5, type: "spring" }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                </motion.div>
                                            </div>

                                            <motion.h3
                                                className="text-lg font-bold text-primary mt-4"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {testimonials[activeIndex].name}
                                            </motion.h3>
                                            <motion.p
                                                className="text-secondary/70 dark:text-textLight/70 text-sm"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                {testimonials[activeIndex].role}
                                            </motion.p>

                                            {/* Star rating */}
                                            <div className="flex mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        custom={i}
                                                        variants={starVariants}
                                                        initial="initial"
                                                        animate="animate"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill={i < testimonials[activeIndex].rating ? "currentColor" : "none"}
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            className={i < testimonials[activeIndex].rating ? 'text-accent' : 'text-highlight/30 dark:text-gray-600'}
                                                        >
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                        </svg>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        {/* Testimonial content */}
                                        <div className="flex-grow">
                                            <motion.blockquote
                                                className="italic text-textDark dark:text-textLight/90 text-lg md:text-xl font-light leading-relaxed"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4, duration: 0.6 }}
                                            >
                                                {testimonials[activeIndex].content}
                                                <motion.div
                                                    className="absolute -bottom-6 -right-2 text-6xl text-primary/20 font-serif"
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.7, duration: 0.5 }}
                                                >
                                                    "
                                                </motion.div>
                                            </motion.blockquote>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Indicators */}
                <div className="flex justify-center mt-8 mb-2 gap-3">
                    {testimonials.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToTestimonial(index)}
                            className={`h-3 rounded-full transition-all duration-300 ${
                                index === activeIndex
                                    ? 'w-10 bg-primary shadow-md'
                                    : 'w-3 bg-primary/30'
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
                className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            />

            <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/5 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 2
                }}
            />
        </section>
    );
};

export default TestimonialSection;