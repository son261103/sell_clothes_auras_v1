import api from './api';
import {
    UserProfile,
    ProfileUpdateDTO,
    ChangePasswordRequest,
    ChangePasswordWithOtpRequest,
    AvatarResponse,
    UserStatus,
} from '../types/profile.types';
import {ApiResponse} from "../types";

const ProfileService = {
    /**
     * Get current user profile
     */
    async getUserProfile(): Promise<UserProfile> {
        try {
            const response = await api.get<UserProfile>('/public/profiles');

            // Validate response data
            if (!response.data) {
                console.warn('Invalid user profile response format:', response.data);
                // Return default profile object instead of throwing error
                return {
                    userId: 0,
                    username: '',
                    email: '',
                    fullName: '',
                    status: UserStatus.PENDING,
                    createdAt: new Date().toISOString(),
                    roles: [],
                    permissions: []
                };
            }

            // Return a copy to ensure object is extensible
            return {...response.data};
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Return a default profile object instead of throwing error
            return {
                userId: 0,
                username: '',
                email: '',
                fullName: '',
                status: UserStatus.PENDING,
                createdAt: new Date().toISOString(),
                roles: [],
                permissions: []
            };
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(profileData: ProfileUpdateDTO): Promise<UserProfile> {
        try {
            const response = await api.put<UserProfile>('/public/profiles', profileData);

            if (!response.data) {
                console.warn('Invalid update profile response format:', response.data);
                throw new Error('Invalid response format');
            }

            // Return a copy to ensure object is extensible
            return {...response.data};
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    /**
     * Change password
     */
    async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse> {
        try {
            const response = await api.put<ApiResponse>('/public/profiles/change-password', passwordData);

            if (!response.data) {
                console.warn('Invalid change password response format:', response.data);
                return {
                    success: false,
                    message: 'Failed to change password due to invalid response',
                };
            }

            return {...response.data};
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    /**
     * Change password with OTP verification
     */
    async changePasswordWithOtp(passwordData: ChangePasswordWithOtpRequest): Promise<ApiResponse> {
        try {
            const response = await api.put<ApiResponse>('/public/profiles/change-password-otp', passwordData);

            if (!response.data) {
                console.warn('Invalid change password with OTP response format:', response.data);
                return {
                    success: false,
                    message: 'Failed to change password due to invalid response',
                };
            }

            return {...response.data};
        } catch (error) {
            console.error('Error changing password with OTP:', error);
            throw error;
        }
    },

    /**
     * Upload avatar
     */
    async uploadAvatar(avatarFile: File): Promise<AvatarResponse> {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await api.post<AvatarResponse>('/public/profiles/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (!response.data) {
                console.warn('Invalid upload avatar response format:', response.data);
                return {
                    success: false,
                    message: 'Failed to upload avatar due to invalid response',
                };
            }

            return {...response.data};
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    },

    /**
     * Update avatar
     */
    async updateAvatar(avatarFile: File): Promise<AvatarResponse> {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await api.put<AvatarResponse>('/public/profiles/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (!response.data) {
                console.warn('Invalid update avatar response format:', response.data);
                return {
                    success: false,
                    message: 'Failed to update avatar due to invalid response',
                };
            }

            return {...response.data};
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    },

    /**
     * Delete avatar
     */
    async deleteAvatar(): Promise<ApiResponse> {
        try {
            const response = await api.delete<ApiResponse>('/public/profiles/avatar');

            if (!response.data) {
                console.warn('Invalid delete avatar response format:', response.data);
                return {
                    success: false,
                    message: 'Failed to delete avatar due to invalid response',
                };
            }

            return {...response.data};
        } catch (error) {
            console.error('Error deleting avatar:', error);
            throw error;
        }
    },

    /**
     * Validate profile data before submission
     * Client-side validation to match server-side validation
     */
    validateProfileData(profileData: ProfileUpdateDTO): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        // Validate email format if provided
        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Invalid email format';
        }

        // Check date of birth if provided
        if (profileData.dateOfBirth) {
            const dob = new Date(profileData.dateOfBirth);
            const now = new Date();
            const minDate = new Date();
            minDate.setFullYear(now.getFullYear() - 120); // 120 years ago

            if (isNaN(dob.getTime())) {
                errors.dateOfBirth = 'Invalid date format';
            } else if (dob > now) {
                errors.dateOfBirth = 'Date of birth cannot be in the future';
            } else if (dob < minDate) {
                errors.dateOfBirth = 'Date of birth is too far in the past';
            }
        }

        // Validate phone number if provided
        if (profileData.phone && profileData.phone.trim() !== '') {
            if (!/^\d+$/.test(profileData.phone)) {
                errors.phone = 'Phone number must contain only digits';
            }
        }

        // Validate full name if provided
        if (profileData.fullName && profileData.fullName.trim().length < 2) {
            errors.fullName = 'Full name must be at least 2 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Validate password change data
     */
    validatePasswordData(passwordData: ChangePasswordRequest): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        if (!passwordData.oldPassword) {
            errors.oldPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Validate password change with OTP data
     */
    validatePasswordWithOtpData(passwordData: ChangePasswordWithOtpRequest): {
        isValid: boolean;
        errors: Record<string, string>
    } {
        const errors: Record<string, string> = {};

        if (!passwordData.loginId) {
            errors.loginId = 'Login ID is required';
        }

        if (!passwordData.oldPassword) {
            errors.oldPassword = 'Current password is required';
        }

        if (!passwordData.otp) {
            errors.otp = 'OTP code is required';
        } else if (!/^\d{6}$/.test(passwordData.otp)) {
            errors.otp = 'OTP must be 6 digits';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default ProfileService;