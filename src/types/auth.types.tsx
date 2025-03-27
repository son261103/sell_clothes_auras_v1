// User status enum
export enum UserStatus {
    ACTIVE = "ACTIVE",
    LOCKED = "LOCKED",
    BANNED = "BANNED",
    PENDING = "PENDING",
}

// Gender enum
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
    avatar?: string;
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
    avatar?: string;
}

export interface RegisterResponse {
    userId: number;
    username: string;
    email: string;
    message: string;
    requiresEmailVerification: boolean;
    userStatus?: UserStatus;
}

// User profile interface
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
    gender?: Gender;
}

// Profile update DTO
export interface ProfileUpdateDTO {
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    address?: string;
}

// Avatar response from backend
export interface AvatarResponse extends ApiResponse {
    avatarUrl?: string;
}

// Convert from UserProfile to ProfileUpdateDTO
export function profileToUpdateDTO(profile: UserProfile): ProfileUpdateDTO {
    return {
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || Gender.OTHER,
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
    };
}

// Convert string to UserStatus
export function toUserStatus(status: string | null | undefined): UserStatus | undefined {
    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) return undefined;
    return status as UserStatus;
}

// Status modal configuration
export interface StatusModalConfig {
    isOpen: boolean;
    type: 'locked' | 'banned' | 'pending';
    title: string;
    message: string;
}