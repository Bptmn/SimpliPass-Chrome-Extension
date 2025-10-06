/**
 * useReEnterPassword Hook Tests
 * 
 * Tests the password re-entry flow for when userSecretKey is missing from secure storage.
 * Focuses on validation, key derivation, and error handling.
 */

import { renderHook, act } from '@testing-library/react';
import { useReEnterPassword } from '../useReEnterPassword';
import { deriveKey } from '../../core/libraries/crypto';
import { storeUserSecretKey } from '../../core/services/secretsService';
import { auth } from '../../core/adapters/auth.adapter';
import { db } from '../../core/adapters/database.adapter';
import { decryptItem } from '../../core/services/cryptoService';
import { getCurrentUserAsync } from '../../core/services/userService';
import { useAppStateStore } from '../useAppState';

// Mock dependencies
jest.mock('../../core/libraries/crypto', () => ({
  deriveKey: jest.fn(),
}));

jest.mock('../../core/services/secretsService', () => ({
  storeUserSecretKey: jest.fn(),
}));

jest.mock('../../core/adapters/auth.adapter', () => ({
  auth: {
    fetchUserSalt: jest.fn(),
  },
}));

jest.mock('../../core/adapters/database.adapter', () => ({
  db: {
    getCollection: jest.fn(),
  },
}));

jest.mock('../../core/services/cryptoService', () => ({
  decryptItem: jest.fn(),
}));

jest.mock('../../core/services/userService', () => ({
  getCurrentUserAsync: jest.fn(),
}));

jest.mock('../useAppState', () => ({
  useAppStateStore: jest.fn(),
}));

const mockDeriveKey = deriveKey as jest.MockedFunction<typeof deriveKey>;
const mockStoreUserSecretKey = storeUserSecretKey as jest.MockedFunction<typeof storeUserSecretKey>;
const mockAuth = auth as jest.Mocked<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;
const mockDecryptItem = decryptItem as jest.MockedFunction<typeof decryptItem>;
const mockGetCurrentUserAsync = getCurrentUserAsync as jest.MockedFunction<typeof getCurrentUserAsync>;
const mockUseAppStateStore = useAppStateStore as jest.MockedFunction<typeof useAppStateStore>;

