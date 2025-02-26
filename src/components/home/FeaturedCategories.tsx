import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface Category {
    id: number;
    name: string;
    displayName: string;
    image: string;
    count: number;
}

const FeaturedCategories: React.FC = () => {
    const categories: Category[] = [
        {
            id: 1,
            name: 'dresses',
            displayName: 'Váy',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 42,
        },
        {
            id: 2,
            name: 'tops',
            displayName: 'Áo',
            image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 56,
        },
        {
            id: 3,
            name: 'bottoms',
            displayName: 'Quần',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 38,
        },
        {
            id: 4,
            name: 'outerwear',
            displayName: 'Áo Khoác',
            image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80',
            count: 24,
        },
    ];

    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center mb-6 border-b border-primary/10 dark:border-primary/20 pb-3">
                <div data-aos="fade-right">
                    <h2 className="text-3xl font-bold text-primary tracking-tight">Danh Mục Sản Phẩm</h2>
                    <p className="text-secondary/70 dark:text-textLight/70 mt-2 text-base">Khám phá những bộ sưu tập dành riêng cho bạn</p>
                </div>
                <Link
                    to="/collection/featured"
                    className="text-primary hover:text-primary/80 transition flex items-center gap-2 font-semibold text-base"
                    data-aos="fade-left"
                >
                    Xem Tất Cả
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={`/category/${category.name.toLowerCase()}`}
                        className="group block transition-all duration-300 ease-out"
                    >
                        <div
                            className="relative h-60 md:h-72 rounded-xl overflow-hidden shadow-md border border-highlight/10 dark:border-secondary/30 bg-white dark:bg-secondary/10 group-hover:shadow-lg group-hover:border-primary/20 dark:group-hover:border-primary/30 group-hover:scale-98 transition-all duration-300"
                            data-aos="fade-up"
                            data-aos-delay={category.id * 75}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent z-10 group-hover:from-primary/30 group-hover:via-primary/10 transition-colors duration-300"></div>
                            <LazyLoadImage
                                src={category.image}
                                alt={category.displayName}
                                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                                wrapperClassName="absolute inset-0 w-full h-full"
                                placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-colors duration-300">
                                <h3 className="text-xl md:text-2xl font-semibold tracking-tight line-clamp-1 drop-shadow-md">{category.displayName}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm md:text-base text-white/90 font-medium">{category.count} sản phẩm</p>
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-1 group-hover:translate-x-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default FeaturedCategories;