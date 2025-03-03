import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GiStarSwirl } from 'react-icons/gi';

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
    const [isResendingOtp, setIsResendingOtp] = useState(false);

    const navigate = useNavigate();
    const { register, verifyOtp, sendOtp, resendOtp, loading, error } = useAuth();

    // Reset localError khi các trường thay đổi
    useEffect(() => {
        if (localError) {
            setLocalError(null);
        }
    }, [username, email, password, confirmPassword, fullName, phone, otp]);

    // Regex kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

    // Xử lý đăng ký
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !password || !confirmPassword || !fullName) {
            setLocalError('Vui lòng nhập đầy đủ thông tin bắt buộc');
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        // Kiểm tra mật khẩu khớp
        if (password !== confirmPassword) {
            setLocalError('Mật khẩu và xác nhận mật khẩu không khớp');
            toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        // Kiểm tra định dạng mật khẩu
        if (!passwordRegex.test(password)) {
            setLocalError('Mật khẩu phải chứa ít nhất một chữ số, một chữ cái thường, một chữ cái in hoa và một ký tự đặc biệt');
            toast.error('Mật khẩu phải chứa ít nhất một chữ số, một chữ cái thường, một chữ cái in hoa và một ký tự đặc biệt');
            return;
        }

        // Dữ liệu gửi lên backend
        const registerData = { username, email, password, confirmPassword, fullName, phone };

        try {
            const loadingToast = toast.loading('Đang đăng ký...');
            await register(registerData); // Gọi hàm register từ useAuth
            toast.dismiss(loadingToast);

            // Hiển thị thông báo và mở popup OTP
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');

            // Chủ động gửi OTP ngay sau khi đăng ký thành công
            try {
                await sendOtp(email);
                console.log('OTP đã được gửi tới email:', email);
            } catch (otpError) {
                console.error('Lỗi khi gửi OTP:', otpError);
                // Không hiện thông báo lỗi gửi OTP ở đây vì đã đăng ký thành công
            }

            setShowOtpPopup(true); // Hiển thị popup OTP sau khi đăng ký thành công
        } catch (err) {
            toast.dismiss(); // Xóa loading toast nếu có lỗi
            const errorMessage = err instanceof Error ? err.message : 'Xác thực thất bại. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('Register error:', err);
        }
    };

    // Xử lý xác minh OTP
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
            const isVerified = await verifyOtp(email, otp); // Gọi hàm verifyOtp từ useAuth
            toast.dismiss(loadingToast);

            if (isVerified) {
                toast.success('Xác thực thành công! Vui lòng đăng nhập.');
                setShowOtpPopup(false);
                navigate('/login');
            } else {
                setLocalError('Mã OTP không hợp lệ');
                toast.error('Mã OTP không hợp lệ');
            }
        } catch (err) {
            toast.dismiss(); // Xóa loading toast nếu có lỗi
            const errorMessage = err instanceof Error ? err.message : 'Xác thực thất bại. Vui lòng thử lại.';
            setLocalError(errorMessage);
            toast.error(errorMessage);
            console.error('OTP verification error:', err);
        }
    };

    // Xử lý gửi lại OTP
    const handleResendOtp = async () => {
        setLocalError(null);
        setIsResendingOtp(true);

        try {
            const loadingToast = toast.loading('Đang gửi lại mã OTP...');
            await resendOtp(email);
            toast.dismiss(loadingToast);
            toast.success('Mã OTP mới đã được gửi đến email của bạn!');
        } catch (err) {
            toast.dismiss(); // Xóa loading toast nếu có lỗi
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
                className="w-full max-w-5xl mx-4 p-10 bg-white/90 dark:bg-darkBackground/90 backdrop-blur-md rounded-3xl shadow-xl border border-highlight/20 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
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

                    <div className="p-8 bg-lightBackground/50 dark:bg-darkBackground/50 rounded-2xl shadow-inner border border-highlight/30 h-[550px] flex flex-col">
                        <h2 className="text-3xl font-bold text-center mb-6 text-textDark dark:text-textLight">
                            Đăng ký
                        </h2>

                        {(error || localError) && (
                            <motion.p
                                className="text-red-500 dark:text-red-400 text-center mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error || localError}
                            </motion.p>
                        )}
                        {loading && (
                            <p className="text-accent dark:text-accent text-center mb-4 bg-accent/10 p-2 rounded-lg animate-pulse text-sm">
                                Đang xử lý...
                            </p>
                        )}

                        <form onSubmit={handleRegister} className="space-y-3 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Tên người dùng
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Tên người dùng"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                        Mật khẩu
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                        placeholder="Mật khẩu"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
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
                            </div>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Họ và tên"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-secondary dark:text-highlight mb-1">
                                    Số điện thoại (tùy chọn)
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 border border-highlight/50 dark:border-highlight/70 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent bg-white dark:bg-darkBackground text-textDark dark:text-textLight placeholder-secondary/60 dark:placeholder-highlight/60 transition-all duration-300 shadow-sm hover:shadow-md"
                                    placeholder="Số điện thoại"
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
                                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </motion.button>
                        </form>

                        <p className="text-center text-sm text-secondary dark:text-highlight mt-4">
                            Đã có tài khoản?{' '}
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

            {/* OTP Popup - Đã cập nhật */}
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