describe('useReEnterPassword', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
  };

  const mockSetSecretKey = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStateStore.mockReturnValue({
      setSecretKey: mockSetSecretKey,
    } as any);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useReEnterPassword());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.reEnterPassword).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('reEnterPassword flow', () => {
    it('should handle successful password re-entry with existing items', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'derived-key';
      const mockEncryptedItems = [
        { id: '1', content_encrypted: 'encrypted1', item_key_encrypted: 'key1' },
      ];

      mockAuth.fetchUserSalt.mockResolvedValue(mockSalt);
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(mockUser);
      mockDb.getCollection.mockResolvedValue(mockEncryptedItems);
      mockDecryptItem.mockResolvedValue({ id: '1', title: 'Test Item', type: 'credential' });
      mockStoreUserSecretKey.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.reEnterPassword('masterpassword');
      });

      expect(mockAuth.fetchUserSalt).toHaveBeenCalled();
      expect(mockDeriveKey).toHaveBeenCalledWith('masterpassword', mockSalt);
      expect(mockGetCurrentUserAsync).toHaveBeenCalled();
      expect(mockDb.getCollection).toHaveBeenCalledWith(`users/${mockUser.uid}/my_items`);
      expect(mockDecryptItem).toHaveBeenCalledWith(mockUserSecretKey, mockEncryptedItems[0]);
      expect(mockStoreUserSecretKey).toHaveBeenCalledWith(mockUserSecretKey);
      expect(mockSetSecretKey).toHaveBeenCalledWith(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle successful password re-entry with no existing items', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'derived-key';

      mockAuth.fetchUserSalt.mockResolvedValue(mockSalt);
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(mockUser);
      mockDb.getCollection.mockResolvedValue([]);
      mockStoreUserSecretKey.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.reEnterPassword('masterpassword');
      });

      expect(mockAuth.fetchUserSalt).toHaveBeenCalled();
      expect(mockDeriveKey).toHaveBeenCalledWith('masterpassword', mockSalt);
      expect(mockGetCurrentUserAsync).toHaveBeenCalled();
      expect(mockDb.getCollection).toHaveBeenCalledWith(`users/${mockUser.uid}/my_items`);
      expect(mockDecryptItem).not.toHaveBeenCalled();
      expect(mockStoreUserSecretKey).toHaveBeenCalledWith(mockUserSecretKey);
      expect(mockSetSecretKey).toHaveBeenCalledWith(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle incorrect master password', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'wrong-key';
      const mockEncryptedItems = [
        { id: '1', content_encrypted: 'encrypted1', item_key_encrypted: 'key1' },
      ];

      mockAuth.fetchUserSalt.mockResolvedValue(mockSalt);
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(mockUser);
      mockDb.getCollection.mockResolvedValue(mockEncryptedItems);
      mockDecryptItem.mockRejectedValue(new Error('Decryption failed'));

      await act(async () => {
        await expect(result.current.reEnterPassword('wrongpassword')).rejects.toThrow();
      });

      expect(mockAuth.fetchUserSalt).toHaveBeenCalled();
      expect(mockDeriveKey).toHaveBeenCalledWith('wrongpassword', mockSalt);
      expect(mockGetCurrentUserAsync).toHaveBeenCalled();
      expect(mockDb.getCollection).toHaveBeenCalledWith(`users/${mockUser.uid}/my_items`);
      expect(mockDecryptItem).toHaveBeenCalledWith(mockUserSecretKey, mockEncryptedItems[0]);
      expect(mockStoreUserSecretKey).not.toHaveBeenCalled();
      expect(mockSetSecretKey).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Incorrect master password. Please try again.');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle missing user salt', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      mockAuth.fetchUserSalt.mockResolvedValue(null);

      await act(async () => {
        await expect(result.current.reEnterPassword('masterpassword')).rejects.toThrow();
      });

      expect(mockAuth.fetchUserSalt).toHaveBeenCalled();
      expect(mockDeriveKey).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Unable to retrieve user salt');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle unauthenticated user', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'derived-key';

      mockAuth.fetchUserSalt.mockResolvedValue(mockSalt);
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(null);
      // getCollection won't be called because validateSecretKey exits early when user is null

      await act(async () => {
        await expect(result.current.reEnterPassword('masterpassword')).rejects.toThrow();
      });

      expect(mockAuth.fetchUserSalt).toHaveBeenCalled();
      expect(mockDeriveKey).toHaveBeenCalledWith('masterpassword', mockSalt);
      expect(mockGetCurrentUserAsync).toHaveBeenCalled();
      // getCollection is not called because validateSecretKey throws early when user is null
      expect(mockDb.getCollection).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Incorrect master password. Please try again.');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during password re-entry', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'derived-key';

      let resolveSalt: (value: string) => void;
      const saltPromise = new Promise<string>((resolve) => {
        resolveSalt = resolve;
      });
      mockAuth.fetchUserSalt.mockReturnValue(saltPromise);

      // Start password re-entry
      act(() => {
        result.current.reEnterPassword('masterpassword');
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve salt and mock the rest of the flow
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(mockUser);
      mockDb.getCollection.mockResolvedValue([]);
      mockStoreUserSecretKey.mockResolvedValue(undefined);

      await act(async () => {
        resolveSalt!(mockSalt);
        await saltPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      // Set error through a failed operation
      mockAuth.fetchUserSalt.mockRejectedValue(new Error('Some error'));

      await act(async () => {
        await expect(result.current.reEnterPassword('masterpassword')).rejects.toThrow();
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle non-Error objects', async () => {
      const { result } = renderHook(() => useReEnterPassword());

      const mockSalt = 'test-salt';
      const mockUserSecretKey = 'derived-key';

      mockAuth.fetchUserSalt.mockResolvedValue(mockSalt);
      mockDeriveKey.mockResolvedValue(mockUserSecretKey);
      mockGetCurrentUserAsync.mockResolvedValue(mockUser);
      mockDb.getCollection.mockRejectedValue('String error');

      await act(async () => {
        await expect(result.current.reEnterPassword('masterpassword')).rejects.toThrow();
      });

      expect(result.current.error).toBe('Incorrect master password. Please try again.');
    });
  });
});
