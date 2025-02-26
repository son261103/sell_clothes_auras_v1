import { RootState } from '../store';
import { UserProfile } from '../../types/auth.types';

// Selector để lấy trạng thái xác thực
export const selectIsAuthenticated = (state: RootState): boolean =>
    state.auth.isAuthenticated;

// Selector để lấy thông tin user
export const selectUser = (state: RootState): UserProfile | null =>
    state.auth.user;

// Selector để lấy access token
export const selectAccessToken = (state: RootState): string | null =>
    state.auth.accessToken;

// Selector để lấy trạng thái loading
export const selectLoading = (state: RootState): boolean =>
    state.auth.loading;

// Selector để lấy lỗi
export const selectError = (state: RootState): string | null =>
    state.auth.error;

// Selector để lấy roles của user
export const selectUserRoles = (state: RootState): string[] =>
    state.auth.user?.roles || [];

// Selector để lấy permissions của user
export const selectUserPermissions = (state: RootState): string[] =>
    state.auth.user?.permissions || [];