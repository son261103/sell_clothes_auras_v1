import api from './api';
import {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    ChangePasswordWithOtpRequest,
    TokenResponse,
    RegisterResponse,
    ApiResponse,
    UserProfile,
} from '../types/auth.types';

// Lấy refresh token từ cookie hoặc localStorage tùy cấu hình
const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

const AuthService = {
    // Đăng nhập
    async login(loginRequest: LoginRequest): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/auth/login', loginRequest);
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    },

    // Đăng ký
    async register(registerRequest: RegisterRequest, otp?: string): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>(
            '/auth/register',
            registerRequest,
            { params: { otp } }
        );
        return response.data;
    },

    // Gửi OTP
    async sendOtp(email: string): Promise<ApiResponse> {
        const response = await api.post<ApiResponse>('/auth/send-otp', null, {
            params: { email },
        });
        return response.data;
    },

    // Xác thực OTP
    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const response = await api.post<boolean>('/auth/verify-otp', null, {
            params: { email, otp },
        });
        return response.data;
    },

    // Quên mật khẩu
    async forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Promise<ApiResponse> {
        const response = await api.post<ApiResponse>('/auth/forgot-password', forgotPasswordRequest);
        return response.data;
    },

    // Reset mật khẩu
    async resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<ApiResponse> {
        const response = await api.post<ApiResponse>('/auth/reset-password', resetPasswordRequest);
        return response.data;
    },

    // Refresh token
    async refreshToken(): Promise<TokenResponse> {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await api.post<TokenResponse>('/auth/refresh-token', {});
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    },

    // Đăng xuất
    async logout(): Promise<ApiResponse> {
        const response = await api.post<ApiResponse>('/auth/logout', {});
        localStorage.removeItem('accessToken');
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        return response.data;
    },

    // Thay đổi mật khẩu không cần OTP
    async changePassword(changePasswordRequest: ChangePasswordRequest): Promise<ApiResponse> {
        const response = await api.put<ApiResponse>('/auth/change-password', changePasswordRequest);
        return response.data;
    },

    // Thay đổi mật khẩu với OTP
    async changePasswordWithOtp(changePasswordRequest: ChangePasswordWithOtpRequest): Promise<ApiResponse> {
        const response = await api.put<ApiResponse>('/auth/change-password-otp', changePasswordRequest);
        return response.data;
    },

    // Lấy thông tin profile
    async getUserProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>('/auth/profile');
        return response.data;
    },

    // Cập nhật profile
    async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
        const response = await api.put<UserProfile>('/auth/profile', profile);
        return response.data;
    },
};

export default AuthService;