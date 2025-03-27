import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GiStarSwirl } from 'react-icons/gi';
import { FcGoogle } from 'react-icons/fc';
import GlobalAuthService from '../../services/global.service';
import { GoogleCredentialResponse } from '../../types/global.types';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [googleInitialized, setGoogleInitialized] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { register, verifyOtp, sendOtp, resendOtp, loading, error, loginWithGoogleCredentials } = useAuth();

    // Load Google API script and initialize Google Sign-In
    useEffect(() => {
        const loadGoogleAPI = async () => {
            try {
                await GlobalAuthService.loadGoogleApiScript();
                initializeGoogleAuth();
            } catch (error) {
                console.error('Failed to load Google API:', error);
                toast.error('Không thể tải Google API');
            }
        };

        loadGoogleAPI();
    }, []);

    // Initialize Google Sign-In
    const initializeGoogleAuth = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
        if (!clientId) {
            console.error('Google Client ID is not configured');
            toast.error('Google Client ID chưa được cấu hình');
            return;
        }

        GlobalAuthService.initializeGoogleAuth(clientId, handleGoogleCredential);
        setGoogleInitialized(true);
    };

    // Render Google button once initialized
    useEffect(() => {
        if (googleInitialized && googleButtonRef.current) {
            GlobalAuthService.renderGoogleButton('google-signin-button', 'filled_blue');
        }
    }, [googleInitialized]);

    // Handle Google credential response
    const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
        try {
            setIsSubmitting(true);

            // Use the auth context method for Google login to ensure state consistency
            await loginWithGoogleCredentials(response, false);

            toast.success('Đăng ký với Google thành công!');
            navigate('/');
        } catch (error) {
            console.error('Google signup error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Đăng ký với Google thất bại';
            setLocalError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset local error when inputs change
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [username, email, password, confirmPassword, fullName, phone, otp]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(e.target.value);
    };

    // Password regex for validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

    // Handle registration form submission
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Validate required fields
        if (!username || !email || !password || !confirmPassword || !fullName) {
            setLocalError('Vui lòng nhập đầy đủ thông tin bắt buộc');
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setLocalError('Mật khẩu và xác nhận mật khẩu không khớp');
            toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        // Validate password format
        if (!passwordRegex.test(password)) {
            setLocalError('Mật khẩu phải chứa ít nhất một chữ số, một chữ cái thường, một chữ cái in hoa và một ký tự đặc biệt');
            toast.error('Mật khẩu phải chứa ít nhất một chữ số, một chữ cái thường, một chữ cái in hoa và một ký tự đặc biệt');
            return;
        }

        // Data to send to backend
        const registerData = { username, email, password, confirmPassword, fullName, phone };

        try {
            setIsSubmitting(true);
            await register(registerData);

            // Send OTP after successful registration
            try {
                await sendOtp(email);
                console.log('OTP đã được gửi tới email:', email);
            } catch (otpError) {
                console.error('Lỗi khi gửi OTP:', otpError);
            }

            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
            setShowOtpPopup(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('Register error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

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
            setIsSubmitting(true);
            const isVerified = await verifyOtp(email, otp);

            if (isVerified) {
                toast.success('Xác thực thành công! Vui lòng đăng nhập.');
                setShowOtpPopup(false);
                navigate('/login');
            } else {
                setLocalError('Mã OTP không hợp lệ');
                toast.error('Mã OTP không hợp lệ');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Xác thực thất bại. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('OTP verification error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle OTP resend
    const handleResendOtp = async () => {
        setLocalError(null);
        setIsResendingOtp(true);

        try {
            await resendOtp(email);
            toast.success('Mã OTP mới đã được gửi đến email của bạn!');
        } catch (err) {
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
                            Đăng ký
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

                        {/* Registration Form */}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                        Tên người dùng
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => handleInputChange(e, setUsername)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Tên người dùng"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleInputChange(e, setEmail)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Email"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                        placeholder="Mật khẩu"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => handleInputChange(e, setConfirmPassword)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Xác nhận mật khẩu"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => handleInputChange(e, setFullName)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Họ và tên"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-secondary dark:text-highlight mb-2">
                                    Số điện thoại (tùy chọn)
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => handleInputChange(e, setPhone)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Số điện thoại"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-highlight/30 dark:border-highlight/20"></div>
                            </div>
                            <div className="relative px-4 bg-lightBackground/50 dark:bg-darkBackground/50 text-sm text-secondary dark:text-highlight">
                                Hoặc đăng ký với
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="">
                            {/* Google Sign-In Button */}
                            <div className="col-span-1">
                                {googleInitialized ? (
                                    <div
                                        id="google-signin-button"
                                        ref={googleButtonRef}
                                        className="flex justify-center h-12 items-center"
                                    ></div>
                                ) : (
                                    <motion.button
                                        className="w-full h-12 bg-white dark:bg-darkBackground border border-highlight/50 rounded-lg flex items-center justify-center text-sm text-textDark dark:text-textLight hover:bg-primary/10 transition-all duration-300 shadow-sm hover:shadow-md group"
                                        disabled={isSubmitting}
                                        onClick={() => toast.error('Đang tải Google API...')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                    >
                                        <FcGoogle className="mr-2 text-lg group-hover:scale-110 transition-transform duration-300" />
                                        <span className="group-hover:text-primary dark:group-hover:text-accent">Google</span>
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-sm text-secondary dark:text-highlight mt-6">
                            Đã có tài khoản?{' '}
                            <Link
                                to="/login"
                                className="text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300 font-medium"
                            >
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

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
                            Xác nhận OTP
                        </h3>
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
                                    disabled={isSubmitting || isResendingOtp}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-accent hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                disabled={isSubmitting || isResendingOtp}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                            </motion.button>

                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-highlight/20">
                                <motion.button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-sm text-primary dark:text-primary hover:text-accent dark:hover:text-accent transition-colors duration-300 underline"
                                    disabled={isSubmitting || isResendingOtp}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isResendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={() => setShowOtpPopup(false)}
                                    className="text-sm text-secondary dark:text-highlight hover:text-accent dark:hover:text-accent transition-colors duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Đóng
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default RegisterPage;