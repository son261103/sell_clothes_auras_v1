import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { store } from '../redux/store'; // Đảm bảo bạn đã export store
import { loginSuccess } from '../redux/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Hàm lấy refresh token từ cookie (đồng bộ với AuthService)
const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};

const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.log('No token found in localStorage');
    }
    return config;
};

const handleTokenRefresh = async (error: AxiosError, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            console.log('Attempting to refresh token...');
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await authApi.post('/auth/refresh-token', { refreshToken });
            const newTokens = response.data;

            console.log('New tokens received:', newTokens);
            localStorage.setItem('accessToken', newTokens.accessToken);
            document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800;`; // 7 ngày

            // Cập nhật Redux store
            store.dispatch(loginSuccess(newTokens));

            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }
            console.log('Retrying original request with new token...');
            return apiInstance(originalRequest);
        } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
};

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