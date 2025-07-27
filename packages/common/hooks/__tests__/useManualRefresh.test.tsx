import { renderHook, act, waitFor } from '@testing-library/react';
import { useManualRefresh } from '../useManualRefresh';
import { loadUserProfile } from '@common/core/services/user';
import { fetchAndStoreItems } from '@common/core/services/items';
import { User } from '@common/core/types/auth.types';
import { ItemDecrypted } from '@common/core/types/items.types';

// Mock dependencies
jest.mock('@common/core/services/user', () => ({
  loadUserProfile: jest.fn(),
  refreshUserInfo: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('@common/core/services/items');
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
jest.mock('@common/core/adapters/auth.adapter', () => ({
  auth: {
    getCurrentUser: jest.fn().mockReturnValue({
      uid: '123',
      email: 'test@example.com'
    })
  }
}));
jest.mock('../useRefreshData', () => ({
  useRefreshData: () => ({
    refreshData: jest.fn().mockResolvedValue()
  })
}));

const mockLoadUserProfile = loadUserProfile as jest.MockedFunction<typeof loadUserProfile>;
const mockFetchAndStoreItems = fetchAndStoreItems as jest.MockedFunction<typeof fetchAndStoreItems>;

describe('useManualRefresh', () => {
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
    mockFetchAndStoreItems.mockResolvedValue([]);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useManualRefresh());

      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refreshAllData).toBe('function');
      expect(typeof result.current.refreshUserOnly).toBe('function');
      expect(typeof result.current.refreshVaultOnly).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('refresh all data', () => {
    it('should refresh all data successfully', async () => {
      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshAllData();
      });

      expect(mockLoadUserProfile).toHaveBeenCalled();
      expect(mockFetchAndStoreItems).toHaveBeenCalled();
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle refresh all data error', async () => {
      const refreshError = new Error('Failed to refresh all data');
      mockLoadUserProfile.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshAllData();
      });

      expect(result.current.error).toBe('Failed to refresh all data');
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set loading state during refresh', async () => {
      // Mock a delayed response
      mockLoadUserProfile.mockImplementation(() => new Promise<User | null>(resolve => setTimeout(() => resolve(mockUser), 100)));
      mockFetchAndStoreItems.mockImplementation(() => new Promise<ItemDecrypted[]>(resolve => setTimeout(() => resolve([]), 100)));

      const { result } = renderHook(() => useManualRefresh());

      const refreshPromise = act(async () => {
        await result.current.refreshAllData();
      });

      // Check loading state during refresh
      expect(result.current.isRefreshing).toBe(true);

      await refreshPromise;

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('refresh user only', () => {
    it('should refresh user data successfully', async () => {
      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshUserOnly();
      });

      expect(mockLoadUserProfile).toHaveBeenCalled();
      expect(mockFetchAndStoreItems).not.toHaveBeenCalled();
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle refresh user error', async () => {
      const userError = new Error('Failed to refresh user');
      mockLoadUserProfile.mockRejectedValue(userError);

      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshUserOnly();
      });

      expect(result.current.error).toBe('Failed to refresh user');
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('refresh vault only', () => {
    it('should refresh vault data successfully', async () => {
      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshVaultOnly();
      });

      expect(mockFetchAndStoreItems).toHaveBeenCalled();
      expect(mockLoadUserProfile).not.toHaveBeenCalled();
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle refresh vault error', async () => {
      const vaultError = new Error('Failed to refresh vault');
      mockFetchAndStoreItems.mockRejectedValue(vaultError);

      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshVaultOnly();
      });

      expect(result.current.error).toBe('Failed to refresh vault');
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockLoadUserProfile.mockRejectedValue('String error');

      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshUserOnly();
      });

      expect(result.current.error).toBe('Refresh failed');
    });

    it('should handle null errors', async () => {
      mockLoadUserProfile.mockRejectedValue(null);

      const { result } = renderHook(() => useManualRefresh());

      await act(async () => {
        await result.current.refreshUserOnly();
      });

      expect(result.current.error).toBe('Refresh failed');
    });

    it('should clear error when clearError is called', async () => {
      const refreshError = new Error('Test error');
      mockLoadUserProfile.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useManualRefresh());

      // First, trigger an error
      await act(async () => {
        await result.current.refreshUserOnly();
      });

      expect(result.current.error).toBe('Test error');

      // Then clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent refresh operations', async () => {
      let resolveFirstRefresh: (value: any) => void;
      let resolveSecondRefresh: (value: any) => void;
      
      const firstRefreshPromise = new Promise((resolve) => {
        resolveFirstRefresh = resolve;
      });
      const secondRefreshPromise = new Promise((resolve) => {
        resolveSecondRefresh = resolve;
      });

      mockLoadUserProfile
        .mockReturnValueOnce(firstRefreshPromise as Promise<User | null>)
        .mockReturnValueOnce(secondRefreshPromise as Promise<User | null>);

      const { result } = renderHook(() => useManualRefresh());

      // Start first refresh
      const firstRefreshAct = act(async () => {
        result.current.refreshUserOnly();
      });

      // Start second refresh while first is still pending
      const secondRefreshAct = act(async () => {
        result.current.refreshUserOnly();
      });

      // Both should be in loading state
      expect(result.current.isRefreshing).toBe(true);

      // Resolve both refreshes
      resolveFirstRefresh!(mockUser);
      resolveSecondRefresh!(mockUser);

      await firstRefreshAct;
      await secondRefreshAct;

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useManualRefresh());

      const initialRefreshAllData = result.current.refreshAllData;
      const initialRefreshUserOnly = result.current.refreshUserOnly;
      const initialRefreshVaultOnly = result.current.refreshVaultOnly;
      const initialClearError = result.current.clearError;

      rerender();

      expect(result.current.refreshAllData).toBe(initialRefreshAllData);
      expect(result.current.refreshUserOnly).toBe(initialRefreshUserOnly);
      expect(result.current.refreshVaultOnly).toBe(initialRefreshVaultOnly);
      expect(result.current.clearError).toBe(initialClearError);
    });
  });

  describe('cleanup', () => {
    it('should properly handle cleanup on unmount', () => {
      const { unmount } = renderHook(() => useManualRefresh());

      // Should not throw any errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
}); 