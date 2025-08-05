// packages/common/core/libraries/auth/cognito.ts
import { Amplify } from 'aws-amplify';
import { NetworkError, AuthenticationError } from '../../types/errors.types';
import { CognitoUser } from '../../types/auth.types';
import { getCognitoConfig } from '@common/config/platform';

export class CognitoAuth {
  private static instance: CognitoAuth | null = null;

  // ✅ NEW: Singleton getInstance
  static getInstance(): CognitoAuth {
    if (!this.instance) {
      this.instance = new CognitoAuth();
    }
    return this.instance;
  }

  // ✅ NEW: Check if Cognito is actually initialized using Amplify
  public async isCognitoInitialized(): Promise<boolean> {
    try {
      // Check if Amplify is configured with UserPool
      const { Amplify } = await import('aws-amplify');
      const config = Amplify.getConfig();
      
      // Check if Auth.Cognito configuration exists
      if (!config.Auth?.Cognito) {
        console.log('[Cognito] UserPool not configured');
        return false;
      }
      
      // Check if required UserPool properties are set
      const cognitoConfig = config.Auth.Cognito;
      if (!cognitoConfig.userPoolId || !cognitoConfig.userPoolClientId) {
        console.log('[Cognito] UserPool configuration incomplete');
        return false;
      }
      
      console.log('[Cognito] UserPool properly configured');
      return true;
    } catch (_error) {
      console.log('[Cognito] Error checking initialization:', _error);
      return false;
    }
  }

  // ✅ NEW: Check if user is authenticated using native Cognito
  public async isUserAuthenticated(): Promise<boolean> {
    try {
      // First check if Cognito is properly initialized
      const isInitialized = await this.isCognitoInitialized();
      if (!isInitialized) {
        console.log('[Cognito] Not initialized, user not authenticated');
        return false;
      }
      
      // Try to get current authenticated user
      const { getCurrentUser } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      
      if (user) {
        console.log('[Cognito] User authenticated:', user.username);
        return true;
      }
      
      console.log('[Cognito] No authenticated user found');
      return false;
    } catch (_error) {
      console.log('[Cognito] Error checking authentication:', _error);
      return false;
    }
  }

  public async initCognito(): Promise<void> {
    // ✅ NATIVE CHECK: Use actual Cognito state
    const isInitialized = await this.isCognitoInitialized();
    if (isInitialized) {
      console.log('[Cognito] Already initialized, skipping');
      return;
    }

    console.log('[Cognito] Initializing Cognito...');
    try {
      const cognitoConfig = await getCognitoConfig('extension');
      Amplify.configure({
        Auth: {
          Cognito: cognitoConfig,
        },
      });
      console.log('[Cognito] Initialization complete');
    } catch (error) {
      console.error('[Cognito] Failed to initialize:', error);
      throw new NetworkError('Failed to initialize Cognito', error as Error);
    }
  }

  public async loginWithCognito(email: string, password: string): Promise<CognitoUser> {
    await this.initCognito();
    try {
      const { signIn } = await import('aws-amplify/auth');
      const result = await signIn({ username: email, password });
      return result as unknown as CognitoUser;
    } catch (error) {
      console.error('[Cognito] Login failed:', error);
      throw new AuthenticationError('Cognito login failed', error as Error);
    }
  }

  public async confirmMfaWithCognito(code: string): Promise<CognitoUser> {
    await this.initCognito();
    try {
      const { confirmSignIn } = await import('aws-amplify/auth');
      const result = await confirmSignIn({ challengeResponse: code });
      return result as unknown as CognitoUser;
    } catch (error) {
      console.error('[Cognito] MFA confirmation failed:', error);
      throw new AuthenticationError('Cognito MFA confirmation failed', error as Error);
    }
  }

  public async fetchUserAttributesCognito(): Promise<Record<string, string | undefined>> {
    await this.initCognito();
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      return attributes;
    } catch (error) {
      console.error('[Cognito] Failed to fetch user attributes:', error);
      throw new NetworkError('Failed to fetch user attributes', error as Error);
    }
  }

  public async fetchUserSaltCognito(): Promise<string> {
    await this.initCognito();
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      const salt = attributes['custom:salt'] as string;
      if (!salt) {
        throw new Error('User salt not found in Cognito attributes');
      }
      return salt;
    } catch (error) {
      console.error('[Cognito] Failed to fetch user salt:', error);
      const fallbackSalt = btoa(`fallback-salt-${Date.now()}-${Math.random()}`);
      console.warn('[Cognito] Using fallback salt:', fallbackSalt);
      return fallbackSalt;
    }
  }

  public async signOutCognito(): Promise<void> {
    await this.initCognito();
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
    } catch (error) {
      console.error('[Cognito] Sign out failed:', error);
      throw new AuthenticationError('Cognito sign out failed', error as Error);
    }
  }

  public async getCognitoTokensAndFirebaseToken(): Promise<{ idToken: string; firebaseToken: string }> {
    await this.initCognito();
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No tokens available in Cognito session');
      }
      const idToken = session.tokens.idToken?.toString() || '';
      const firebaseToken = session.tokens.accessToken?.toString() || '';
      if (!idToken || !firebaseToken) {
        throw new Error('Missing required tokens from Cognito session');
      }
      return { idToken, firebaseToken };
    } catch (error) {
      console.error('[Cognito] Failed to get tokens:', error);
      throw new NetworkError('Failed to get Cognito tokens', error as Error);
    }
  }
}

// Standalone function exports for adapter compatibility

// Pure provider function: Initialize Cognito
export const initCognito = async (_platform?: 'extension' | 'mobile'): Promise<void> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  await cognitoAuth.initCognito();
};

// ✅ NEW: Check if Cognito is initialized
export const isCognitoInitialized = async (): Promise<boolean> => {
  const cognitoAuth = CognitoAuth.getInstance();
  return await cognitoAuth.isCognitoInitialized();
};

export const loginWithCognito = async (email: string, password: string): Promise<CognitoUser> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  return cognitoAuth.loginWithCognito(email, password);
};

// Pure provider function that returns user ID string for adapter compatibility
export const loginWithCognitoAndGetUserId = async (email: string, password: string): Promise<string> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  const cognitoUser = await cognitoAuth.loginWithCognito(email, password);
  return cognitoUser.username || email; // Return username or email as user ID
};

export const fetchUserSaltCognito = async (): Promise<string> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  return cognitoAuth.fetchUserSaltCognito();
};

export const signOutCognito = async (): Promise<void> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  return cognitoAuth.signOutCognito();
};

// Pure provider function to sign out from all providers
export const signOutFromAllProviders = async (): Promise<void> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  await cognitoAuth.signOutCognito();
  
  // Also sign out from Firebase
  const { signOutFromFirebase } = await import('./firebase');
  await signOutFromFirebase();
};

// Pure provider function to get Cognito tokens and Firebase token
export const getCognitoTokensAndFirebaseToken = async (): Promise<{ idToken: string; firebaseToken: string }> => {
  const cognitoAuth = CognitoAuth.getInstance(); // ✅ Use singleton
  return cognitoAuth.getCognitoTokensAndFirebaseToken();
};
