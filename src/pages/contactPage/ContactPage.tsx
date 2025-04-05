import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ContactPage: React.FC = () => {
    const { scrollY } = useScroll();
    const heroParallax = useTransform(scrollY, [0, 500], [0, -50]);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50, easing: 'ease-in-out' });
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <motion.section
                style={{ y: heroParallax }}
                className="relative bg-gradient-to-r from-primary/90 to-accent/90 text-white py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center overflow-hidden"
            >
                <div className="container mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
                    >
                        Liên Hệ Với Chúng Tôi
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light"
                    >
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ để được tư vấn và giải đáp mọi thắc mắc.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <a
                            href="#contact-form"
                            className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md mx-2"
                        >
                            Gửi Tin Nhắn
                        </a>
                        <a
                            href="#contact-info"
                            className="px-8 py-3 bg-transparent text-white border border-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 mx-2 mt-4 sm:mt-0 inline-block"
                        >
                            Thông Tin Liên Hệ
                        </a>
                    </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-12"
                        fill="currentColor"
                    >
                        <path
                            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                            opacity=".25"
                            className="fill-white dark:fill-gray-900"
                        />
                        <path
                            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                            opacity=".5"
                            className="fill-white dark:fill-gray-900"
                        />
                        <path
                            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                            className="fill-white dark:fill-gray-900"
                        />
                    </svg>
                </div>
            </motion.section>

            {/* Giới thiệu liên hệ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div data-aos="fade-right">
                            <div className="relative">
                                <div className="aspect-square bg-primary/10 rounded-lg overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1551489186-cf8726f514f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                        alt="AURAS Contact"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-accent/10 rounded-lg -z-10"></div>
                            </div>
                        </div>
                        <div data-aos="fade-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Chúng Tôi Luôn Sẵn Sàng</h2>
                            <div className="w-20 h-1 bg-primary mb-6"></div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Tại AURAS, chúng tôi trân trọng mọi ý kiến đóng góp và câu hỏi từ khách hàng. Đội ngũ của chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Hãy liên hệ qua biểu mẫu bên dưới hoặc sử dụng thông tin liên hệ được cung cấp. Chúng tôi rất mong được hỗ trợ bạn!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Biểu mẫu liên hệ */}
            <section id="contact-form" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gửi Tin Nhắn Cho Chúng Tôi</h2>
                        <form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Họ và Tên
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-2 border bg-white dark:bg-gray-800 text-primary dark:text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-4 py-2 border bg-white dark:bg-gray-800 text-primary dark:text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Chủ Đề
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="w-full px-4 py-2 border bg-white dark:bg-gray-800 text-primary dark:text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tin Nhắn
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        className="w-full px-4 py-2 border bg-white dark:bg-gray-800 text-primary dark:text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors duration-300"
                                >
                                    Gửi Tin Nhắn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Thông tin liên hệ */}
            <section id="contact-info" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Địa Chỉ</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                123 Đường ABC, Quận XYZ, Thành phố HCM, Việt Nam
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Số Điện Thoại</h3>
                            <p className="text-gray-600 dark:text-gray-300">+84 123 456 789</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Email</h3>
                            <p className="text-gray-600 dark:text-gray-300">support@auras.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bản đồ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.498312895711!2d106.68007201480074!3d10.762622992321693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b7c3ed2d7%3A0xa5a9d8a6f9e9c9a7!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1631234567890!5m2!1sen!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Banner đăng ký nhận tin */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-8 md:p-12 flex flex-col justify-center text-white">
                                <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
                                <p className="mb-6">
                                    Nhận thông tin mới nhất về sản phẩm, bộ sưu tập và ưu đãi đặc biệt từ AURAS.
                                </p>
                                <form className="flex flex-col sm:flex-row">
                                    <input
                                        type="email"
                                        placeholder="Email của bạn"
                                        className="px-4 py-3 rounded-l-md border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 w-full sm:w-auto mb-2 sm:mb-0"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-white text-primary font-semibold rounded-r-md hover:bg-gray-100 transition-colors duration-300"
                                    >
                                        Đăng ký
                                    </button>
                                </form>
                            </div>
                            <div className="hidden md:block relative">
                                <img
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                                    alt="AURAS Membership"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;