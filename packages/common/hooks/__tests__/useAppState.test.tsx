import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppStateStore } from '../useAppState';
import { checkUserSecretKey } from '../../core/services/userService';

// Mock dependencies
jest.mock('../../core/services/userService');

const mockCheckUserSecretKey = checkUserSecretKey as jest.MockedFunction<typeof checkUserSecretKey>;

describe('useAppState', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  const mockVault = [
    {
      id: '1',
      title: 'Test Credential',
      username: 'testuser',
      password: 'password123',
      url: 'http://example.com',
      note: 'A note',
      createdDateTime: new Date().toISOString(),
      lastUseDateTime: new Date().toISOString(),
      itemType: 'credential',
      itemKey: 'key1',
    } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    useAppStateStore.setState({
      isInitializing: false,
      initializationError: null,
      user: null,
      userSecretKeyExist: false,
      authIsAvailable: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppStateStore());

      expect(result.current.isInitializing).toBe(false);
      expect(result.current.initializationError).toBe(null);
      expect(result.current.user).toBe(null);
      expect(result.current.userSecretKeyExist).toBe(false);
      expect(result.current.authIsAvailable).toBe(false);
    });
  });

  describe('state updates', () => {
    it('should update initialization state', () => {
      const { result } = renderHook(() => useAppStateStore());

      act(() => {
        result.current.setInitializing(true, 'Test error');
      });

      expect(result.current.isInitializing).toBe(true);
      expect(result.current.initializationError).toBe('Test error');
    });

    it('should update user state', () => {
      const { result } = renderHook(() => useAppStateStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should update secret key state', () => {
      const { result } = renderHook(() => useAppStateStore());

      act(() => {
        result.current.setSecretKey(true);
      });

      expect(result.current.userSecretKeyExist).toBe(true);
    });

    it('should update user and secret key together', () => {
      const { result } = renderHook(() => useAppStateStore());

      act(() => {
        result.current.setUserAndSecretKey(mockUser, true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userSecretKeyExist).toBe(true);
    });

    it('should update auth availability', () => {
      const { result } = renderHook(() => useAppStateStore());

      act(() => {
        result.current.setAuthIsAvailable(true);
      });

      expect(result.current.authIsAvailable).toBe(true);
    });
  });

  describe('refresh secret key', () => {
    it('should refresh secret key successfully', async () => {
      mockCheckUserSecretKey.mockResolvedValue(true);

      const { result } = renderHook(() => useAppStateStore());

      await act(async () => {
        await result.current.refreshSecretKey();
      });

      expect(mockCheckUserSecretKey).toHaveBeenCalled();
      expect(result.current.userSecretKeyExist).toBe(true);
    });

    it('should handle secret key refresh error', async () => {
      mockCheckUserSecretKey.mockRejectedValue(new Error('Failed to get secret key'));

      const { result } = renderHook(() => useAppStateStore());

      await act(async () => {
        await result.current.refreshSecretKey();
      });

      expect(result.current.userSecretKeyExist).toBe(false);
    });
  });

  describe('clear error', () => {
    it('should clear initialization error', () => {
      const { result } = renderHook(() => useAppStateStore());

      // Set an error first
      act(() => {
        result.current.setInitializing(false, 'Test error');
      });

      expect(result.current.initializationError).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.initializationError).toBe(null);
    });
  });
}); 