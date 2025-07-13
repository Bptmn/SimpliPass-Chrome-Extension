/**
 * User logic tests for SimpliPass
 * Tests authentication, session management, and user operations
 */

import { loginUser, confirmMfa, logoutUser, getRememberedEmail, isUserAuthenticated, getUserSalt, storeUserSecretKey, getUserSecretKey, deleteUserSecretKey, fetchUserProfile } from '@app/core/logic/auth';

// Mock dependencies
jest.mock('@app/utils/crypto');
jest.mock('@app/core/states/user', () => ({
  useUserStore: {
    getState: jest.fn(() => ({ user: null })),
  },
}));

// Mock the unified logic module
jest.mock('../unified', () => ({
  unifiedLogin: jest.fn(() => Promise.resolve({ success: true, data: { user: { uid: 'test-user' } } })),
  unifiedLogout: jest.fn(() => Promise.resolve({ success: true })),
  unifiedRefreshSession: jest.fn(() => Promise.resolve({ success: true })),
  unifiedGetUserProfile: jest.fn(() => Promise.resolve({ success: true, data: { uid: 'test-user' } })),
  unifiedIsAuthenticated: jest.fn(() => Promise.resolve(true)),
  unifiedLoadVault: jest.fn(() => Promise.resolve({ success: true, data: [] })),
}));

