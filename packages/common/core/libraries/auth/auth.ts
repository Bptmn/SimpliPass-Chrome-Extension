/**
 * Authentication Service - Layer 2: Business Logic
 * 
 * Handles authentication operations only (steps 1-3 of login flow).
 * Session management is handled by session.ts
 * Secret key management is handled by secret.ts
 */

import { AuthenticationError } from '../../types/errors.types';
import { loginWithCognito, signInWithFirebaseToken, getCurrentUserId, signOutFromFirebase, signOutCognito } from './index';
import { platform } from '../../adapters';
import { isSessionValid } from '../../services/session';

/**
 * Step 1-3: Authenticate user and derive secret key
 * This function handles only authentication, not session management
 */ 
export async function loginUser(email: string, password: string): Promise<string> {
  try {
    // Always sign out before login to avoid UserAlreadyAuthenticatedException
    await signOutFromFirebase();
    await signOutCognito();

    // Step 1: Login with Cognito
    await loginWithCognito(email, password);
    
    // Step 2: Sign in to Firebase
    const firebaseUser = await signInWithFirebaseToken();
    
    // Return the user ID from Firebase
    return firebaseUser.uid;
  } catch {
    console.error('[Auth] Login failed');
    throw new AuthenticationError('Login failed', new Error('Login failed'));
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const currentUser = getCurrentUserId();
    return !!currentUser;
  } catch {
    return false;
  }
}

/**
 * Sign out user from all authentication providers
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOutFromFirebase();
    await signOutCognito();
    console.log('[Auth] User signed out successfully');
  } catch {
    console.error('Failed to sign out');
    throw new AuthenticationError('Failed to sign out', new Error('Sign out failed'));
  }
}


// Store user secret key in platform adapter
export async function storeUserSecretKey(userSecretKey: string): Promise<void> {
  await platform.storeUserSecretKey(userSecretKey);
}

// Check authentication status (stub, should be replaced with real implementation if needed)
export async function checkAuthenticationStatus(): Promise<any> {
  const isUserConnected = await isUserAuthenticated();
  const sessionValid = await isSessionValid();
  
  return {
    isUserConnected,
    isSessionValid: sessionValid,
    user: getCurrentUserId(),
    session: null,
  };
} 