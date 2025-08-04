import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import type { User } from '@common/core/types/auth.types';

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
    login: jest.fn(),
    signOut: jest.fn()
  }
}));

jest.mock('@common/core/adapters/platform.storage.adapter', () => ({
  storage: {
    clearAllSecureLocalStorage: jest.fn()
  }
}));

jest.mock('@common/core/services/userService', () => ({
  getCurrentUser: jest.fn()
}));

jest.mock('@common/core/services/listenerService', () => ({
  databaseListeners: {
    stop: jest.fn()
  },
  authListeners: {
    stop: jest.fn()
  }
}));

// Get the mocked modules
const { auth: mockAuth } = require('@common/core/adapters/auth.adapter');
const { storage: mockStorage } = require('@common/core/adapters/platform.storage.adapter');
const { getCurrentUser: mockGetCurrentUserFromService } = require('@common/core/services/userService');
const { databaseListeners: mockDatabaseListeners, authListeners: mockAuthListeners } = require('@common/core/services/listenerService');

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided user and default state', () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      expect(result.current.user).toBe(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should initialize with null user', () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('returned values', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('getCurrentUser');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should return functions for all methods', () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.getCurrentUser).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('state management', () => {
    it('should maintain user state from props', () => {
      const { result } = renderHook(() => useAuth({ user: mockUser }));

      expect(result.current.user).toBe(mockUser);
    });

    it('should handle null user state', () => {
      const { result } = renderHook(() => useAuth({ user: null }));

      expect(result.current.user).toBe(null);
    });
  });
}); 