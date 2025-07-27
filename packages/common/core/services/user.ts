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
 * Fetch user profile from database and store in secure storage
 */
export async function fetchAndStoreUserProfile(userId: string): Promise<User | null> {
  try {
    console.log('[UserService] Fetching user profile for:', userId);
    
    // Fetch user document from database via adapter
    const userDoc = await db.getDocument(`users/${userId}`);
    
    if (!userDoc) {
      console.warn('[UserService] User document not found in database');
      return null;
    }

    // Create User object
    const user: User = {
      id: userId,
      email: userDoc.email,
      username: userDoc.username || userDoc.email,
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
      updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
    };

    // Store user in secure storage
    await storage.storeUserToSecureLocalStorage(user);
    
    console.log('[UserService] User profile stored successfully');
    return user;
    
  } catch (error) {
    console.error('[UserService] Failed to fetch and store user profile:', error);
    throw error;
  }
}

/**
 * Get current user from secure storage
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await storage.getUserFromSecureLocalStorage();
  } catch (error) {
    console.error('[UserService] Failed to get current user:', error);
    return null;
  }
}

/**
 * Load user profile from secure storage
 */
export async function loadUserProfile(): Promise<User | null> {
  try {
    console.log('[UserService] Loading user profile from secure storage...');
    const userData = await storage.getUserFromSecureLocalStorage();
    console.log('[UserService] User profile loaded:', userData);
    return userData;
  } catch (error) {
    console.error('[UserService] Failed to load user profile:', error);
    throw error;
  }
}

/**
 * Check if user has secret key stored
 */
export async function checkUserSecretKey(): Promise<boolean> {
  try {
    console.log('[UserService] Checking if user secret key exists...');
    const userSecretKey = await storage.getUserSecretKeyFromSecureLocalStorage();
    const hasSecretKey = !!userSecretKey;
    console.log('[UserService] Secret key check result:', hasSecretKey);
    return hasSecretKey;
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
export async function initializeUserData(userId: string): Promise<{
  user: User | null;
  hasSecretKey: boolean;
}> {
  try {
    console.log('[UserService] Initializing user data for:', userId);
    
    // Fetch and store user profile
    const user = await fetchAndStoreUserProfile(userId);
    
    // Check if user has secret key
    const hasSecretKey = await checkUserSecretKey();
    
    console.log('[UserService] User data initialization complete:', {
      user: !!user,
      hasSecretKey
    });
    
    return { user, hasSecretKey };
    
  } catch (error) {
    console.error('[UserService] Failed to initialize user data:', error);
    throw error;
  }
}

/**
 * Clear all user data from secure storage
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
 * Refresh user info from Firestore and store in secure storage
 */
export async function refreshUserInfo(userId: string): Promise<void> {
  try {
    console.log('[UserService] Refreshing user info for:', userId);
    
    // 1. Fetch user document from Firestore via database adapter
    const userDoc = await getFirestoreUserDocument(userId);
    if (!userDoc) {
      throw new Error('User document not found in Firestore');
    }

    // 2. Create User object
    const user: User = {
      id: userId,
      email: userDoc.email,
      username: userDoc.username || userDoc.email,
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
      updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
    };

    // 3. Store user object in secure storage
    await storage.storeUserToSecureLocalStorage(user);
    
    console.log('[UserService] User info refreshed successfully');
  } catch (error) {
    console.error('[UserService] Failed to refresh user info:', error);
    throw error;
  }
} 