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
} from '../types/auth.types';

const useAuth = () => {
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
        const response = await AuthService.login(loginRequest);
        dispatch(loginSuccess(response));
        return response;
    };

    const register = (registerRequest: RegisterRequest, otp?: string) =>
        AuthService.register(registerRequest, otp);

    const sendOtp = (email: string) => AuthService.sendOtp(email);

    const verifyOtp = (email: string, otp: string) => AuthService.verifyOtp(email, otp);

    const forgotPassword = (forgotPasswordRequest: ForgotPasswordRequest) =>
        AuthService.forgotPassword(forgotPasswordRequest);

    const resetPassword = (resetPasswordRequest: ResetPasswordRequest) =>
        AuthService.resetPassword(resetPasswordRequest);

    const refreshToken = async () => {
        const newTokens = await AuthService.refreshToken();
        dispatch(loginSuccess(newTokens));
        return newTokens;
    };

    const signOut = async () => {
        await AuthService.logout();
        dispatch(logout());
    };

    const changePassword = (changePasswordRequest: ChangePasswordRequest) =>
        AuthService.changePassword(changePasswordRequest);

    const changePasswordWithOtp = (changePasswordRequest: ChangePasswordWithOtpRequest) =>
        AuthService.changePasswordWithOtp(changePasswordRequest);

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