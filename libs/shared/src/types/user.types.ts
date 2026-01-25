/**
 * User-related type definitions
 */

/**
 * Base user interface representing the core user data
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile with additional computed fields
 */
export interface UserProfile extends User {
  fullName: string;
  age: number;
}

/**
 * Data required to create a new user
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

/**
 * Data for updating user profile
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatarUrl?: string | null;
}

/**
 * Login history entry
 */
export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * User with login history
 */
export interface UserWithHistory extends User {
  loginHistory: LoginHistory[];
}
