import { authApi } from './api';
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
import { AxiosError } from 'axios';

// Hàm lấy refresh token từ cookie
const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

// Hàm đặt refresh token vào cookie
const setRefreshTokenCookie = (refreshToken: string) => {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800;`; // 7 ngày
};

const AuthService = {
    async login(loginRequest: LoginRequest): Promise<TokenResponse> {
        const response = await authApi.post<TokenResponse>('/auth/login', loginRequest);
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
            setRefreshTokenCookie(response.data.refreshToken);
        }
        return response.data;
    },

    async register(registerRequest: RegisterRequest, otp?: string): Promise<RegisterResponse> {
        const response = await authApi.post<RegisterResponse>(
            '/auth/register',
            registerRequest,
            { params: { otp } }
        );

        // Nếu đăng ký thành công, tự động gửi OTP
        if (response.data && response.data.requiresEmailVerification) {
            try {
                // Gửi OTP sau khi đăng ký thành công
                await this.sendOtp(registerRequest.email);
                console.log('OTP sent successfully after registration');
            } catch (error) {
                console.error('Could not send OTP after registration:', error);
                // Không throw lỗi ở đây để không ảnh hưởng đến luồng đăng ký
            }
        }

        return response.data;
    },

    async sendOtp(email: string): Promise<ApiResponse> {
        try {
            const response = await authApi.post<ApiResponse>('/auth/send-otp', null, {
                params: { email },
            });
            console.log('Send OTP response:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error sending OTP:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi mã OTP' };
        }
    },

    async resendOtp(email: string): Promise<ApiResponse> {
        try {
            const response = await authApi.post<ApiResponse>('/auth/resend-otp', null, {
                params: { email },
            });
            console.log('Resend OTP response:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error resending OTP:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi lại mã OTP' };
        }
    },

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        try {
            const response = await authApi.post<ApiResponse>('/auth/verify-otp', null, {
                params: { email, otp },
            });
            console.log('Verify OTP response:', response.data);

            // Kiểm tra cả response.data.success nếu API trả về ApiResponse
            if (typeof response.data === 'boolean') {
                return response.data;
            } else if (response.data && 'success' in response.data) {
                return response.data.success;
            }
            return false;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error verifying OTP:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || { success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' };
        }
    },

    async forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Promise<ApiResponse> {
        const response = await authApi.post<ApiResponse>('/auth/forgot-password', forgotPasswordRequest);
        return response.data;
    },

    async resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<ApiResponse> {
        const response = await authApi.post<ApiResponse>('/auth/reset-password', resetPasswordRequest);
        return response.data;
    },

    async refreshToken(): Promise<TokenResponse> {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await authApi.post<TokenResponse>('/auth/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
            setRefreshTokenCookie(response.data.refreshToken);
        }
        return response.data;
    },

    async logout(): Promise<ApiResponse> {
        const refreshToken = getRefreshToken();
        let response;
        if (refreshToken) {
            response = await authApi.post<ApiResponse>('/auth/logout', { refreshToken });
        } else {
            response = await authApi.post<ApiResponse>('/auth/logout', {});
        }
        localStorage.removeItem('accessToken');
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        return response.data;
    },

    async changePassword(changePasswordRequest: ChangePasswordRequest): Promise<ApiResponse> {
        const response = await authApi.put<ApiResponse>('/auth/change-password', changePasswordRequest);
        return response.data;
    },

    async changePasswordWithOtp(changePasswordRequest: ChangePasswordWithOtpRequest): Promise<ApiResponse> {
        const response = await authApi.put<ApiResponse>('/auth/change-password-otp', changePasswordRequest);
        return response.data;
    },

    async getUserProfile(): Promise<UserProfile> {
        try {
            const response = await authApi.get<UserProfile>('/auth/profile');
            console.log('Profile fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Error fetching user profile:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw error;
        }
    },

    async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
        const response = await authApi.put<UserProfile>('/auth/profile', profile);
        return response.data;
    },
};

export default AuthService;