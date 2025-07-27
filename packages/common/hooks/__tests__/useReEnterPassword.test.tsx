import { renderHook, act } from '@testing-library/react';
import { useReEnterPassword } from '../useReEnterPassword';
import { getUserSecretKey } from '@common/core/services/secret';
import { storage } from '@common/core/adapters/platform.storage.adapter';

// Mock dependencies
jest.mock('@common/core/services/secret');
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

const mockGetUserSecretKey = getUserSecretKey as jest.MockedFunction<typeof getUserSecretKey>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('useReEnterPassword', () => {
  const mockUserSecretKey = 'test-secret-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserSecretKey.mockResolvedValue(mockUserSecretKey);
    mockStorage.storeUserSecretKeyToSecureLocalStorage.mockResolvedValue();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useReEnterPassword());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.reEnterPassword).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('password re-entry', () => {
    it('should handle successful password re-entry', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        await result.current.reEnterPassword('testpassword');
      });

      expect(mockGetUserSecretKey).toHaveBeenCalled();
      expect(mockStorage.storeUserSecretKeyToSecureLocalStorage).toHaveBeenCalledWith(mockUserSecretKey);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle password re-entry error', async () => {
      const passwordError = new Error('Invalid password');
      mockGetUserSecretKey.mockRejectedValue(passwordError);

      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        try {
          await result.current.reEnterPassword('wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid password');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during password re-entry', async () => {
      // Mock a delayed response
      mockGetUserSecretKey.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockUserSecretKey), 100)));

      const { result } = renderHook(() => useReEnterPassword());

      const reEnterPromise = act(async () => {
        await result.current.reEnterPassword('testpassword');
      });

      // Check loading state during re-entry
      expect(result.current.isLoading).toBe(true);

      await reEnterPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('secret key validation', () => {
    it('should validate secret key successfully', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        await result.current.reEnterPassword('testpassword');
      });

      expect(mockGetUserSecretKey).toHaveBeenCalled();
    });

    it('should handle secret key validation failure', async () => {
      mockGetUserSecretKey.mockResolvedValue(null);

      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        try {
          await result.current.reEnterPassword('testpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid master password');
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockGetUserSecretKey.mockRejectedValue('String error');

      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        try {
          await result.current.reEnterPassword('testpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Password re-entry failed');
    });

    it('should handle null errors', async () => {
      mockGetUserSecretKey.mockRejectedValue(null);

      const { result } = renderHook(() => useReEnterPassword());

      await act(async () => {
        try {
          await result.current.reEnterPassword('testpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Password re-entry failed');
    });

    it('should clear error when clearError is called', async () => {
      const passwordError = new Error('Test error');
      mockGetUserSecretKey.mockRejectedValue(passwordError);

      const { result } = renderHook(() => useReEnterPassword());

      // First, trigger an error
      await act(async () => {
        try {
          await result.current.reEnterPassword('testpassword');
        } catch (error) {
          // Expected to throw
        }
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
    it('should handle multiple concurrent password re-entries', async () => {
      let resolveFirstReEntry: (value: string) => void;
      let resolveSecondReEntry: (value: string) => void;
      
      const firstReEntryPromise = new Promise<string>((resolve) => {
        resolveFirstReEntry = resolve;
      });
      const secondReEntryPromise = new Promise<string>((resolve) => {
        resolveSecondReEntry = resolve;
      });

      mockGetUserSecretKey
        .mockReturnValueOnce(firstReEntryPromise)
        .mockReturnValueOnce(secondReEntryPromise);

      const { result } = renderHook(() => useReEnterPassword());

      // Start first re-entry
      const firstReEntryAct = act(async () => {
        result.current.reEnterPassword('testpassword');
      });

      // Start second re-entry while first is still pending
      const secondReEntryAct = act(async () => {
        result.current.reEnterPassword('testpassword');
      });

      // Both should be in loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve both re-entries
      resolveFirstReEntry!(mockUserSecretKey);
      resolveSecondReEntry!(mockUserSecretKey);

      await firstReEntryAct;
      await secondReEntryAct;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useReEnterPassword());

      const initialReEnterPassword = result.current.reEnterPassword;
      const initialClearError = result.current.clearError;

      rerender();

      expect(result.current.reEnterPassword).toBe(initialReEnterPassword);
      expect(result.current.clearError).toBe(initialClearError);
    });
  });

  describe('cleanup', () => {
    it('should properly handle cleanup on unmount', () => {
      const { unmount } = renderHook(() => useReEnterPassword());

      // Should not throw any errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
}); 