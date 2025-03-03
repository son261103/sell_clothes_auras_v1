import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GiStarSwirl } from 'react-icons/gi';

const ForgotPasswordPage: React.FC = () => {
    const [loginId, setLoginId] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [showOtpPopup, setShowOtpPopup] = useState(false);

    const navigate = useNavigate();
    const { forgotPassword, resetPassword, loading, error } = useAuth();

    // Reset local error khi inputs thay đổi
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [loginId, otp, newPassword, confirmPassword]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!loginId) {
            setLocalError('Vui lòng nhập ID đăng nhập hoặc email');
            toast.error('Vui lòng nhập ID đăng nhập hoặc email');
            return;
        }

        try {
            await forgotPassword({ loginId });
            setOtpSent(true);
            setShowOtpPopup(true);
            toast.success('OTP đã được gửi đến email của bạn!');
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Không thể gửi OTP');
            toast.error('Không thể gửi OTP. Vui lòng thử lại.');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!otp || !newPassword || !confirmPassword) {
            setLocalError('Vui lòng nhập đầy đủ OTP và mật khẩu mới');
            toast.error('Vui lòng nhập đầy đủ OTP và mật khẩu mới');
            return;
        }

        if (newPassword !== confirmPassword) {
            setLocalError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        try {
            await resetPassword({ email: loginId, otp, newPassword, confirmPassword });
            setShowOtpPopup(false);
            toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại');
            toast.error('Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại.');
        }
    };

    const handleResendOtp = async () => {
        try {
            await forgotPassword({ loginId });
            toast.success('OTP mới đã được gửi!');
        } catch (err) {
            console.log(err);
            toast.error('Không thể gửi lại OTP. Vui lòng thử lại.');
        }
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
                            Quên mật khẩu
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
                        {loading && (
                            <p className="text-accent dark:text-accent text-center mb-6 bg-accent/10 p-3 rounded-lg animate-pulse text-sm">
                                Đang xử lý...
                            </p>
                        )}

                        {/* Forgot Password Form */}
                        <form onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="space-y-6">
                            <div>
                                <label htmlFor="loginId" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                    ID đăng nhập hoặc Email
                                </label>
                                <input
                                    id="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Nhập ID hoặc email"
                                    disabled={loading || otpSent}
                                />
                            </div>
                            {!otpSent ? (
                                <motion.button
                                    type="submit"
                                    className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                                </motion.button>
                            ) : null}
                        </form>

                        {/* OTP Popup */}
                        {showOtpPopup && (
                            <motion.div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white dark:bg-darkBackground p-8 rounded-2xl shadow-xl border border-highlight/20 w-full max-w-md"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-2xl font-bold text-center mb-6 text-textDark dark:text-textLight">
                                        Đặt lại mật khẩu
                                    </h3>
                                    <p className="text-center text-sm text-secondary dark:text-highlight mb-6">
                                        Vui lòng nhập mã OTP và mật khẩu mới cho <span className="font-semibold">{loginId}</span>
                                    </p>
                                    <form onSubmit={handleResetPassword} className="space-y-6">
                                        <div>
                                            <label htmlFor="otp" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                                Mã OTP
                                            </label>
                                            <input
                                                id="otp"
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                                placeholder="Nhập mã OTP"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                                placeholder="Nhập mật khẩu mới"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                                Xác nhận mật khẩu
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                                placeholder="Xác nhận mật khẩu"
                                                disabled={loading}
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            disabled={loading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                                        </motion.button>
                                    </form>
                                    <p className="text-center text-sm text-secondary dark:text-highlight mt-4">
                                        Không nhận được OTP?{' '}
                                        <button
                                            onClick={handleResendOtp}
                                            className="text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300"
                                            disabled={loading}
                                        >
                                            Gửi lại
                                        </button>
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Login Link */}
                        <p className="text-center text-sm text-secondary dark:text-highlight mt-6">
                            Quay lại{' '}
                            <Link
                                to="/login"
                                className="text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300"
                            >
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;