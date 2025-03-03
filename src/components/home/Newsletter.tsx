import React, { useState, FormEvent, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate email
        if (!email) {
            toast.error('Vui lòng nhập địa chỉ email của bạn');
            return;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }

        // Simulate API call
        setIsSubmitting(true);

        setTimeout(() => {
            toast.success('Cảm ơn bạn đã đăng ký nhận bản tin!');
            setEmail('');
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <section className="py-4 px-4 md:px-8 bg-white dark:bg-secondary rounded-xl max-w-7xl mx-auto">
            <motion.div
                className="bg-gradient-to-r from-primary/5 to-primary/15 dark:from-primary/10 dark:to-primary/20 rounded-lg p-4 md:p-5 border border-primary/10 shadow-sm"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <h2 className="text-xl font-bold mb-1 text-primary">Đăng Ký Nhận Tin</h2>
                        <p className="mb-3 text-secondary dark:text-textLight/80 text-sm">
                            Đăng ký để nhận thông tin về ưu đãi đặc biệt, quà tặng miễn phí và các ưu đãi độc quyền.
                        </p>
                    </motion.div>

                    <motion.form
                        className="flex flex-col sm:flex-row gap-2"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="relative flex-grow">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input
                                type="email"
                                placeholder="Địa chỉ email của bạn"
                                className="w-full pl-9 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/60 border border-primary/20 dark:border-primary/30 dark:bg-secondary/10 dark:text-textLight shadow-sm transition-all duration-300 text-sm"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full transition duration-300 shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Đăng Ký"
                            )}
                        </motion.button>
                    </motion.form>

                    <motion.p
                        className="mt-2 text-xs text-secondary/60 dark:text-textLight/60 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        Bằng cách đăng ký, bạn đồng ý với Chính sách quyền riêng tư và Điều khoản dịch vụ của chúng tôi.
                    </motion.p>
                </div>
            </motion.div>
        </section>
    );
};

export default Newsletter;