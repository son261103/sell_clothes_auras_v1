import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Define types for Article and Category
type Article = {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: { name: string; url: string };
};

type Category = {
    name: string;
    keyword: string;
};

const categories: Category[] = [
    { name: 'Tất cả', keyword: 'fashion' },
    { name: 'Thời trang nam', keyword: 'men fashion' },
    { name: 'Thời trang nữ', keyword: 'women fashion' },
    { name: 'Phụ kiện', keyword: 'fashion accessories' },
    { name: 'Thời trang cao cấp', keyword: 'luxury fashion' },
    { name: 'Xu hướng', keyword: 'fashion trends' },
];

const NewsPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [moreLoading, setMoreLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const { scrollY } = useScroll();
    const heroParallax = useTransform(scrollY, [0, 500], [0, -50]);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50, easing: 'ease-in-out' });
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
                if (!apiKey) throw new Error('Khóa API chưa được thiết lập');

                const query = searchQuery ? `${searchQuery} ${selectedCategory.keyword}` : selectedCategory.keyword;
                const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=12&page=${page}&apikey=${apiKey}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error('Không thể tải tin tức');

                const data = await response.json();
                const newArticles = data.articles || [];

                if (newArticles.length === 0) {
                    setHasMore(false);
                }

                setArticles((prev) => (page === 1 ? newArticles : [...prev, ...newArticles]));
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
                setMoreLoading(false);
            }
        };

        fetchNews();
    }, [searchQuery, selectedCategory, page]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(1);
        setHasMore(true);
        setLoading(true);
    };

    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        setPage(1);
        setHasMore(true);
        setLoading(true);
    };

    const loadMore = () => {
        if (!hasMore || moreLoading) return;
        setMoreLoading(true);
        setPage((prev) => prev + 1);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải tin tức...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="text-red-500 dark:text-red-400 text-xl mb-4">Đã xảy ra lỗi</div>
                    <p className="text-gray-700 dark:text-gray-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen ">
            {/* Hero Section */}
            <motion.section
                style={{ y: heroParallax }}
                className="relative bg-gradient-to-r from-primary/90 to-accent/90 text-white py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
            >
                <div className="container mx-auto text-center z-10 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        Thời Trang 24h
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light"
                    >
                        Cập nhật tin tức và xu hướng thời trang mới nhất từ khắp nơi trên thế giới
                    </motion.p>
                    <form onSubmit={handleSearch} className="flex items-center max-w-md mx-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm tin tức..."
                            className="flex-1 px-4 py-3 rounded-l-md border-0 bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-white text-primary font-semibold rounded-r-md hover:bg-gray-100 transition-colors duration-300"
                        >
                            Tìm
                        </button>
                    </form>
                </div>
                <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0">
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

            {/* Category Navigation - Sticky */}
            <div className="sticky top-0 z-20">
                <nav className="bg-white dark:bg-gray-800 py-4 shadow-md">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto flex justify-center">
                        <div className="flex space-x-2 md:space-x-4">
                            {categories.map((category) => (
                                <button
                                    key={category.name}
                                    type="button"
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                        selectedCategory.name === category.name
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                {articles.length === 0 ? (
                    <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-8 my-8">
                        <div className="text-5xl mb-4">😕</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Không tìm thấy bài viết nào</h3>
                        <p className="text-gray-600 dark:text-gray-400">Vui lòng thử với từ khóa khác hoặc chọn danh mục khác.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        <section className="mb-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <FeaturedNewsCard article={articles[0]} />
                                </div>
                                <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                                    {articles.slice(1, 3).map((article, index) => (
                                        <SideNewsCard key={`${article.url}-${index}`} article={article} index={index} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Latest News Section */}
                        <section>
                            <div className="flex items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tin mới nhất</h2>
                                <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {articles.slice(3).map((article, index) => (
                                    <NewsCard key={`${article.url}-${index}`} article={article} index={index} />
                                ))}
                            </div>
                        </section>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="mt-12 text-center">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={moreLoading}
                                    className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 inline-flex items-center justify-center"
                                >
                                    {moreLoading ? (
                                        <>
                                            <LoadingSpinner size="small" />
                                            <span className="ml-2">Đang tải...</span>
                                        </>
                                    ) : (
                                        'Xem thêm tin tức'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* No More Content Message */}
                        {!hasMore && articles.length > 0 && (
                            <div className="mt-12 text-center p-4">
                                <p className="text-gray-600 dark:text-gray-400">Bạn đã xem hết tất cả tin tức.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

// FeaturedNewsCard Component
const FeaturedNewsCard: React.FC<{ article: Article }> = ({ article }) => {
    const { title, description, url, image, publishedAt, source } = article;
    const formattedDate = new Date(publishedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=" rounded-lg shadow-md overflow-hidden h-full"
            data-aos="fade-up"
        >
            <div className="relative">
                {image && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-80 object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                        />
                    </a>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Nổi bật
                </div>
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary dark:hover:text-accent transition-colors"
                    >
                        {title}
                    </a>
                </h2>
                {description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {description}
                    </p>
                )}
                <div className="flex justify-between items-center text-sm">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                        {source.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                </div>
            </div>
        </motion.article>
    );
};

// SideNewsCard Component
const SideNewsCard: React.FC<{ article: Article; index: number }> = ({ article, index }) => {
    const { title, url, image, publishedAt, source } = article;
    const formattedDate = new Date(publishedAt).toLocaleDateString('vi-VN', {
        month: 'long',
        day: 'numeric',
    });

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className=" rounded-lg shadow-md overflow-hidden h-full"
            data-aos="fade-up"
            data-aos-delay={index * 100}
        >
            <div className="flex flex-col sm:flex-row lg:flex-col h-full">
                {image && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden sm:w-1/3 lg:w-full">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-48 sm:h-full lg:h-48 object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                        />
                    </a>
                )}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary dark:hover:text-accent transition-colors"
                        >
                            {title}
                        </a>
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                            {source.name}
                        </span>
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

// NewsCard Component
const NewsCard: React.FC<{ article: Article; index: number }> = ({ article, index }) => {
    const { title, description, url, image, publishedAt, source } = article;
    const formattedDate = new Date(publishedAt).toLocaleDateString('vi-VN', {
        month: 'long',
        day: 'numeric',
    });

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className=" rounded-lg shadow-md overflow-hidden h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            data-aos="fade-up"
            data-aos-delay={index * 50}
        >
            {image && (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden">
                    <div className="relative h-48">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                </a>
            )}
            <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary dark:hover:text-accent transition-colors"
                    >
                        {title}
                    </a>
                </h3>
                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
                        {description}
                    </p>
                )}
                <div className="flex justify-between items-center text-xs mt-auto">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {source.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                </div>
            </div>
        </motion.article>
    );
};

export default NewsPage;