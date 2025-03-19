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
    profileToUpdateDTO,
    ProfileUpdateDTO
} from '../types/auth.types';

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
        return AuthService.verifyOtp(email, otp);
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
        try {
            await AuthService.logout();
            dispatch(logout());
        } catch (error) {
            console.error('Error during logout:', error);
            // Force logout anyway
            dispatch(logout());
        }
    };

    const changePassword = async (changePasswordRequest: ChangePasswordRequest) => {
        return AuthService.changePassword(changePasswordRequest);
    };

    const changePasswordWithOtp = async (changePasswordRequest: ChangePasswordWithOtpRequest) => {
        return AuthService.changePasswordWithOtp(changePasswordRequest);
    };

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