/**
 * Cognito Library - Layer 3: External Integration
 * 
 * Handles AWS Cognito authentication operations.
 * Low-level operations that can be called by services.
 */

import { Amplify } from 'aws-amplify';
import { NetworkError, AuthenticationError } from '../../types/errors.types';
import { CognitoUser } from '../../types/auth.types';
import { getCognitoConfig } from '@common/config/platform';

let isInitialized = false;

/**
 * Initialize Cognito configuration
 */
export async function initCognito(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const cognitoConfig = await getCognitoConfig();
    
    Amplify.configure({
      Auth: {
        Cognito: cognitoConfig,
      },
    });
    
    isInitialized = true;
    console.log('[Cognito] Initialized successfully');
  } catch (error) {
    console.error('[Cognito] Failed to initialize:', error);
    throw new NetworkError('Failed to initialize Cognito', error as Error);
  }
}

/**
 * Login with Cognito
 */
export async function loginWithCognito(email: string, password: string): Promise<CognitoUser> {
  await initCognito();
  
  try {
    const { signIn } = await import('aws-amplify/auth');
    const result = await signIn({ username: email, password });
    console.log('[Cognito] Login successful');
    return result as unknown as CognitoUser;
  } catch (error) {
    console.error('[Cognito] Login failed:', error);
    throw new AuthenticationError('Cognito login failed', error as Error);
  }
}

/**
 * Confirm MFA with Cognito
 */
export async function confirmMfaWithCognito(code: string): Promise<CognitoUser> {
  await initCognito();
  
  try {
    const { confirmSignIn } = await import('aws-amplify/auth');
    const result = await confirmSignIn({ challengeResponse: code });
    console.log('[Cognito] MFA confirmation successful');
    return result as unknown as CognitoUser;
  } catch (error) {
    console.error('[Cognito] MFA confirmation failed:', error);
    throw new AuthenticationError('Cognito MFA confirmation failed', error as Error);
  }
}

/**
 * Fetch user attributes from Cognito
 */
export async function fetchUserAttributesCognito(): Promise<Record<string, any>> {
  await initCognito();
  
  try {
    const { fetchUserAttributes } = await import('aws-amplify/auth');
    const attributes = await fetchUserAttributes();
    console.log('[Cognito] User attributes fetched successfully');
    return attributes;
  } catch (error) {
    console.error('[Cognito] Failed to fetch user attributes:', error);
    throw new NetworkError('Failed to fetch user attributes', error as Error);
  }
}

/**
 * Fetch user salt from Cognito attributes
 */
export async function fetchUserSaltCognito(): Promise<string> {
  await initCognito();
  
  try {
    const { fetchUserAttributes } = await import('aws-amplify/auth');
    const attributes = await fetchUserAttributes();
    const salt = attributes['custom:salt'] as string;
    
    if (!salt) {
      throw new Error('User salt not found in Cognito attributes');
    }
    
    console.log('[Cognito] User salt fetched successfully');
    return salt;
  } catch (error) {
    console.error('[Cognito] Failed to fetch user salt:', error);
    // Fallback: generate a random salt for extension background context
    const fallbackSalt = btoa(`fallback-salt-${Date.now()}-${Math.random()}`);
    console.warn('[Cognito] Using fallback salt:', fallbackSalt);
    return fallbackSalt;
  }
}

/**
 * Sign out from Cognito
 */
export async function signOutCognito(): Promise<void> {
  await initCognito();
  
  try {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
    console.log('[Cognito] Sign out successful');
  } catch (error) {
    console.error('[Cognito] Sign out failed:', error);
    throw new AuthenticationError('Cognito sign out failed', error as Error);
  }
}

/**
 * Get Cognito tokens and Firebase token
 */
export async function getCognitoTokensAndFirebaseToken(): Promise<{ idToken: string; firebaseToken: string }> {
  await initCognito();
  
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
    
    console.log('[Cognito] Tokens retrieved successfully');
    return { idToken, firebaseToken };
  } catch (error) {
    console.error('[Cognito] Failed to get tokens:', error);
    throw new NetworkError('Failed to get Cognito tokens', error as Error);
  }
}
