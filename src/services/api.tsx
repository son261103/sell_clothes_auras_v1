import axios, {AxiosInstance, InternalAxiosRequestConfig, AxiosError} from 'axios';
import {toast} from 'react-hot-toast';
import {store} from '../redux/store';
import {loginSuccess, logout} from '../redux/slices/authSlice';
import {UserStatus, ApiResponse} from '../types/auth.types';
import {jwtDecode} from 'jwt-decode';
import AuthService from './auth.service.tsx'; // Import AuthService

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Định nghĩa interface cho payload của token
interface TokenPayload {
    permissions: string[];
    roles: string[];
    fullName: string;
    userId: number;
    email: string;
    status: string;
    sub: string;
    iat: number;
    exp: number;
}

// Create axios instances
const authApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

const publicApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add auth token to request
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: Error | null) => void }[] = [];

// Process failed queue (retry requests with new token or reject all)
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Function to get refresh token from cookie
const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

// Hàm giải mã token và lấy email
const getEmailFromToken = (token: string): string | null => {
    try {
        const decoded: TokenPayload = jwtDecode(token);
        console.log('Giải mã token:', decoded);
        return decoded.email || null;
    } catch (error) {
        console.log('Lỗi khi giải mã token:', error);
        return null;
    }
};

// Check if token is expired or about to expire
const isTokenExpired = (token: string): boolean => {
    if (!token) {
        return true;
    }

    try {
        const decoded: TokenPayload = jwtDecode(token);
        // Check if token will expire in the next 60 seconds
        return decoded.exp * 1000 < Date.now() + 60000;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

// Detect user status from error message or response data
const detectUserStatus = (error: AxiosError<ApiResponse>): UserStatus | null => {
    const errorMessage = error?.response?.data?.message || '';
    const userStatus = error?.response?.data?.userStatus;

    if (userStatus) {
        return userStatus;
    }

    if (
        errorMessage.includes('has not been activated') ||
        errorMessage.includes('not active') ||
        errorMessage.includes('pending')
    ) {
        return UserStatus.PENDING;
    }

    if (errorMessage.includes('banned') || errorMessage.includes('permanently locked')) {
        return UserStatus.BANNER;
    }

    if (errorMessage.includes('locked') || errorMessage.includes('temporarily')) {
        return UserStatus.LOCKED;
    }

    return null;
};

const handleTokenRefresh = async (error: AxiosError<ApiResponse>, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const userStatus = detectUserStatus(error);

        if (userStatus === UserStatus.PENDING) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const email = getEmailFromToken(token);
                if (email) {
                    console.log('Tìm thấy email từ token:', email);
                    localStorage.setItem('pendingActivationEmail', email);
                } else {
                    console.log('Không tìm thấy email trong token');
                }
            }

            toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#FFF9C4',
                    color: '#F57F17',
                },
            });

            if (!window.location.pathname.includes('/activate-account')) {
                window.location.href = '/activate-account';
            }

            return Promise.reject(error);
        } else if (userStatus === UserStatus.BANNER) {
            toast.error('Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ admin.');
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        } else if (userStatus === UserStatus.LOCKED) {
            toast.error('Tài khoản của bạn đã bị tạm khóa. Vui lòng thử lại sau.');
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<string | unknown>((resolve, reject) => {
                failedQueue.push({resolve, reject});
            })
                .then((token) => {
                    if (originalRequest.headers && typeof token === 'string') {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    }
                    return apiInstance(originalRequest);
                })
                .catch((err: Error) => {
                    return Promise.reject(err);
                });
        }

        isRefreshing = true;

        try {
            console.log('Attempting to refresh token...');

            // Get refresh token from cookie
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Use AuthService to refresh token instead of direct API call
            const newTokens = await AuthService.refreshToken();

            console.log('Token refresh successful');
            localStorage.setItem('accessToken', newTokens.accessToken);

            if (newTokens.refreshToken) {
                document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            }

            store.dispatch(loginSuccess(newTokens));

            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }

            processQueue(null, newTokens.accessToken);
            isRefreshing = false;
            return apiInstance(originalRequest);
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            const typedError = refreshError as AxiosError<ApiResponse>;
            const userStatus = detectUserStatus(typedError);

            processQueue(new Error('Token refresh failed'));
            isRefreshing = false;

            if (userStatus === UserStatus.PENDING) {
                const email = typedError.response?.data?.email;
                if (email) {
                    localStorage.setItem('pendingActivationEmail', email);
                }
                toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#FFF9C4',
                        color: '#F57F17',
                    },
                });
                if (!window.location.pathname.includes('/activate-account')) {
                    window.location.href = '/activate-account';
                }
            } else if (userStatus === UserStatus.BANNER) {
                toast.error('Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ admin.');
                localStorage.removeItem('accessToken');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else if (userStatus === UserStatus.LOCKED) {
                toast.error('Tài khoản của bạn đã bị tạm khóa. Vui lòng thử lại sau.');
                localStorage.removeItem('accessToken');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else {
                // Chuyển hướng đến trang OTP thay vì đăng xuất
                const email = typedError.response?.data?.email;
                if (email) {
                    localStorage.setItem('otpEmail', email);
                }
                toast('Phiên đăng nhập hết hạn. Vui lòng xác thực lại qua OTP.', {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#FFF9C4',
                        color: '#F57F17',
                    },
                });
                if (!window.location.pathname.includes('/otp')) {
                    window.location.href = '/otp';
                }
            }

            return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        }
    }

    return Promise.reject(error);
};

