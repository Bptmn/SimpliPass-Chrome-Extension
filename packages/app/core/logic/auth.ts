/**
 * Authentication Logic - Unified Architecture
 * 
 * Handles all user authentication operations using the new unified architecture.
 * Integrates with platform adapters and unified logic functions.
 */

import { getPlatformAdapter } from '../adapters/adapter.factory';
import { deriveKey } from '@app/utils/crypto';
import { initFirebase } from '@app/core/auth/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { User } from '@app/core/types/types';
import { createSession } from './session';
import { 
  loginWithCognito, 
  getCognitoTokensAndFirebaseToken, 
  fetchUserAttributesCognito, 
  signOutCognito, 
  fetchUserSaltCognito 
} from '../auth/cognito';
import { signInWithFirebaseToken, signOutFromFirebase } from '../auth/firebase';

// ===== Types =====

export interface LoginData {
  email: string;
  password: string;
  rememberEmail: boolean;
  rememberMe?: boolean;
}

export interface MfaData {
  code: string;
  password: string;
}

// ===== Authentication Functions =====

/**
 * Login user with unified architecture
 * Handles authentication logic until login is fully successful
 */
export async function loginUser(data: LoginData): Promise<void> {
  try {
    
    // 1. Login with Cognito
    const cognitoResult = await loginWithCognito(data.email, data.password);
    
    // Since loginWithCognito returns unknown, we'll assume success if no error was thrown
    console.log('[Auth] Cognito login successful');
    
    // 2. Get tokens
    const { idToken, firebaseToken } = await getCognitoTokensAndFirebaseToken();
    
    // 3. Sign in to Firebase with custom token
    await signInWithFirebaseToken(firebaseToken);
    
    console.log('[Auth] Firebase sign-in successful');
    
    
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    throw error;
  }
}

/**
 * Confirm MFA with unified architecture
 */
export async function confirmMfa(data: MfaData): Promise<any> {
  try {
    const adapter = await getPlatformAdapter();
    
    // Get user from database
    const userProfile = await fetchUserProfile(data.password);
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Derive and store user secret key
    const userSecretKey = await deriveKey(data.password, userProfile.salt);
    
    // Create session
    const sessionResult = await createSession(userSecretKey, {
      rememberMe: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    });
    
    if (!sessionResult.success) {
      throw new Error('Failed to create session');
    }
    
    console.log('[Auth] MFA confirmation successful');
    return { user: userProfile, session: sessionResult.data };
    
  } catch (error) {
    console.error('[Auth] MFA confirmation failed:', error);
    throw error;
  }
}

/**
 * Logout user with unified architecture
 */
export async function logoutUser(): Promise<void> {
  try {
    console.log('[Auth] Starting logout process');
    
    // Clear session
    const { clearSession } = await import('./session');
    await clearSession();
    
    // Sign out from Firebase
    await signOutFromFirebase();
    
    // Sign out from Cognito
    await signOutCognito();
    
    console.log('[Auth] Logout successful');
    
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
    throw error;
  }
}

/**
 * Get remembered email
 */
export async function getRememberedEmail(): Promise<string | null> {
  try {
    const adapter = await getPlatformAdapter();
    return await adapter.getRememberedEmail?.() || null;
  } catch (error) {
    console.warn('[Auth] Failed to get remembered email:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const { isAuthenticated } = await import('./session');
    return await isAuthenticated();
  } catch (error) {
    console.warn('[Auth] Failed to check authentication status:', error);
    return false;
  }
}

/**
 * Get user salt
 */
export async function getUserSalt(): Promise<string> {
  try {
    return await fetchUserSaltCognito();
  } catch (error) {
    console.error('[Auth] Failed to get user salt:', error);
    throw error;
  }
}

/**
 * Store user secret key
 */
export async function storeUserSecretKey(key: string): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    await adapter.storeUserSecretKey(key);
  } catch (error) {
    console.error('[Auth] Failed to store user secret key:', error);
    throw error;
  }
}

/**
 * Get user secret key
 */
export async function getUserSecretKey(): Promise<string | null> {
  try {
    const adapter = await getPlatformAdapter();
    return await adapter.getUserSecretKey();
  } catch (error) {
    console.error('[Auth] Failed to get user secret key:', error);
    return null;
  }
}

/**
 * Delete user secret key
 */
export async function deleteUserSecretKey(): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    await adapter.deleteUserSecretKey();
  } catch (error) {
    console.error('[Auth] Failed to delete user secret key:', error);
    throw error;
  }
}

/**
 * Fetch user profile from database
 */
export async function fetchUserProfile(uid: string): Promise<User | null> {
  try {
    const { db } = await initFirebase();
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('[Auth] Error fetching user profile:', error);
    throw error;
  }
} 