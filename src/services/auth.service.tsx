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

// Tạo các type cụ thể để thay thế cho any
interface ErrorResponseData {
    message?: string;
    success?: boolean;
    error?: string;
    status?: number;
    userStatus?: string;
    email?: string;
    [key: string]: unknown;
}

// Hàm lấy refresh token từ cookie with fallback
const getRefreshToken = (): string | null => {
    // Try to get from cookie first
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);

    // Get from cookie
    const cookieToken = cookies['refreshToken'];
    if (cookieToken) return cookieToken;

    // Fallback to localStorage backup
    return localStorage.getItem('refreshTokenBackup');
};

// Hàm đặt refresh token vào cookie và localStorage backup
const setRefreshTokenCookie = (refreshToken: string): void => {
    // Set in cookie with strict security
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict;`; // 7 ngày

    // Also keep a backup in localStorage
    localStorage.setItem('refreshTokenBackup', refreshToken);
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

// Track refresh token attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
// Track last refresh time
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // 5 seconds

const AuthService: AuthServiceInterface = {
    async login(loginRequest: LoginRequest): Promise<TokenResponse> {
        try {
            // Thêm xử lý lỗi cho các trường hợp đặc biệt
            if (!loginRequest.loginId || !loginRequest.password) {
                throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu');
            }

            console.log('Đang gửi yêu cầu đăng nhập cho:', loginRequest.loginId);

            // Đưa rememberMe vào request
            const requestToSend = {
                ...loginRequest,
                rememberMe: loginRequest.rememberMe !== undefined ? loginRequest.rememberMe : true
            };

            const response = await authApi.post<TokenResponse>('/auth/login', requestToSend);
            console.log('Đăng nhập thành công:', response.data);

            // Store tokens properly
            localStorage.setItem('accessToken', response.data.accessToken);

            // Always store refresh token in both cookie and localStorage backup
            if (response.data.refreshToken) {
                setRefreshTokenCookie(response.data.refreshToken);
            }

            // Reset refresh attempt counter on successful login
            refreshAttempts = 0;

            return response.data;
        } catch (error) {
            console.error('Login error:', error);

            // Xử lý lỗi đăng nhập một cách rõ ràng hơn
            if ((error as AxiosError).response?.status === 401) {
                throw new Error('Thông tin đăng nhập không chính xác');
            } else if ((error as AxiosError).response?.status === 403) {
                throw new Error('Tài khoản của bạn đã bị khóa');
            } else if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi đăng nhập');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi đăng nhập');
            }
        }
    },

    async register(registerRequest: RegisterRequest, otp?: string): Promise<RegisterResponse> {
        try {
            // Thêm kiểm tra dữ liệu đầu vào
            if (!registerRequest.email || !registerRequest.username || !registerRequest.password) {
                throw new Error('Vui lòng nhập đầy đủ thông tin');
            }

            if (registerRequest.password !== registerRequest.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            console.log('Đang gửi yêu cầu đăng ký cho:', registerRequest.email);

            const response = await authApi.post<RegisterResponse>('/auth/register', registerRequest, { params: { otp } });
            console.log('Đăng ký thành công:', response.data);

            if (response.data.requiresEmailVerification) {
                try {
                    await this.sendOtp(registerRequest.email);
                    console.log('Đã gửi OTP sau khi đăng ký');
                } catch (error) {
                    console.error('Không thể gửi OTP sau khi đăng ký:', error);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Register error:', error);

            // Xử lý lỗi đăng ký
            if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi đăng ký');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi đăng ký');
            }
        }
    },

    async sendOtp(email: string): Promise<ApiResponse> {
        try {
            if (!email) {
                throw new Error('Vui lòng nhập địa chỉ email');
            }

            console.log('Đang gửi OTP cho email:', email);
            const response = await authApi.post<ApiResponse>('/auth/send-otp', null, { params: { email } });
            console.log('Gửi OTP thành công');
            return response.data;
        } catch (error) {
            console.error('Send OTP error:', error);
            const axiosError = error as AxiosError<ApiResponse>;
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi mã OTP' };
        }
    },

    async resendOtp(email: string): Promise<ApiResponse> {
        try {
            if (!email) {
                throw new Error('Vui lòng nhập địa chỉ email');
            }

            console.log('Đang gửi lại OTP cho email:', email);
            const response = await authApi.post<ApiResponse>('/auth/resend-otp', null, { params: { email } });
            console.log('Gửi lại OTP thành công');
            return response.data;
        } catch (error) {
            console.error('Resend OTP error:', error);
            const axiosError = error as AxiosError<ApiResponse>;
            throw axiosError.response?.data || { success: false, message: 'Không thể gửi lại mã OTP' };
        }
    },

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        try {
            if (!email || !otp) {
                throw new Error('Vui lòng nhập email và mã OTP');
            }

            console.log('Đang xác thực OTP cho email:', email);
            const response = await authApi.post<ApiResponse | boolean>('/auth/verify-otp', null, { params: { email, otp } });
            console.log('Xác thực OTP thành công');
            return typeof response.data === 'boolean' ? response.data : response.data.success ?? false;
        } catch (error) {
            console.error('Verify OTP error:', error);
            const axiosError = error as AxiosError<ApiResponse>;
            throw axiosError.response?.data || { success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' };
        }
    },

    async forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Promise<ApiResponse> {
        try {
            if (!forgotPasswordRequest.loginId) {
                throw new Error('Vui lòng nhập tên đăng nhập hoặc email');
            }

            console.log('Đang gửi yêu cầu quên mật khẩu cho:', forgotPasswordRequest.loginId);
            const response = await authApi.post<ApiResponse>('/auth/forgot-password', forgotPasswordRequest);
            console.log('Gửi yêu cầu quên mật khẩu thành công');
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);

            if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi yêu cầu khôi phục mật khẩu');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi yêu cầu khôi phục mật khẩu');
            }
        }
    },

    async resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<ApiResponse> {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!resetPasswordRequest.email || !resetPasswordRequest.otp || !resetPasswordRequest.newPassword) {
                throw new Error('Vui lòng nhập đầy đủ thông tin');
            }

            if (resetPasswordRequest.newPassword !== resetPasswordRequest.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            console.log('Đang đặt lại mật khẩu cho email:', resetPasswordRequest.email);
            const response = await authApi.post<ApiResponse>('/auth/reset-password', resetPasswordRequest);
            console.log('Đặt lại mật khẩu thành công');
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);

            if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi đặt lại mật khẩu');
            }
        }
    },

    async refreshToken(): Promise<TokenResponse> {
        const now = Date.now();

        // Prevent too frequent refresh attempts
        if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
            console.log('Refresh token attempted too soon, waiting...');
            await new Promise(resolve => setTimeout(resolve, MIN_REFRESH_INTERVAL - (now - lastRefreshTime)));
        }

        lastRefreshTime = Date.now();

        // Check refresh attempts to prevent infinite loops
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error(`Maximum refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached`);
            refreshAttempts = 0; // Reset counter
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            throw new Error('Đã vượt quá số lần thử làm mới token. Vui lòng đăng nhập lại.');
        }

        refreshAttempts++; // Increment counter

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            refreshAttempts = 0; // Reset counter on error
            throw new Error('Không tìm thấy refresh token');
        }

        try {
            console.log(`Attempting token refresh (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);

            // Use direct fetch call to avoid axios interceptors that might cause loops
            const response = await fetch(`${authApi.defaults.baseURL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Refresh token failed with status:', response.status, errorText);
                refreshAttempts = 0; // Reset counter on error
                throw new Error(`Không thể làm mới token: ${response.status} ${errorText}`);
            }

            const data = await response.json() as TokenResponse;

            // Store tokens securely
            localStorage.setItem('accessToken', data.accessToken);

            if (data.refreshToken) {
                setRefreshTokenCookie(data.refreshToken);
            }

            console.log('Token refresh successful');
            refreshAttempts = 0; // Reset counter on success

            return data;
        } catch (error) {
            console.error('Error during token refresh:', error);
            refreshAttempts = 0; // Reset counter on error

            // Clear all tokens on refresh failure
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';

            throw error;
        }
    },

    async logout(): Promise<ApiResponse> {
        try {
            console.log('Đang đăng xuất...');
            const refreshToken = getRefreshToken();
            let apiResponse: ApiResponse;
            if (refreshToken) {
                try {
                    const config = getAuthConfig();
                    const response = await authApi.post<ApiResponse>('/auth/logout', { refreshToken }, config);
                    apiResponse = response.data;
                    console.log('Đăng xuất thành công (server)');
                } catch (error) {
                    console.warn('Lỗi khi đăng xuất trên server:', error);
                    apiResponse = { success: true, message: 'Đăng xuất phía client' };
                }
            } else {
                console.log('Không tìm thấy refresh token, chỉ đăng xuất phía client');
                apiResponse = { success: true, message: 'Đăng xuất phía client' };
            }

            // Clear all tokens and state regardless of server response
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            localStorage.removeItem('pendingActivationEmail');
            localStorage.removeItem('otpEmail');

            // Reset counters
            refreshAttempts = 0;

            console.log('Đã xóa tất cả token và state phía client');
            return apiResponse;
        } catch (error) {
            console.error('Logout error:', error);

            // Force client-side logout even on server error
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            console.log('Đã cưỡng chế đăng xuất phía client do lỗi');

            // Reset counters
            refreshAttempts = 0;

            return { success: true, message: 'Đăng xuất cưỡng chế phía client' };
        }
    },

    async changePassword(changePasswordRequest: ChangePasswordRequest): Promise<ApiResponse> {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!changePasswordRequest.oldPassword || !changePasswordRequest.newPassword) {
                throw new Error('Vui lòng nhập đầy đủ thông tin');
            }

            if (changePasswordRequest.newPassword !== changePasswordRequest.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            console.log('Đang thay đổi mật khẩu...');
            const config = getAuthConfig();
            const response = await authApi.put<ApiResponse>('/auth/change-password', changePasswordRequest, config);
            console.log('Thay đổi mật khẩu thành công');
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);

            if ((error as AxiosError).response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi thay đổi mật khẩu');
            }
        }
    },

    async changePasswordWithOtp(changePasswordRequest: ChangePasswordWithOtpRequest): Promise<ApiResponse> {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!changePasswordRequest.oldPassword || !changePasswordRequest.newPassword || !changePasswordRequest.otp) {
                throw new Error('Vui lòng nhập đầy đủ thông tin');
            }

            if (changePasswordRequest.newPassword !== changePasswordRequest.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            console.log('Đang thay đổi mật khẩu với OTP...');
            const config = getAuthConfig();
            const response = await authApi.put<ApiResponse>('/auth/change-password-otp', changePasswordRequest, config);
            console.log('Thay đổi mật khẩu với OTP thành công');
            return response.data;
        } catch (error) {
            console.error('Change password with OTP error:', error);

            if ((error as AxiosError).response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi thay đổi mật khẩu');
            }
        }
    },

    async getUserProfile(): Promise<UserProfile> {
        try {
            console.log('Đang lấy thông tin hồ sơ người dùng...');
            const config = getAuthConfig();
            const token = localStorage.getItem('accessToken');

            if (!token) {
                console.warn('Không có access token, không thể lấy hồ sơ');
                throw new Error('Vui lòng đăng nhập để xem thông tin hồ sơ');
            }

            try {
                const response = await authApi.get<UserProfile>('/auth/profile', config);
                console.log('Lấy thông tin hồ sơ thành công');
                return response.data;
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;

                if (axiosError.response?.status === 401) {
                    console.log('Token hết hạn, đang làm mới token để lấy hồ sơ...');

                    // Kiểm tra xem có refresh token không
                    const refreshToken = getRefreshToken();
                    if (!refreshToken) {
                        throw new Error('Không có refresh token, vui lòng đăng nhập lại');
                    }

                    // Handle 401 by refreshing token and retrying
                    await this.refreshToken();

                    // Retry with new token
                    const newConfig = getAuthConfig();
                    const retryResponse = await authApi.get<UserProfile>('/auth/profile', newConfig);
                    console.log('Lấy thông tin hồ sơ thành công sau khi làm mới token');
                    return retryResponse.data;
                }

                throw error;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);

            if ((error as AxiosError).response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi lấy thông tin hồ sơ');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi lấy thông tin hồ sơ');
            }
        }
    },

    async updateUserProfile(profileData: ProfileUpdateDTO | UserProfile): Promise<UserProfile> {
        try {
            console.log('Đang cập nhật hồ sơ người dùng...');
            // Chuyển đổi dữ liệu sang ProfileUpdateDTO nếu cần
            const profileUpdate: ProfileUpdateDTO = 'userId' in profileData
                ? profileToUpdateDTO(profileData as UserProfile)
                : profileData as ProfileUpdateDTO;

            // Lấy token
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('Không có access token, đang thử làm mới token...');
                try {
                    // Try to refresh token first
                    await this.refreshToken();
                    const newToken = localStorage.getItem('accessToken');
                    if (!newToken) throw new Error('Không thể làm mới token');
                } catch (error) {
                    throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                }
            }

            // Get updated token
            const currentToken = localStorage.getItem('accessToken')!;
            const authToken = currentToken.startsWith('Bearer ') ? currentToken : `Bearer ${currentToken}`;

            // Kiểm tra dữ liệu trước khi gửi
            if (profileUpdate.dateOfBirth) {
                const dateObj = new Date(profileUpdate.dateOfBirth);
                if (isNaN(dateObj.getTime())) throw new Error('Ngày sinh không hợp lệ');
                if (dateObj > new Date()) throw new Error('Ngày sinh không thể trong tương lai');
            }

            console.log('Dữ liệu cập nhật hồ sơ:', JSON.stringify(profileUpdate, null, 2));

            try {
                // Use direct fetch to avoid potential issues with axios interceptors
                const apiUrl = `${authApi.defaults.baseURL}/auth/profile`;
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
                        console.log('Token hết hạn, đang làm mới token để cập nhật hồ sơ...');
                        // Token expired, refresh and retry
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

                        if (!retryResponse.ok) {
                            const errorText = await retryResponse.text();
                            throw new Error(`Lỗi ${retryResponse.status}: ${errorText}`);
                        }

                        const responseData = await retryResponse.json() as UserProfile;
                        console.log('Cập nhật hồ sơ thành công sau khi làm mới token');
                        return responseData;
                    }

                    const errorText = await fetchResponse.text();
                    throw new Error(`Lỗi ${fetchResponse.status}: ${errorText}`);
                }

                const responseData = await fetchResponse.json() as UserProfile;
                console.log('Cập nhật hồ sơ thành công');
                return responseData;
            } catch (error) {
                console.error('Lỗi cập nhật hồ sơ:', error);

                // If it's an axios error with a 401 status, try refresh and retry
                if ((error as AxiosError).response?.status === 401) {
                    await this.refreshToken();

                    // Try again with updated token
                    return this.updateUserProfile(profileUpdate);
                }

                throw error;
            }
        } catch (error) {
            console.error('Error updating profile:', error);

            if ((error as AxiosError).response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if ((error as AxiosError).response?.data) {
                const errorData = (error as AxiosError<ErrorResponseData>).response?.data;
                throw new Error(errorData?.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ');
            } else if ((error as Error).message) {
                throw new Error((error as Error).message);
            } else {
                throw new Error('Đã xảy ra lỗi không xác định khi cập nhật hồ sơ');
            }
        }
    },
};

export default AuthService;