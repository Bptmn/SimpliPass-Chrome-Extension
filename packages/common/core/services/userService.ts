/**
 * User Service - Layer 2: Business Logic
 * 
 * Handles user profile operations and user state management.
 * Provides reusable functions for mobile and extension platforms.
 */

import { User } from '../types/auth.types';
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { auth } from '../adapters/auth.adapter';
import { useAppStateStore } from '../../hooks/useAppState';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Get current user from database
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get current user ID from auth using async method
    const currentUser = await getCurrentUserAsync();
    if (!currentUser) {
      return null;
    }

    // Fetch user document from database via adapter
    const userDoc = await db.getDocument(`users/${currentUser.uid}`);
    
    if (!userDoc) {
      console.warn('[UserService] User document not found in database');
      return null;
    }

    // Create User object
    const user: User = {
      id: currentUser.uid,
      email: userDoc.email,
      username: userDoc.username || userDoc.email,
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
      updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
    };

    return user;
    
  } catch (error) {
    console.error('[UserService] Failed to get current user:', error);
    return null;
  }
}

/**
 * Get current authenticated user ID with async waiting for auth state
 */
export async function getCurrentUserAsync(): Promise<FirebaseUser | null> {
  // Wait for auth state to be fully stable first
  await waitForAuthStateStable();
  
  // Now get the current user
  return auth.getCurrentUser();
}

/**
 * Wait for auth state to be fully stable (business logic moved from adapter)
 */
export async function waitForAuthStateStable(): Promise<void> {
  
  // Use onAuthStateChanged to wait for auth state to be fully loaded - onAuthStateChanged only fires when Firebase has completed loading
  await new Promise<void>((resolve) => {
    auth.onAuthStateChanged((_user: FirebaseUser | null) => {
      console.log('[UserService] onAuthStateChanged fired, auth state is now stable');
      resolve();
    }).then((unsubscribe) => {
      // Store unsubscribe function for cleanup if needed
      (waitForAuthStateStable as any)._unsubscribe = unsubscribe;
    });
  });
  
}

/**
 * Check if user has secret key stored
 */
export async function checkUserSecretKey(): Promise<boolean> {
  try {
    const userSecretKey = await storage.getUserSecretKeyFromSecureLocalStorage();
    return !!userSecretKey;
  } catch (error) {
    console.error('[UserService] Error checking user secret key:', error);
    return false;
  }
}

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const currentUser = await getCurrentUserAsync();
  return currentUser?.uid || null;
}

/**
 * Initialize user data after authentication
 */
export async function initializeUserData(_userId: string): Promise<{
  user: User | null;
  hasSecretKey: boolean;
}> {
  try {
    // Get user from database
    const user = await getCurrentUser();
    
    // Check if user has secret key
    const hasSecretKey = await checkUserSecretKey();
    
    return { user, hasSecretKey };
    
  } catch (error) {
    console.error('[UserService] Failed to initialize user data:', error);
    throw error;
  }
}

/**
 * Common function to handle user authentication state updates
 * Used by both useAppInitialization and AuthListeners to avoid code duplication
 */
export async function handleUserAuthenticationState(userId: string): Promise<{
  user: User | null;
  hasSecretKey: boolean;
  success: boolean;
}> {
  try {
    console.log('[UserService] Handling user authentication state for:', userId);
    
    // Step 1: Get user data and secret key status
    const { user, hasSecretKey } = await initializeUserData(userId);
    
    if (user) {
      console.log('[UserService] User authenticated with secret key:', hasSecretKey);
      
      // Step 2: Update global state directly via Zustand store
      useAppStateStore.getState().setUserAndSecretKey(user, hasSecretKey);
      
      return { user, hasSecretKey, success: true };
    } else {
      console.log('[UserService] No user data found for:', userId);
      useAppStateStore.getState().setUserAndSecretKey(null, false);
      return { user: null, hasSecretKey: false, success: false };
    }
    
  } catch (error) {
    console.error('[UserService] Error handling user authentication state:', error);
    // On error, treat as no user
    useAppStateStore.getState().setUserAndSecretKey(null, false);
    return { user: null, hasSecretKey: false, success: false };
  }
}

/**
 * Clear all user data from secure storage (except user object)
 */
export async function clearUserData(): Promise<void> {
  try {
    console.log('[UserService] Clearing user data...');
    await storage.clearAllSecureLocalStorage();
    console.log('[UserService] User data cleared successfully');
  } catch (error) {
    console.error('[UserService] Failed to clear user data:', error);
    throw error;
  }
}

/**
 * Get user document from Firestore via database adapter
 */
export async function getFirestoreUserDocument(userId: string): Promise<User | null> {
  try {
    console.log('[UserService] Getting Firestore user document for:', userId);
    return await db.getDocument(`users/${userId}`);
  } catch (error) {
    console.error('[UserService] Failed to get Firestore user document:', error);
    throw error;
  }
}

/**
 * Refresh user info from Firestore (no longer stores in secure storage)
 */
export async function refreshUserInfo(userId: string): Promise<User | null> {
  try {
    console.log('[UserService] Refreshing user info for:', userId);
    
    // Fetch user document from Firestore via database adapter
    const userDoc = await getFirestoreUserDocument(userId);
    if (!userDoc) {
      throw new Error('User document not found in Firestore');
    }

    // Create User object
    const user: User = {
      id: userId,
      email: userDoc.email,
      username: userDoc.username || userDoc.email,
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
      updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
    };

    console.log('[UserService] User info refreshed successfully');
    return user;
  } catch (error) {
    console.error('[UserService] Failed to refresh user info:', error);
    throw error;
  }
} 