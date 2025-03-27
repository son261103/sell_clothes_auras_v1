import { ApiResponse } from "./auth.types";

// Google auth request interface
export interface GoogleAuthRequest {
    idToken: string;
    rememberMe?: boolean;
}

// Google link/unlink response
export type GoogleLinkResponse = ApiResponse & {
    avatar?: string;
};

// Google credential response interface (from Google SDK)
export interface GoogleCredentialResponse {
    credential: string;  // The ID token
    clientId: string;
    select_by: string;
}

// Google button theme options
export type GoogleButtonTheme = 'outline' | 'filled_blue' | 'filled_black';

// Interface for Google user info extracted from ID token
export interface GoogleUserInfo {
    email: string;
    name?: string;
    picture?: string;
    sub?: string; // Google's unique user ID
    email_verified?: boolean;
}

// Google OAuth configuration
export interface GoogleOAuthConfig {
    clientId: string;
    redirectUri?: string;
    scopes?: string[];
}