import React, { useState, FormEvent, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState<string>('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            toast.error('Vui lòng nhập địa chỉ email của bạn');
            return;
        }
        toast.success('Cảm ơn bạn đã đăng ký nhận bản tin!');
        setEmail('');
    };

    return (
        <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto">
            <div
                className="bg-gradient-to-r from-primary/5 to-primary/15 dark:from-primary/10 dark:to-primary/20 rounded-xl p-5 md:p-8 border border-primary/10 shadow-sm"
                data-aos="fade-up"
            >
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">Đăng Ký Nhận Tin</h2>
                    <p className="mb-4 text-secondary dark:text-textLight/80 text-sm">Đăng ký để nhận thông tin về ưu đãi đặc biệt, quà tặng miễn phí và các ưu đãi độc quyền.</p>
                    <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
                        <div className="relative flex-grow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input
                                type="email"
                                placeholder="Địa chỉ email của bạn"
                                className="w-full pl-12 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/60 border border-primary/20 dark:border-primary/30 dark:bg-secondary/10 dark:text-textLight shadow-sm"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full transition duration-300 shadow-md font-medium"
                        >
                            Đăng Ký
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;