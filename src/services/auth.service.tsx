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
import {AxiosError} from "axios";

const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

const AuthService = {
    async login(loginRequest: LoginRequest): Promise<TokenResponse> {
        const response = await authApi.post<TokenResponse>('/auth/login', loginRequest);
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    },

    async register(registerRequest: RegisterRequest, otp?: string): Promise<RegisterResponse> {
        const response = await authApi.post<RegisterResponse>(
            '/auth/register',
            registerRequest,
            { params: { otp } }
        );
        return response.data;
    },

    async sendOtp(email: string): Promise<ApiResponse> {
        const response = await authApi.post<ApiResponse>('/auth/send-otp', null, {
            params: { email },
        });
        return response.data;
    },

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const response = await authApi.post<boolean>('/auth/verify-otp', null, {
            params: { email, otp },
        });
        return response.data;
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
        const response = await authApi.post<TokenResponse>('/auth/refresh-token', {});
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    },

    async logout(): Promise<ApiResponse> {
        const response = await authApi.post<ApiResponse>('/auth/logout', {});
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