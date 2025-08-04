// packages/common/core/libraries/auth/__tests__/auth.integration.test.ts
import { AuthService } from '../firebase';
import { CognitoAuth } from '../cognito';

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(() => Promise.resolve({
    tokens: {
      idToken: {
        toString: () => 'header.eyJmaXJlYmFzZVRva2VuIjogImZha2UtZmlyZWJhc2UtdG9rZW4ifQ.signature'
      }
    }
  })),
  signIn: jest.fn(() => Promise.resolve({})),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithCustomToken: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-user-id' } })),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('@common/config/platform', () => ({
    getFirebaseConfig: jest.fn(() => Promise.resolve({ projectId: 'test-project' })),
    getCognitoConfig: jest.fn(() => Promise.resolve({}))
}));

describe('Authentication Integration', () => {
  let authService: AuthService;
  let cognitoAuth: CognitoAuth;

  beforeEach(() => {
    authService = new AuthService();
    cognitoAuth = new CognitoAuth();
  });

  it('should sign in with Cognito and then with Firebase', async () => {
    await cognitoAuth.loginWithCognito('test@test.com', 'password');
    const firebaseUser = await authService.signInWithFirebaseToken();
    
    expect(firebaseUser.uid).toBe('firebase-user-id');
  });

  it('should sign out from both services', async () => {
    await cognitoAuth.signOutCognito();
    await authService.signOutFromFirebase();
    
    // Check that the respective signOut functions were called
    const { signOut: cognitoSignOut } = require('aws-amplify/auth');
    const { signOut: firebaseSignOut } = require('firebase/auth');
    
    expect(cognitoSignOut).toHaveBeenCalled();
    expect(firebaseSignOut).toHaveBeenCalled();
  });
});
