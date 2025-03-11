import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { GiStarSwirl } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';
import useAuth from '../../hooks/useAuth';
import { FiMail, FiCheck } from 'react-icons/fi';
import { ApiResponse } from '../../types/auth.types';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa interface cho payload của token
interface TokenPayload {
    permissions: string[];
    roles: string[];
    fullName: string;
    userId: number;
    email: string;
    status: string;
    sub: string;
    iat: number;
    exp: number;
}

const ActivateAccountPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isEmailMissing, setIsEmailMissing] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Ngăn chặn quay lại trang trước
    useEffect(() => {
        const preventBack = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', preventBack);
        return () => window.removeEventListener('popstate', preventBack);
    }, []);

    // Lấy email từ token hoặc các nguồn khác
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const savedEmail = localStorage.getItem('pendingActivationEmail');
        const rememberedLoginId = localStorage.getItem('rememberedLoginId');

        if (token) {
            try {
                const decoded: TokenPayload = jwtDecode(token);
                if (decoded.email) {
                    console.log('Sử dụng email từ token:', decoded.email);
                    setEmail(decoded.email);
                    localStorage.setItem('pendingActivationEmail', decoded.email);
                }
            } catch (error) {
                console.log('Lỗi khi giải mã token:', error);
            }
        } else if (savedEmail) {
            console.log('Sử dụng email từ pendingActivationEmail:', savedEmail);
            setEmail(savedEmail);
        } else if (user?.email) {
            console.log('Sử dụng email từ user context:', user.email);
            setEmail(user.email);
        } else if (rememberedLoginId && rememberedLoginId.includes('@')) {
            console.log('Sử dụng rememberedLoginId làm email:', rememberedLoginId);
            setEmail(rememberedLoginId);
        } else {
            console.log('Không tìm thấy email từ bất kỳ nguồn nào');
            setIsEmailMissing(true);
            toast('Vui lòng nhập email để nhận OTP.');
        }
    }, [user, navigate]);

    // Xóa lỗi khi OTP thay đổi
    useEffect(() => {
        if (localError) setLocalError(null);
    }, [otp]);

    // Gửi OTP
    const handleSendOtp = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Email không hợp lệ.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.sendOtp(email);
            toast.success('Mã OTP đã được gửi đến email của bạn');
            setOtpSent(true);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Không thể gửi mã OTP.';
            toast.error(errorMessage);
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        if (!email) {
            toast.error('Không tìm thấy email.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.resendOtp(email);
            toast.success('Mã OTP mới đã được gửi.');
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Không thể gửi lại mã OTP.';
            toast.error(errorMessage);
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Xác thực OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            toast.error('Vui lòng nhập mã OTP hợp lệ.');
            setLocalError('Mã OTP không hợp lệ.');
            return;
        }

        setLoading(true);
        try {
            const verified = await AuthService.verifyOtp(email, otp);
            if (verified) {
                toast.success('Tài khoản đã được kích hoạt thành công!');
                localStorage.removeItem('pendingActivationEmail');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error('Mã OTP không đúng hoặc đã hết hạn.');
                setLocalError('Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Xác thực thất bại.';
            toast.error(errorMessage);
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setIsEmailMissing(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lightBackground via-primary to-accent dark:from-darkBackground dark:via-secondary dark:to-accent text-textDark dark:text-textLight">
            <motion.div
                className="w-full max-w-5xl mx-4 p-10 bg-white/90 dark:bg-darkBackground/90 backdrop-blur-md rounded-3xl shadow-xl border border-highlight/20"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <motion.div
                            className="relative"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <GiStarSwirl className="w-[150px] h-[150px] text-primary hover:text-accent transition-colors duration-300" />
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

                    <div className="p-8 bg-lightBackground/50 dark:bg-darkBackground/50 rounded-2xl shadow-inner border border-highlight/30">
                        <h2 className="text-3xl font-bold text-center mb-4 text-textDark dark:text-textLight">
                            Kích hoạt tài khoản
                        </h2>
                        <p className="text-center mb-6 text-secondary dark:text-highlight text-sm">
                            Vui lòng kích hoạt tài khoản trước khi sử dụng.
                        </p>

                        {localError && (
                            <motion.p
                                className="text-red-500 dark:text-red-400 text-center mb-6 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {localError}
                            </motion.p>
                        )}

                        {!otpSent ? (
                            <div className="space-y-6">
                                {isEmailMissing ? (
                                    <div>
                                        <label className="block text-sm font-medium text-secondary dark:text-highlight mb-2 flex items-center">
                                            <FiMail className="mr-2" />
                                            Nhập email của bạn
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            className="w-full p-3 border border-highlight/50 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-darkBackground text-textDark dark:text-textLight"
                                            placeholder="Nhập email"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-primary/5 dark:bg-accent/5 rounded-lg p-4 border border-primary/20 dark:border-accent/20">
                                        <label className="block text-sm font-medium text-secondary dark:text-highlight mb-2 flex items-center">
                                            <FiMail className="mr-2" />
                                            Email đăng ký
                                        </label>
                                        <div className="p-3 bg-white dark:bg-darkBackground rounded border border-highlight/30 font-medium text-primary dark:text-accent break-all">
                                            {email || 'Đang tải...'}
                                        </div>
                                    </div>
                                )}
                                <motion.button
                                    onClick={handleSendOtp}
                                    className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50"
                                    disabled={loading || !email}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiMail className="mr-2 inline" />
                                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                </motion.button>
                            </div>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="bg-primary/5 dark:bg-accent/5 rounded-lg p-4 border border-primary/20">
                                    <p className="text-sm text-secondary dark:text-highlight mb-2">
                                        Mã OTP đã gửi đến:
                                    </p>
                                    <div className="p-3 bg-white dark:bg-darkBackground rounded border border-highlight/30 font-medium text-primary dark:text-accent break-all flex items-center">
                                        <FiMail className="mr-2" />
                                        {email}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="otp"
                                        className="block text-sm font-medium text-secondary dark:text-highlight mb-2"
                                    >
                                        Nhập mã OTP
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-3 border border-highlight/50 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-darkBackground text-textDark dark:text-textLight"
                                        placeholder="Nhập mã OTP"
                                        disabled={loading}
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiCheck className="mr-2 inline" />
                                    {loading ? 'Đang xác thực...' : 'Xác thực'}
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="w-full text-sm text-primary hover:text-accent transition-colors duration-300"
                                    disabled={loading}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Gửi lại mã OTP
                                </motion.button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ActivateAccountPage;