import { ApiResponse } from './auth.types.tsx';

// User status enum (phù hợp với backend)
export enum UserStatus {
    ACTIVE = "ACTIVE",
    LOCKED = "LOCKED",
    BANNED = "BANNED",
    PENDING = "PENDING",
}

// Gender enum (phù hợp với backend)
export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
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
    gender?: Gender;
}

// Profile update DTO (phù hợp với cấu trúc backend mong đợi)
export interface ProfileUpdateDTO {
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    dateOfBirth?: string;
    address?: string;
}

// Password change request
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Password change with OTP request
export interface ChangePasswordWithOtpRequest {
    loginId: string;
    oldPassword: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

// Chuyển đổi từ UserProfile sang ProfileUpdateDTO
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

// Avatar response from backend
export interface AvatarResponse extends ApiResponse {
    avatarUrl?: string;
}
