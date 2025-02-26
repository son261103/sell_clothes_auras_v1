import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const PromotionBanner: React.FC = () => {
    const promotionImageUrl = "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80";

    return (
        <section className="px-4 md:px-8">
            <div
                className="relative h-72 rounded-xl overflow-hidden shadow-lg border border-accent/10"
                data-aos="fade-up"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-primary/30 z-10"></div>
                <LazyLoadImage
                    src={promotionImageUrl}
                    alt="Khuyến mãi mùa hè"
                    effect="blur"
                    className="absolute inset-0 w-full h-full object-cover object-center transition duration-700 hover:scale-105"
                    wrapperClassName="absolute inset-0 w-full h-full"
                    placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjwvc3ZnPg=="
                />
                <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4 text-center">
                    <div className="bg-accent/90 px-6 py-2 rounded-lg mb-3 text-sm font-bold shadow-md transform hover:scale-105 transition duration-300">ƯU ĐÃI CÓ HẠN</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-md">SALE HÈ 2025</h2>
                    <p className="text-lg mb-4 text-white max-w-md drop-shadow-md">Giảm giá lên đến 50% cho các sản phẩm được chọn. Đừng bỏ lỡ cơ hội này!</p>
                    <Link
                        to="/collection/sale"
                        className="bg-white text-primary hover:bg-primary hover:text-white px-8 py-2 rounded-full transition duration-300 shadow-md flex items-center gap-2 font-medium"
                    >
                        Mua Ngay
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"/>
                            <path d="M12 5l7 7-7 7"/>
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PromotionBanner;