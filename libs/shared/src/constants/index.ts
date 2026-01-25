/**
 * Application constants shared between frontend and backend
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
  },
  USERS: {
    ME: "/api/users/me",
    PROFILE: "/api/users/profile",
    AVATAR: "/api/users/avatar",
    LOGIN_HISTORY: "/api/users/login-history",
    CHANGE_PASSWORD: "/api/users/change-password",
  },
} as const;

/**
 * Route paths for frontend routing
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "ftechnology_access_token",
  USER: "ftechnology_user",
  REMEMBER_ME: "ftechnology_remember_me",
  THEME: "ftechnology_theme",
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  AVATAR_PLACEHOLDER: "/assets/avatar-placeholder.png",
  LOGIN_HISTORY_LIMIT: 5,
  TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  TOKEN_EXPIRES_IN_REMEMBER: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
} as const;

/**
 * Validation limits
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
