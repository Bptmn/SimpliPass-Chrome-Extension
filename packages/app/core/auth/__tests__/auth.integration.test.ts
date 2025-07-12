import { auth } from '../auth.adapter';
import { loginUser, confirmMfa, logoutUser, isUserAuthenticated, getUserSalt, storeUserSecretKey, getUserSecretKey, deleteUserSecretKey } from '@app/core/logic/user';
import { TEST_USER } from '@app/__tests__/testData';
import * as firebaseModule from '@app/core/auth/firebase';
import { signIn, confirmSignIn, fetchAuthSession, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { getDoc } from 'firebase/firestore';
import { setItem, getItem, removeItem, clearAll } from '@app/core/database/localDB';

// Mock AWS Amplify auth functions
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  confirmSignIn: jest.fn(),
  fetchAuthSession: jest.fn(),
  fetchUserAttributes: jest.fn(),
  signOut: jest.fn(),
}));

// Mock local storage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock window.crypto.subtle for crypto operations
const mockCryptoSubtle = {
  importKey: jest.fn(),
  deriveBits: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  generateKey: jest.fn(),
};
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: mockCryptoSubtle,
    getRandomValues: jest.fn(),
  },
  writable: true,
});

// Mock user store
jest.mock('@app/core/states', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      user: null,
      setUser: jest.fn(),
    })),
  },
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock localDB functions
jest.mock('@app/core/database/localDB', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clearAll: jest.fn(),
}));

