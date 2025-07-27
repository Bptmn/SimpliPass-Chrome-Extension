import { renderHook, act } from '@testing-library/react';
import { useRefreshData } from '../useRefreshData';
import { fetchAndStoreItems } from '@common/core/services/items';

// Mock dependencies
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

const mockFetchAndStoreItems = fetchAndStoreItems as jest.MockedFunction<typeof fetchAndStoreItems>;

describe('useRefreshData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchAndStoreItems.mockResolvedValue([]);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useRefreshData());

      expect(result.current.refresh).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.refreshData).toBe('function');
    });
  });

  describe('refresh data', () => {
    it('should refresh data successfully', async () => {
      const { result } = renderHook(() => useRefreshData());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(mockFetchAndStoreItems).toHaveBeenCalled();
      expect(result.current.refresh).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle refresh error', async () => {
      const refreshError = new Error('Failed to refresh data');
      mockFetchAndStoreItems.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useRefreshData());

      await act(async () => {
        try {
          await result.current.refreshData();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockFetchAndStoreItems).toHaveBeenCalled();
      expect(result.current.refresh).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during refresh', async () => {
      // Mock a delayed response
      mockFetchAndStoreItems.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));

      const { result } = renderHook(() => useRefreshData());

      const refreshPromise = act(async () => {
        await result.current.refreshData();
      });

      // Check loading state during refresh
      expect(result.current.isLoading).toBe(true);

      await refreshPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockFetchAndStoreItems.mockRejectedValue('String error');

      const { result } = renderHook(() => useRefreshData());

      await act(async () => {
        try {
          await result.current.refreshData();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.refresh).toBe(false);
    });

    it('should handle null errors', async () => {
      mockFetchAndStoreItems.mockRejectedValue(null);

      const { result } = renderHook(() => useRefreshData());

      await act(async () => {
        try {
          await result.current.refreshData();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.refresh).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useRefreshData());

      const initialRefreshData = result.current.refreshData;

      rerender();

      expect(result.current.refreshData).toBe(initialRefreshData);
    });
  });

  describe('cleanup', () => {
    it('should properly handle cleanup on unmount', () => {
      const { unmount } = renderHook(() => useRefreshData());

      // Should not throw any errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
}); 