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

/**
 * Get current user from database
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get current user ID from auth
    const currentUser = auth.getCurrentUser();
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
export function getCurrentUserId(): string | null {
  const currentUser = auth.getCurrentUser();
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
export async function getFirestoreUserDocument(userId: string): Promise<any> {
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