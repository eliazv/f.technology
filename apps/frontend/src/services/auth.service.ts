/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import api from "./api";
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  ForgotPasswordFormData,
  ResetPasswordFormData
} from "@ftechnology/shared";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Register a new user
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
  });
  return response.data.data;
}

/**
 * Login with credentials
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data,
  );
  return response.data.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/**
 * Request password reset
 */
export async function forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", data);
  return { message: response.data.message || 'Email inviata con successo' };
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordFormData): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>("/auth/reset-password", data);
  return { message: response.data.message || 'Password reimpostata con successo' };
}

export const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
};
