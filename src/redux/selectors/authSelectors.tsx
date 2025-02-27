import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Basic selectors
export const selectAuthState = (state: RootState) => state.auth;

// Memoized selectors using createSelector
export const selectIsAuthenticated = createSelector(
    [selectAuthState],
    (auth) => auth.isAuthenticated
);

export const selectUser = createSelector(
    [selectAuthState],
    (auth) => auth.user
);

export const selectAccessToken = createSelector(
    [selectAuthState],
    (auth) => auth.accessToken
);

export const selectLoading = createSelector(
    [selectAuthState],
    (auth) => auth.loading
);

export const selectError = createSelector(
    [selectAuthState],
    (auth) => auth.error
);

// Memoized selectors for arrays to prevent unnecessary rerenders
export const selectUserRoles = createSelector(
    [selectUser],
    (user) => user?.roles || []
);

export const selectUserPermissions = createSelector(
    [selectUser],
    (user) => user?.permissions || []
);

// New memoized selector for the auth object used in ProductDetailPage
export const selectAuth = createSelector(
    [selectAuthState],
    (auth) => ({
        isAuthenticated: auth.isAuthenticated || false,
        userId: auth.user?.userId,
        accessToken: auth.accessToken
    })
);