/**
 * Session Logic Tests
 * 
 * Tests for the session management functions.
 * Ensures session operations work correctly across platforms.
 */

import {
  createSession,
  getSession,
  validateSession,
  refreshSession,
  clearSession,
  isAuthenticated,
  getSessionTimeRemaining,
  extendSession,
} from '../session';

// Mock platform adapter with state management
let mockSessionMetadata: string | null = null;
let mockUserSecretKey: string | null = null;

jest.mock('../../adapters/adapter.factory', () => ({
  getPlatformAdapter: jest.fn(() => ({
    storeUserSecretKey: jest.fn((key: string) => {
      mockUserSecretKey = key;
      return Promise.resolve();
    }),
    getUserSecretKey: jest.fn(() => Promise.resolve(mockUserSecretKey)),
    deleteUserSecretKey: jest.fn(() => {
      mockUserSecretKey = null;
      return Promise.resolve();
    }),
    clearSession: jest.fn(() => Promise.resolve()),
    getSessionMetadata: jest.fn(() => Promise.resolve(mockSessionMetadata)),
    storeSessionMetadata: jest.fn((metadata: string) => {
      mockSessionMetadata = metadata;
      return Promise.resolve();
    }),
    deleteSessionMetadata: jest.fn(() => {
      mockSessionMetadata = null;
      return Promise.resolve();
    }),
  })),
}));