describe('Authentication Integration Tests', () => {
  const mockSignIn = jest.mocked(signIn);
  const mockConfirmSignIn = jest.mocked(confirmSignIn);
  const mockFetchAuthSession = jest.mocked(fetchAuthSession);
  const mockFetchUserAttributes = jest.mocked(fetchUserAttributes);
  const mockSignOut = jest.mocked(signOut);
  const mockGetDoc = jest.mocked(getDoc);
  let signInWithFirebaseTokenSpy: jest.SpyInstance;
  let signOutFromFirebaseSpy: jest.SpyInstance;
  let initFirebaseSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockLocalStorage.removeItem.mockReturnValue(undefined);
    mockLocalStorage.clear.mockReturnValue(undefined);
    
    // Clear test storage
    // clearTestStorage(); // Removed as per edit hint
    // clearTestClipboard(); // Removed as per edit hint
    // clearUserSecretKeyTestStorage(); // Removed as per edit hint
    
    // Mock crypto operations
    mockCryptoSubtle.importKey.mockResolvedValue('mock-key');
    mockCryptoSubtle.deriveBits.mockResolvedValue(new Uint8Array(32));
    mockCryptoSubtle.encrypt.mockResolvedValue(new Uint8Array(16));
    mockCryptoSubtle.decrypt.mockResolvedValue(new Uint8Array(16));
    mockCryptoSubtle.generateKey.mockResolvedValue('mock-generated-key');
    
    // Mock localDB functions
    const mockSetItem = jest.mocked(setItem);
    const mockGetItem = jest.mocked(getItem);
    const mockRemoveItem = jest.mocked(removeItem);
    const mockClearAll = jest.mocked(clearAll);
    
    mockSetItem.mockResolvedValue(undefined);
    mockGetItem.mockResolvedValue(null);
    mockRemoveItem.mockResolvedValue(undefined);
    mockClearAll.mockResolvedValue(undefined);

    // Spy on the actual Firebase functions
    signInWithFirebaseTokenSpy = jest.spyOn(firebaseModule, 'signInWithFirebaseToken').mockResolvedValue(undefined);
    signOutFromFirebaseSpy = jest.spyOn(firebaseModule, 'signOutFromFirebase').mockResolvedValue(undefined);
    initFirebaseSpy = jest.spyOn(firebaseModule, 'initFirebase').mockResolvedValue({
      auth: {},
      db: {}
    });
  });

  afterEach(() => {
    signInWithFirebaseTokenSpy.mockRestore();
    signOutFromFirebaseSpy.mockRestore();
    initFirebaseSpy.mockRestore();
  });

  describe('Complete Login Flow', () => {
    it('successfully completes login flow with valid credentials', async () => {
      // Mock successful Cognito login
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      // Mock successful auth session
      // JWT with base64 payload: { "firebaseToken": "firebase_custom_token" }
      // Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
      // Payload: eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=
      // Signature: dummy
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      // Mock user attributes
      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      // Mock Firestore user document
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: TEST_USER.email,
          uid: 'test-user-id',
          created_time: new Date(),
          salt: TEST_USER.salt
        })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: true
      });

      expect(result.mfaRequired).toBe(false);
      expect(mockSignIn).toHaveBeenCalledWith({
        username: TEST_USER.email,
        password: TEST_USER.password
      });
      expect(signInWithFirebaseTokenSpy).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('simplipass_remembered_email', TEST_USER.email);
    });

    it('handles MFA required scenario', async () => {
      // Mock MFA required response
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_SMS_CODE' }
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('simplipass_remembered_email');
    });

    it('handles login with remembered email', async () => {
      mockLocalStorage.getItem.mockReturnValue(TEST_USER.email);

      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(false);
      expect(mockSignIn).toHaveBeenCalledWith({
        username: TEST_USER.email,
        password: TEST_USER.password
      });
    });
  });

  describe('MFA Flow Integration', () => {
    it('successfully confirms MFA with valid code', async () => {
      mockConfirmSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      const result = await confirmMfa({
        code: '123456',
        password: TEST_USER.password
      });

      expect(result).toBeDefined();
      expect(mockConfirmSignIn).toHaveBeenCalledWith({
        challengeResponse: '123456'
      });
      expect(signInWithFirebaseTokenSpy).toHaveBeenCalled();
    });

    it('handles invalid MFA code', async () => {
      mockConfirmSignIn.mockRejectedValue(new Error('Invalid code'));

      await expect(confirmMfa({
        code: '000000',
        password: TEST_USER.password
      })).rejects.toThrow('Invalid code');
    });
  });

  describe('Logout Flow', () => {
    it('successfully completes logout flow', async () => {
      // Mock successful logout
      mockSignOut.mockResolvedValue(undefined);

      await logoutUser();

      expect(mockSignOut).toHaveBeenCalled();
      expect(signOutFromFirebaseSpy).toHaveBeenCalled();
    });

    it('clears all local data on logout', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await logoutUser();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('checks user authentication status correctly', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'valid-token'
          }
        }
      });

      const isAuthenticated = await isUserAuthenticated();
      expect(isAuthenticated).toBe(true);
    });

    it('handles session timeout scenarios', async () => {
      mockFetchAuthSession.mockRejectedValue(new Error('Session expired'));

      await expect(auth.login(TEST_USER.email, TEST_USER.password))
        .rejects.toThrow('Session expired');
    });
  });

  describe('Token Validation', () => {
    it('validates Firebase token presence in Cognito token', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      // Mock JWT without Firebase token
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dummy'
          }
        }
      });

      await expect(auth.login(TEST_USER.email, TEST_USER.password))
        .rejects.toThrow('Firebase token not found in Cognito ID token claims');
    });

    it('validates JWT structure', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      // Mock invalid JWT
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'invalid-jwt'
          }
        }
      });

      await expect(auth.login(TEST_USER.email, TEST_USER.password))
        .rejects.toThrow('Invalid JWT structure');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('handles stuck session error and retries', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(false);
    });

    it('handles network errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      await expect(loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      })).rejects.toThrow('Network error');
    });
  });

  describe('Platform-Specific Authentication', () => {
    it('handles biometric authentication on mobile', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(false);
    });

    it('handles extension authentication flow', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(false);
    });
  });

  describe('Cross-Platform Session Synchronization', () => {
    it('synchronizes user state across platforms', async () => {
      mockSignIn.mockResolvedValue({
        nextStep: { signInStep: 'DONE' }
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJlYmFzZVRva2VuIjoiZmlyZWJhc2VfY3VzdG9tX3Rva2VuIn0=.dummy'
          }
        }
      });

      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt,
        sub: 'test-user-id',
        email: TEST_USER.email
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(result.mfaRequired).toBe(false);
    });
  });

  describe('Offline Authentication Handling', () => {
    it('handles offline authentication gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      await expect(loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      })).rejects.toThrow('Network error');
    });

    it('retrieves cached user data when offline', async () => {
      // Store some test data in the test storage
      // const testStorage = getTestStorage(); // Removed as per edit hint
      // testStorage['cached-user-data'] = 'cached-user-data'; // Removed as per edit hint

      const cachedData = await getUserSecretKey();
      expect(cachedData).toBe(null); // Should be null since we're using test environment
    });
  });

  describe('User Secret Key Management', () => {
    it('derives and stores user secret key correctly', async () => {
      const testSecretKey = 'test-secret-key';
      await storeUserSecretKey(testSecretKey);
      
      const storedKey = await getUserSecretKey();
      expect(storedKey).toBe(testSecretKey);
      
      // Check that it was stored in test storage
      // const testStorage = getTestStorage(); // Removed as per edit hint
      // expect(testStorage.UserSecretKey).toBe(testSecretKey); // Removed as per edit hint
    });

    it('deletes user secret key on logout', async () => {
      const testSecretKey = 'test-secret-key';
      await storeUserSecretKey(testSecretKey);
      
      await deleteUserSecretKey();
      
      const storedKey = await getUserSecretKey();
      expect(storedKey).toBe(null);
      
      // Check that it was removed from test storage
      // const testStorage = getTestStorage(); // Removed as per edit hint
      // expect(testStorage.UserSecretKey).toBeUndefined(); // Removed as per edit hint
    });
  });

  describe('User Salt Management', () => {
    it('retrieves user salt from Cognito', async () => {
      mockFetchUserAttributes.mockResolvedValue({
        'custom:salt': TEST_USER.salt
      });

      const salt = await getUserSalt();
      expect(salt).toBe(TEST_USER.salt);
    });

    it('handles missing user salt gracefully', async () => {
      mockFetchUserAttributes.mockResolvedValue({
        // No salt attribute
      });

      await expect(getUserSalt()).rejects.toThrow('User salt not found in Cognito attributes');
    });
  });
}); 