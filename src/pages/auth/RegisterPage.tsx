import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import AuthFormContainer from '../../components/auth/AuthFormContainer';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { register, sendOtp, loading } = useAuth();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            await sendOtp(email);
            setOtpSent(true);
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to send OTP');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            await register(
                { username, email, password, confirmPassword, fullName, phone },
                otp
            );
            window.location.href = '/login';
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Registration failed');
        }
    };

    return (
        <AuthFormContainer title="Đăng ký" error={localError} loading={loading}>
            <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-textDark dark:text-textLight">
                        Tên người dùng
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                        placeholder="Nhập tên người dùng"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-textDark dark:text-textLight">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                        placeholder="Nhập email"
                        disabled={loading || otpSent}
                    />
                </div>
                {!otpSent ? (
                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-md hover:bg-opacity-90 transition disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                    </button>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-textLight">
                                OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Nhập mã OTP"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-textLight">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-textLight">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Xác nhận mật khẩu"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-textLight">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Nhập họ và tên"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-textLight">
                                Số điện thoại (không bắt buộc)
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Nhập số điện thoại"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 bg-primary text-white rounded-md hover:bg-opacity-90 transition disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </>
                )}
                <p className="text-center text-sm text-textDark dark:text-textLight">
                    Đã có tài khoản?{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Đăng nhập
                    </a>
                </p>
            </form>
        </AuthFormContainer>
    );
};

export default RegisterPage;