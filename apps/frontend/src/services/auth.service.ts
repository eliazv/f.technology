/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import api from "./api";
import { LoginDto, RegisterDto, AuthResponse, User } from "@ftechnology/shared";

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

export const authService = {
  register,
  login,
  getCurrentUser,
  logout,
};
