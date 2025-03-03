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

    // Khôi phục thông tin đăng nhập nếu "Ghi nhớ tôi" được lưu
    useEffect(() => {
        const savedLoginId = localStorage.getItem('rememberedLoginId');
        if (savedLoginId) {
            setLoginId(savedLoginId);
            setRememberMe(true);
        }
    }, []);

    // Reset local error khi inputs thay đổi
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [loginId, password]);

    // Log trạng thái ban đầu để debug
    useEffect(() => {
        console.log('Auth state loaded:', { loading, error });
    }, [loading, error]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        console.log('Input changing:', e.target.name, e.target.value);
        setter(e.target.value);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!loginId || !password) {
            setLocalError('Vui lòng nhập đầy đủ thông tin đăng nhập');
            toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        try {
            setIsSubmitting(true);
            await login({ loginId, password, rememberMe });

            if (rememberMe) {
                localStorage.setItem('rememberedLoginId', loginId);
            } else {
                localStorage.removeItem('rememberedLoginId');
            }

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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lightBackground via-primary to-accent dark:from-darkBackground dark:via-secondary dark:to-accent text-textDark dark:text-textLight transition-colors duration-500 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 bg-primary/20 rounded-full -top-40 -left-40 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute w-72 h-72 bg-accent/20 rounded-full bottom-10 right-10 blur-3xl"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div
                className="w-full max-w-5xl mx-4 p-10 bg-white/90 dark:bg-darkBackground/90 backdrop-blur-md rounded-3xl shadow-xl border border-highlight/20 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <motion.div
                            className="relative"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <motion.div
                                className="absolute inset-0 w-[150px] h-[150px] bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            />
                            <GiStarSwirl className="relative w-[150px] h-[150px] text-primary hover:text-accent transition-colors duration-300 transform hover:scale-105" />
                        </motion.div>
                        <motion.p
                            className="text-4xl font-extrabold text-primary tracking-wide"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            AURAS
                        </motion.p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 bg-lightBackground/50 dark:bg-darkBackground/50 rounded-2xl shadow-inner border border-highlight/30">
                        <h2 className="text-3xl font-bold text-center mb-8 text-textDark dark:text-textLight">
                            Đăng nhập
                        </h2>

                        {/* Error and Loading States */}
                        {(error || localError) && (
                            <motion.p
                                className="text-red-500 dark:text-red-400 text-center mb-6 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error || localError}
                            </motion.p>
                        )}
                        {(loading || isSubmitting) && (
                            <p className="text-accent dark:text-accent text-center mb-6 bg-accent/10 p-3 rounded-lg animate-pulse text-sm">
                                Đang xử lý...
                            </p>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="loginId" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    id="loginId"
                                    name="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => handleInputChange(e, setLoginId)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Nhập tên đăng nhập"
                                    disabled={isSubmitting}
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => handleInputChange(e, setPassword)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Nhập mật khẩu"
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <motion.label
                                    htmlFor="rememberMe"
                                    className="flex items-center cursor-pointer group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-primary dark:text-accent focus:ring-2 focus:ring-primary dark:focus:ring-accent border-highlight/50 rounded transition-all duration-300 cursor-pointer"
                                        disabled={isSubmitting}
                                        animate={{ scale: rememberMe ? 1.1 : 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <span className="ml-2 text-sm text-secondary dark:text-highlight group-hover:text-primary dark:group-hover:text-accent transition-colors duration-300">
                                        Ghi nhớ tôi
                                    </span>
                                </motion.label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </motion.button>
                        </form>

                        {/* Social Login Buttons */}
                        <div className="mt-8 space-y-4">
                            <motion.button
                                className="w-full p-3 bg-white dark:bg-darkBackground border border-highlight/50 rounded-lg flex items-center justify-center text-sm text-textDark dark:text-textLight hover:bg-primary/10 transition-all duration-300 shadow-sm hover:shadow-md group"
                                disabled={isSubmitting}
                                onClick={() => handleSocialLogin('Google')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                            >
                                <FcGoogle className="mr-2 text-lg group-hover:scale-110 transition-transform duration-300" />
                                <span className="group-hover:text-primary dark:group-hover:text-accent">Đăng nhập bằng Google</span>
                            </motion.button>

                            <motion.button
                                className="w-full p-3 bg-white dark:bg-darkBackground border border-highlight/50 rounded-lg flex items-center justify-center text-sm text-textDark dark:text-textLight hover:bg-primary/10 transition-all duration-300 shadow-sm hover:shadow-md group"
                                disabled={isSubmitting}
                                onClick={() => handleSocialLogin('Facebook')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                            >
                                <FaFacebook className="mr-2 text-lg text-[#3b5998] group-hover:scale-110 transition-transform duration-300" />
                                <span className="group-hover:text-primary dark:group-hover:text-accent">Đăng nhập bằng Facebook</span>
                            </motion.button>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-sm text-secondary dark:text-highlight mt-6">
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                className="text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300"
                            >
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