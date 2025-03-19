import { authApi } from './api';
import { AxiosError, AxiosRequestConfig } from 'axios';
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
    ProfileUpdateDTO,
    profileToUpdateDTO,
} from '../types/auth.types';

// Hàm lấy refresh token từ cookie
const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

// Hàm đặt refresh token vào cookie với SameSite=Strict để tăng cường bảo mật
const setRefreshTokenCookie = (refreshToken: string): void => {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict;`; // 7 ngày
};

// Hàm lấy cấu hình xác thực với token
const getAuthConfig = (): AxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('Không tìm thấy token trong localStorage');
        return { headers: { 'Content-Type': 'application/json' } };
    }
    return {
        headers: {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

// Định nghĩa interface cho AuthService
interface AuthServiceInterface {
    login: (loginRequest: LoginRequest) => Promise<TokenResponse>;
    register: (registerRequest: RegisterRequest, otp?: string) => Promise<RegisterResponse>;
    sendOtp: (email: string) => Promise<ApiResponse>;
    resendOtp: (email: string) => Promise<ApiResponse>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    forgotPassword: (forgotPasswordRequest: ForgotPasswordRequest) => Promise<ApiResponse>;
    resetPassword: (resetPasswordRequest: ResetPasswordRequest) => Promise<ApiResponse>;
    refreshToken: () => Promise<TokenResponse>;
    logout: () => Promise<ApiResponse>;
    changePassword: (changePasswordRequest: ChangePasswordRequest) => Promise<ApiResponse>;
    changePasswordWithOtp: (changePasswordRequest: ChangePasswordWithOtpRequest) => Promise<ApiResponse>;
    getUserProfile: () => Promise<UserProfile>;
    updateUserProfile: (profileUpdate: ProfileUpdateDTO | UserProfile) => Promise<UserProfile>;
}

const AuthService: AuthServiceInterface = {
    async login(loginRequest: LoginRequest): Promise<TokenResponse> {
        const response = await authApi.post<TokenResponse>('/auth/login', loginRequest);

        // Chỉ lưu accessToken vào localStorage
        localStorage.setItem('accessToken', response.data.accessToken);

        return response.data;
    },


    async register(registerRequest: RegisterRequest, otp?: string): Promise<RegisterResponse> {
        const response = await authApi.post<RegisterResponse>('/auth/register', registerRequest, { params: { otp } });
        if (response.data.requiresEmailVerification) {
            try {
                await this.sendOtp(registerRequest.email);
            } catch (error) {
                console.error('Không thể gửi OTP sau khi đăng ký:', error);
            }
        }
        return response.data;
    },

    async sendOtp(email: string): Promise<ApiResponse> {
        try {
            const response = await authApi.post<ApiResponse>('/auth/send-otp', null, { params: { email } });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi mã OTP' };
        }
    },

    async resendOtp(email: string): Promise<ApiResponse> {
        try {
            const response = await authApi.post<ApiResponse>('/auth/resend-otp', null, { params: { email } });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi lại mã OTP' };
        }
    },

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        try {
            const response = await authApi.post<ApiResponse | boolean>('/auth/verify-otp', null, { params: { email, otp } });
            return typeof response.data === 'boolean' ? response.data : response.data.success ?? false;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
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
        const refreshToken = getRefreshToken() || localStorage.getItem('refreshTokenBackup');
        if (!refreshToken) {
            throw new Error('Không tìm thấy refresh token');
        }
        try {
            const response = await authApi.post<TokenResponse>('/auth/refresh-token', { refreshToken });
            localStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.refreshToken) {
                setRefreshTokenCookie(response.data.refreshToken);
                localStorage.setItem('refreshTokenBackup', response.data.refreshToken);
            }
            return response.data;
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            throw error;
        }
    },

    async logout(): Promise<ApiResponse> {
        try {
            const refreshToken = getRefreshToken();
            let apiResponse: ApiResponse;
            if (refreshToken) {
                const config = getAuthConfig();
                const response = await authApi.post<ApiResponse>('/auth/logout', { refreshToken }, config);
                apiResponse = response.data;
            } else {
                apiResponse = { success: true, message: 'Đăng xuất phía client' };
            }
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            localStorage.removeItem('pendingActivationEmail');
            localStorage.removeItem('otpEmail');
            return apiResponse;
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            console.log('L��i đăng xuất:', error);
            return { success: true, message: 'Đăng xuất cưỡng chế phía client' };
        }
    },

    async changePassword(changePasswordRequest: ChangePasswordRequest): Promise<ApiResponse> {
        const config = getAuthConfig();
        const response = await authApi.put<ApiResponse>('/auth/change-password', changePasswordRequest, config);
        return response.data;
    },

    async changePasswordWithOtp(changePasswordRequest: ChangePasswordWithOtpRequest): Promise<ApiResponse> {
        const config = getAuthConfig();
        const response = await authApi.put<ApiResponse>('/auth/change-password-otp', changePasswordRequest, config);
        return response.data;
    },

    async getUserProfile(): Promise<UserProfile> {
        try {
            const config = getAuthConfig();
            const token = localStorage.getItem('accessToken');
            if (!token) {
                await this.refreshToken();
                return this.getUserProfile();
            }
            const response = await authApi.get<UserProfile>('/auth/profile', config);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            if (axiosError.response?.status === 401) {
                await this.refreshToken();
                const config = getAuthConfig();
                const retryResponse = await authApi.get<UserProfile>('/auth/profile', config);
                return retryResponse.data;
            }
            throw error;
        }
    },

    async updateUserProfile(profileData: ProfileUpdateDTO | UserProfile): Promise<UserProfile> {
        try {
            // Chuyển đổi dữ liệu sang ProfileUpdateDTO nếu cần
            const profileUpdate: ProfileUpdateDTO = 'userId' in profileData
                ? profileToUpdateDTO(profileData as UserProfile)
                : profileData as ProfileUpdateDTO;

            // Lấy token
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }
            const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            // Kiểm tra dữ liệu trước khi gửi
            if (profileUpdate.dateOfBirth) {
                const dateObj = new Date(profileUpdate.dateOfBirth);
                if (isNaN(dateObj.getTime())) throw new Error('Ngày sinh không hợp lệ');
                if (dateObj > new Date()) throw new Error('Ngày sinh không thể trong tương lai');
            }

            console.log('Dữ liệu cập nhật hồ sơ:', JSON.stringify(profileUpdate, null, 2));

            // Gửi yêu cầu bằng fetch
            const apiUrl = `${authApi.defaults.baseURL}auth/profile`;
            const fetchResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileUpdate),
                credentials: 'include',
            });

            if (!fetchResponse.ok) {
                if (fetchResponse.status === 401) {
                    await this.refreshToken();
                    const newToken = localStorage.getItem('accessToken');
                    if (!newToken) throw new Error('Không thể làm mới token');
                    const refreshedAuthToken = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
                    const retryResponse = await fetch(apiUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': refreshedAuthToken,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(profileUpdate),
                        credentials: 'include',
                    });
                    if (!retryResponse.ok) throw new Error(`Lỗi ${retryResponse.status}: ${retryResponse.statusText}`);
                    return await retryResponse.json();
                }
                const errorText = await fetchResponse.text();
                throw new Error(`Lỗi ${fetchResponse.status}: ${errorText}`);
            }

            return await fetchResponse.json();
        } catch (error) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            throw error;
        }
    },
};

export default AuthService;