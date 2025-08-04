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

// Mock dependencies
jest.mock('@common/core/adapters/auth.adapter', () => ({
  auth: {
    initialize: jest.fn()
  }
}));

jest.mock('@common/core/adapters/platform.adapter', () => ({
  initializePlatform: jest.fn()
}));

jest.mock('@common/core/adapters/platform.storage.adapter', () => ({
  initializeStorage: jest.fn()
}));

jest.mock('@common/core/services/listenerService', () => ({
  authListeners: {
    start: jest.fn(),
    stop: jest.fn()
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
const { auth: mockAuth } = require('@common/core/adapters/auth.adapter');
const { initializePlatform: mockInitializePlatform } = require('@common/core/adapters/platform.adapter');
const { initializeStorage: mockInitializeStorage } = require('@common/core/adapters/platform.storage.adapter');
const { authListeners: mockAuthListeners } = require('@common/core/services/listenerService');
const { useAppStateStore: mockUseAppStateStore } = require('../useAppState');

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockAuth.initialize.mockResolvedValue(undefined);
    mockInitializeStorage.mockResolvedValue(undefined);
    mockInitializePlatform.mockResolvedValue(undefined);
    mockAuthListeners.start.mockResolvedValue(undefined);
    
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

      expect(mockAuth.initialize).toHaveBeenCalled();
      expect(mockInitializePlatform).toHaveBeenCalled();
      expect(mockInitializeStorage).toHaveBeenCalled();
      expect(mockAuthListeners.start).toHaveBeenCalled();
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

      expect(mockAuth.initialize).not.toHaveBeenCalled();
    });

    it('should handle auth initialization failure', async () => {
      const authError = new Error('Auth initialization failed');
      mockAuth.initialize.mockRejectedValue(authError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuth.initialize).toHaveBeenCalled();
    });

    it('should handle platform initialization failure', async () => {
      const platformError = new Error('Platform initialization failed');
      mockInitializePlatform.mockRejectedValue(platformError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializePlatform).toHaveBeenCalled();
    });

    it('should handle storage initialization failure', async () => {
      const storageError = new Error('Storage initialization failed');
      mockInitializeStorage.mockRejectedValue(storageError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockInitializeStorage).toHaveBeenCalled();
    });

    it('should handle auth listeners start failure', async () => {
      const listenersError = new Error('Auth listeners failed');
      mockAuthListeners.start.mockRejectedValue(listenersError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuthListeners.start).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockAuth.initialize.mockRejectedValue('Unknown error');

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuth.initialize).toHaveBeenCalled();
    });

    it('should handle undefined errors', async () => {
      mockAuth.initialize.mockRejectedValue(undefined);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuth.initialize).toHaveBeenCalled();
    });

    it('should handle null errors', async () => {
      mockAuth.initialize.mockRejectedValue(null);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAuth.initialize).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log initialization steps', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Starting application initialization');
      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Application fully initialized');

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
      const authError = new Error('Auth initialization failed');
      mockAuth.initialize.mockRejectedValue(authError);

      renderHook(() => useAppInitialization());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAppInitialization] Initialization failed:', authError);

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

      expect(mockAuth.initialize).toHaveBeenCalled();
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

      expect(mockAuth.initialize).not.toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should prevent multiple simultaneous initializations', async () => {
      // Create a promise that doesn't resolve immediately
      let resolveAuth: () => void;
      const authPromise = new Promise<void>((resolve) => {
        resolveAuth = resolve;
      });
      mockAuth.initialize.mockReturnValue(authPromise);

      renderHook(() => useAppInitialization());

      // Wait for the first initialization to start
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should only call auth.initialize once
      expect(mockAuth.initialize).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveAuth!();
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    });
  });
}); 