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

        // Lấy trạng thái từ Redux store
        const isAuthenticated = useSelector(selectIsAuthenticated);
        const user = useSelector(selectUser);
        const accessToken = useSelector(selectAccessToken);
        const loading = useSelector(selectLoading);
        const error = useSelector(selectError);
        const roles = useSelector(selectUserRoles);
        const permissions = useSelector(selectUserPermissions);

        // Đăng nhập
        const login = async (loginRequest: LoginRequest) => {
            dispatch(loginStart());
            const response = await AuthService.login(loginRequest);
            dispatch(loginSuccess(response));
            return response;
        };

        // Đăng ký
        const register = (registerRequest: RegisterRequest, otp?: string) =>
            AuthService.register(registerRequest, otp);

        // Gửi OTP
        const sendOtp = (email: string) => AuthService.sendOtp(email);

        // Xác thực OTP
        const verifyOtp = (email: string, otp: string) => AuthService.verifyOtp(email, otp);

        // Quên mật khẩu
        const forgotPassword = (forgotPasswordRequest: ForgotPasswordRequest) =>
            AuthService.forgotPassword(forgotPasswordRequest);

        // Reset mật khẩu
        const resetPassword = (resetPasswordRequest: ResetPasswordRequest) =>
            AuthService.resetPassword(resetPasswordRequest);

        // Làm mới token
        const refreshToken = async () => {
            const newTokens = await AuthService.refreshToken();
            dispatch(loginSuccess(newTokens)); // Cập nhật token mới vào Redux
            return newTokens;
        };

        // Đăng xuất
        const signOut = async () => {
            await AuthService.logout();
            dispatch(logout());
        };

        // Thay đổi mật khẩu không dùng OTP
        const changePassword = (changePasswordRequest: ChangePasswordRequest) =>
            AuthService.changePassword(changePasswordRequest);

        // Thay đổi mật khẩu với OTP
        const changePasswordWithOtp = (changePasswordRequest: ChangePasswordWithOtpRequest) =>
            AuthService.changePasswordWithOtp(changePasswordRequest);

        // Lấy thông tin profile
        const getUserProfile = async () => {
            const profile = await AuthService.getUserProfile();
            dispatch(setUserProfile(profile));
            return profile;
        };

        // Cập nhật profile
        const updateUserProfile = async (profile: UserProfile) => {
            const updatedProfile = await AuthService.updateUserProfile(profile);
            dispatch(setUserProfile(updatedProfile));
            return updatedProfile;
        };

        // Kiểm tra quyền (dựa trên roles hoặc permissions)
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