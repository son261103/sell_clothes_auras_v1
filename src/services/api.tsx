import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { store } from '../redux/store';
import { loginSuccess, logout } from '../redux/slices/authSlice';
import { UserStatus, ApiResponse, TokenResponse } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instances
const authApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

const publicApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Add auth token to request
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

// Create a separate instance just for token refresh to avoid interceptor loops
const tokenRefreshApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: {resolve: (value: unknown) => void; reject: (reason?: Error | null) => void}[] = [];

// Process failed queue (retry requests with new token or reject all)
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Detect user status from error message
const detectUserStatus = (error: AxiosError<ApiResponse>): UserStatus | null => {
    const errorMessage = error?.response?.data?.message || '';

    if (errorMessage.includes('has not been activated') ||
        errorMessage.includes('not active') ||
        errorMessage.includes('pending')) {
        return UserStatus.PENDING;
    }

    if (errorMessage.includes('banned') ||
        errorMessage.includes('permanently locked')) {
        return UserStatus.BANNER;
    }

    if (errorMessage.includes('locked') ||
        errorMessage.includes('temporarily')) {
        return UserStatus.LOCKED;
    }

    return null;
};

const handleTokenRefresh = async (error: AxiosError<ApiResponse>, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only try to refresh if we get a 401 and haven't tried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Detect user status from error message
        const userStatus = detectUserStatus(error);

        // If PENDING status, redirect to activation page
        if (userStatus === UserStatus.PENDING) {
            // Store user email if available in localStorage
            const user = store.getState().auth.user;
            if (user?.email) {
                localStorage.setItem('pendingActivationEmail', user.email);
            }

            // Clear auth data to logout
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());

            // Show message and redirect
            toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#FFF9C4',
                    color: '#F57F17',
                }
            });

            // Only redirect if not already on activation page
            if (!window.location.pathname.includes('/activate-account')) {
                window.location.href = '/activate-account';
            }

            return Promise.reject(error);
        }

        // If already refreshing, add to queue instead of making duplicate refresh requests
        if (isRefreshing) {
            return new Promise<string | unknown>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                if (originalRequest.headers && typeof token === 'string') {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
                return apiInstance(originalRequest);
            }).catch((err: Error) => {
                return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
            console.log('Attempting to refresh token...');

            // Use the separate API instance without interceptors to avoid loops
            // The server will read the refreshToken from the cookie
            const response = await tokenRefreshApi.post<TokenResponse>('/auth/refresh-token');
            const newTokens = response.data;

            console.log('Token refresh successful');

            // Update localStorage and Redux state
            localStorage.setItem('accessToken', newTokens.accessToken);

            // If the server returned a new refresh token, update the cookie
            if (newTokens.refreshToken) {
                document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800;`; // 7 days
            }

            // Update Redux store
            store.dispatch(loginSuccess(newTokens));

            // Update authorization header for the original request
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }

            // Process all queued requests with the new token
            processQueue(null, newTokens.accessToken);

            // Finally, reset refreshing flag and retry the original request
            isRefreshing = false;
            return apiInstance(originalRequest);

        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);

            // Check for specific user status in the error
            const typedError = refreshError as AxiosError<ApiResponse>;
            const userStatus = detectUserStatus(typedError);

            // Process all queued requests with the error
            processQueue(new Error('Token refresh failed'));

            // Reset refreshing flag
            isRefreshing = false;

            // Clear auth data
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());

            // Show appropriate message based on user status
            if (userStatus === UserStatus.PENDING) {
                // Store user email if available in localStorage
                const user = store.getState().auth.user;
                if (user?.email) {
                    localStorage.setItem('pendingActivationEmail', user.email);
                }

                toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#FFF9C4',
                        color: '#F57F17',
                    }
                });

                // Redirect to activation page if not already there
                if (!window.location.pathname.includes('/activate-account')) {
                    window.location.href = '/activate-account';
                }
            } else if (userStatus === UserStatus.BANNER) {
                toast.error('Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ admin.');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else if (userStatus === UserStatus.LOCKED) {
                toast.error('Tài khoản của bạn đã bị tạm khóa. Vui lòng thử lại sau.');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        }
    }

    // For non-401 errors or already retried requests, just reject
    return Promise.reject(error);
};

// Apply interceptors
authApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
publicApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

authApi.interceptors.response.use(
    (response) => response,
    (error) => handleTokenRefresh(error, authApi)
);

publicApi.interceptors.response.use(
    (response) => response,
    (error) => handleTokenRefresh(error, publicApi)
);

export { authApi, publicApi };
export default publicApi;