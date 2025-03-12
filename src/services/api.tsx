import axios, {AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse} from 'axios';
import {toast} from 'react-hot-toast';
import {store} from '../redux/store';
import {loginSuccess, logout} from '../redux/slices/authSlice';
import {UserStatus, ApiResponse} from '../types/auth.types';
import {jwtDecode} from 'jwt-decode';
import AuthService from './auth.service.tsx';

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

// Cải thiện việc xử lý JSON lỗi
const fixMalformedJson = (data: string): unknown => {
    if (!data || typeof data !== 'string') {
        return data;
    }

    // Trường hợp 1: Chuỗi JSON không hợp lệ do nối nhiều đối tượng
    if (data.includes('}{')) {
        try {
            // Tìm vị trí kết thúc của đối tượng JSON đầu tiên
            let depth = 0;
            let firstObjEnd = -1;

            for (let i = 0; i < data.length; i++) {
                const char = data[i];
                if (char === '{') depth++;
                else if (char === '}') {
                    depth--;
                    if (depth === 0) {
                        firstObjEnd = i + 1;
                        break;
                    }
                }
            }

            if (firstObjEnd > 0) {
                const firstPart = data.substring(0, firstObjEnd);
                return JSON.parse(firstPart);
            }
        } catch (e) {
            console.error('Lỗi khi cố gắng sửa đối tượng JSON bị nối:', e);
        }
    }

    // Trường hợp 2: Chuỗi JSON không hợp lệ do nối nhiều mảng
    if (data.includes('][')) {
        try {
            // Tìm vị trí kết thúc của mảng JSON đầu tiên
            let depth = 0;
            let firstArrEnd = -1;

            for (let i = 0; i < data.length; i++) {
                const char = data[i];
                if (char === '[') depth++;
                else if (char === ']') {
                    depth--;
                    if (depth === 0) {
                        firstArrEnd = i + 1;
                        break;
                    }
                }
            }

            if (firstArrEnd > 0) {
                const firstPart = data.substring(0, firstArrEnd);
                return JSON.parse(firstPart);
            }
        } catch (e) {
            console.error('Lỗi khi cố gắng sửa mảng JSON bị nối:', e);
        }
    }

    // Trường hợp 3: Có khoảng trắng hoặc ký tự không hợp lệ ở đầu/cuối
    try {
        const trimmedData = data.trim();
        // Tìm đối tượng JSON hợp lệ đầu tiên
        const startObj = trimmedData.indexOf('{');
        const startArr = trimmedData.indexOf('[');

        let start = -1;
        if (startObj >= 0 && (startArr < 0 || startObj < startArr)) {
            start = startObj;
        } else if (startArr >= 0) {
            start = startArr;
        }

        if (start >= 0) {
            const potentialJson = trimmedData.substring(start);
            return JSON.parse(potentialJson);
        }
    } catch (e) {
        console.error('Lỗi khi cố gắng sửa JSON có ký tự không hợp lệ:', e);
    }

    // Trường hợp 4: Xử lý trường hợp đặc biệt - JSON có dấu phẩy cuối cùng không hợp lệ
    try {
        // Tìm vị trí lỗi từ thông báo lỗi
        const result = JSON.parse(data);
        return result;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        const positionMatch = errorMessage.match(/position (\d+)/);

        if (positionMatch && positionMatch[1]) {
            const errorPos = parseInt(positionMatch[1]);
            try {
                // Thử sửa lỗi tại vị trí đó
                const before = data.substring(0, errorPos);
                const after = data.substring(errorPos + 1);
                const fixedJson = before + after;
                return JSON.parse(fixedJson);
            } catch (innerError) {
                console.error('Không thể sửa JSON tại vị trí lỗi:', innerError);
            }

            try {
                // Thử cắt chuỗi tại vị trí lỗi
                const truncated = data.substring(0, errorPos) + '}';
                return JSON.parse(truncated);
            } catch (truncateError) {
                console.error('Không thể cắt bớt JSON tại vị trí lỗi:', truncateError);
            }
        }
    }

    // Trường hợp 5: Gỡ bỏ các ký tự không hợp lệ và thử lại
    try {
        // Loại bỏ các ký tự không phải UTF-8 hợp lệ
        const cleaned = data.replace(/[^\x20-\x7E]/g, '');
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Không thể sửa JSON sau khi loại bỏ ký tự không hợp lệ:', e);
    }

    // Nếu tất cả đều thất bại, trả về dữ liệu ban đầu
    return data;
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

// Xử lý response để sửa lỗi JSON
const responseHandler = (response: AxiosResponse): AxiosResponse => {
    // Chỉ xử lý nếu response.data tồn tại và là chuỗi
    if (response.data && typeof response.data === 'string') {
        try {
            // Nếu chuỗi có dấu hiệu là JSON không hợp lệ
            if (
                response.data.includes('}{') ||
                response.data.includes('][') ||
                response.data.includes('undefined') ||
                (response.data.startsWith('{') && !response.data.endsWith('}')) ||
                (response.data.startsWith('[') && !response.data.endsWith(']'))
            ) {
                console.warn('Phát hiện phản hồi JSON bị lỗi, đang cố gắng sửa');
                const fixedData = fixMalformedJson(response.data);

                // Chỉ cập nhật nếu dữ liệu đã được sửa thành công
                if (fixedData !== response.data) {
                    console.log('Đã sửa thành công phản hồi JSON');
                    response.data = fixedData;
                }
            } else {
                // Thử parse dữ liệu nếu nó có vẻ là JSON hợp lệ
                if (
                    (response.data.startsWith('{') && response.data.endsWith('}')) ||
                    (response.data.startsWith('[') && response.data.endsWith(']'))
                ) {
                    try {
                        response.data = JSON.parse(response.data);
                    } catch {
                        console.warn('Không thể parse JSON mặc dù có vẻ hợp lệ, thử sửa lỗi');
                        const fixedData = fixMalformedJson(response.data);
                        if (fixedData !== response.data) {
                            response.data = fixedData;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Không thể sửa phản hồi JSON bị lỗi:', e);
        }
    }

    return response;
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
    // Đối với các route public, chỉ thêm token nếu có, không cần refresh
    if (config.url?.includes('/public/')) {
        return addAuthToken(config);
    }

    // Xử lý giống như authApi cho các route không phải public
    const token = localStorage.getItem('accessToken');

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

// Response interceptors cho cả hai instance
authApi.interceptors.response.use(responseHandler, (error) => handleTokenRefresh(error, authApi));

publicApi.interceptors.response.use(responseHandler, (error) => {
    // Đối với các route public, không cần xử lý refresh token
    if (error.config?.url?.includes('/public/')) {
        console.log('Lỗi route public - bỏ qua logic refresh token');

        // Đối với lỗi 401 ở route public, chỉ log và trả về dữ liệu trống
        if (error.response?.status === 401) {
            console.log('Route public lỗi 401 unauthorized - trả về dữ liệu trống');

            // Trả về một Promise đã resolve với dữ liệu trống để tránh crash
            return Promise.resolve({
                data: Array.isArray(error.config?.data) ? [] : {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    empty: true
                }
            });
        }

        return Promise.reject(error);
    }

    // Đối với các route khác, xử lý bình thường
    return handleTokenRefresh(error, publicApi);
});

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