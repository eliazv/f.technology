/**
 * Authentication-related type definitions
 */

import { User } from "./user.types";

/**
 * Login request payload
 */
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration request payload
 */
export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

/**
 * Authentication response with user and token
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Password reset request
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password request
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth state for frontend context
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
