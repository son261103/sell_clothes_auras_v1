// User status enum (matching backend)
export enum UserStatus {
    ACTIVE = 1,
    LOCKED = 2,
    BANNER = 3, // Note: This matches your backend enum (BANNER instead of BANNED)
    PENDING = 4
}

// Định nghĩa các DTOs cho request gửi từ client lên server
export interface LoginRequest {
    loginId: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
}

export interface ForgotPasswordRequest {
    loginId: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordWithOtpRequest {
    loginId: string;
    oldPassword: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

// Định nghĩa các DTOs cho response từ server
export interface ApiResponse {
    success: boolean;
    message: string;
    userStatus?: UserStatus;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken?: string | null;
    tokenType: string;
    expiresIn: number;
    username: string;
    email: string;
    userId: number;
    fullName: string;
    roles: string[];
    permissions: string[];
    userStatus: UserStatus; // Added userStatus field
}

export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
    userStatus: UserStatus; // Added userStatus field
}

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    status: UserStatus; // Changed to use enum
    createdAt?: string;
    lastLoginAt?: string;
    roles: string[];
    permissions: string[];
    address?: string;
    dateOfBirth?: string;
    gender?: string;
}

// Interface for status modal configuration
export interface StatusModalConfig {
    isOpen: boolean;
    type: 'locked' | 'banned' | 'pending';
    title: string;
    message: string;
}