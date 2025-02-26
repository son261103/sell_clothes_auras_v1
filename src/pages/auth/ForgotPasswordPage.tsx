import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import AuthFormContainer from '../../components/auth/AuthFormContainer';

const ForgotPasswordPage: React.FC = () => {
    const [loginId, setLoginId] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { forgotPassword, resetPassword, loading } = useAuth();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            await forgotPassword({ loginId });
            setOtpSent(true);
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            await resetPassword({ email: loginId, otp, newPassword, confirmPassword });
            window.location.href = '/login';
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Reset password failed');
        }
    };

    return (
        <AuthFormContainer title="Quên mật khẩu" error={localError} loading={loading}>
            <form onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-textDark dark:text-textLight">
                        ID đăng nhập hoặc Email
                    </label>
                    <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                        placeholder="Nhập ID hoặc email"
                        disabled={loading || otpSent}
                    />
                </div>
                {otpSent && (
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
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-md focus:ring-primary focus:border-primary dark:bg-darkBackground dark:text-textLight dark:border-secondary"
                                placeholder="Nhập mật khẩu mới"
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
                    </>
                )}
                <button
                    type="submit"
                    className="w-full p-3 bg-primary text-white rounded-md hover:bg-opacity-90 transition disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading
                        ? 'Đang xử lý...'
                        : otpSent
                            ? 'Đặt lại mật khẩu'
                            : 'Gửi OTP'}
                </button>
                <p className="text-center text-sm text-textDark dark:text-textLight">
                    Quay lại{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Đăng nhập
                    </a>
                </p>
            </form>
        </AuthFormContainer>
    );
};

export default ForgotPasswordPage;