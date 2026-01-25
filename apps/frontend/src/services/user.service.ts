/**
 * User Service
 * Handles user profile API calls
 */

import api from "./api";
import { User, UpdateUserDto, LoginHistory } from "@ftechnology/shared";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/users/me");
  return response.data.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateUserDto): Promise<User> {
  const response = await api.patch<ApiResponse<User>>("/users/profile", data);
  return response.data.data;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
    "/users/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
}

/**
 * Remove avatar
 */
export async function removeAvatar(): Promise<User> {
  const response = await api.delete<ApiResponse<User>>("/users/avatar");
  return response.data.data;
}

/**
 * Get login history
 */
export async function getLoginHistory(
  limit: number = 5,
): Promise<LoginHistory[]> {
  const response = await api.get<ApiResponse<LoginHistory[]>>(
    "/users/login-history",
    {
      params: { limit },
    },
  );
  return response.data.data;
}

export const userService = {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getLoginHistory,
};
