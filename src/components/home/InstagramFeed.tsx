import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface InstagramPost {
    id: number;
    image: string;
    likes: number;
}

const InstagramFeed: React.FC = () => {
    const instagramPosts: InstagramPost[] = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 123
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 87
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 245
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 167
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 92
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
            likes: 134
        },
    ];

    return (
        <section className="px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-3">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">Instagram Của Chúng Tôi</h2>
                <p className="max-w-2xl mx-auto text-secondary/80 dark:text-textLight/80 text-sm mb-4" data-aos="fade-up" data-aos-delay="100">
                    Theo dõi chúng tôi{' '}
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold inline-flex items-center gap-1 hover:text-primary/80 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        @AURAS
                    </a>{' '}
                    để cập nhật các xu hướng mới nhất
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                {instagramPosts.map((post) => (
                    <a
                        href="#"
                        key={post.id}
                        className="relative group overflow-hidden aspect-square rounded-md shadow-sm border border-highlight/10 dark:border-secondary/30"
                        data-aos="fade-up"
                        data-aos-delay={post.id * 50}
                    >
                        <LazyLoadImage
                            src={post.image}
                            alt={`Ảnh Instagram ${post.id}`}
                            effect="blur"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            wrapperClassName="w-full h-full"
                            placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                            <span className="text-white flex items-center gap-2 transform scale-90 group-hover:scale-100 transition duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {post.likes}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
            <div className="text-center mt-3">
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 border border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-white transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Theo dõi @AURAS
                </a>
            </div>
        </section>
    );
};

export default InstagramFeed;