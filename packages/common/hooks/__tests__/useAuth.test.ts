/**
 * useAuth Hook Tests
 * 
 * Tests authentication state management, logout functionality, and user operations.
 * Focuses on UI state management and user interactions.
 */

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { authService } from '../../core/services/authService';
import { getCurrentUser as getCurrentUserFromService } from '../../core/services/userService';
import { User } from '../@common/types/auth.types';

// Mock the auth service
jest.mock('../../core/services/authService', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

// Mock the user service
jest.mock('../../core/services/userService', () => ({
  getCurrentUser: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockGetCurrentUser = getCurrentUserFromService as jest.MockedFunction<typeof getCurrentUserFromService>;

describe('useAuth', () => {
  const mockUser: User = {
    uid: 'user123',
    email: 'test@example.com',
    emailVerified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle null user', () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('logout functionality', () => {
    it('should handle successful logout', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      mockAuthService.logout.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle logout error', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      const errorMessage = 'Logout failed';
      mockAuthService.logout.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during logout', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      let resolveLogout: () => void;
      const logoutPromise = new Promise<void>((resolve) => {
        resolveLogout = resolve;
      });
      mockAuthService.logout.mockReturnValue(logoutPromise);

      // Start logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve logout
      await act(async () => {
        resolveLogout!();
        await logoutPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error before logout', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      // Set an error first through a failed operation
      mockGetCurrentUser.mockRejectedValue(new Error('Previous error'));

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.error).toBe('Previous error');

      mockAuthService.logout.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('getCurrentUser functionality', () => {
    it('should handle successful getCurrentUser', async () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      mockGetCurrentUser.mockResolvedValue(mockUser);

      let currentUser: User | null = null;
      await act(async () => {
        currentUser = await result.current.getCurrentUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(currentUser).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle getCurrentUser error', async () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      const errorMessage = 'Failed to get current user';
      mockGetCurrentUser.mockRejectedValue(new Error(errorMessage));

      let currentUser: User | null = null;
      await act(async () => {
        currentUser = await result.current.getCurrentUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(currentUser).toBeNull();
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during getCurrentUser', async () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      let resolveGetCurrentUser: (value: User | null) => void;
      const getCurrentUserPromise = new Promise<User | null>((resolve) => {
        resolveGetCurrentUser = resolve;
      });
      mockGetCurrentUser.mockReturnValue(getCurrentUserPromise);

      // Start getCurrentUser
      act(() => {
        result.current.getCurrentUser();
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve getCurrentUser
      await act(async () => {
        resolveGetCurrentUser!(mockUser);
        await getCurrentUserPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error before getCurrentUser', async () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      // Set an error first through a failed operation
      mockAuthService.logout.mockRejectedValue(new Error('Previous error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Previous error');

      mockGetCurrentUser.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      // Set error through a failed operation
      mockAuthService.logout.mockRejectedValue(new Error('Some error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle non-Error objects in logout', async () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      mockAuthService.logout.mockRejectedValue('String error');

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Logout failed');
    });

    it('should handle non-Error objects in getCurrentUser', async () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      mockGetCurrentUser.mockRejectedValue('String error');

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.error).toBe('Failed to get current user');
    });
  });
});
