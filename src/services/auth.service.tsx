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

// Hàm đặt refresh token vào cookie - Enhanced with SameSite=Strict for better security
const setRefreshTokenCookie = (refreshToken: string): void => {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict;`; // 7 ngày
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
            const response = await authApi.post<ApiResponse | boolean>('/auth/verify-otp', null, {
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
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // Explicitly send the refresh token in the request body as expected by the backend
        const response = await authApi.post<TokenResponse>('/auth/refresh-token', { refreshToken });

        // Store the new tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
            setRefreshTokenCookie(response.data.refreshToken);
        }

        return response.data;
    },

    async logout(): Promise<ApiResponse> {
        try {
            const refreshToken = getRefreshToken();
            let apiResponse: ApiResponse;

            if (refreshToken) {
                try {
                    // Try to logout on the server with the token
                    const response = await authApi.post<ApiResponse>('/auth/logout', { refreshToken });
                    console.log('Logout successful on server');
                    apiResponse = response.data;
                } catch (error) {
                    // If server logout fails, log the error but continue with client-side logout
                    console.error('Server logout failed, continuing with client-side logout:', error);
                    apiResponse = {
                        success: true,
                        message: 'Logged out on client only'
                    };
                }
            } else {
                console.log('No refresh token found, performing client-side logout only');
                apiResponse = {
                    success: true,
                    message: 'Logged out on client only'
                };
            }

            // Always clear local storage and cookies, regardless of server response
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';

            // Clear any other auth-related storage
            localStorage.removeItem('pendingActivationEmail');
            localStorage.removeItem('otpEmail');

            console.log('Client-side logout complete');
            return apiResponse;
        } catch (error) {
            console.error('Complete logout process failed:', error);

            // Ensure tokens are removed even if there's an error
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';

            // Return a client-generated response for UI handling
            return {
                success: true,
                message: 'Forced logout on client'
            };
        }
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