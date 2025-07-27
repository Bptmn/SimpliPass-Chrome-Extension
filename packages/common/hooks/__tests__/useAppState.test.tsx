import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppState } from '../useAppState';
import { auth } from '../../core/adapters/auth.adapter';
import { storage } from '../../core/adapters/platform.storage.adapter';
import { getLocalVault } from '../../core/services/vault';
import { getUserSecretKey } from '../../core/services/secret';
import { CredentialDecrypted, BankCardDecrypted } from '../../core/types/items.types';

// Mock dependencies
jest.mock('../../core/adapters/auth.adapter');
jest.mock('../../core/adapters/platform.storage.adapter');
jest.mock('../../core/services/vault');
jest.mock('../../core/services/secret');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockStorage = storage as jest.Mocked<typeof storage>;
const mockGetLocalVault = getLocalVault as jest.MockedFunction<typeof getLocalVault>;
const mockGetUserSecretKey = getUserSecretKey as jest.MockedFunction<typeof getUserSecretKey>;

describe('useAppState', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  const mockVault: (CredentialDecrypted | BankCardDecrypted)[] = [
    {
      id: '1',
      itemType: 'credential',
      title: 'Test Credential',
      username: 'testuser',
      password: 'testpass',
      url: 'https://test.com',
      note: '',
      itemKey: 'key1',
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    } as CredentialDecrypted,
    {
      id: '2',
      itemType: 'bankCard',
      title: 'Test Card',
      cardNumber: '1234567890123456',
      owner: 'Test User',
      note: '',
      color: '#000000',
      itemKey: 'key2',
      expirationDate: { month: 12, year: 2025 },
      verificationNumber: '123',
      bankName: 'Test Bank',
      bankDomain: 'testbank.com',
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    } as BankCardDecrypted
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.state).toEqual({
        isInitialized: false,
        isAuthenticated: false,
        hasLocalData: false,
        shouldShowLogin: false,
        shouldShowReEnterPassword: false,
        shouldRenderApp: false,
        error: null,
      });
      expect(result.current.user).toBe(null);
      expect(result.current.vault).toBe(null);
      expect(typeof result.current.refreshState).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('authentication state', () => {
    it('should handle unauthenticated user', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(false);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
        expect(result.current.state.isAuthenticated).toBe(false);
        expect(result.current.state.shouldShowLogin).toBe(true);
        expect(result.current.state.shouldRenderApp).toBe(false);
        expect(result.current.user).toBe(null);
        expect(result.current.vault).toBe(null);
      });
    });

    it('should handle authenticated user with local data', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(true);
      mockGetUserSecretKey.mockResolvedValue('secret-key');
      mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(mockUser);
      mockGetLocalVault.mockResolvedValue(mockVault);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
        expect(result.current.state.isAuthenticated).toBe(true);
        expect(result.current.state.hasLocalData).toBe(true);
        expect(result.current.state.shouldShowLogin).toBe(false);
        expect(result.current.state.shouldRenderApp).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.vault).toEqual(mockVault);
      });
    });

    it('should handle authenticated user without local data', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(true);
      mockGetUserSecretKey.mockResolvedValue(null);
      mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(null);
      mockGetLocalVault.mockResolvedValue([]);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
        expect(result.current.state.isAuthenticated).toBe(true);
        expect(result.current.state.hasLocalData).toBe(false);
        expect(result.current.state.shouldShowLogin).toBe(false);
        expect(result.current.state.shouldShowReEnterPassword).toBe(true);
        expect(result.current.state.shouldRenderApp).toBe(false);
        expect(result.current.user).toBe(null);
        expect(result.current.vault).toBe(null);
      });
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      mockAuth.isAuthenticated.mockRejectedValue(authError);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
        expect(result.current.state.isAuthenticated).toBe(false);
        expect(result.current.state.shouldShowLogin).toBe(true);
        expect(result.current.state.error).toBe('Authentication failed');
      });
    });

    it('should handle storage errors', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(true);
      const storageError = new Error('Storage access failed');
      mockGetUserSecretKey.mockRejectedValue(storageError);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
        expect(result.current.state.isAuthenticated).toBe(false);
        expect(result.current.state.shouldShowLogin).toBe(true);
        expect(result.current.state.error).toBe('Storage access failed');
      });
    });

    it('should clear error when clearError is called', async () => {
      const authError = new Error('Test error');
      mockAuth.isAuthenticated.mockRejectedValue(authError);

      const { result } = renderHook(() => useAppState());

      await waitFor(() => {
        expect(result.current.state.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBe(null);
    });
  });

  describe('refresh state', () => {
    it('should refresh state when called', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(true);
      mockGetUserSecretKey.mockResolvedValue('secret-key');
      mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(mockUser);
      mockGetLocalVault.mockResolvedValue(mockVault);

      const { result } = renderHook(() => useAppState());

      // Wait for initial state
      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Reset mocks for refresh call
      jest.clearAllMocks();
      mockAuth.isAuthenticated.mockResolvedValue(false);

      // Call refresh
      await act(async () => {
        await result.current.refreshState();
      });

      await waitFor(() => {
        expect(result.current.state.isAuthenticated).toBe(false);
        expect(result.current.state.shouldShowLogin).toBe(true);
      });
    });
  });

  describe('data loading', () => {
    it('should load data on mount', async () => {
      mockAuth.isAuthenticated.mockResolvedValue(true);
      mockGetUserSecretKey.mockResolvedValue('secret-key');
      mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(mockUser);
      mockGetLocalVault.mockResolvedValue(mockVault);

      renderHook(() => useAppState());

      await waitFor(() => {
        expect(mockAuth.isAuthenticated).toHaveBeenCalled();
        expect(mockGetUserSecretKey).toHaveBeenCalled();
        expect(mockStorage.getUserFromSecureLocalStorage).toHaveBeenCalled();
        expect(mockGetLocalVault).toHaveBeenCalled();
      });
    });
  });
}); 