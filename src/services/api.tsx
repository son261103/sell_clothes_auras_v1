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
// Last successful refresh timestamp
let lastRefreshTime = 0;
// Minimum interval between refreshes (2 seconds)
const MIN_REFRESH_INTERVAL = 2000;
// Track if we're redirecting to login to prevent multiple redirects
let isRedirectingToLogin = false;
// Track if we've checked authentication on startup
let hasCheckedAuthOnStartup = false;

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

// Function to get refresh token from cookie with fallback to localStorage
const getRefreshToken = (): string | null => {
    // Try to get from cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);

    const cookieToken = cookies['refreshToken'];
    if (cookieToken) return cookieToken;

    // Fallback to localStorage
    return localStorage.getItem('refreshTokenBackup');
};

// Hàm giải mã token và lấy email
const getEmailFromToken = (token: string): string | null => {
    try {
        const decoded: TokenPayload = jwtDecode(token);
        return decoded.email || null;
    } catch (error) {
        console.log('Lỗi khi giải mã token:', error);
        return null;
    }
};

// Check if token is expired or about to expire (buffer period of 30 seconds)
const isTokenExpired = (token: string): boolean => {
    if (!token) {
        return true;
    }

    try {
        const decoded: TokenPayload = jwtDecode(token);
        // Check if token will expire in the next 30 seconds
        return decoded.exp * 1000 < Date.now() + 30000;
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

    // Try to parse normally first
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e)
        // Continue with fixes if normal parsing fails
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

// Improved token refresh function with retry and backoff
const refreshAccessToken = async (retries = 3, backoff = 300): Promise<string> => {
    const now = Date.now();
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        console.log('Skipping refresh - too soon since last refresh');
        // Return current token if we refreshed recently
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) return currentToken;
        throw new Error('No access token available and too soon to refresh');
    }

    console.log('Attempting to refresh token...');
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        // Use AuthService to refresh token
        const newTokens = await AuthService.refreshToken();

        console.log('Token refresh successful');
        localStorage.setItem('accessToken', newTokens.accessToken);

        if (newTokens.refreshToken) {
            // Store in cookie
            document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
            // Also keep backup in localStorage
            localStorage.setItem('refreshTokenBackup', newTokens.refreshToken);
        }

        store.dispatch(loginSuccess(newTokens));
        lastRefreshTime = Date.now();

        return newTokens.accessToken;
    } catch (error) {
        if (retries > 0) {
            // Wait using backoff strategy before retrying
            await new Promise(resolve => setTimeout(resolve, backoff));
            return refreshAccessToken(retries - 1, backoff * 2);
        }

        console.error('Token refresh failed after retries:', error);
        // Clear tokens on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshTokenBackup');
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        throw error;
    }
};

