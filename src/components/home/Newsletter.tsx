import React, { useState, FormEvent, ChangeEvent, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.5 });

    // Parallax scroll effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate email
        if (!email) {
            toast.error('Vui lòng nhập địa chỉ email của bạn', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            return;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Vui lòng nhập địa chỉ email hợp lệ', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            return;
        }

        // Simulate API call
        setIsSubmitting(true);

        setTimeout(() => {
            toast.success('Cảm ơn bạn đã đăng ký nhận bản tin!', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#10b981',
                    secondary: '#FFFAEE',
                },
            });
            setEmail('');
            setIsSubmitting(false);
            setIsSubscribed(true);

            // Reset after 5 seconds to allow subscribing again
            setTimeout(() => {
                setIsSubscribed(false);
            }, 5000);
        }, 1500);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section
            className="py-8 px-4 md:px-8 bg-white dark:bg-secondary rounded-xl max-w-7xl mx-auto"
            ref={containerRef}
        >
            <motion.div
                className="bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/15 dark:to-primary/25 rounded-2xl p-8 border border-primary/10 shadow-lg overflow-hidden relative"
                style={{ y, scale }}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {/* Decorative elements */}
                <motion.div
                    className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 180]
                    }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>

                <motion.div
                    className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, -180]
                    }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", delay: 2 }}
                ></motion.div>

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <motion.div variants={itemVariants}>
                        <motion.h2
                            className="text-2xl md:text-3xl font-bold mb-2 text-primary"
                            animate={{
                                scale: [1, 1.03, 1],
                                transition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
                            }}
                        >
                            Đăng Ký Nhận Tin
                        </motion.h2>
                        <motion.p
                            className="mb-6 text-secondary dark:text-textLight/80 text-base"
                            variants={itemVariants}
                        >
                            Đăng ký để nhận thông tin về ưu đãi đặc biệt, quà tặng miễn phí
                            và các ưu đãi độc quyền dành riêng cho bạn.
                        </motion.p>
                    </motion.div>

                    <motion.form
                        className="flex flex-col sm:flex-row gap-3"
                        onSubmit={handleSubmit}
                        variants={itemVariants}
                    >
                        <div className="relative flex-grow">
                            <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                animate={{
                                    y: [0, -2, 0],
                                    transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                                }}
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </motion.svg>
                            <motion.input
                                type="email"
                                placeholder="Địa chỉ email của bạn"
                                className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/60 border border-primary/20 dark:border-primary/30 dark:bg-secondary/10 dark:text-textLight shadow-md transition-all duration-300 text-base"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                disabled={isSubmitting || isSubscribed}
                                whileFocus={{ scale: 1.01 }}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-xl transition duration-300 shadow-md font-medium text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isSubmitting || isSubscribed}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            variants={itemVariants}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : isSubscribed ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Đã đăng ký</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng Ký</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </>
                            )}
                        </motion.button>
                    </motion.form>

                    <motion.p
                        className="mt-4 text-xs text-secondary/70 dark:text-textLight/60 max-w-md mx-auto"
                        variants={itemVariants}
                    >
                        Bằng cách đăng ký, bạn đồng ý với <motion.a
                        href="#"
                        className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                        whileHover={{ scale: 1.1 }}
                    >
                        Chính sách quyền riêng tư
                    </motion.a> và <motion.a
                        href="#"
                        className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                        whileHover={{ scale: 1.1 }}
                    >
                        Điều khoản dịch vụ
                    </motion.a> của chúng tôi.
                    </motion.p>

                    {/* Benefits badges */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-3 mt-6"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-gray-700 dark:text-white/90 font-medium">Giảm giá độc quyền</span>
                        </motion.div>

                        <motion.div
                            className="bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-gray-700 dark:text-white/90 font-medium">Thông tin sản phẩm mới</span>
                        </motion.div>

                        <motion.div
                            className="bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-gray-700 dark:text-white/90 font-medium">Quà tặng sinh nhật</span>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default Newsletter;