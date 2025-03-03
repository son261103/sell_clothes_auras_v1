import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
    loginStart,
    loginSuccess,
    logout,
    setUserProfile,
} from '../redux/slices/authSlice';
import {
    selectIsAuthenticated,
    selectUser,
    selectAccessToken,
    selectLoading,
    selectError,
    selectUserRoles,
    selectUserPermissions,
} from '../redux/selectors/authSelectors';
import AuthService from '../services/auth.service';
import {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    ChangePasswordWithOtpRequest,
    UserProfile,
    TokenResponse,
    RegisterResponse,
    ApiResponse,
} from '../types/auth.types';

interface AuthHook {
    isAuthenticated: boolean;
    user: UserProfile | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
    roles: string[];
    permissions: string[];
    login: (loginRequest: LoginRequest) => Promise<TokenResponse>;
    register: (registerRequest: RegisterRequest, otp?: string) => Promise<RegisterResponse>;
    sendOtp: (email: string) => Promise<ApiResponse>;
    resendOtp: (email: string) => Promise<ApiResponse>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>; // Thay đổi thành Promise<boolean>
    forgotPassword: (forgotPasswordRequest: ForgotPasswordRequest) => Promise<ApiResponse>;
    resetPassword: (resetPasswordRequest: ResetPasswordRequest) => Promise<ApiResponse>;
    refreshToken: () => Promise<TokenResponse>;
    signOut: () => Promise<void>;
    changePassword: (changePasswordRequest: ChangePasswordRequest) => Promise<ApiResponse>;
    changePasswordWithOtp: (changePasswordRequest: ChangePasswordWithOtpRequest) => Promise<ApiResponse>;
    getUserProfile: () => Promise<UserProfile>;
    updateUserProfile: (profile: UserProfile) => Promise<UserProfile>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
}

const useAuth = (): AuthHook => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const accessToken = useSelector(selectAccessToken);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const roles = useSelector(selectUserRoles);
    const permissions = useSelector(selectUserPermissions);

    const login = async (loginRequest: LoginRequest) => {
        dispatch(loginStart());
        try {
            const response = await AuthService.login(loginRequest);
            dispatch(loginSuccess(response));
            return response;
        } catch (err) {
            dispatch({ type: 'auth/loginFailure', payload: (err as Error).message });
            throw err;
        }
    };

    const register = async (registerRequest: RegisterRequest, otp?: string) => {
        return AuthService.register(registerRequest, otp);
    };

    const sendOtp = async (email: string) => {
        return AuthService.sendOtp(email);
    };

    const resendOtp = async (email: string) => {
        return AuthService.resendOtp(email);
    };

    const verifyOtp = async (email: string, otp: string) => {
        return AuthService.verifyOtp(email, otp); // Trả về Promise<boolean>
    };

    const forgotPassword = async (forgotPasswordRequest: ForgotPasswordRequest) => {
        return AuthService.forgotPassword(forgotPasswordRequest);
    };

    const resetPassword = async (resetPasswordRequest: ResetPasswordRequest) => {
        return AuthService.resetPassword(resetPasswordRequest);
    };

    const refreshToken = async () => {
        const newTokens = await AuthService.refreshToken();
        dispatch(loginSuccess(newTokens));
        return newTokens;
    };

    const signOut = async () => {
        await AuthService.logout();
        dispatch(logout());
    };

    const changePassword = async (changePasswordRequest: ChangePasswordRequest) => {
        return AuthService.changePassword(changePasswordRequest);
    };

    const changePasswordWithOtp = async (changePasswordRequest: ChangePasswordWithOtpRequest) => {
        return AuthService.changePasswordWithOtp(changePasswordRequest);
    };

    const getUserProfile = async () => {
        const profile = await AuthService.getUserProfile();
        dispatch(setUserProfile(profile));
        return profile;
    };

    const updateUserProfile = async (profile: UserProfile) => {
        const updatedProfile = await AuthService.updateUserProfile(profile);
        dispatch(setUserProfile(updatedProfile));
        return updatedProfile;
    };

    const hasPermission = (permission: string): boolean => permissions.includes(permission);
    const hasRole = (role: string): boolean => roles.includes(role);

    return {
        isAuthenticated,
        user,
        accessToken,
        loading,
        error,
        roles,
        permissions,
        login,
        register,
        sendOtp,
        resendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        refreshToken,
        signOut,
        changePassword,
        changePasswordWithOtp,
        getUserProfile,
        updateUserProfile,
        hasPermission,
        hasRole,
    };
};

export default useAuth;