// Improved token refresh handler with better error handling
const handleTokenRefresh = async (error: AxiosError<ApiResponse>, apiInstance: AxiosInstance) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip token refresh for login/register/refresh-token requests
    if (originalRequest?.url?.includes('/auth/login') ||
        originalRequest?.url?.includes('/auth/register') ||
        originalRequest?.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
    }

    // Only try refreshing token for 401 errors and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Check user status from error response
        const userStatus = detectUserStatus(error);

        // Handle special user status cases
        if (userStatus === UserStatus.PENDING) {
            // For pending accounts, save email and redirect to activation page
            const token = localStorage.getItem('accessToken');
            if (token) {
                const email = getEmailFromToken(token);
                if (email) {
                    localStorage.setItem('pendingActivationEmail', email);
                }
            }

            // Only toast and redirect if not already on activation page
            if (!window.location.pathname.includes('/activate-account')) {
                toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#FFF9C4',
                        color: '#F57F17',
                    },
                });
                window.location.href = '/activate-account';
            }
            return Promise.reject(error);
        } else if (userStatus === UserStatus.BANNER) {
            // For banned accounts, clear auth and redirect to login
            toast.error('Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ admin.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());

            if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                window.location.href = '/login';
            }
            return Promise.reject(error);
        } else if (userStatus === UserStatus.LOCKED) {
            // For locked accounts, clear auth and redirect to login
            toast.error('Tài khoản của bạn đã bị tạm khóa. Vui lòng thử lại sau.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshTokenBackup');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            store.dispatch(logout());

            if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
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
            // Check for tokens
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = getRefreshToken();

            if (!accessToken && !refreshToken) {
                // No tokens available, redirect to login if not already there
                isRefreshing = false;
                processQueue(new Error('No tokens available'));
                store.dispatch(logout());

                if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    toast('Vui lòng đăng nhập để tiếp tục', {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#FFF9C4',
                            color: '#F57F17',
                        },
                    });
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            // Try to refresh the token with retry logic
            const newToken = await refreshAccessToken();

            // Update authorization header with new token
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }

            // Process any queued requests with the new token
            processQueue(null, newToken);
            isRefreshing = false;

            // Retry the original request with the new token
            return apiInstance(originalRequest);
        } catch (refreshError) {
            console.error('Token refresh failed during request:', refreshError);
            const typedError = refreshError as AxiosError<ApiResponse>;
            const userStatus = detectUserStatus(typedError);

            // Process queued requests with the error
            processQueue(new Error('Token refresh failed'));
            isRefreshing = false;

            // Handle specific error cases
            if (userStatus === UserStatus.PENDING) {
                const email = typedError.response?.data?.email;
                if (email) {
                    localStorage.setItem('pendingActivationEmail', email);
                }

                if (!window.location.pathname.includes('/activate-account')) {
                    toast('Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.', {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#FFF9C4',
                            color: '#F57F17',
                        },
                    });
                    window.location.href = '/activate-account';
                }
            } else if (userStatus === UserStatus.BANNER) {
                toast.error('Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ admin.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshTokenBackup');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());

                if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    window.location.href = '/login';
                }
            } else if (userStatus === UserStatus.LOCKED) {
                toast.error('Tài khoản của bạn đã bị tạm khóa. Vui lòng thử lại sau.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshTokenBackup');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());

                if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    window.location.href = '/login';
                }
            } else {
                // Generic token error - only redirect to login if needed
                const email = typedError.response?.data?.email;
                if (email) {
                    localStorage.setItem('loginEmail', email);
                }

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshTokenBackup');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());

                if (!window.location.pathname.includes('/login') && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#FFF9C4',
                            color: '#F57F17',
                        },
                    });
                    window.location.href = '/login';
                }
            }

            return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        }
    }

    return Promise.reject(error);
};

// Enhanced response handler to fix malformed JSON
const responseHandler = (response: AxiosResponse): AxiosResponse => {
    if (response.data && typeof response.data === 'string') {
        try {
            // Check for signs of malformed JSON
            if (
                response.data.includes('}{') ||
                response.data.includes('][') ||
                response.data.includes('undefined') ||
                (response.data.startsWith('{') && !response.data.endsWith('}')) ||
                (response.data.startsWith('[') && !response.data.endsWith(']'))
            ) {
                console.warn('Detected malformed JSON response, attempting to fix');
                const fixedData = fixMalformedJson(response.data);

                if (fixedData !== response.data) {
                    console.log('Successfully fixed malformed JSON response');
                    response.data = fixedData;
                }
            } else {
                // Try to parse valid-looking JSON
                if (
                    (response.data.startsWith('{') && response.data.endsWith('}')) ||
                    (response.data.startsWith('[') && response.data.endsWith(']'))
                ) {
                    try {
                        response.data = JSON.parse(response.data);
                    } catch {
                        console.warn('Failed to parse seemingly valid JSON, attempting fixes');
                        const fixedData = fixMalformedJson(response.data);
                        if (fixedData !== response.data) {
                            response.data = fixedData;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fix malformed JSON response:', e);
        }
    }

    return response;
};

// Improved request interceptor for authApi
authApi.interceptors.request.use(async (config) => {
    // Skip token checks for specific auth endpoints
    if (config.url?.includes('/auth/refresh-token') ||
        config.url?.includes('/auth/login') ||
        config.url?.includes('/auth/register')) {
        return config;
    }

    const token = localStorage.getItem('accessToken');

    // Proactively refresh token if it's expired or about to expire
    if (token && isTokenExpired(token)) {
        console.log('Token expired or about to expire, refreshing proactively');

        // Check if we're already refreshing
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                // Update the current request with the new token
                if (config.headers) {
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                }

                isRefreshing = false;
            } catch (refreshError) {
                console.error('Proactive token refresh failed:', refreshError);
                isRefreshing = false;

                // Let the request proceed with the old token
                // The response interceptor will handle the 401 if needed
            }
        } else {
            // Wait for ongoing refresh to complete
            console.log('Another request is already refreshing token, waiting...');
            await new Promise<void>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!isRefreshing) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);

                // Set a timeout to prevent infinite waiting
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            });

            // Get the new token after refresh completes
            const newToken = localStorage.getItem('accessToken');
            if (newToken && config.headers) {
                config.headers['Authorization'] = `Bearer ${newToken}`;
            }
        }
    }

    // Add token to request
    return addAuthToken(config);
}, (error) => Promise.reject(error));

