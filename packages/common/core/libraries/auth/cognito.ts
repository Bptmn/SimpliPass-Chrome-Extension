// packages/common/core/libraries/auth/cognito.ts
import { Amplify } from 'aws-amplify';
import { NetworkError, AuthenticationError } from '../../types/errors.types';
import { CognitoUser, MfaChallenge } from '../../types/auth.types';
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
      const { confirmSignIn, fetchAuthSession, fetchUserAttributes } = await import('aws-amplify/auth');
      
      console.log('[Cognito] Confirming MFA with code:', code);
      const user = await confirmSignIn({ challengeResponse: code });
      
      // ✅ NEW: Wait for session to be properly established
      console.log('[Cognito] MFA confirmed, waiting for session to be established...');
      
      // Wait a bit for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify session is available and get tokens
      try {
        const session = await fetchAuthSession();
        if (!session.tokens) {
          throw new Error('No tokens available after MFA confirmation');
        }
        console.log('[Cognito] Session verified after MFA confirmation');
        
        // ✅ FIXED: Get tokens and attributes like in old code
        const idToken = session.tokens.idToken?.toString();
        if (!idToken) throw new Error('No IdToken found');
        
        const parts = idToken.split('.');
        if (parts.length !== 3) throw new Error('Invalid JWT structure');
        
        const payload = JSON.parse(atob(parts[1]));
        const firebaseToken = payload.firebaseToken;
        if (!firebaseToken) throw new Error('Firebase token not found in Cognito ID token claims');
        
        const userAttributes = await fetchUserAttributes();
        
        console.log('[Cognito] confirmMfaWithCognito success');
        
        // ✅ Return complete result like old code
        return {
          ...user,
          idToken,
          firebaseToken,
          userAttributes,
        } as unknown as CognitoUser;
        
      } catch (sessionError) {
        console.error('[Cognito] Session verification failed after MFA:', sessionError);
        throw new Error('Session not properly established after MFA confirmation');
      }
      
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
      console.log('[Cognito] Getting Cognito tokens and Firebase token...');
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      console.log('[Cognito] Session fetched:', !!session.tokens);
      
      if (!session.tokens) {
        throw new Error('No tokens available in Cognito session');
      }
      
      const idToken = session.tokens.idToken?.toString() || '';
      
      console.log('[Cognito] ID Token exists:', !!idToken);
      
      if (!idToken) {
        throw new Error('Missing ID token from Cognito session');
      }
      
      // ✅ NEW: Validate token structure
      if (idToken.split('.').length !== 3) {
        throw new Error('Invalid ID token structure');
      }
      
      // ✅ FIXED: Extract Firebase token from ID token claims (like in old code)
      const parts = idToken.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const firebaseToken = payload.firebaseToken;
      
      console.log('[Cognito] Firebase token extracted from ID token claims:', !!firebaseToken);
      
      if (!firebaseToken) {
        throw new Error('Firebase token not found in Cognito ID token claims');
      }
      
      console.log('[Cognito] Tokens validated successfully');
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

// ✅ Cognito authentication that returns status to master login function
let pendingMfaUser: CognitoUser | null = null;

export const loginWithCognito = async (email: string, password: string): Promise<string | MfaChallenge> => {
  const cognitoAuth = CognitoAuth.getInstance();
  const cognitoUser = await cognitoAuth.loginWithCognito(email, password);
  
  // Check if MFA is required
  const mfaSteps = [
    'CONFIRM_SIGN_IN_WITH_SMS_CODE',
    'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
    'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
    'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
    'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
    'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
  ];
  
  if (cognitoUser.nextStep && mfaSteps.includes(cognitoUser.nextStep.signInStep)) {
    console.log('[Cognito] MFA required:', cognitoUser.nextStep.signInStep);
    // Store the pending MFA user for later confirmation
    pendingMfaUser = cognitoUser;
    return {
      mfaRequired: true,
      mfaUser: cognitoUser,
      challengeType: cognitoUser.nextStep.signInStep,
      challengeName: cognitoUser.nextStep.signInStep,
    };
  }
  
  // No MFA required, return user ID
  console.log('[Cognito] No MFA required, authentication complete');
  return cognitoUser.username || email;
};

// ✅ NEW: Confirm MFA and complete Cognito authentication
export const confirmMfaAndCompleteCognitoAuth = async (code: string): Promise<string> => {
  if (!pendingMfaUser) {
    throw new Error('No pending MFA user found. Please start login process first.');
  }
  
  const cognitoAuth = CognitoAuth.getInstance();
  const result = await cognitoAuth.confirmMfaWithCognito(code);
  
  // Clear the pending user
  pendingMfaUser = null;
  
  console.log('[Cognito] MFA confirmed and Cognito authentication complete');
  return (result as any).username || '';
};



// ✅ NEW: Confirm MFA and return user ID
export const confirmMfaAndGetUserId = async (code: string): Promise<string> => {
  const cognitoAuth = CognitoAuth.getInstance();
  const result = await cognitoAuth.confirmMfaWithCognito(code);
  
  // ✅ FIXED: Handle the new return format with tokens and attributes
  if (result && typeof result === 'object' && 'firebaseToken' in result) {
    // The result contains the complete data from confirmMfaWithCognito
    console.log('[Cognito] MFA confirmation completed with tokens');
    return (result as any).username || '';
  }
  
  // Fallback to old format
  return (result as any).username || '';
};

// Pure provider function that returns user ID string for adapter compatibility (legacy)
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
