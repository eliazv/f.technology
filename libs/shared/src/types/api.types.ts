/**
 * API response type definitions
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * API error response
 */
export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  errors?: ValidationError[];
  timestamp?: string;
  path?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}
