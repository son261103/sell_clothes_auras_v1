import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
    getProfileStart,
    getProfileSuccess,
    getProfileFailure,
    updateProfileStart,
    updateProfileSuccess,
    updateProfileFailure,
    uploadAvatarStart,
    uploadAvatarSuccess,
    uploadAvatarFailure,
    updateAvatarStart,
    updateAvatarSuccess,
    updateAvatarFailure,
    deleteAvatarStart,
    deleteAvatarSuccess,
    deleteAvatarFailure,
    changePasswordStart,
    changePasswordSuccess,
    changePasswordFailure,
    changePasswordWithOtpStart,
    changePasswordWithOtpSuccess,
    changePasswordWithOtpFailure,
    clearError,
    clearPasswordError
} from '../redux/slices/profileSlice';

import {
    selectProfile,
    selectProfileLoading,
    selectProfileError,
    selectIsUpdating,
    selectIsDeleting,
    selectAvatarLoading,
    selectPasswordLoading,
    selectPasswordError,
    selectHasProfile,
    selectLastRequestTimestamp
} from '../redux/selectors/profileSelectors';

import { selectIsAuthenticated, selectAccessToken } from '../redux/selectors/authSelectors';

import ProfileService from '../services/profile.service';
import {
    UserProfile,
    ProfileUpdateDTO,
    ChangePasswordRequest,
    ChangePasswordWithOtpRequest,
    AvatarResponse
} from '../types/profile.types';
import { ApiResponse } from "../types";

// Variable to track profile request status
let profileRequestInProgress = false;
let fetchAttempted = false;
const PROFILE_REQUEST_THROTTLE = 2000; // 2 seconds

// Define interface for hook useProfile - renamed loading to isLoading
interface UseProfileHook {
    profile: UserProfile | null;
    isLoading: boolean;  // Changed loading to isLoading to match usage
    error: string | null;
    hasProfile: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    avatarLoading: boolean;
    passwordLoading: boolean;
    passwordError: string | null;

    getProfile: (force?: boolean) => Promise<UserProfile>;
    updateProfile: (profileUpdate: ProfileUpdateDTO) => Promise<UserProfile>;

    uploadAvatar: (file: File) => Promise<AvatarResponse>;
    updateAvatar: (file: File) => Promise<AvatarResponse>;
    deleteAvatar: () => Promise<ApiResponse>;

    changePassword: (changePasswordData: ChangePasswordRequest) => Promise<ApiResponse>;
    changePasswordWithOtp: (changePasswordData: ChangePasswordWithOtpRequest) => Promise<ApiResponse>;

    clearProfileError: () => void;
    clearProfilePasswordError: () => void;
}

