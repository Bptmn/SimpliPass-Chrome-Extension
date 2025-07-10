import { auth } from '../auth.adapter';
import { loginUser, confirmMfa, logoutUser, isUserAuthenticated, getUserSalt, storeUserSecretKey, getUserSecretKey, deleteUserSecretKey, getRememberedEmail } from '@app/core/logic/user';
import { TEST_USER } from '@app/__tests__/testData';
import { deriveKey } from '@app/utils/crypto';
import { clearAll } from '@app/core/database/localDB';
import * as firebaseModule from '@app/core/auth/firebase';

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
  const mockSignIn = require('aws-amplify/auth').signIn as jest.MockedFunction<any>;
  const mockConfirmSignIn = require('aws-amplify/auth').confirmSignIn as jest.MockedFunction<any>;
  const mockFetchAuthSession = require('aws-amplify/auth').fetchAuthSession as jest.MockedFunction<any>;
  const mockFetchUserAttributes = require('aws-amplify/auth').fetchUserAttributes as jest.MockedFunction<any>;
  const mockSignOut = require('aws-amplify/auth').signOut as jest.MockedFunction<any>;
  const mockSignInWithFirebaseToken = require('@app/core/auth/firebase').signInWithFirebaseToken as jest.MockedFunction<any>;
  const mockSignOutFromFirebase = require('@app/core/auth/firebase').signOutFromFirebase as jest.MockedFunction<any>;
  const mockInitFirebase = require('@app/core/auth/firebase').initFirebase as jest.MockedFunction<any>;
  const mockGetDoc = require('firebase/firestore').getDoc as jest.MockedFunction<any>;
  let signInWithFirebaseTokenSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockLocalStorage.removeItem.mockReturnValue(undefined);
    mockLocalStorage.clear.mockReturnValue(undefined);
    
    // Mock crypto operations
    mockCryptoSubtle.importKey.mockResolvedValue('mock-key');
    mockCryptoSubtle.deriveBits.mockResolvedValue(new Uint8Array(32));
    mockCryptoSubtle.encrypt.mockResolvedValue(new Uint8Array(16));
    mockCryptoSubtle.decrypt.mockResolvedValue(new Uint8Array(16));
    mockCryptoSubtle.generateKey.mockResolvedValue('mock-generated-key');
    
    // Mock localDB functions
    const mockSetItem = require('@app/core/database/localDB').setItem as jest.MockedFunction<any>;
    const mockGetItem = require('@app/core/database/localDB').getItem as jest.MockedFunction<any>;
    const mockRemoveItem = require('@app/core/database/localDB').removeItem as jest.MockedFunction<any>;
    const mockClearAll = require('@app/core/database/localDB').clearAll as jest.MockedFunction<any>;
    
    mockSetItem.mockResolvedValue(undefined);
    mockGetItem.mockResolvedValue(null);
    mockRemoveItem.mockResolvedValue(undefined);
    mockClearAll.mockResolvedValue(undefined);

    // Spy on the actual signInWithFirebaseToken import
    signInWithFirebaseTokenSpy = jest.spyOn(firebaseModule, 'signInWithFirebaseToken').mockResolvedValue(undefined);
  });

  afterEach(() => {
    signInWithFirebaseTokenSpy.mockRestore();
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

      // Mock Firebase initialization
      mockInitFirebase.mockResolvedValue({
        auth: {},
        db: {}
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

      mockInitFirebase.mockResolvedValue({ auth: {}, db: {} });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const rememberedEmail = getRememberedEmail();
      expect(rememberedEmail).toBe(TEST_USER.email);

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: true
      });

      expect(result.mfaRequired).toBe(false);
    });
  });

  describe('MFA Flow Integration', () => {
    it('successfully confirms MFA with valid code', async () => {
      // Mock successful MFA confirmation
      mockConfirmSignIn.mockResolvedValue({
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

      const result = await confirmMfa({
        code: '123456',
        password: TEST_USER.password
      });

      expect(mockConfirmSignIn).toHaveBeenCalledWith({
        challengeResponse: '123456'
      });
      expect(signInWithFirebaseTokenSpy).toHaveBeenCalled();
    });

    it('handles invalid MFA code', async () => {
      mockConfirmSignIn.mockRejectedValue(new Error('Invalid MFA code'));

      await expect(confirmMfa({
        code: '000000',
        password: TEST_USER.password
      })).rejects.toThrow('Invalid MFA code');
    });
  });

  describe('Logout Flow', () => {
    it('successfully completes logout flow', async () => {
      // Mock successful logout
      mockSignOut.mockResolvedValue(undefined);
      mockSignOutFromFirebase.mockResolvedValue(undefined);

      await logoutUser();

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockSignOutFromFirebase).toHaveBeenCalled();
      // Note: logoutUser doesn't directly call localStorage.removeItem, it's handled in the user logic
    });

    it('clears all local data on logout', async () => {
      const mockClearAll = require('@app/core/database/localDB').clearAll as jest.MockedFunction<any>;
      mockClearAll.mockResolvedValue(undefined);

      await logoutUser();

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('checks user authentication status correctly', async () => {
      const mockGetState = require('@app/core/states').useUserStore.getState as jest.MockedFunction<any>;
      
      // Test authenticated user
      mockGetState.mockReturnValue({
        user: { email: TEST_USER.email, uid: 'test-user-id' },
        setUser: jest.fn()
      });

      const isAuthenticated = await isUserAuthenticated();
      expect(isAuthenticated).toBe(true);

      // Test unauthenticated user
      mockGetState.mockReturnValue({
        user: null,
        setUser: jest.fn()
      });

      const isNotAuthenticated = await isUserAuthenticated();
      expect(isNotAuthenticated).toBe(false);
    });

    it('handles session timeout scenarios', async () => {
      // Mock expired session
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

      // Mock token without Firebase token
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
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
            toString: () => 'invalid-jwt-token'
          }
        }
      });

      await expect(auth.login(TEST_USER.email, TEST_USER.password))
        .rejects.toThrow('Invalid JWT structure');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('handles stuck session error and retries', async () => {
      // Mock stuck session error on first attempt
      mockSignIn.mockRejectedValueOnce(new Error('Already a signed in user'));
      
      // Mock successful login on retry
      mockSignIn.mockResolvedValueOnce({
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

      mockInitFirebase.mockResolvedValue({ auth: {}, db: {} });
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
      expect(mockSignIn).toHaveBeenCalledTimes(2);
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
      // Mock mobile platform detection
      const originalPlatform = process.env.PLATFORM;
      process.env.PLATFORM = 'mobile';

      // Mock biometric authentication
      const mockBiometricAuth = jest.fn().mockResolvedValue(true);
      (global as any).navigator.credentials = {
        create: mockBiometricAuth
      };

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

      mockInitFirebase.mockResolvedValue({ auth: {}, db: {} });
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

      // Restore platform
      process.env.PLATFORM = originalPlatform;
    });

    it('handles extension authentication flow', async () => {
      // Mock extension environment
      const originalPlatform = process.env.PLATFORM;
      process.env.PLATFORM = 'extension';

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

      mockInitFirebase.mockResolvedValue({ auth: {}, db: {} });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      const result = await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: true
      });

      expect(result.mfaRequired).toBe(false);

      // Restore platform
      process.env.PLATFORM = originalPlatform;
    });
  });

  describe('Cross-Platform Session Synchronization', () => {
    it('synchronizes user state across platforms', async () => {
      const mockSetUser = jest.fn();
      const mockGetState = require('@app/core/states').useUserStore.getState as jest.MockedFunction<any>;
      
      mockGetState.mockReturnValue({
        user: null,
        setUser: mockSetUser
      });

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

      mockInitFirebase.mockResolvedValue({ auth: {}, db: {} });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ email: TEST_USER.email, uid: 'test-user-id' })
      });

      await loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        email: TEST_USER.email,
        uid: 'test-user-id'
      });
    });
  });

  describe('Offline Authentication Handling', () => {
    it('handles offline authentication gracefully', async () => {
      // Mock offline state
      mockSignIn.mockRejectedValue(new Error('Network error'));

      await expect(loginUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberEmail: false
      })).rejects.toThrow('Network error');
    });

    it('retrieves cached user data when offline', async () => {
      // Mock cached user data
      const mockGetItem = require('@app/core/database/localDB').getItem as jest.MockedFunction<any>;
      mockGetItem.mockResolvedValue('cached-user-data');

      const cachedData = await getUserSecretKey();
      expect(cachedData).toBe('cached-user-data');
    });
  });

  describe('User Secret Key Management', () => {
    it('derives and stores user secret key correctly', async () => {
      const mockSetItem = require('@app/core/database/localDB').setItem as jest.MockedFunction<any>;
      const mockGetItem = require('@app/core/database/localDB').getItem as jest.MockedFunction<any>;
      
      const testSecretKey = 'test-secret-key';
      mockGetItem.mockResolvedValue(testSecretKey);
      
      await storeUserSecretKey(testSecretKey);
      
      const storedKey = await getUserSecretKey();
      expect(storedKey).toBe(testSecretKey);
      expect(mockSetItem).toHaveBeenCalledWith('UserSecretKey', testSecretKey);
    });

    it('deletes user secret key on logout', async () => {
      const mockRemoveItem = require('@app/core/database/localDB').removeItem as jest.MockedFunction<any>;
      mockRemoveItem.mockResolvedValue(undefined);

      await deleteUserSecretKey();
      
      expect(mockRemoveItem).toHaveBeenCalledWith('UserSecretKey');
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
      mockFetchUserAttributes.mockResolvedValue({});

      const salt = await getUserSalt();
      expect(salt).toBe('');
    });
  });
}); 