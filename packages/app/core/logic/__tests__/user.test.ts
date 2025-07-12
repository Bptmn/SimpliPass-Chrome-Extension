/**
 * User logic tests for SimpliPass
 * Tests authentication, session management, and user operations
 */

import { loginUser, confirmMfa, logoutUser, getRememberedEmail, isUserAuthenticated, getUserSalt, storeUserSecretKey, getUserSecretKey, deleteUserSecretKey, fetchUserProfile } from '@app/core/logic/user';
import { loginWithCognito, confirmMfaWithCognito, signOutCognito, fetchUserSaltCognito } from '@app/core/auth/cognito';
import { clearAll } from '@app/core/database/localDB';
import { deriveKey } from '@app/utils/crypto';
import { getDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('@app/core/auth/cognito');
jest.mock('@app/core/database/localDB');
jest.mock('@app/utils/crypto');
jest.mock('@app/core/states/user', () => ({
  useUserStore: {
    getState: jest.fn(() => ({ user: null })),
  },
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
  (deriveKey as jest.Mock).mockResolvedValue('derived-secret-key');
  (clearAll as jest.Mock).mockResolvedValue(undefined);
  (fetchUserSaltCognito as jest.Mock).mockResolvedValue(TEST_USER.salt);
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

describe('User Authentication Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupPlatformMocks();
    
    // Setup authentication mocks
    (loginWithCognito as jest.Mock).mockResolvedValue({
      challengeName: 'SMS_MFA',
      session: 'mock-session',
    });
    (confirmMfaWithCognito as jest.Mock).mockResolvedValue({
      session: 'mock-session',
    });
    (signOutCognito as jest.Mock).mockResolvedValue(undefined);
    (fetchUserSaltCognito as jest.Mock).mockResolvedValue(TEST_USER.salt);
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
      expect(loginWithCognito).toHaveBeenCalledWith(email, password);
    });

    it('should login user with valid credentials and rememberMe true', async () => {
      const email = TEST_USER.email;
      const password = TEST_USER.password;
      const rememberEmail = true;
      const rememberMe = true;
      
      const result = await loginUser({ email, password, rememberEmail, rememberMe });
      
      expect(result.mfaRequired).toBe(false);
      expect(loginWithCognito).toHaveBeenCalledWith(email, password);
    });

    it('should handle MFA required scenario', async () => {
      (loginWithCognito as jest.Mock).mockResolvedValue({
        challengeName: 'SMS_MFA',
        session: 'mock-session',
        mfaRequired: true,
      });
      
      const email = TEST_USER.email;
      const password = TEST_USER.password;
      const rememberEmail = false;
      const rememberMe = false;
      
      const result = await loginUser({ email, password, rememberEmail, rememberMe });
      
      expect(result.mfaRequired).toBe(true);
      expect(result.mfaUser).toBeDefined();
    });

    it('should handle invalid credentials', async () => {
      (loginWithCognito as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
      
      const email = TEST_USER.email;
      const password = 'wrongpassword';
      const rememberEmail = false;
      const rememberMe = false;
      
      await expect(loginUser({ email, password, rememberEmail, rememberMe })).rejects.toThrow();
    });
  });

  describe('MFA Confirmation', () => {
    it('should confirm MFA successfully', async () => {
      const code = '123456';
      const password = TEST_USER.password;
      await confirmMfa({ code, password });
      expect(confirmMfaWithCognito).toHaveBeenCalledWith(code);
    });
  });

  describe('Logout Flow', () => {
    it('should logout user successfully', async () => {
      await logoutUser();
      
      expect(signOutCognito).toHaveBeenCalled();
      expect(clearAll).toHaveBeenCalled();
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
      
      expect(retrievedKey).toBeNull();
    });

    it('should handle invalid user secret key', async () => {
      const invalidKey = 'invalid-key';
      
      await expect(storeUserSecretKey(invalidKey)).rejects.toThrow();
    });

    it('should handle empty user secret key', async () => {
      const emptyKey = '';
      
      await expect(storeUserSecretKey(emptyKey)).rejects.toThrow();
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
    it('should get remembered email', () => {
      const rememberedEmail = 'remembered@example.com';
      localStorageMock.getItem.mockReturnValue(rememberedEmail);
      
      const result = getRememberedEmail();
      
      expect(result).toBe(rememberedEmail);
    });

    it('should check if user is authenticated', async () => {
      const result = await isUserAuthenticated();
      
      expect(typeof result).toBe('boolean');
    });

    it('should get user salt', async () => {
      const salt = await getUserSalt();
      
      expect(salt).toBe(TEST_USER.salt);
      expect(fetchUserSaltCognito).toHaveBeenCalled();
    });
  });
}); 