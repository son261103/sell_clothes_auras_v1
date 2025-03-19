import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gender, UserProfile, AvatarResponse } from '../../types/profile.types';

interface ProfileState {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    avatarLoading: boolean;
    passwordLoading: boolean;
    passwordError: string | null;
    isUpdating: boolean;
    isDeleting: boolean;
    lastRequestTimestamp: number;
}

const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
    avatarLoading: false,
    passwordLoading: false,
    passwordError: null,
    isUpdating: false,
    isDeleting: false,
    lastRequestTimestamp: 0
};

const ensureProfileData = (profile: UserProfile): UserProfile => {
    if (!profile) return profile;
    return {
        ...profile,
        roles: profile.roles || [],
        permissions: profile.permissions || [],
        gender: profile.gender || Gender.OTHER
    };
};

// Helper function to update profile with avatar URL
const updateProfileWithAvatar = (state: ProfileState, avatarResponse: AvatarResponse) => {
    if (state.profile && avatarResponse.success && avatarResponse.avatarUrl) {
        state.profile = {
            ...state.profile,
            avatar: avatarResponse.avatarUrl
        };
    }
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        // Get profile
        getProfileStart(state) {
            state.loading = true;
            state.error = null;
            state.lastRequestTimestamp = Date.now();
        },
        getProfileSuccess(state, action: PayloadAction<UserProfile>) {
            state.loading = false;
            state.profile = ensureProfileData(action.payload);
            state.error = null;
        },
        getProfileFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        // Update profile
        updateProfileStart(state) {
            state.isUpdating = true;
            state.error = null;
        },
        updateProfileSuccess(state, action: PayloadAction<UserProfile>) {
            state.isUpdating = false;
            state.profile = ensureProfileData(action.payload);
            state.error = null;
        },
        updateProfileFailure(state, action: PayloadAction<string>) {
            state.isUpdating = false;
            state.error = action.payload;
        },

        // Delete profile
        deleteProfileStart(state) {
            state.isDeleting = true;
            state.error = null;
        },
        deleteProfileSuccess(state) {
            state.isDeleting = false;
            state.profile = null;
            state.error = null;
        },
        deleteProfileFailure(state, action: PayloadAction<string>) {
            state.isDeleting = false;
            state.error = action.payload;
        },

        // Avatar management - Updated to handle AvatarResponse
        uploadAvatarStart(state) {
            state.avatarLoading = true;
            state.error = null;
        },
        uploadAvatarSuccess(state, action: PayloadAction<AvatarResponse>) {
            state.avatarLoading = false;
            updateProfileWithAvatar(state, action.payload);
            state.error = null;
        },
        uploadAvatarFailure(state, action: PayloadAction<string>) {
            state.avatarLoading = false;
            state.error = action.payload;
        },

        updateAvatarStart(state) {
            state.avatarLoading = true;
            state.error = null;
        },
        updateAvatarSuccess(state, action: PayloadAction<AvatarResponse>) {
            state.avatarLoading = false;
            updateProfileWithAvatar(state, action.payload);
            state.error = null;
        },
        updateAvatarFailure(state, action: PayloadAction<string>) {
            state.avatarLoading = false;
            state.error = action.payload;
        },

        deleteAvatarStart(state) {
            state.avatarLoading = true;
            state.error = null;
        },
        deleteAvatarSuccess(state) {
            state.avatarLoading = false;
            if (state.profile && state.profile.avatar) {
                state.profile = {
                    ...state.profile,
                    avatar: undefined
                };
            }
            state.error = null;
        },
        deleteAvatarFailure(state, action: PayloadAction<string>) {
            state.avatarLoading = false;
            state.error = action.payload;
        },

        // Password management
        changePasswordStart(state) {
            state.passwordLoading = true;
            state.passwordError = null;
        },
        changePasswordSuccess(state) {
            state.passwordLoading = false;
            state.passwordError = null;
        },
        changePasswordFailure(state, action: PayloadAction<string>) {
            state.passwordLoading = false;
            state.passwordError = action.payload;
        },

        changePasswordWithOtpStart(state) {
            state.passwordLoading = true;
            state.passwordError = null;
        },
        changePasswordWithOtpSuccess(state) {
            state.passwordLoading = false;
            state.passwordError = null;
        },
        changePasswordWithOtpFailure(state, action: PayloadAction<string>) {
            state.passwordLoading = false;
            state.passwordError = action.payload;
        },

        // Clear errors
        clearError(state) {
            state.error = null;
        },

        clearPasswordError(state) {
            state.passwordError = null;
        },

        // Reset profile state
        resetProfileState() {
            return initialState;
        }
    }
});

export const {
    getProfileStart,
    getProfileSuccess,
    getProfileFailure,
    updateProfileStart,
    updateProfileSuccess,
    updateProfileFailure,
    deleteProfileStart,
    deleteProfileSuccess,
    deleteProfileFailure,
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
    clearPasswordError,
    resetProfileState
} = profileSlice.actions;

export default profileSlice.reducer;