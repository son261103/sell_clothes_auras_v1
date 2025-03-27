import { authApi } from './api';
import { AxiosError } from 'axios';
import { store } from '../redux/store';
import { loginSuccess } from '../redux/slices/authSlice';
import { ApiResponse, TokenResponse } from '../types/auth.types';
import { GoogleAuthRequest, GoogleButtonTheme, GoogleCredentialResponse, GoogleLinkResponse } from '../types/global.types';

// Declare Google global variable for TypeScript
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
                    prompt: () => void;
                    cancel: () => void;
                    revoke: (email: string, callback?: () => void) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
        googleConfigured?: boolean;
    }
}

// Cache to track if login is in progress
let loginInProgress = false;

// Helper function to set refresh token in cookie
const setRefreshTokenCookie = (refreshToken: string): void => {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800;`; // 7 days
};

// Helper function to modify user data before storing
const processUserData = (data: TokenResponse): TokenResponse => {
    // If avatar URL is from Google, ensure it's properly formatted
    if (data.avatar && isGoogleAvatarUrl(data.avatar)) {
        console.log('Detected Google avatar URL, applying proper formatting');

        // For Google avatars, make sure no cache busting parameters are added
        // as they can cause CORS issues with Google's servers
        const cleanUrl = cleanGoogleAvatarUrl(data.avatar);
        data.avatar = cleanUrl;
    }

    return data;
};

// Helper function to check if URL is a Google avatar
const isGoogleAvatarUrl = (url: string): boolean => {
    return url.includes('googleusercontent.com') ||
        url.includes('google.com') ||
        url.includes('googleapis.com');
};

// Helper function to clean Google avatar URL
const cleanGoogleAvatarUrl = (url: string): string => {
    try {
        // Create a URL object to easily manipulate the URL
        const urlObj = new URL(url);

        // Remove common cache busting parameters that might be added
        urlObj.searchParams.delete('t');
        urlObj.searchParams.delete('_t');
        urlObj.searchParams.delete('timestamp');
        urlObj.searchParams.delete('cache');

        return urlObj.toString();
    } catch (error) {
        console.error('Error cleaning Google avatar URL:', error);
        return url;
    }
};

const GlobalAuthService = {
    /**
     * Initialize Google Sign-In SDK
     * @param clientId Google client ID
     * @param callback Function to handle credential response
     */
    initializeGoogleAuth(
        clientId: string,
        callback: (response: GoogleCredentialResponse) => void
    ): void {
        if (!window.google) {
            console.error('Google API is not loaded. Make sure to include the Google script in your HTML.');
            return;
        }

        // Initialize Google Sign-In
        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: callback,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            window.googleConfigured = true;
            console.log('Google Sign-In initialized successfully');
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    },

    /**
     * Render Google Sign-In button
     * @param elementId DOM element ID to render the button
     * @param theme Button theme (outline, filled_blue, filled_black)
     */
    renderGoogleButton(
        elementId: string,
        theme: GoogleButtonTheme = 'filled_blue'
    ): void {
        if (!window.google || !window.googleConfigured) {
            console.error('Google API is not initialized. Call initializeGoogleAuth first.');
            return;
        }

        const element = document.getElementById(elementId);
        if (element) {
            try {
                window.google.accounts.id.renderButton(element, {
                    theme,
                    size: 'large',
                    text: 'continue_with',
                    width: element.offsetWidth || 240,
                });
                console.log('Google button rendered successfully');
            } catch (error) {
                console.error('Error rendering Google button:', error);
            }
        } else {
            console.error(`Element with ID "${elementId}" not found`);
        }
    },

    /**
     * Display Google One-Tap sign-in prompt
     */
    promptGoogleSignIn(): void {
        if (window.google && window.googleConfigured) {
            try {
                window.google.accounts.id.prompt();
                console.log('Google Sign-In prompt displayed');
            } catch (error) {
                console.error('Error displaying Google Sign-In prompt:', error);
            }
        } else {
            console.error('Google API is not initialized. Call initializeGoogleAuth first.');
        }
    },

    /**
     * Cancel Google One-Tap sign-in prompt
     */
    cancelGooglePrompt(): void {
        if (window.google && window.googleConfigured) {
            try {
                window.google.accounts.id.cancel();
                console.log('Google Sign-In prompt canceled');
            } catch (error) {
                console.error('Error canceling Google Sign-In prompt:', error);
            }
        }
    },

    /**
     * Process Google credential response and authenticate with backend
     * @param response Google credential response containing ID token
     * @param rememberMe Whether to remember the user
     * @returns Promise with token response
     */
    async handleGoogleCredential(
        response: GoogleCredentialResponse,
        rememberMe = false
    ): Promise<TokenResponse> {
        console.log('Processing Google credential response');

        // Prevent multiple login requests
        if (loginInProgress) {
            console.warn('Login already in progress, ignoring duplicate request');
            throw new Error('Login already in progress');
        }

        loginInProgress = true;

        try {
            // Extract ID token from Google response
            const idToken = response.credential;
            if (!idToken) {
                loginInProgress = false;
                const error = new Error('No ID token provided by Google');
                console.error(error);
                throw error;
            }

            // Call backend login API with the token
            const result = await this.loginWithGoogle({ idToken, rememberMe });
            loginInProgress = false;
            return result;
        } catch (error) {
            loginInProgress = false;
            throw error;
        }
    },

    /**
     * Login with Google ID token (backend API call)
     * @param googleAuthRequest Request containing ID token and remember me flag
     * @returns Promise with token response
     */
    async loginWithGoogle(googleAuthRequest: GoogleAuthRequest): Promise<TokenResponse> {
        try {
            console.log('Sending Google login request to backend');

            const response = await authApi.post<TokenResponse>(
                '/auth/google/login',
                { idToken: googleAuthRequest.idToken },
                { params: { rememberMe: googleAuthRequest.rememberMe || false } }
            );

            // Process the response data (handle avatar URLs, etc.)
            const processedData = processUserData(response.data);

            // Store tokens
            localStorage.setItem('accessToken', processedData.accessToken);
            if (processedData.refreshToken) {
                setRefreshTokenCookie(processedData.refreshToken);
            }

            // Save user data to local storage
            localStorage.setItem('user', JSON.stringify({
                userId: processedData.userId,
                username: processedData.username,
                email: processedData.email,
                fullName: processedData.fullName,
                roles: processedData.roles,
                permissions: processedData.permissions,
                avatar: processedData.avatar, // Include avatar URL
                userStatus: processedData.userStatus
            }));

            // Reset avatar timestamp to force a fresh avatar load
            sessionStorage.removeItem('avatarTimestamp');
            sessionStorage.setItem('avatarTimestamp', Date.now().toString());

            // Dispatch login success to Redux store
            store.dispatch(loginSuccess(processedData));

            console.log('Google login successful');
            return processedData;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Google login failed:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || {
                success: false,
                message: 'Google authentication failed'
            };
        }
    },

    /**
     * Link Google account with existing user account
     * @param idToken Google ID token
     * @returns Promise with link response
     */
    async linkGoogleAccount(idToken: string): Promise<GoogleLinkResponse> {
        try {
            console.log('Linking Google account');

            const response = await authApi.post<GoogleLinkResponse>(
                '/auth/google/link',
                { idToken }
            );

            console.log('Google account successfully linked');

            // Refresh user data in localStorage to get updated avatar
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userData = JSON.parse(userStr);

                    // Update the avatar
                    if (response.data.avatar) {
                        userData.avatar = response.data.avatar;

                        // Reset avatar timestamp to force a fresh avatar load
                        sessionStorage.removeItem('avatarTimestamp');
                        sessionStorage.setItem('avatarTimestamp', Date.now().toString());
                    }

                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (e) {
                console.warn('Could not update user data after linking Google account', e);
            }

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Failed to link Google account:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || {
                success: false,
                message: 'Failed to link Google account'
            };
        }
    },

    /**
     * Unlink Google account from user account
     * @returns Promise with unlink response
     */
    async unlinkGoogleAccount(): Promise<GoogleLinkResponse> {
        try {
            console.log('Unlinking Google account');

            const response = await authApi.post<GoogleLinkResponse>('/auth/google/unlink');

            console.log('Google account successfully unlinked');
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Failed to unlink Google account:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || {
                success: false,
                message: 'Failed to unlink Google account'
            };
        }
    },

    /**
     * Load Google API script dynamically
     * @returns Promise that resolves when the script is loaded
     */
    loadGoogleApiScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (window.google && window.google.accounts) {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('Google API script loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Error loading Google API script:', error);
                reject(new Error('Failed to load Google API script'));
            };

            // Add script to document
            document.head.appendChild(script);
        });
    },

    /**
     * Clear Google sign-in state (for logout)
     * @param email User email to revoke
     */
    clearGoogleState(email?: string): void {
        // First, clean up local storage
        sessionStorage.removeItem('avatarTimestamp');

        // Then try to handle Google sign-in state
        if (window.google && window.google.accounts) {
            if (email) {
                try {
                    window.google.accounts.id.revoke(email, () => {
                        console.log('Google sign-in state revoked for:', email);
                    });
                } catch (error) {
                    console.error('Error revoking Google sign-in state:', error);
                }
            }

            // Disable auto select to prevent automatic sign-in on next page load
            try {
                window.google.accounts.id.disableAutoSelect();
                console.log('Google auto select disabled');

                // Also try to cancel any active prompts
                window.google.accounts.id.cancel();
            } catch (error) {
                console.error('Error disabling Google auto select:', error);
            }
        }
    },

    /**
     * Exchange Google authorization code for access token and ID token
     * @param code Authorization code from Google
     * @returns Promise with token response
     */
    async exchangeGoogleCode(code: string): Promise<{idToken: string, accessToken: string}> {
        try {
            const response = await authApi.post<{idToken: string, accessToken: string}>(
                '/auth/google/exchange',
                { code }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.error('Google code exchange failed:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
            throw axiosError.response?.data || {
                success: false,
                message: 'Failed to exchange Google code'
            };
        }
    }
};

export default GlobalAuthService;