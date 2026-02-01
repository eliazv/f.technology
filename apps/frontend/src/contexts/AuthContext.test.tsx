/**
 * AuthContext Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '@/services/auth.service';

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '1990-01-01',
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAuthResponse = {
  user: mockUser,
  accessToken: 'mock-token',
  expiresIn: 604800000,
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('should login successfully', async () => {
    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'Password123',
        rememberMe: false,
      });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });

  it('should register successfully', async () => {
    (authService.register as jest.Mock).mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.register({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should logout successfully', async () => {
    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Login first
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'Password123',
        rememberMe: false,
      });
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  it('should handle login error', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(
      act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
          rememberMe: false,
        });
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const updatedUser = { ...mockUser, firstName: 'Updated' };

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user?.firstName).toBe('Updated');
  });

  it('should clear error', async () => {
    const error = new Error('Test error');
    (authService.login as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    try {
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
          rememberMe: false,
        });
      });
    } catch (e) {
      // Expected error
    }

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
