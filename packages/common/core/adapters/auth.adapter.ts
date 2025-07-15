import * as cognito from '@common/core/libraries/auth/cognito';
import * as firebase from '@common/core/libraries/auth/firebase';

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
    try {
      const result = await cognito.loginWithCognito(email, password);
      
      // Check if MFA is required by examining the result structure
      if (result && typeof result === 'object' && 'nextStep' in result) {
        const nextStep = (result as any).nextStep;
        if (nextStep && nextStep.signInStep && nextStep.signInStep !== 'DONE') {
          return { mfaRequired: true };
        }
      }
      
      // If login is successful, sign in to Firebase
      await firebase.signInWithFirebaseToken();
      
      // Get user attributes
      const userAttributes = await cognito.fetchUserAttributesCognito();
      
      return {
        mfaRequired: false,
        userAttributes
      };
    } catch (error) {
      console.error('[Auth Adapter] Login failed:', error);
      throw error;
    }
  },

  confirmMfa: async (code): Promise<AuthResult> => {
    try {
      await cognito.confirmMfaWithCognito(code);
      
      // Sign in to Firebase after successful MFA
      await firebase.signInWithFirebaseToken();
      
      // Get user attributes
      const userAttributes = await cognito.fetchUserAttributesCognito();
      
      return {
        mfaRequired: false,
        userAttributes
      };
    } catch (error) {
      console.error('[Auth Adapter] MFA confirmation failed:', error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    await cognito.signOutCognito();
    await firebase.signOutFromFirebase();
  },

  getUserSalt: async (): Promise<string> => {
    return await cognito.fetchUserSaltCognito();
  }
}; 