// Custom hook useProfile
const useProfile = (): UseProfileHook => {
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const profile = useSelector(selectProfile);
    const loading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);
    const hasProfile = useSelector(selectHasProfile);
    const isUpdating = useSelector(selectIsUpdating);
    const isDeleting = useSelector(selectIsDeleting);
    const avatarLoading = useSelector(selectAvatarLoading);
    const passwordLoading = useSelector(selectPasswordLoading);
    const passwordError = useSelector(selectPasswordError);
    const lastRequestTimestamp = useSelector(selectLastRequestTimestamp);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const accessToken = useSelector(selectAccessToken);

    // Function to get user profile information - modified to use useCallback
    const getProfile = useCallback(async (force: boolean = false): Promise<UserProfile> => {
        try {
            // Don't fetch if not authenticated
            if (!isAuthenticated || !accessToken) {
                console.log('Not authenticated, skipping profile fetch');
                return {} as UserProfile;
            }

            // Check if already fetched complete profile data
            if (!force && profile && Object.keys(profile).length > 3) {
                console.log('Profile already loaded, skipping fetch');
                return profile;
            }

            // Check for throttling
            const now = Date.now();
            if (!force && now - lastRequestTimestamp < PROFILE_REQUEST_THROTTLE) {
                console.log('Profile request throttled, returning current data');
                return profile || {} as UserProfile;
            }

            // Implement request tracking to prevent duplicate requests
            if (profileRequestInProgress) {
                console.log('Profile request already in progress, waiting...');
                return new Promise<UserProfile>((resolve) => {
                    // Wait for the current request to finish
                    const checkInterval = setInterval(() => {
                        if (!profileRequestInProgress) {
                            clearInterval(checkInterval);
                            resolve(profile || {} as UserProfile);
                        }
                    }, 100);

                    // Set a timeout to prevent infinite waiting
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        profileRequestInProgress = false;
                        resolve(profile || {} as UserProfile);
                    }, 5000);
                });
            }

            profileRequestInProgress = true;
            dispatch(getProfileStart());
            console.log('Fetching user profile...');

            try {
                // Fixed: Changed from getProfile to getUserProfile
                const fetchedProfile = await ProfileService.getUserProfile();
                console.log('Profile fetched successfully:', fetchedProfile);
                dispatch(getProfileSuccess(fetchedProfile));
                profileRequestInProgress = false;
                fetchAttempted = true;
                return fetchedProfile;
            } catch (err) {
                console.error('Error fetching profile:', err);
                const errorMessage = err instanceof Error ? err.message : 'Không thể lấy thông tin hồ sơ';
                dispatch(getProfileFailure(errorMessage));
                profileRequestInProgress = false;
                fetchAttempted = true;
                throw err;
            }
        } catch (error) {
            profileRequestInProgress = false;
            fetchAttempted = true;
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }, [dispatch, profile, lastRequestTimestamp, isAuthenticated, accessToken]);

    // Auto-fetch profile when authenticated
    useEffect(() => {
        // Only fetch if authenticated, not already loading, and haven't attempted fetch yet
        if (isAuthenticated && accessToken && !loading && !fetchAttempted) {
            console.log('Auto-fetching profile on mount');
            getProfile(true).catch(err => {
                console.error('Error in auto-fetch profile:', err);
            });
        }

        // Reset fetch status when authentication changes
        return () => {
            if (!isAuthenticated) {
                fetchAttempted = false;
            }
        };
    }, [isAuthenticated, accessToken, loading, getProfile]);

    // Function to update user profile
    const updateProfile = async (profileUpdate: ProfileUpdateDTO): Promise<UserProfile> => {
        dispatch(updateProfileStart());
        try {
            const updatedProfile = await ProfileService.updateProfile(profileUpdate);
            dispatch(updateProfileSuccess(updatedProfile));
            return updatedProfile;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ';
            dispatch(updateProfileFailure(errorMessage));
            throw err;
        }
    };

    // Function to upload avatar
    const uploadAvatar = async (file: File): Promise<AvatarResponse> => {
        dispatch(uploadAvatarStart());
        try {
            const response = await ProfileService.uploadAvatar(file);
            // Changed: Now correctly typing response as AvatarResponse
            dispatch(uploadAvatarSuccess(response));
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải lên avatar';
            dispatch(uploadAvatarFailure(errorMessage));
            throw err;
        }
    };

    // Function to update avatar
    const updateAvatar = async (file: File): Promise<AvatarResponse> => {
        dispatch(updateAvatarStart());
        try {
            const response = await ProfileService.updateAvatar(file);
            // Changed: Now correctly typing response as AvatarResponse
            dispatch(updateAvatarSuccess(response));
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật avatar';
            dispatch(updateAvatarFailure(errorMessage));
            throw err;
        }
    };

    // Function to delete avatar
    const deleteAvatar = async (): Promise<ApiResponse> => {
        dispatch(deleteAvatarStart());
        try {
            const response = await ProfileService.deleteAvatar();
            dispatch(deleteAvatarSuccess(response));
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể xóa avatar';
            dispatch(deleteAvatarFailure(errorMessage));
            throw err;
        }
    };

    // Function to change password
    const changePassword = async (changePasswordData: ChangePasswordRequest): Promise<ApiResponse> => {
        dispatch(changePasswordStart());
        try {
            const response = await ProfileService.changePassword(changePasswordData);
            dispatch(changePasswordSuccess());
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể thay đổi mật khẩu';
            dispatch(changePasswordFailure(errorMessage));
            throw err;
        }
    };

    // Function to change password with OTP
    const changePasswordWithOtp = async (changePasswordData: ChangePasswordWithOtpRequest): Promise<ApiResponse> => {
        dispatch(changePasswordWithOtpStart());
        try {
            const response = await ProfileService.changePasswordWithOtp(changePasswordData);
            dispatch(changePasswordWithOtpSuccess());
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể thay đổi mật khẩu bằng OTP';
            dispatch(changePasswordWithOtpFailure(errorMessage));
            throw err;
        }
    };

    // Function to clear error in state
    const clearProfileError = () => {
        dispatch(clearError());
    };

    // Function to clear password error in state
    const clearProfilePasswordError = () => {
        dispatch(clearPasswordError());
    };

    return {
        profile,
        isLoading: loading,
        error,
        hasProfile,
        isUpdating,
        isDeleting,
        avatarLoading,
        passwordLoading,
        passwordError,
        getProfile,
        updateProfile,
        uploadAvatar,
        updateAvatar,
        deleteAvatar,
        changePassword,
        changePasswordWithOtp,
        clearProfileError,
        clearProfilePasswordError,
    };
};

export default useProfile;