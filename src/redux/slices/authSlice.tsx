import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenResponse, UserProfile } from '../../types/auth.types';

// Định nghĩa trạng thái ban đầu cho auth
interface AuthState {
    isAuthenticated: boolean;
    user: UserProfile | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
}

// Khởi tạo state từ localStorage nếu có
const getInitialState = (): AuthState => {
    const accessToken = localStorage.getItem('accessToken');
    let user = null;

    // Cố gắng lấy dữ liệu cơ bản của user từ localStorage nếu có
    // Thêm tùy chọn này để giữ thông tin người dùng cơ bản giữa các lần làm mới trang
    try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
            user = JSON.parse(savedUserData);
        }
    } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
    }

    return {
        isAuthenticated: !!accessToken,
        user,
        accessToken,
        loading: false,
        error: null
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action: PayloadAction<TokenResponse>) {
            state.isAuthenticated = true;
            state.accessToken = action.payload.accessToken;
            state.user = {
                userId: action.payload.userId,
                username: action.payload.username,
                email: action.payload.email,
                fullName: action.payload.fullName,
                roles: action.payload.roles || [],
                permissions: action.payload.permissions || [],
            } as UserProfile;
            state.loading = false;

            // Lưu token vào localStorage
            localStorage.setItem('accessToken', action.payload.accessToken);

            // Lưu thông tin cơ bản của user vào localStorage để duy trì thông tin giữa các lần làm mới trang
            // Lưu ý: Chỉ lưu thông tin không nhạy cảm (không lưu password hoặc các token khác)
            localStorage.setItem('userData', JSON.stringify({
                userId: action.payload.userId,
                username: action.payload.username,
                email: action.payload.email,
                fullName: action.payload.fullName,
                roles: action.payload.roles || [],
                permissions: action.payload.permissions || [],
            }));
        },
        loginFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.loading = false;
            state.error = null;

            // Xóa dữ liệu khỏi localStorage và cookie
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userData');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        },
        setUserProfile(state, action: PayloadAction<UserProfile>) {
            state.user = action.payload;

            // Cập nhật thông tin user vào localStorage để duy trì giữa các lần làm mới trang
            localStorage.setItem('userData', JSON.stringify(action.payload));
        },
        updateLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
        // Thêm reducer để cập nhật token nếu cần
        updateAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            localStorage.setItem('accessToken', action.payload);
        }
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUserProfile,
    updateLoading,
    clearError,
    updateAccessToken
} = authSlice.actions;

export default authSlice.reducer;