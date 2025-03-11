import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { store } from '../redux/store';
import { loginSuccess, logout } from '../redux/slices/authSlice';

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
// Fix: Use Error instead of any
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

const handleTokenRefresh = async (error: AxiosError, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only try to refresh if we get a 401 and haven't tried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

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
            const response = await tokenRefreshApi.post('/auth/refresh-token');
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

            // Process all queued requests with the error
            processQueue(new Error('Token refresh failed'));

            // Reset refreshing flag
            isRefreshing = false;

            // Clear auth data and redirect to login
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());

            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');

            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
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