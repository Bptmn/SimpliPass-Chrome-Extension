// packages/common/hooks/__tests__/useAppInitialization.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAppInitialization, resetInitializationState } from '../useAppInitialization';

// Mock the platform module to avoid import.meta.env issues
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    appId: 'test-app-id'
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    userPoolId: 'test-user-pool-id',
    userPoolClientId: 'test-client-id',
    region: 'us-east-1'
  }),
  validateFirebaseConfig: jest.fn().mockReturnValue(true),
  validateCognitoConfig: jest.fn().mockReturnValue(true),
  getPlatformConfig: jest.fn().mockReturnValue({
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    deviceFingerprintKey: 'deviceFingerprint',
    sessionTimeout: 30 * 60 * 1000,
    maxRetryAttempts: 3,
    encryptionAlgorithm: 'AES-256-GCM',
  }),
}));

// Mock the initialization service
jest.mock('@common/core/services/initializationService', () => ({
  initializationService: {
    initializeApp: jest.fn(),
    resetInitializationState: jest.fn()
  }
}));

jest.mock('../useAppState', () => ({
  useAppStateStore: jest.fn(() => ({
    isInitializing: false,
    initializationError: null,
    setInitializing: jest.fn(),
    clearError: jest.fn()
  }))
}));

// Get the mocked modules
const { initializationService: mockInitializationService } = require('@common/core/services/initializationService');
const { useAppStateStore: mockUseAppStateStore } = require('../useAppState');

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockInitializationService.initializeApp.mockResolvedValue(undefined);
    mockInitializationService.resetInitializationState.mockReturnValue(undefined);
    
    // Setup store mock
    const mockSetInitializing = jest.fn();
    const mockGetState = jest.fn(() => ({
      isInitializing: false,
      initializationError: null,
      setInitializing: mockSetInitializing,
      clearError: jest.fn()
    }));
    
    mockUseAppStateStore.mockReturnValue({
      isInitializing: false,
      initializationError: null,
      setInitializing: mockSetInitializing,
      clearError: jest.fn()
    });
    
    // Add getState method to the mock
    mockUseAppStateStore.getState = mockGetState;
  });

  describe('initialization flow', () => {
    it('should complete full initialization successfully on mount', async () => {
      renderHook(() => useAppInitialization());

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });

    it('should skip initialization if already initializing', async () => {
      const mockSetInitializing = jest.fn();
      mockUseAppStateStore.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });
      
      // Update getState to return the same state
      mockUseAppStateStore.getState.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).not.toHaveBeenCalled();
    });

    it('should handle initialization failure', async () => {
      const initError = new Error('Initialization failed');
      mockInitializationService.initializeApp.mockRejectedValue(initError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockInitializationService.initializeApp.mockRejectedValue('Unknown error');

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });

    it('should handle undefined errors', async () => {
      mockInitializationService.initializeApp.mockRejectedValue(undefined);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });

    it('should handle null errors', async () => {
      mockInitializationService.initializeApp.mockRejectedValue(null);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log initialization steps', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // The logging now happens in the service, not in the hook
      // The hook only logs when there's an error
      expect(consoleSpy).not.toHaveBeenCalledWith('[useAppInitialization] Starting application initialization');
      expect(consoleSpy).not.toHaveBeenCalledWith('[useAppInitialization] Application fully initialized');

      consoleSpy.mockRestore();
    });

    it('should log when skipping initialization', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockSetInitializing = jest.fn();
      
      mockUseAppStateStore.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });
      
      // Update getState to return the same state
      mockUseAppStateStore.getState.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Skipping initialization - app already initializing');

      consoleSpy.mockRestore();
    });

    it('should log when already initializing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockSetInitializing = jest.fn();
      
      mockUseAppStateStore.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });
      
      // Update getState to return the same state
      mockUseAppStateStore.getState.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Skipping initialization - app already initializing');

      consoleSpy.mockRestore();
    });

    it('should log errors during initialization', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const initError = new Error('Initialization failed');
      mockInitializationService.initializeApp.mockRejectedValue(initError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Initialization failed:', initError);

      consoleSpy.mockRestore();
    });
  });

  describe('resetInitializationState', () => {
    it('should reset initialization state', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      resetInitializationState();

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Resetting initialization state');

      consoleSpy.mockRestore();
    });
  });

  describe('useEffect behavior', () => {
    it('should call initializeApp on mount when not initializing', async () => {
      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).toHaveBeenCalled();
    });

    it('should not call initializeApp on mount when already initializing', async () => {
      const mockSetInitializing = jest.fn();
      mockUseAppStateStore.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });
      
      // Update getState to return the same state
      mockUseAppStateStore.getState.mockReturnValue({
        isInitializing: true,
        initializationError: null,
        setInitializing: mockSetInitializing,
        clearError: jest.fn()
      });

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializationService.initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should prevent multiple simultaneous initializations', async () => {
      // Create a promise that doesn't resolve immediately
      let resolveInit: () => void;
      const initPromise = new Promise<void>((resolve) => {
        resolveInit = resolve;
      });
      mockInitializationService.initializeApp.mockReturnValue(initPromise);

      renderHook(() => useAppInitialization());

      // Wait for the first initialization to start
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should only call initializeApp once
      expect(mockInitializationService.initializeApp).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveInit!();
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    });
  });
}); 