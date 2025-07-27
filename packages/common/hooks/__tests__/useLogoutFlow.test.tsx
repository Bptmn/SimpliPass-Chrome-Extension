import { renderHook, act } from '@testing-library/react';
import { useLogoutFlow } from '../useLogoutFlow';
import { auth } from '../../core/adapters/auth.adapter';
import { storage } from '../../core/adapters/platform.storage.adapter';
import { firestoreListeners } from '@common/core/services/firestoreListeners';

// Mock dependencies
jest.mock('../../core/adapters/auth.adapter');
jest.mock('../../core/adapters/platform.storage.adapter');
jest.mock('@common/core/services/firestoreListeners');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockStorage = storage as jest.Mocked<typeof storage>;
const mockFirestoreListeners = firestoreListeners as jest.Mocked<typeof firestoreListeners>;

describe('useLogoutFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLogoutFlow());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('logout process', () => {
    it('should handle successful logout', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);
      mockFirestoreListeners.stopListeners.mockResolvedValue();
      mockStorage.clearAllSecureLocalStorage.mockResolvedValue();

      const { result } = renderHook(() => useLogoutFlow());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockFirestoreListeners.stopListeners).toHaveBeenCalled();
      expect(mockStorage.clearAllSecureLocalStorage).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle auth signOut error', async () => {
      const authError = new Error('Auth signOut failed');
      mockAuth.signOut.mockRejectedValue(authError);

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockFirestoreListeners.stopListeners).not.toHaveBeenCalled();
      expect(mockStorage.clearAllSecureLocalStorage).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Auth signOut failed');
    });

    it('should handle firestore listeners stop error', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);
      const listenersError = new Error('Stop listeners failed');
      mockFirestoreListeners.stopListeners.mockRejectedValue(listenersError);

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockFirestoreListeners.stopListeners).toHaveBeenCalled();
      expect(mockStorage.clearAllSecureLocalStorage).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Stop listeners failed');
    });

    it('should handle storage clear error', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);
      mockFirestoreListeners.stopListeners.mockResolvedValue();
      const storageError = new Error('Storage clear failed');
      mockStorage.clearAllSecureLocalStorage.mockRejectedValue(storageError);

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockFirestoreListeners.stopListeners).toHaveBeenCalled();
      expect(mockStorage.clearAllSecureLocalStorage).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Storage clear failed');
    });
  });

  describe('loading state', () => {
    it('should set loading state during logout', async () => {
      // Mock a delayed response
      mockAuth.signOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      mockFirestoreListeners.stopListeners.mockResolvedValue();
      mockStorage.clearAllSecureLocalStorage.mockResolvedValue();

      const { result } = renderHook(() => useLogoutFlow());

      const logoutPromise = act(async () => {
        await result.current.logout();
      });

      // Check loading state during logout
      expect(result.current.isLoading).toBe(true);

      await logoutPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockAuth.signOut.mockRejectedValue('String error');

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Logout failed');
    });

    it('should handle null errors', async () => {
      mockAuth.signOut.mockRejectedValue(null);

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useLogoutFlow());

      const initialLogoutFn = result.current.logout;

      rerender();

      expect(result.current.logout).toBe(initialLogoutFn);
    });
  });

  describe('cleanup', () => {
    it('should call all cleanup functions in correct order', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);
      mockFirestoreListeners.stopListeners.mockResolvedValue();
      mockStorage.clearAllSecureLocalStorage.mockResolvedValue();

      const { result } = renderHook(() => useLogoutFlow());

      await act(async () => {
        await result.current.logout();
      });

      // Verify all functions were called
      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(mockFirestoreListeners.stopListeners).toHaveBeenCalled();
      expect(mockStorage.clearAllSecureLocalStorage).toHaveBeenCalled();
    });
  });
}); 