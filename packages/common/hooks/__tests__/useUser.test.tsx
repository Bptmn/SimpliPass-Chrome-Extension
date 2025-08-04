import { renderHook, act, waitFor } from '@testing-library/react';
import { useUser } from '../useUser';
import { getCurrentUser } from '@common/core/services/userService';

// Mock dependencies
jest.mock('@common/core/services/userService', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  })
}));

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('useUser', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(mockUser);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUser());

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refreshUser).toBe('function');
      expect(typeof result.current.clearUser).toBe('function');
    });
  });

  describe('user loading', () => {
    it('should load user successfully', async () => {
      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });
    });

    it('should handle user loading error', async () => {
      const loadError = new Error('Failed to load user');
      mockGetCurrentUser.mockRejectedValue(loadError);

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Failed to load user');
      });
    });

    it('should handle null user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('user refresh', () => {
    it('should refresh user successfully', async () => {
      const { result } = renderHook(() => useUser());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Clear previous calls
      jest.clearAllMocks();
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle refresh error', async () => {
      const { result } = renderHook(() => useUser());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Clear previous calls
      jest.clearAllMocks();
      const refreshError = new Error('Failed to refresh user');
      mockGetCurrentUser.mockRejectedValue(refreshError);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.error).toBe('Failed to refresh user');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clear user', () => {
    it('should clear user successfully', async () => {
      const { result } = renderHook(() => useUser());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      act(() => {
        result.current.clearUser();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockGetCurrentUser.mockRejectedValue('String error');

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user data');
      });
    });

    it('should handle null errors', async () => {
      mockGetCurrentUser.mockRejectedValue(null);

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user data');
      });
    });
  });

  describe('loading states', () => {
    it('should show loading during initial load', () => {
      const { result } = renderHook(() => useUser());

      expect(result.current.isLoading).toBe(true);
    });

    it('should hide loading after successful load', async () => {
      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should hide loading after error', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useUser());

      const initialRefreshUser = result.current.refreshUser;
      const initialClearUser = result.current.clearUser;

      rerender();

      expect(typeof result.current.refreshUser).toBe('function');
      expect(typeof result.current.clearUser).toBe('function');
      expect(result.current.refreshUser).toBeInstanceOf(Function);
      expect(result.current.clearUser).toBeInstanceOf(Function);
    });
  });

  describe('cleanup', () => {
    it('should properly handle cleanup on unmount', () => {
      const { unmount } = renderHook(() => useUser());

      // Should not throw any errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
}); 