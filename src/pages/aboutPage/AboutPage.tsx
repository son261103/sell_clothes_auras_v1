import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Định nghĩa kiểu dữ liệu
type BrandValue = {
    title: string;
    description: string;
    icon: string;
};

type CollectionItem = {
    title: string;
    description: string;
    image: string;
    url: string;
};

type TestimonialItem = {
    text: string;
    author: string;
    role: string;
    image: string;
};

const AboutPage: React.FC = () => {
    const { scrollY } = useScroll();
    const heroParallax = useTransform(scrollY, [0, 500], [0, -50]);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50, easing: 'ease-in-out' });
    }, []);

    // Dữ liệu giá trị thương hiệu
    const brandValues: BrandValue[] = [
        {
            title: 'Bền Vững',
            description: 'Chúng tôi cam kết sử dụng nguyên liệu có nguồn gốc bền vững và quy trình sản xuất thân thiện với môi trường.',
            icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'
        },
        {
            title: 'Chất Lượng',
            description: 'Mỗi sản phẩm AURAS đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng vải và đường may hoàn hảo.',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            title: 'Thiết Kế',
            description: 'Thiết kế độc đáo, kết hợp giữa xu hướng hiện đại và nét đẹp truyền thống, tạo nên phong cách riêng biệt.',
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z'
        },
        {
            title: 'Tính Độc Đáo',
            description: 'Mỗi sản phẩm AURAS đều mang dấu ấn riêng, giúp bạn thể hiện cá tính và khẳng định phong cách.',
            icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
        }
    ];

    // Dữ liệu bộ sưu tập nổi bật với URL ảnh mới
    const featuredCollections: CollectionItem[] = [
        {
            title: 'Bộ Sưu Tập Mùa Hè',
            description: 'Tươi mát, nhẹ nhàng và đầy sức sống với các thiết kế từ chất liệu tự nhiên.',
            image: 'https://media.vietnamplus.vn/images/7255a701687d11cb8c6bbc58a6c80785da2ac87e74b1aaac2484f4f6ffebdc834a324478b600d9f358ef5acf2106f107/nhook10.jpg',
            url: '/collections/summer'
        },
        {
            title: 'Dòng Sản Phẩm Công Sở',
            description: 'Lịch lãm, tinh tế và chuyên nghiệp - Trang phục cho người thành đạt.',
            image: 'https://dongphuchaianh.vn/wp-content/uploads/2022/02/bo-suu-tap-la-victoire-dong-phuc.jpg',
            url: '/collections/office'
        },
        {
            title: 'Dạo Phố Cuối Tuần',
            description: 'Thoải mái, cá tính và thời thượng cho những ngày nghỉ đầy năng lượng.',
            image: 'https://giadinh.mediacdn.vn/2020/11/25/photo-1-1606291917324352525852.jpg',
            url: '/collections/casual'
        }
    ];

    // Dữ liệu đánh giá khách hàng
    const testimonials: TestimonialItem[] = [
        {
            text: 'AURAS không chỉ mang đến những sản phẩm chất lượng mà còn là một trải nghiệm mua sắm tuyệt vời. Tôi luôn tin tưởng và quay lại với AURAS mỗi mùa.',
            author: 'Nguyễn Thị Minh',
            role: 'Khách hàng thân thiết',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
        },
        {
            text: 'Chất lượng vải và đường may của AURAS luôn khiến tôi hài lòng. Đặc biệt, dịch vụ chăm sóc khách hàng rất chu đáo và nhiệt tình.',
            author: 'Trần Văn Hoàng',
            role: 'Doanh nhân',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
        },
        {
            text: 'AURAS mang đến cho tôi sự tự tin mỗi khi xuất hiện. Thiết kế độc đáo và phong cách riêng biệt là điều tôi yêu thích nhất ở thương hiệu này.',
            author: 'Phạm Thị Hương',
            role: 'Người mẫu tự do',
            image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
        }
    ];

    return (
        <div className="flex flex-col min-h-screen ">
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
                        AURAS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light"
                    >
                        Thời trang tinh tế, phong cách sống hoàn mỹ
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <a
                            href="/collections"
                            className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md mx-2"
                        >
                            Khám phá bộ sưu tập
                        </a>
                        <a
                            href="/about"
                            className="px-8 py-3 bg-transparent text-white border border-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 mx-2 mt-4 sm:mt-0 inline-block"
                        >
                            Câu chuyện thương hiệu
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

            {/* Giới thiệu thương hiệu */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div data-aos="fade-right">
                            <div className="relative">
                                <div className="aspect-square bg-primary/10 rounded-lg overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1551489186-cf8726f514f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                        alt="AURAS Brand Story"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-accent/10 rounded-lg -z-10"></div>
                            </div>
                        </div>
                        <div data-aos="fade-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Câu Chuyện AURAS</h2>
                            <div className="w-20 h-1 bg-primary mb-6"></div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                AURAS ra đời vào năm 2018 với khát vọng tạo nên những sản phẩm thời trang không chỉ đẹp về hình thức mà còn mang giá trị bền vững, thân thiện với môi trường.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Tên gọi AURAS - lấy cảm hứng từ vầng hào quang tinh tế bao quanh mỗi con người - thể hiện triết lý thương hiệu của chúng tôi: mỗi sản phẩm được tạo ra đều nhằm tôn vinh vẻ đẹp và cá tính riêng biệt của người mặc.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Từ những nguyên liệu tự nhiên cao cấp, đội ngũ thiết kế tài năng của chúng tôi tạo nên những bộ sưu tập vừa hiện đại vừa mang đậm dấu ấn văn hóa Việt Nam, kết nối truyền thống với đương đại.
                            </p>
                            <a
                                href="/story"
                                className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                            >
                                Tìm hiểu thêm về chúng tôi
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Giá trị thương hiệu */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Giá Trị Cốt Lõi</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Những nguyên tắc định hướng mọi quyết định và hoạt động của AURAS, từ lựa chọn nguyên liệu đến phục vụ khách hàng.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {brandValues.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bộ sưu tập nổi bật */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto">
                    <div className="flex items-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bộ Sưu Tập Nổi Bật</h2>
                        <div className="ml-4 flex-grow h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredCollections.map((collection, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <a href={collection.url} className="block overflow-hidden">
                                    <img
                                        src={collection.image}
                                        alt={collection.title}
                                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </a>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        <a href={collection.url} className="hover:text-primary transition-colors">
                                            {collection.title}
                                        </a>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{collection.description}</p>
                                    <a
                                        href={collection.url}
                                        className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                                    >
                                        Khám phá ngay
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Số liệu thống kê */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/90 to-accent/90 text-white">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center" data-aos="fade-up">
                            <div className="text-4xl md:text-5xl font-bold mb-2">5+</div>
                            <div className="text-white/80">Năm kinh nghiệm</div>
                        </div>
                        <div className="text-center" data-aos="fade-up" data-aos-delay="100">
                            <div className="text-4xl md:text-5xl font-bold mb-2">30k+</div>
                            <div className="text-white/80">Khách hàng hài lòng</div>
                        </div>
                        <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                            <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
                            <div className="text-white/80">Thiết kế độc đáo</div>
                        </div>
                        <div className="text-center" data-aos="fade-up" data-aos-delay="300">
                            <div className="text-4xl md:text-5xl font-bold mb-2">12</div>
                            <div className="text-white/80">Cửa hàng toàn quốc</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lời chứng thực */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Khách Hàng Nói Gì Về AURAS</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Những chia sẻ chân thực từ khách hàng là minh chứng rõ nhất cho chất lượng và giá trị mà AURAS mang lại.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.author}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Banner thành viên */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 ">
                <div className="container mx-auto">
                    <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-8 md:p-12 flex flex-col justify-center text-white">
                                <h2 className="text-3xl font-bold mb-4">Trở Thành Thành Viên AURAS</h2>
                                <p className="mb-6">
                                    Tham gia cộng đồng AURAS để nhận thông tin về bộ sưu tập mới nhất, ưu đãi đặc biệt và quà tặng độc quyền dành riêng cho thành viên.
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

export default AboutPage;