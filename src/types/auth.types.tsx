// User status enum (phù hợp với backend)
export enum UserStatus {
    ACTIVE = "ACTIVE",
    LOCKED = "LOCKED",
    BANNER = "BANNER",
    PENDING = "PENDING",
}

// Gender enum (phù hợp với backend)
export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

// Request DTOs
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

// Response DTOs
export interface ApiResponse {
    success: boolean;
    message: string;
    userStatus?: UserStatus;
    email?: string;
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
    userStatus?: UserStatus;
}

export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
    userStatus?: UserStatus;
}

// User profile interface (phù hợp với phản hồi từ backend)
export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string;
    roles: string[];
    permissions: string[];
    address?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

// Profile update DTO (phù hợp với cấu trúc backend mong đợi)
export interface ProfileUpdateDTO {
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: string;
    address?: string;
}

// Chuyển đổi từ UserProfile sang ProfileUpdateDTO
export function profileToUpdateDTO(profile: UserProfile): ProfileUpdateDTO {
    return {
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || 'OTHER',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
    };
}

// Chuyển đổi string sang UserStatus
export function toUserStatus(status: string | null | undefined): UserStatus | undefined {
    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) return undefined;
    return status as UserStatus;
}

// Cấu hình modal trạng thái
export interface StatusModalConfig {
    isOpen: boolean;
    type: 'locked' | 'banned' | 'pending';
    title: string;
    message: string;
}