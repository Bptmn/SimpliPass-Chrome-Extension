import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppInitialization } from '../useAppInitialization';
import { auth } from '../../core/adapters/auth.adapter';
import { handleAuthStateChange, loadDataAndStartListeners, handleSecretKeyReEntry } from '../../core/services/appInitialization';
import { User } from '../../core/types/auth.types';
import { User as FirebaseUser } from 'firebase/auth';

// Mock dependencies
jest.mock('../../core/adapters/auth.adapter');
jest.mock('../../core/services/appInitialization');

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockHandleAuthStateChange = handleAuthStateChange as jest.MockedFunction<typeof handleAuthStateChange>;
const mockLoadDataAndStartListeners = loadDataAndStartListeners as jest.MockedFunction<typeof loadDataAndStartListeners>;
const mockHandleSecretKeyReEntry = handleSecretKeyReEntry as jest.MockedFunction<typeof handleSecretKeyReEntry>;

describe('useAppInitialization', () => {
  let mockUnsubscribe: jest.Mock;

  const createMockUser = (): User => ({
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  });

  const createMockFirebaseUser = (): FirebaseUser => ({
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: 'token',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    phoneNumber: null,
    providerId: 'password'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockAuth.onAuthStateChanged.mockReturnValue(mockUnsubscribe);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppInitialization());

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isUserFullyInitialized).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.handleSecretKeyStored).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('authentication state changes', () => {
    it('should handle successful authentication', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = createMockFirebaseUser();
      mockHandleAuthStateChange.mockResolvedValue({
        user: mockUser,
        isUserFullyInitialized: true
      });

      const { result } = renderHook(() => useAppInitialization());

      // Simulate auth state change
      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(mockFirebaseUser);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isUserFullyInitialized).toBe(true);
        expect(result.current.error).toBe(null);
      });
    });

    it('should handle authentication failure', async () => {
      const authError = new Error('Authentication failed');
      mockHandleAuthStateChange.mockRejectedValue(authError);

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Authentication failed');
      });
    });

    it('should handle null user', async () => {
      mockHandleAuthStateChange.mockResolvedValue({
        user: null,
        isUserFullyInitialized: false
      });

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isUserFullyInitialized).toBe(false);
      });
    });
  });

  describe('data loading', () => {
    it('should load data when user is fully initialized', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = createMockFirebaseUser();
      mockHandleAuthStateChange.mockResolvedValue({
        user: mockUser,
        isUserFullyInitialized: true
      });
      mockLoadDataAndStartListeners.mockResolvedValue();

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(mockFirebaseUser);
      });

      await waitFor(() => {
        expect(mockLoadDataAndStartListeners).toHaveBeenCalled();
      });
    });

    it('should not load data when user is not fully initialized', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = createMockFirebaseUser();
      mockHandleAuthStateChange.mockResolvedValue({
        user: mockUser,
        isUserFullyInitialized: false
      });

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(mockFirebaseUser);
      });

      await waitFor(() => {
        expect(mockLoadDataAndStartListeners).not.toHaveBeenCalled();
      });
    });

    it('should handle data loading error', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = createMockFirebaseUser();
      mockHandleAuthStateChange.mockResolvedValue({
        user: mockUser,
        isUserFullyInitialized: true
      });
      mockLoadDataAndStartListeners.mockRejectedValue(new Error('Data loading failed'));

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(mockFirebaseUser);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Data loading failed');
      });
    });
  });

  describe('secret key handling', () => {
    it('should handle secret key stored successfully', async () => {
      mockHandleSecretKeyReEntry.mockResolvedValue({
        isUserFullyInitialized: true
      });

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        await result.current.handleSecretKeyStored();
      });

      expect(mockHandleSecretKeyReEntry).toHaveBeenCalled();
      expect(result.current.isUserFullyInitialized).toBe(true);
    });

    it('should handle secret key error', async () => {
      mockHandleSecretKeyReEntry.mockRejectedValue(new Error('Secret key check failed'));

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        await result.current.handleSecretKeyStored();
      });

      expect(result.current.error).toBe('Secret key check failed');
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = createMockFirebaseUser();
      mockHandleAuthStateChange.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useAppInitialization());

      await act(async () => {
        const authCallback = mockAuth.onAuthStateChanged.mock.calls[0][0];
        await authCallback(mockFirebaseUser);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      const { unmount } = renderHook(() => useAppInitialization());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
}); 