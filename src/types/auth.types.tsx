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

export interface RefreshTokenRequest {
    refreshToken: string;
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
}

export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
}

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    status: string;
    createdAt?: string;
    lastLoginAt?: string;
    roles: string[];
    permissions: string[];
    address?: string;
    dateOfBirth?: string;
    gender?: string;
}