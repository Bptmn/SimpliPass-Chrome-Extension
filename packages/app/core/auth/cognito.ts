/**
 * services/cognito.ts
 * Low-level Cognito service functions for authentication and user management.
 * No business logic, just direct API calls.
 */
import { Amplify } from 'aws-amplify';
import { getCognitoConfig } from '../config/platform';

let isInitialized = false;

export async function initCognito() {
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
    throw error;
  }
}

export async function loginWithCognito(email: string, password: string): Promise<unknown> {
  await initCognito();
  
  try {
    const { signIn } = await import('aws-amplify/auth');
    const result = await signIn({ username: email, password });
    console.log('[Cognito] Login successful');
    return result;
  } catch (error) {
    console.error('[Cognito] Login failed:', error);
    throw error;
  }
}

export async function confirmMfaWithCognito(code: string): Promise<unknown> {
  await initCognito();
  
  try {
    const { confirmSignIn } = await import('aws-amplify/auth');
    const result = await confirmSignIn({ challengeResponse: code });
    console.log('[Cognito] MFA confirmation successful');
    return result;
  } catch (error) {
    console.error('[Cognito] MFA confirmation failed:', error);
    throw error;
  }
}

export async function fetchUserAttributesCognito(): Promise<unknown> {
  await initCognito();
  
  try {
    const { fetchUserAttributes } = await import('aws-amplify/auth');
    const attributes = await fetchUserAttributes();
    console.log('[Cognito] User attributes fetched successfully');
    return attributes;
  } catch (error) {
    console.error('[Cognito] Failed to fetch user attributes:', error);
    throw error;
  }
}

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
    throw error;
  }
}

export async function signOutCognito(): Promise<void> {
  await initCognito();
  
  try {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
    console.log('[Cognito] Sign out successful');
  } catch (error) {
    console.error('[Cognito] Sign out failed:', error);
    throw error;
  }
}

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
    throw error;
  }
}
