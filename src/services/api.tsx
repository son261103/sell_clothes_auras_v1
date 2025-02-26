import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AuthService from './auth.service';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Để gửi cookie (refresh token)
});

// Interceptor để thêm access token vào header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor xử lý refresh token khi access token hết hạn
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Gọi AuthService.refreshToken để làm mới token
                const newTokens = await AuthService.refreshToken();
                localStorage.setItem('accessToken', newTokens.accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Logout nếu refresh token cũng hết hạn
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;