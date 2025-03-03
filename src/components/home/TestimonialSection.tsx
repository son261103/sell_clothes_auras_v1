import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        }
    ];

    // Auto-scroll testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            nextTestimonial();
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex]);

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

    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
        })
    };

    return (
        <section className="px-4 py-4 md:px-8 max-w-7xl mx-auto py-2  bg-white dark:bg-secondary rounded-lg">
            <div className="flex justify-between items-center mb-3 border-b border-primary/10 dark:border-primary/20 pb-2">
                <div>
                    <h2 className="text-2xl font-bold text-primary tracking-tight">
                        Sản Phẩm Nổi Bật
                    </h2>
                    <p className="text-secondary/70 dark:text-textLight/70 mt-1 text-sm">
                        Khám phá những thiết kế thời thượng được yêu thích nhất
                    </p>
                </div>
            </div>

            <div className="relative mt-3">
                {/* Main testimonial container */}
                <div className="overflow-hidden relative h-[200px] md:h-[180px]">
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
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute w-full px-2"
                        >
                            <div className="bg-white dark:bg-secondary/10 rounded-lg p-4 shadow-sm border border-highlight/10 dark:border-secondary/30">
                                <div className="flex items-center mb-2">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={testimonials[activeIndex].avatar}
                                            alt={testimonials[activeIndex].name}
                                            className="h-12 w-12 rounded-full object-cover border-2 border-primary"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-base font-bold text-textDark dark:text-textLight">
                                            {testimonials[activeIndex].name}
                                        </h3>
                                        <p className="text-secondary/70 dark:text-textLight/70 text-xs">
                                            {testimonials[activeIndex].role}
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill={i < testimonials[activeIndex].rating ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    className={i < testimonials[activeIndex].rating ? 'text-accent' : 'text-highlight/30 dark:text-gray-600'}
                                                >
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <blockquote className="mt-2 italic text-textDark dark:text-textLight/90 text-sm md:text-base line-clamp-3">
                                    "{testimonials[activeIndex].content}"
                                </blockquote>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Indicators */}
                <div className="flex justify-center mt-4 mb-2 gap-2">
                    {testimonials.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToTestimonial(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeIndex
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-primary/30'
                            }`}
                            whileHover={{ scale: 1.5 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <motion.button
                    onClick={prevTestimonial}
                    className="absolute top-[90px] md:top-[75px] left-0 md:-left-1 bg-white dark:bg-secondary/80 text-primary shadow-sm rounded-full p-1.5 hidden md:flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 z-10"
                    aria-label="Previous testimonial"
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </motion.button>

                <motion.button
                    onClick={nextTestimonial}
                    className="absolute top-[90px] md:top-[75px] right-0 md:-right-1 bg-white dark:bg-secondary/80 text-primary shadow-sm rounded-full p-1.5 hidden md:flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 z-10"
                    aria-label="Next testimonial"
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </motion.button>
            </div>
        </section>
    );
};

export default TestimonialSection;