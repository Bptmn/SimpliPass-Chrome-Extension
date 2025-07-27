import { renderHook, act, waitFor } from '@testing-library/react';
import { useUser } from '../useUser';
import { loadUserProfile } from '@common/core/services/user';
import { storage } from '@common/core/adapters/platform.storage.adapter';

// Mock dependencies
jest.mock('@common/core/services/user');
jest.mock('@common/core/adapters/platform.storage.adapter');
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

const mockLoadUserProfile = loadUserProfile as jest.MockedFunction<typeof loadUserProfile>;
const mockStorage = storage as jest.Mocked<typeof storage>;

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
    mockLoadUserProfile.mockResolvedValue(mockUser);
    mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(mockUser);
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
      mockLoadUserProfile.mockRejectedValue(loadError);

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Failed to load user');
      });
    });

    it('should handle null user', async () => {
      mockLoadUserProfile.mockResolvedValue(null);

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
      mockLoadUserProfile.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mockLoadUserProfile).toHaveBeenCalled();
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
      mockLoadUserProfile.mockRejectedValue(refreshError);

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
      mockLoadUserProfile.mockRejectedValue('String error');

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user');
      });
    });

    it('should handle null errors', async () => {
      mockLoadUserProfile.mockRejectedValue(null);

      const { result } = renderHook(() => useUser());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user');
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
      mockLoadUserProfile.mockRejectedValue(new Error('Test error'));

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

      expect(result.current.refreshUser).toBe(initialRefreshUser);
      expect(result.current.clearUser).toBe(initialClearUser);
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