import * as cognito from './cognito';
import * as firebase from './firebase';

export interface AuthResult {
  mfaRequired: boolean;
  idToken?: string;
  firebaseToken?: string;
  userAttributes?: Record<string, string>;
}

export interface AuthAdapter {
  login(email: string, password: string): Promise<AuthResult>;
  confirmMfa(code: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getUserSalt(): Promise<string>;
}

export const auth: AuthAdapter = {
  login: async (email, password): Promise<AuthResult> => {
    console.log('[Auth] Starting login process');
    const result = await cognito.loginWithCognito(email, password);
    
    if (result && typeof result === 'object' && 'mfaRequired' in result && result.mfaRequired === true) {
      return result as AuthResult;
    }
    
    const token = result && typeof result === 'object' && 'firebaseToken' in result 
      ? (result as { firebaseToken: string }).firebaseToken 
      : undefined;
    
    if (token) {
      await firebase.signInWithFirebaseToken(token);
      console.log('[Auth] Firebase authentication completed');
    } else {
      console.log('[Auth] No Firebase token found in result');
    }
    return result as AuthResult;
  },

  confirmMfa: async (code): Promise<AuthResult> => {
    const result = await cognito.confirmMfaWithCognito(code);
    const token = result && typeof result === 'object' && 'firebaseToken' in result 
      ? (result as { firebaseToken: string }).firebaseToken 
      : undefined;
    if (token) {
      await firebase.signInWithFirebaseToken(token);
    }
    return result as AuthResult;
  },

  signOut: async (): Promise<void> => {
    await cognito.signOutCognito();
    await firebase.signOutFromFirebase();
  },

  getUserSalt: async (): Promise<string> => {
    return await cognito.fetchUserSaltCognito();
  }
}; 