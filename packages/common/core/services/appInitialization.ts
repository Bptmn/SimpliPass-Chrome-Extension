/**
 * App Initialization Service - Layer 2: Business Logic
 * 
 * Handles app initialization and data loading after user authentication.
 * Provides reusable functions for mobile and extension platforms.
 */

import { User } from '../types/auth.types';
import { auth } from '../adapters/auth.adapter';
import { initializeUserData, getCurrentUser, checkUserSecretKey } from './user';
import { loadItemsWithFallback } from './items';
import { firestoreListeners } from './firestoreListeners';

export interface AppInitializationState {
  isLoading: boolean;
  user: User | null;
  isUserFullyInitialized: boolean;
  error: string | null;
}

/**
 * Initialize app data after user authentication
 */
export async function initializeAppData(userId: string): Promise<{
  user: User | null;
  isUserFullyInitialized: boolean;
}> {
  try {
    console.log('[AppInitialization] Starting app data initialization for:', userId);
    
    // Initialize user data
    const { user, hasSecretKey } = await initializeUserData(userId);
    
    console.log('[AppInitialization] User data initialized:', {
      user: !!user,
      hasSecretKey
    });
    
    return {
      user,
      isUserFullyInitialized: hasSecretKey
    };
    
  } catch (error) {
    console.error('[AppInitialization] Failed to initialize app data:', error);
    throw error;
  }
}

/**
 * Load data and start listeners when user is fully initialized
 */
export async function loadDataAndStartListeners(): Promise<void> {
  try {
    console.log('[AppInitialization] Loading data and starting listeners...');
    
    // Load items with fallback
    await loadItemsWithFallback();
    console.log('[AppInitialization] Items loaded successfully');
    
    // Start Firestore listeners
    await firestoreListeners.startListeners();
    console.log('[AppInitialization] Listeners started successfully');
    
    console.log('[AppInitialization] Data loading and listeners complete');
    
  } catch (error) {
    console.error('[AppInitialization] Failed to load data and start listeners:', error);
    throw error;
  }
}

/**
 * Handle authentication state changes
 */
export async function handleAuthStateChange(firebaseUser: any): Promise<{
  user: User | null;
  isUserFullyInitialized: boolean;
}> {
  if (firebaseUser) {
    console.log('[AppInitialization] User authenticated:', firebaseUser.uid);
    return await initializeAppData(firebaseUser.uid);
  } else {
    console.log('[AppInitialization] User signed out');
    return {
      user: null,
      isUserFullyInitialized: false
    };
  }
}

/**
 * Check if user needs to re-enter password
 */
export async function checkUserNeedsPasswordReEntry(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const hasSecretKey = await checkUserSecretKey();
    return !hasSecretKey;
    
  } catch (error) {
    console.error('[AppInitialization] Error checking password re-entry:', error);
    return false;
  }
}

/**
 * Handle secret key re-entry completion
 */
export async function handleSecretKeyReEntry(): Promise<{
  isUserFullyInitialized: boolean;
}> {
  try {
    console.log('[AppInitialization] Handling secret key re-entry completion...');
    
    const hasSecretKey = await checkUserSecretKey();
    
    if (hasSecretKey) {
      console.log('[AppInitialization] Secret key found, user fully initialized');
      return { isUserFullyInitialized: true };
    } else {
      console.log('[AppInitialization] Secret key still missing');
      return { isUserFullyInitialized: false };
    }
    
  } catch (error) {
    console.error('[AppInitialization] Error handling secret key re-entry:', error);
    return { isUserFullyInitialized: false };
  }
} 