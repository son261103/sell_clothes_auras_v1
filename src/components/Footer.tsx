import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary text-textLight py-8 mt-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Giới thiệu */}
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-primary">AURAS</h3>
                        <p className="mb-3 text-gray-300 text-sm">
                            AURAS là thương hiệu thời trang hiện đại mang đến cho bạn những sản phẩm phong cách, bền vững và thoải mái.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-primary transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-primary transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-primary transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-highlight">Liên Kết</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="text-gray-300 hover:text-primary transition">Giới Thiệu</Link></li>
                            <li><Link to="/contact" className="text-gray-300 hover:text-primary transition">Liên Hệ</Link></li>
                            <li><Link to="/terms" className="text-gray-300 hover:text-primary transition">Điều Khoản & Điều Kiện</Link></li>
                            <li><Link to="/privacy" className="text-gray-300 hover:text-primary transition">Chính Sách Bảo Mật</Link></li>
                            <li><Link to="/faq" className="text-gray-300 hover:text-primary transition">Câu Hỏi Thường Gặp</Link></li>
                        </ul>
                    </div>

                    {/* Danh mục */}
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-highlight">Danh Mục</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/collection/women" className="text-gray-300 hover:text-primary transition">Thời Trang Nữ</Link></li>
                            <li><Link to="/collection/men" className="text-gray-300 hover:text-primary transition">Thời Trang Nam</Link></li>
                            <li><Link to="/collection/accessories" className="text-gray-300 hover:text-primary transition">Phụ Kiện</Link></li>
                            <li><Link to="/collection/new" className="text-gray-300 hover:text-primary transition">Hàng Mới Về</Link></li>
                            <li><Link to="/collection/sale" className="text-gray-300 hover:text-primary transition">Khuyến Mãi</Link></li>
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-highlight">Liên Hệ</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-300">123 Đường Thời Trang, Quận 1, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-300">0123.456.789</span>
                            </li>
                            <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-300">hotro@auras.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom footer */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-xs">© 2025 AURAS. Tất cả quyền được bảo lưu.</p>
                        <div className="mt-4 md:mt-0 flex items-center">
                            <LazyLoadImage
                                src="https://i.imgur.com/6RF5LOq.png" // Payment methods image
                                alt="Phương thức thanh toán"
                                effect="blur"
                                height={32}
                                width={240}
                                className="h-8"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;