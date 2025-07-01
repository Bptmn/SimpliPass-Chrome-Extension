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
  getCurrentUser(): Promise<any | null>; // Type à adapter
  getUserSalt(): Promise<string>;
}

export const auth: AuthAdapter = {
  login: async (email, password): Promise<AuthResult> => {
    const result = await cognito.loginWithCognito(email, password);
    if ((result as any).mfaRequired) return result as AuthResult;
    const token = (result as any).firebaseToken;
    await firebase.signInWithFirebaseToken(token);
    return result as AuthResult;
  },

  confirmMfa: async (code): Promise<AuthResult> => {
    const result = await cognito.confirmMfaWithCognito(code);
    const token = (result as any).firebaseToken;
    await firebase.signInWithFirebaseToken(token);
    return result as AuthResult;
  },

  signOut: async (): Promise<void> => {
    await cognito.signOutCognito();
    await firebase.signOutFromFirebase();
  },

  getCurrentUser: async (): Promise<any | null> => {
    return firebase.getCurrentUser();
  },

  getUserSalt: async (): Promise<string> => {
    return await cognito.fetchUserSaltCognito();
  }
}; 