import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Base API URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create separate instances for auth and public endpoints
const authApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies (refresh token)
});

const publicApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

// Response interceptor to handle token refresh
const handleTokenRefresh = async (error: AxiosError, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            // Use authApi directly to avoid circular dependency
            console.log('Attempting to refresh token...');
            const response = await authApi.post('/auth/refresh-token', {});
            const newTokens = response.data;
            console.log('New tokens received:', newTokens);

            localStorage.setItem('accessToken', newTokens.accessToken);

            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }

            console.log('Retrying original request with new token...');
            return apiInstance(originalRequest);
        } catch (refreshError: unknown) {
            console.error('Refresh token failed:', refreshError);

            const axiosRefreshError = refreshError as AxiosError;
            if (axiosRefreshError.response?.status === 401 || axiosRefreshError.response?.status === 400) {
                console.log('Both tokens expired or invalid.');
                toast.error('Token đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('accessToken');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
};

// Apply interceptors to both API instances
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