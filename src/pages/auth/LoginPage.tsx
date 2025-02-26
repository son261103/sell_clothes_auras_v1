import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { GiStarSwirl } from 'react-icons/gi';

const LoginPage: React.FC = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    // Reset local error when inputs change
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [loginId, password]);

    // Log initial states for debugging
    useEffect(() => {
        console.log('Auth state loaded:', { loading, error });
    }, [loading, error]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        console.log('Input changing:', e.target.name, e.target.value);
        setter(e.target.value);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Form validation
        if (!loginId || !password) {
            setLocalError('Vui lòng nhập đầy đủ thông tin đăng nhập');
            toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        try {
            setIsSubmitting(true);
            await login({ loginId, password, rememberMe });
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setLocalError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
            toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        toast.error(`Tính năng đăng nhập bằng ${provider} đang được phát triển`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f9e1e5] via-[#fce4e8] to-[#e8f0fe] dark:from-[#d1a3ab] dark:via-[#b58c94] dark:to-[#a3bffa] text-textDark dark:text-textLight relative overflow-hidden transition-colors duration-300">
            {/* Background decorations with pointer-events-none to prevent blocking inputs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-accent/10 rounded-full -top-32 -left-32 blur-3xl transform rotate-45 animate-pulse"></div>
                <div className="absolute w-80 h-80 bg-primary/10 rounded-full bottom-0 right-0 blur-3xl transform -rotate-30 animate-pulse"></div>
            </div>

            <motion.div
                className="w-full max-w-4xl mx-auto p-8 bg-white dark:bg-darkBackground rounded-2xl shadow-2xl border border-highlight/30 relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Logo Section */}
                    <div className="w-full lg:w-1/2 p-6 rounded-lg shadow-inner flex flex-col items-center space-y-8 bg-gradient-to-b from-white to-[#f8f8f8] dark:from-darkBackground dark:to-darkBackground/90">
                        <motion.div
                            className="flex flex-col items-center"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <GiStarSwirl className="w-[120px] h-[120px] text-primary hover:text-accent transition-colors duration-300 transform hover:scale-110 cursor-pointer" />
                            <p className="text-3xl font-bold text-primary mt-6 hover:text-accent transition-colors duration-300">AURAS</p>
                        </motion.div>
                    </div>

                    {/* Form Section */}
                    <div className="border-l-2 border-highlight/30 dark:border-highlight/20 w-full lg:w-1/2 p-6">
                        <h2 className="text-2xl font-semibold text-center mb-6 text-darkBackground dark:text-textLight">
                            Đăng nhập
                        </h2>

                        {/* Error and Loading States */}
                        {(error || localError) && (
                            <motion.p
                                className="text-red-500 dark:text-red-400 text-center mb-4 text-base bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error || localError}
                            </motion.p>
                        )}
                        {(loading || isSubmitting) && (
                            <p className="text-accent dark:text-accent text-center mb-4 text-base bg-accent/10 p-2 rounded-lg animate-pulse">
                                Đang xử lý...
                            </p>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="loginId" className="block text-base font-medium text-secondary dark:text-highlight mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    id="loginId"
                                    name="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => handleInputChange(e, setLoginId)}
                                    className="w-full p-3 border border-highlight dark:border-highlight/50 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary text-base placeholder-secondary/50 dark:placeholder-highlight/50 bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight transition-all duration-300 cursor-text"
                                    placeholder="Nhập tên đăng nhập"
                                    disabled={isSubmitting}
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-base font-medium text-secondary dark:text-highlight mb-2">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => handleInputChange(e, setPassword)}
                                    className="w-full p-3 border border-highlight dark:border-highlight/50 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary text-base placeholder-secondary/50 dark:placeholder-highlight/50 bg-lightBackground dark:bg-darkBackground text-textDark dark:text-textLight transition-all duration-300 cursor-text"
                                    placeholder="Nhập mật khẩu"
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="rememberMe" className="flex items-center cursor-pointer group">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-5 w-5 text-primary dark:text-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary border-highlight dark:border-highlight/50 rounded hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all duration-300"
                                        disabled={isSubmitting}
                                    />
                                    <span className="ml-2 text-base text-secondary dark:text-highlight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
                                        Ghi nhớ tôi
                                    </span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-base text-primary dark:text-primary hover:underline hover:text-accent dark:hover:text-accent transition-colors duration-300"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-accent text-white rounded-lg hover:from-accent hover:to-primary dark:hover:from-accent dark:hover:to-primary transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </motion.button>
                        </form>

                        {/* Social Login Buttons */}
                        <div className="mt-6 space-y-3">
                            <motion.button
                                className="w-full p-3 bg-white dark:bg-darkBackground border border-highlight dark:border-highlight/50 rounded-lg flex items-center justify-center text-base text-darkBackground dark:text-textLight hover:bg-[#4285f4]/10 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 group cursor-pointer"
                                disabled={isSubmitting}
                                onClick={() => handleSocialLogin('Google')}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                            >
                                <FcGoogle className="mr-2 text-xl group-hover:scale-110 transition-transform duration-300" />
                                <span className="group-hover:text-[#4285f4] dark:group-hover:text-[#4285f4]/80 transition-colors duration-300">Đăng nhập bằng Google</span>
                            </motion.button>

                            <motion.button
                                className="w-full p-3 bg-white dark:bg-darkBackground border border-highlight dark:border-highlight/50 rounded-lg flex items-center justify-center text-base text-darkBackground dark:text-textLight hover:bg-[#3b5998]/10 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 group cursor-pointer"
                                disabled={isSubmitting}
                                onClick={() => handleSocialLogin('Facebook')}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                            >
                                <FaFacebook className="mr-2 text-xl text-[#3b5998] group-hover:scale-110 transition-transform duration-300" />
                                <span className="group-hover:text-[#3b5998] dark:group-hover:text-[#3b5998]/80 transition-colors duration-300">Đăng nhập bằng Facebook</span>
                            </motion.button>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-base text-secondary dark:text-highlight mt-6">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-primary dark:text-primary hover:underline hover:text-accent dark:hover:text-accent transition-colors duration-300">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;