// Improved request interceptor for publicApi
publicApi.interceptors.request.use(async (config) => {
    // For public routes, just add token if available without refresh
    if (config.url?.includes('/public/')) {
        return addAuthToken(config);
    }

    // Skip token check for auth endpoints
    if (config.url?.includes('/auth/refresh-token') ||
        config.url?.includes('/auth/login') ||
        config.url?.includes('/auth/register')) {
        return config;
    }

    // Handle the same as authApi for non-public routes
    const token = localStorage.getItem('accessToken');

    if (token && isTokenExpired(token)) {
        console.log('Token expired or about to expire, refreshing proactively');

        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                if (config.headers) {
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                }

                isRefreshing = false;
            } catch (refreshError) {
                console.error('Proactive token refresh failed:', refreshError);
                isRefreshing = false;
            }
        } else {
            // Wait for ongoing refresh to complete
            console.log('Another request is already refreshing token, waiting...');
            await new Promise<void>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!isRefreshing) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);

                // Set a timeout to prevent infinite waiting
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            });

            // Get the new token after refresh completes
            const newToken = localStorage.getItem('accessToken');
            if (newToken && config.headers) {
                config.headers['Authorization'] = `Bearer ${newToken}`;
            }
        }
    }

    return addAuthToken(config);
}, (error) => Promise.reject(error));

// Response interceptors for both instances
authApi.interceptors.response.use(responseHandler, (error) => {
    // Skip token refresh for auth endpoints
    if (error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
    }

    return handleTokenRefresh(error, authApi);
});

publicApi.interceptors.response.use(responseHandler, (error) => {
    // For public routes, handle errors differently
    if (error.config?.url?.includes('/public/')) {
        console.log('Error in public route - skipping token refresh logic');

        // For 401 errors in public routes, return empty data to avoid crashes
        if (error.response?.status === 401) {
            console.log('Public route returned 401 unauthorized - returning empty data');

            // Return a resolved promise with empty data
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

    // Skip token refresh for auth endpoints
    if (error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
    }

    // For other routes, handle normally
    return handleTokenRefresh(error, publicApi);
});

// Improved token validation on application startup
const validateTokenOnStartup = async () => {
    if (hasCheckedAuthOnStartup) {
        return; // Only check once per page load
    }

    hasCheckedAuthOnStartup = true;

    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.log('No access token found on startup');
            return;
        }

        // Check if token is expired or about to expire
        if (isTokenExpired(token)) {
            console.log('Token expired on startup, attempting refresh');

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                console.log('No refresh token available, clearing session');
                localStorage.removeItem('accessToken');
                store.dispatch(logout());
                return;
            }

            try {
                // Try to refresh the token with retries
                await refreshAccessToken(3, 300);
                console.log('Token refreshed successfully on startup');

                // Reset the redirect flag after successful refresh
                isRedirectingToLogin = false;
            } catch (refreshError) {
                console.error('Failed to refresh token on startup:', refreshError);

                // For failures, clear tokens but don't redirect unless on a protected route
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshTokenBackup');
                document.cookie = 'refreshToken=; Max-Age=0; path=/;';
                store.dispatch(logout());

                // Only redirect on protected routes
                const publicPaths = ['/login', '/register', '/forgot-password', '/products', '/home', '/'];
                const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));

                if (!isPublicPath && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    toast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#FFF9C4',
                            color: '#F57F17',
                        },
                    });
                    window.location.href = '/login';
                }
            }
        } else {
            console.log('Token valid on startup, no refresh needed');
        }
    } catch (error) {
        console.error('Error validating token on startup:', error);
    }
};

// Add event listener to reset the redirect flag on location changes
window.addEventListener('popstate', () => {
    isRedirectingToLogin = false;
});

// Add event listener for synchronizing logout across tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken' && !event.newValue) {
        // Another tab cleared the token, log out in this tab too
        document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        store.dispatch(logout());

        // Only redirect if not already on a public page
        const publicPaths = ['/login', '/register', '/forgot-password', '/products', '/home', '/'];
        const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));

        if (!isPublicPath && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            window.location.href = '/login';
        }
    }
});

// Run validation on startup with a small delay to ensure DOM is ready
setTimeout(() => {
    validateTokenOnStartup();
}, 100);

export {authApi, publicApi, refreshAccessToken, validateTokenOnStartup};
export default publicApi;