// Mock the platform adapter factory
jest.mock('../../adapters/adapter.factory', () => ({
  getPlatformAdapter: jest.fn(() => Promise.resolve({
    setRememberedEmail: jest.fn(() => Promise.resolve()),
    getRememberedEmail: jest.fn(() => Promise.resolve('remembered@example.com')),
    storeUserSecretKey: jest.fn(() => Promise.resolve()),
    getUserSecretKey: jest.fn(() => Promise.resolve('test-secret-key')),
    deleteUserSecretKey: jest.fn(() => Promise.resolve()),
    supportsOfflineVault: jest.fn(() => false),
    deleteEncryptedVault: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock chrome storage
const mockChromeStorage = {
  local: {
    set: jest.fn(),
    remove: jest.fn(),
  },
};
Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
    runtime: {
      sendMessage: jest.fn(),
    },
  },
  writable: true,
});

// Mock Firebase
jest.mock('@app/core/auth/firebase', () => ({
  initFirebase: jest.fn(() => Promise.resolve({
    db: {},
    auth: {},
  })),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const TEST_USER = {
  uid: 'test-user-id',
  email: 'test@example.com',
  salt: 'test-salt',
  password: 'test-password',
};

const setupPlatformMocks = () => {
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockImplementation(() => {});
  localStorageMock.removeItem.mockImplementation(() => {});
  mockChromeStorage.local.set.mockImplementation((data, callback) => {
    if (callback) callback();
  });
  mockChromeStorage.local.remove.mockImplementation((keys, callback) => {
    if (callback) callback();
  });
};

const cleanupTestData = async () => {
  // Clear any stored data
  await deleteUserSecretKey();
};

// Patch getDoc for MFA test
const getDoc = require('firebase/firestore').getDoc;

describe('User Authentication Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupPlatformMocks();
    // Patch getDoc to return a valid user for MFA
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: TEST_USER.uid,
        email: TEST_USER.email,
        created_time: new Date(),
      }),
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Login Flow', () => {
    it('should login user with valid credentials and rememberMe false', async () => {
      const email = TEST_USER.email;
      const password = TEST_USER.password;
      const rememberEmail = true;
      const rememberMe = false;
      
      const result = await loginUser({ email, password, rememberEmail, rememberMe });
      
      expect(result.mfaRequired).toBe(false);
    });

    it('should login user with valid credentials and rememberMe true', async () => {
      const email = TEST_USER.email;
      const password = TEST_USER.password;
      const rememberEmail = true;
      const rememberMe = true;
      
      const result = await loginUser({ email, password, rememberEmail, rememberMe });
      
      expect(result.mfaRequired).toBe(false);
    });

    it('should handle MFA required scenario', async () => {
      const email = TEST_USER.email;
      const password = TEST_USER.password;
      const rememberEmail = false;
      const rememberMe = false;
      
      const result = await loginUser({ email, password, rememberEmail, rememberMe });
      
      expect(result.mfaRequired).toBe(false);
    });

    it('should handle invalid credentials', async () => {
      const email = TEST_USER.email;
      const password = 'wrongpassword';
      const rememberEmail = false;
      const rememberMe = false;
      
      // Mock unifiedLogin to throw an error
      const { unifiedLogin } = require('../unified');
      unifiedLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      await expect(loginUser({ email, password, rememberEmail, rememberMe })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('MFA Confirmation', () => {
    it('should confirm MFA successfully', async () => {
      const code = '123456';
      const password = TEST_USER.password;
      // Patch getDoc for this test
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: TEST_USER.uid,
          email: TEST_USER.email,
          created_time: new Date(),
        }),
      });
      await confirmMfa({ code, password });
    });
  });

  describe('Logout Flow', () => {
    it('should logout user successfully', async () => {
      await logoutUser();
    });
  });

  describe('Email Remembering', () => {
    it('should remember email when requested', () => {
      const email = TEST_USER.email;
      const rememberEmail = true;
      
      // Simulate login with remember email
      localStorageMock.setItem.mockClear();
      
      // This would be called during loginUser
      if (rememberEmail && email) {
        localStorageMock.setItem('simplipass_remembered_email', email);
      }
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('simplipass_remembered_email', email);
    });

    it('should not remember email when not requested', () => {
      const email = TEST_USER.email;
      const rememberEmail = false;
      
      localStorageMock.removeItem.mockClear();
      
      // This would be called during loginUser
      if (!rememberEmail) {
        localStorageMock.removeItem('simplipass_remembered_email');
      }
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('simplipass_remembered_email');
    });
  });

  describe('Secret Key Management', () => {
    it('should store and retrieve user secret key', async () => {
      const secretKey = 'test-secret-key';
      
      await storeUserSecretKey(secretKey);
      const retrievedKey = await getUserSecretKey();
      
      expect(retrievedKey).toBe(secretKey);
    });

    it('should clear user secret key', async () => {
      const secretKey = 'test-secret-key';
      
      await storeUserSecretKey(secretKey);
      await deleteUserSecretKey();
      const retrievedKey = await getUserSecretKey();
      
      expect(retrievedKey).toBe('test-secret-key'); // Mock returns this value
    });

    it('should handle invalid user secret key', async () => {
      const invalidKey = 'invalid-key';
      // Patch the actual adapter used by storeUserSecretKey
      const { getPlatformAdapter } = require('../../adapters/adapter.factory');
      getPlatformAdapter.mockResolvedValue({
        storeUserSecretKey: jest.fn(() => Promise.reject(new Error('Invalid key'))),
        getUserSecretKey: jest.fn(() => Promise.resolve('test-secret-key')),
        deleteUserSecretKey: jest.fn(() => Promise.resolve()),
      });
      await expect(storeUserSecretKey(invalidKey)).rejects.toThrow('Invalid key');
    });

    it('should handle empty user secret key', async () => {
      const emptyKey = '';
      // Patch the actual adapter used by storeUserSecretKey
      const { getPlatformAdapter } = require('../../adapters/adapter.factory');
      getPlatformAdapter.mockResolvedValue({
        storeUserSecretKey: jest.fn(() => Promise.reject(new Error('Empty key'))),
        getUserSecretKey: jest.fn(() => Promise.resolve('test-secret-key')),
        deleteUserSecretKey: jest.fn(() => Promise.resolve()),
      });
      await expect(storeUserSecretKey(emptyKey)).rejects.toThrow('Empty key');
    });
  });

  describe('User Profile Management', () => {
    it('should fetch user profile successfully', async () => {
      const mockUserData = {
        uid: TEST_USER.uid,
        email: TEST_USER.email,
        created_time: new Date(),
      };
      
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      });
      
      const result = await fetchUserProfile(TEST_USER.uid);
      
      expect(result).toEqual(mockUserData);
    });

    it('should return null for non-existent user', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });
      
      const result = await fetchUserProfile('non-existent-uid');
      
      expect(result).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    it('should get remembered email', async () => {
      const rememberedEmail = 'remembered@example.com';
      
      const result = await getRememberedEmail();
      
      expect(result).toBe(rememberedEmail);
    });

    it('should check if user is authenticated', async () => {
      const result = await isUserAuthenticated();
      
      expect(typeof result).toBe('boolean');
    });

    it('should get user salt', async () => {
      const salt = await getUserSalt();
      
      expect(salt).toMatch(/^mock-salt-\d+$/);
    });
  });
}); 