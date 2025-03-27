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
import GlobalAuthService from '../services/global.service';
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
    profileToUpdateDTO,
    ProfileUpdateDTO
} from '../types/auth.types';
import { GoogleCredentialResponse } from '../types/global.types';

// Variable to track profile request status
let profileRequestInProgress = false;
let lastProfileRequestTime = 0;
const PROFILE_REQUEST_THROTTLE = 2000; // 2 seconds

interface AuthHook {
    isAuthenticated: boolean;
    user: UserProfile | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
    roles: string[];
    permissions: string[];
    login: (loginRequest: LoginRequest) => Promise<TokenResponse>;
    loginWithGoogleCredentials: (
        googleResponse: GoogleCredentialResponse,
        rememberMe?: boolean
    ) => Promise<TokenResponse>;
    register: (registerRequest: RegisterRequest, otp?: string) => Promise<RegisterResponse>;
    sendOtp: (email: string) => Promise<ApiResponse>;
    resendOtp: (email: string) => Promise<ApiResponse>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    forgotPassword: (forgotPasswordRequest: ForgotPasswordRequest) => Promise<ApiResponse>;
    resetPassword: (resetPasswordRequest: ResetPasswordRequest) => Promise<ApiResponse>;
    refreshToken: () => Promise<TokenResponse>;
    signOut: () => Promise<void>;
    changePassword: (changePasswordRequest: ChangePasswordRequest) => Promise<ApiResponse>;
    changePasswordWithOtp: (changePasswordRequest: ChangePasswordWithOtpRequest) => Promise<ApiResponse>;
    getUserProfile: () => Promise<UserProfile>;
    updateUserProfile: (profile: ProfileUpdateDTO | UserProfile) => Promise<UserProfile>;
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

    // Login with username/password
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

    // Login with Google credentials
    const loginWithGoogleCredentials = async (
        googleResponse: GoogleCredentialResponse,
        rememberMe = false
    ) => {
        dispatch(loginStart());
        try {
            // Process Google credentials
            const response = await GlobalAuthService.handleGoogleCredential(googleResponse, rememberMe);

            // Update Redux state
            dispatch(loginSuccess(response));

            // Store user info for profile access
            if (!response.userId) {
                console.warn('User ID is missing in Google login response');
            }

            // Force profile refresh on next access
            profileRequestInProgress = false;
            lastProfileRequestTime = 0;

            return response;
        } catch (err) {
            dispatch({ type: 'auth/loginFailure', payload: (err as Error).message });
            throw err;
        }
    };

    // Register
    const register = async (registerRequest: RegisterRequest, otp?: string) => {
        return AuthService.register(registerRequest, otp);
    };

    // Send OTP
    const sendOtp = async (email: string) => {
        return AuthService.sendOtp(email);
    };

    // Resend OTP
    const resendOtp = async (email: string) => {
        return AuthService.resendOtp(email);
    };

    // Verify OTP
    const verifyOtp = async (email: string, otp: string) => {
        return AuthService.verifyOtp(email, otp);
    };

    // Forgot password
    const forgotPassword = async (forgotPasswordRequest: ForgotPasswordRequest) => {
        return AuthService.forgotPassword(forgotPasswordRequest);
    };

    // Reset password
    const resetPassword = async (resetPasswordRequest: ResetPasswordRequest) => {
        return AuthService.resetPassword(resetPasswordRequest);
    };

    // Refresh token
    const refreshToken = async () => {
        const newTokens = await AuthService.refreshToken();
        dispatch(loginSuccess(newTokens));
        return newTokens;
    };

    // Sign out
    const signOut = async () => {
        try {
            // Clear Google sign-in state if user logged in with Google
            if (user?.email) {
                GlobalAuthService.clearGoogleState(user.email);
            }

            // Call backend logout
            await AuthService.logout();

            // Clear any session storage
            sessionStorage.removeItem('avatarTimestamp');

            // Dispatch logout action to clear Redux state
            dispatch(logout());
        } catch (error) {
            console.error('Error during logout:', error);
            // Force logout anyway
            dispatch(logout());
        }
    };

    // Change password
    const changePassword = async (changePasswordRequest: ChangePasswordRequest) => {
        return AuthService.changePassword(changePasswordRequest);
    };

    // Change password with OTP
    const changePasswordWithOtp = async (changePasswordRequest: ChangePasswordWithOtpRequest) => {
        return AuthService.changePasswordWithOtp(changePasswordRequest);
    };

    // Get user profile
    const getUserProfile = async () => {
        try {
            // Check if already authenticated with detailed user data
            if (user && user.userId && Object.keys(user).length > 3) {
                console.log('User profile already loaded, skipping fetch');
                return user;
            }

            // Check for throttling
            const now = Date.now();
            if (now - lastProfileRequestTime < PROFILE_REQUEST_THROTTLE) {
                console.log('Profile request throttled, returning current data');
                return user || { userId: 0 } as UserProfile;
            }

            // Implement request tracking to prevent duplicate requests
            if (profileRequestInProgress) {
                console.log('Profile request already in progress, waiting...');
                return new Promise<UserProfile>((resolve) => {
                    // Wait for the current request to finish
                    const checkInterval = setInterval(() => {
                        if (!profileRequestInProgress) {
                            clearInterval(checkInterval);
                            resolve(user || { userId: 0 } as UserProfile);
                        }
                    }, 100);

                    // Set a timeout to prevent infinite waiting
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        profileRequestInProgress = false;
                        resolve(user || { userId: 0 } as UserProfile);
                    }, 5000);
                });
            }

            profileRequestInProgress = true;
            lastProfileRequestTime = now;

            const profile = await AuthService.getUserProfile();
            if (profile) {
                dispatch(setUserProfile(profile));
            }

            profileRequestInProgress = false;
            return profile;
        } catch (error) {
            profileRequestInProgress = false;
            console.error('Failed to get user profile:', error);
            throw error;
        }
    };

    // Update user profile
    const updateUserProfile = async (profileData: ProfileUpdateDTO | UserProfile) => {
        try {
            // If we receive a full UserProfile object, convert it to ProfileUpdateDTO
            const profileUpdateDTO = 'userId' in profileData
                ? profileToUpdateDTO(profileData as UserProfile)
                : profileData as ProfileUpdateDTO;

            const updatedProfile = await AuthService.updateUserProfile(profileUpdateDTO);
            dispatch(setUserProfile(updatedProfile));
            return updatedProfile;
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
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
        loginWithGoogleCredentials,
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