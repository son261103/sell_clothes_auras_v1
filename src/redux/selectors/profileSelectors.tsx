import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Gender } from "../../types/profile.types";

// Basic profile selectors
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;

// Avatar selectors
export const selectAvatarLoading = (state: RootState) => state.profile.avatarLoading;
export const selectAvatar = (state: RootState) => state.profile.profile?.avatar;

// Password management selectors
export const selectPasswordLoading = (state: RootState) => state.profile.passwordLoading;
export const selectPasswordError = (state: RootState) => state.profile.passwordError;

// Operation status selectors
export const selectIsUpdating = (state: RootState) => state.profile.isUpdating;
export const selectIsDeleting = (state: RootState) => state.profile.isDeleting;
export const selectLastRequestTimestamp = (state: RootState) => state.profile.lastRequestTimestamp;

// Utility selectors
export const selectHasProfile = (state: RootState) => !!state.profile.profile;
export const selectHasAvatar = (state: RootState) => !!state.profile.profile?.avatar;

// User information selectors
export const selectUserId = (state: RootState) => state.profile.profile?.userId;
export const selectUsername = (state: RootState) => state.profile.profile?.username;
export const selectEmail = (state: RootState) => state.profile.profile?.email;
export const selectFullName = (state: RootState) => state.profile.profile?.fullName;
export const selectPhone = (state: RootState) => state.profile.profile?.phone;
export const selectAddress = (state: RootState) => state.profile.profile?.address;
export const selectDateOfBirth = (state: RootState) => state.profile.profile?.dateOfBirth;
export const selectGender = (state: RootState) => state.profile.profile?.gender;
export const selectRoles = (state: RootState) => state.profile.profile?.roles || [];
export const selectPermissions = (state: RootState) => state.profile.profile?.permissions || [];
export const selectStatus = (state: RootState) => state.profile.profile?.status;
export const selectCreatedAt = (state: RootState) => state.profile.profile?.createdAt;
export const selectLastLoginAt = (state: RootState) => state.profile.profile?.lastLoginAt;

// Combined selectors
export const selectProfileSummary = (state: RootState) => ({
    fullName: state.profile.profile?.fullName,
    email: state.profile.profile?.email,
    username: state.profile.profile?.username,
    avatar: state.profile.profile?.avatar,
});

export const selectProfileDetails = (state: RootState) => ({
    profile: state.profile.profile,
    loading: state.profile.loading,
    error: state.profile.error,
    isUpdating: state.profile.isUpdating,
});

export const selectAvatarDetails = (state: RootState) => ({
    avatar: state.profile.profile?.avatar,
    loading: state.profile.avatarLoading,
    error: state.profile.error,
});

export const selectPasswordManagement = (state: RootState) => ({
    loading: state.profile.passwordLoading,
    error: state.profile.passwordError,
});

// Memoized selectors for derived data
export const selectGenderLabel = createSelector(
    [selectGender],
    (gender) => {
        switch (gender) {
            case Gender.MALE:
                return 'Nam';
            case Gender.FEMALE:
                return 'Nữ';
            case Gender.OTHER:
            default:
                return 'Khác';
        }
    }
);

export const selectIsAdmin = createSelector(
    [selectRoles],
    (roles) => roles.includes('ROLE_ADMIN')
);

export const selectFormattedDateOfBirth = createSelector(
    [selectDateOfBirth],
    (dateOfBirth) => {
        if (!dateOfBirth) return '';
        try {
            const date = new Date(dateOfBirth);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return '';
        }
    }
);

export const selectFormattedCreatedAt = createSelector(
    [selectCreatedAt],
    (createdAt) => {
        if (!createdAt) return '';
        try {
            const date = new Date(createdAt);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '';
        }
    }
);

export const selectFormattedLastLoginAt = createSelector(
    [selectLastLoginAt],
    (lastLoginAt) => {
        if (!lastLoginAt) return 'Chưa đăng nhập';
        try {
            const date = new Date(lastLoginAt);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Không xác định';
        }
    }
);

export const selectProfileCompleteness = createSelector(
    [selectProfile],
    (profile) => {
        if (!profile) return 0;

        // Define fields to check for completeness
        const fieldsToCheck = [
            'fullName', 'email', 'phone', 'gender',
            'dateOfBirth', 'address', 'avatar'
        ];

        const fieldsPresent = fieldsToCheck.filter(
            field => !!profile[field as keyof typeof profile]
        ).length;

        return Math.round((fieldsPresent / fieldsToCheck.length) * 100);
    }
);