// Apply interceptors
authApi.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('accessToken');

    // If token exists but is about to expire, refresh it proactively
    if (token && isTokenExpired(token) && !config.url?.includes('/auth/refresh-token')) {
        try {
            console.log('Token about to expire, refreshing proactively');
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                // If no refresh token, clear storage and redirect to login
                localStorage.removeItem('accessToken');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());
                window.location.href = '/login';
                throw new Error('No refresh token available');
            }

            // Get new tokens
            const newTokens = await AuthService.refreshToken();
            localStorage.setItem('accessToken', newTokens.accessToken);

            if (newTokens.refreshToken) {
                document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            }

            store.dispatch(loginSuccess(newTokens));

            // Update the current request with the new token
            if (config.headers) {
                config.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }
        } catch (error) {
            console.error('Proactive token refresh failed:', error);
            // Handle the error (redirect to login or show a notification)
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());
            window.location.href = '/login';
        }
    }

    // Continue with adding the token to the request
    return addAuthToken(config);
}, (error) => Promise.reject(error));

publicApi.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('accessToken');

    // If token exists but is about to expire, refresh it proactively (same as above)
    if (token && isTokenExpired(token) && !config.url?.includes('/auth/refresh-token')) {
        try {
            console.log('Token about to expire, refreshing proactively');
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                localStorage.removeItem('accessToken');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());
                window.location.href = '/login';
                throw new Error('No refresh token available');
            }

            const newTokens = await AuthService.refreshToken();
            localStorage.setItem('accessToken', newTokens.accessToken);

            if (newTokens.refreshToken) {
                document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            }

            store.dispatch(loginSuccess(newTokens));

            if (config.headers) {
                config.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }
        } catch (error) {
            console.error('Proactive token refresh failed:', error);
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());
            window.location.href = '/login';
        }
    }

    return addAuthToken(config);
}, (error) => Promise.reject(error));

authApi.interceptors.response.use(
    (response) => response,
    (error) => handleTokenRefresh(error, authApi)
);

publicApi.interceptors.response.use(
    (response) => response,
    (error) => handleTokenRefresh(error, publicApi)
);

// Add event listener for synchronizing logout across tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken' && !event.newValue) {
        // Another tab cleared the token, log out in this tab too
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        store.dispatch(logout());
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }
});

export {authApi, publicApi};
export default publicApi;