describe('Session Logic', () => {
  const testUserSecretKey = 'test-secret-key';

  function createFreshSessionData(timeout = 30 * 60 * 1000) {
    const now = Date.now();
    return {
      userSecretKey: testUserSecretKey,
      expiresAt: now + timeout,
      createdAt: now,
    };
  }

  function setFreshSession(timeout = 30 * 60 * 1000) {
    const sessionData = createFreshSessionData(timeout);
    mockSessionMetadata = JSON.stringify(sessionData);
    mockUserSecretKey = testUserSecretKey;
    return sessionData;
  }

  const mockAdapter = {
    storeUserSecretKey: jest.fn((key: string) => {
      mockUserSecretKey = key;
      return Promise.resolve();
    }),
    getUserSecretKey: jest.fn(() => Promise.resolve(mockUserSecretKey)),
    deleteUserSecretKey: jest.fn(() => {
      mockUserSecretKey = null;
      return Promise.resolve();
    }),
    clearSession: jest.fn(() => Promise.resolve()),
    getSessionMetadata: jest.fn(() => Promise.resolve(mockSessionMetadata)),
    storeSessionMetadata: jest.fn((metadata: string) => {
      mockSessionMetadata = metadata;
      return Promise.resolve();
    }),
    deleteSessionMetadata: jest.fn(() => {
      mockSessionMetadata = null;
      return Promise.resolve();
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state
    mockSessionMetadata = null;
    mockUserSecretKey = null;
    
    const { getPlatformAdapter } = require('../../adapters/adapter.factory');
    getPlatformAdapter.mockResolvedValue(mockAdapter);
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      const result = await createSession(testUserSecretKey, {
        rememberMe: false,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userSecretKey).toBe(testUserSecretKey);
      expect(result.data?.expiresAt).toBeGreaterThan(Date.now());
      expect(mockAdapter.storeUserSecretKey).toHaveBeenCalledWith(testUserSecretKey);
      expect(mockAdapter.storeSessionMetadata).toHaveBeenCalled();
    });

    it('should create a session with remember me option', async () => {
      const result = await createSession(testUserSecretKey, {
        rememberMe: true,
        sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      expect(result.success).toBe(true);
      expect(result.data?.expiresAt).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000); // At least 6 days
    });

    it('should handle adapter errors', async () => {
      mockAdapter.storeUserSecretKey.mockRejectedValue(new Error('Storage error'));

      const result = await createSession(testUserSecretKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });
  });

  describe('getSession', () => {
    it('should get current session successfully', async () => {
      setFreshSession();
      const result = await getSession();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userSecretKey).toBe(testUserSecretKey);
    });

    it('should return error when no session exists', async () => {
      const result = await getSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('No active session found');
    });

    it('should handle invalid session metadata', async () => {
      mockSessionMetadata = 'invalid-json';
      const result = await getSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid session metadata format');
    });

    it('should handle adapter errors', async () => {
      mockAdapter.getSessionMetadata.mockRejectedValue(new Error('Adapter error'));
      const result = await getSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Adapter error');
    });
  });

  describe('validateSession', () => {
    it('should validate active session successfully', async () => {
      setFreshSession();
      const result = await validateSession();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error when no session exists', async () => {
      const result = await validateSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('No valid session found');
    });

    it('should clear expired session', async () => {
      const expiredSessionData = createFreshSessionData(-1000); // Expired 1s ago
      mockSessionMetadata = JSON.stringify(expiredSessionData);
      mockUserSecretKey = testUserSecretKey;
      const result = await validateSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session has expired');
      expect(mockAdapter.deleteUserSecretKey).toHaveBeenCalled();
      expect(mockAdapter.deleteSessionMetadata).toHaveBeenCalled();
      expect(mockAdapter.clearSession).toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      setFreshSession();
      const result = await refreshSession({
        sessionTimeout: 60 * 60 * 1000, // 1 hour
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userSecretKey).toBe(testUserSecretKey);
    });

    it('should return error when no session to refresh', async () => {
      const result = await refreshSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('No active session to refresh');
    });
  });

  describe('clearSession', () => {
    it('should clear session successfully', async () => {
      setFreshSession();
      const result = await clearSession();
      expect(result.success).toBe(true);
      expect(mockAdapter.deleteUserSecretKey).toHaveBeenCalled();
      expect(mockAdapter.deleteSessionMetadata).toHaveBeenCalled();
      expect(mockAdapter.clearSession).toHaveBeenCalled();
    });

    it('should handle adapter errors', async () => {
      mockAdapter.deleteUserSecretKey.mockRejectedValue(new Error('Delete error'));
      const result = await clearSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete error');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid session', async () => {
      setFreshSession();
      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false for invalid session', async () => {
      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockAdapter.getSessionMetadata.mockRejectedValue(new Error('Adapter error'));
      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getSessionTimeRemaining', () => {
    it('should return remaining time for valid session', async () => {
      setFreshSession();
      const result = await getSessionTimeRemaining();
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for no session', async () => {
      const result = await getSessionTimeRemaining();
      expect(result).toBe(0);
    });

    it('should return 0 for expired session', async () => {
      const expiredSessionData = createFreshSessionData(-1000); // Expired 1s ago
      mockSessionMetadata = JSON.stringify(expiredSessionData);
      mockUserSecretKey = testUserSecretKey;
      const result = await getSessionTimeRemaining();
      expect(result).toBe(0);
    });
  });

  describe('extendSession', () => {
    it('should extend session successfully', async () => {
      setFreshSession();
      const additionalTime = 60 * 60 * 1000; // 1 hour
      const result = await extendSession(additionalTime);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.expiresAt).toBeGreaterThan(Date.now() + additionalTime - 1000); // Allow 1 second tolerance
      expect(mockAdapter.storeSessionMetadata).toHaveBeenCalled();
    });

    it('should return error when no session to extend', async () => {
      const result = await extendSession();
      expect(result.success).toBe(false);
      expect(result.error).toBe('No active session to extend');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete session lifecycle', async () => {
      // Create session
      await createSession(testUserSecretKey);
      // Validate session
      const validateResult = await validateSession();
      expect(validateResult.success).toBe(true);
      // Check authentication
      const isAuth = await isAuthenticated();
      expect(isAuth).toBe(true);
      // Get remaining time
      const remaining = await getSessionTimeRemaining();
      expect(remaining).toBeGreaterThan(0);
      // Extend session
      const extendResult = await extendSession(30 * 60 * 1000);
      expect(extendResult.success).toBe(true);
      // Clear session
      const clearResult = await clearSession();
      expect(clearResult.success).toBe(true);
      // Verify session is cleared
      const isAuthAfterClear = await isAuthenticated();
      expect(isAuthAfterClear).toBe(false);
    });
  });
}); 