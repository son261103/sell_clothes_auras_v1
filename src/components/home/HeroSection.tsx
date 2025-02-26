import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
    // Hero image URL from Unsplash (royalty-free)
    const heroImageUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80";

    return (
        <section className="relative h-[90vh] overflow-hidden">
            {/* Giảm độ mờ của overlay - từ /60 xuống /30 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-primary/20 z-10"></div>
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageUrl})` }}
            ></div>

            <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4 text-center" data-aos="fade-up" data-aos-duration="1000">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-md">Phong Cách Mỗi Ngày</h1>
                <p className="text-lg md:text-xl mb-5 max-w-2xl text-white drop-shadow-sm">Khám phá bộ sưu tập mới kết hợp giữa phong cách, sự thoải mái và tính bền vững.</p>
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link to="/collection/new" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full transition duration-300 shadow-md">
                        Hàng Mới Về
                    </Link>
                    <Link to="/collection/all" className="bg-transparent border-2 border-white hover:bg-white/20 text-white px-6 py-2 rounded-full transition duration-300 shadow-md">
                        Xem Bộ Sưu Tập
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;