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

const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem('accessToken'), // Kiểm tra token để xác định trạng thái ban đầu
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
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
                roles: action.payload.roles,
                permissions: action.payload.permissions,
            } as UserProfile;
            state.loading = false;
            localStorage.setItem('accessToken', action.payload.accessToken);
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
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
        },
        setUserProfile(state, action: PayloadAction<UserProfile>) {
            state.user = action.payload;
        },
        updateLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
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
} = authSlice.actions;

export default authSlice.reducer;