import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { GiStarSwirl } from 'react-icons/gi';
import useAuth from '../../hooks/useAuth';

interface LocationState {
    email?: string;
}

interface VerifyOtpPageProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

const VerifyOtpPage: React.FC<VerifyOtpPageProps> = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isResendingOtp, setIsResendingOtp] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp, resendOtp, loading, error, user } = useAuth();

    useEffect(() => {
        // Get email from location state
        const state = location.state as LocationState;
        if (state && state.email) {
            setEmail(state.email);
        } else if (user && user.email) {
            // If not in state, use from current user
            setEmail(user.email);
        } else {
            // If no email found, redirect to login
            toast.error('Không thể xác định email, vui lòng đăng nhập lại');
            navigate('/login');
        }
    }, [location, user, navigate]);

    // Reset localError when fields change
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [otp]);

    // Handle OTP verification
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!otp) {
            setLocalError('Vui lòng nhập mã OTP');
            toast.error('Vui lòng nhập mã OTP');
            return;
        }

        try {
            const loadingToast = toast.loading('Đang xác minh OTP...');
            const isVerified = await verifyOtp(email, otp);
            toast.dismiss(loadingToast);

            if (isVerified) {
                toast.success('Xác thực thành công!');
                navigate('/'); // Redirect to home after successful verification
            } else {
                setLocalError('Mã OTP không hợp lệ');
                toast.error('Mã OTP không hợp lệ');
            }
        } catch (err) {
            toast.dismiss(); // Clear loading toast if there's an error
            const errorMessage = err instanceof Error ? err.message : 'Xác thực thất bại. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('OTP verification error:', err);
        }
    };

    // Handle resending OTP
    const handleResendOtp = async () => {
        setLocalError(null);
        setIsResendingOtp(true);

        try {
            const loadingToast = toast.loading('Đang gửi lại mã OTP...');
            await resendOtp(email);
            toast.dismiss(loadingToast);
            toast.success('Mã OTP mới đã được gửi đến email của bạn!');
        } catch (err) {
            toast.dismiss(); // Clear loading toast if there's an error
            const errorMessage = err instanceof Error ? err.message : 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('Resend OTP error:', err);
        } finally {
            setIsResendingOtp(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lightBackground via-primary to-accent dark:from-darkBackground dark:via-secondary dark:to-accent text-textDark dark:text-textLight transition-colors duration-500 relative overflow-hidden">
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
                className="w-full max-w-md mx-4 p-8 bg-white/90 dark:bg-darkBackground/90 backdrop-blur-md rounded-3xl shadow-xl border border-highlight/20 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="flex flex-col items-center justify-center space-y-6 mb-8">
                    <motion.div
                        className="relative"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <motion.div
                            className="absolute inset-0 w-[100px] h-[100px] bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        />
                        <GiStarSwirl className="relative w-[100px] h-[100px] text-primary hover:text-accent transition-colors duration-300 transform hover:scale-105" />
                    </motion.div>
                    <motion.p
                        className="text-3xl font-extrabold text-primary tracking-wide"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        AURAS
                    </motion.p>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 text-textDark dark:text-textLight">
                    Xác thực tài khoản
                </h2>

                <p className="text-center text-sm text-secondary dark:text-highlight mb-6">
                    Vui lòng nhập mã OTP được gửi đến <span className="font-semibold">{email}</span>
                </p>

                {(error || localError) && (
                    <motion.p
                        className="text-red-500 dark:text-red-400 text-center mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error || localError}
                    </motion.p>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                            disabled={loading || isResendingOtp}
                        />
                    </div>
                    <motion.button
                        type="submit"
                        className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        disabled={loading || isResendingOtp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                    </motion.button>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-highlight/20">
                        <motion.button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-sm text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300 underline"
                            disabled={loading || isResendingOtp}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isResendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-secondary dark:text-highlight hover:text-accent dark:hover:text-accent transition-colors duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Quay lại đăng nhập
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyOtpPage;