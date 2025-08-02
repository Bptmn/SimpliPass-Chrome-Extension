/**
 * Listeners Service - Layer 2: Business Logic
 * 
 * Handles authentication and database listeners through their respective adapters.
 * Auth listeners directly update global states when users log in/out.
 * Updates local storage when changes occur.
 */

import { db } from '../adapters/database.adapter';
import { auth } from '../adapters/auth.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { fetchAndStoreItems } from './itemsService';
import { handleUserAuthenticationState, getCurrentUserAsync } from './userService';
import { useAppStateStore } from '../../hooks/useAppState';

/**
 * Database Listeners Class
 * Handles database-related real-time listeners
 */
class DatabaseListeners {
  private isListening: boolean = false;

  async start(userId: string): Promise<void> {
    try {
      console.log('[DatabaseListeners] Starting database listeners for user:', userId);
      
      const callbacks = {
        onUserUpdate: async (userData: any) => {
          await storage.updateUserInSecureLocalStorage(userData);
        },
        onItemsUpdate: async () => {
          try {
            console.log('[DatabaseListeners] Items updated in database, checking if user has secret key...');
            
            // ✅ Check if user has secret key before processing updates
            const appState = useAppStateStore.getState();
            if (!appState.userSecretKeyExist) {
              console.log('[DatabaseListeners] Skipping items update - user secret key not available yet');
              return;
            }
            
            const currentUser = await getCurrentUserAsync();
            const currentUserId = currentUser?.uid;
            if (!currentUserId) {
              console.log('[DatabaseListeners] Skipping items update - auth not ready yet');
              return;
            }
            
            console.log('[DatabaseListeners] User has secret key, refreshing local storage and state...');
            // ✅ Use fetchAndStoreItems to update local storage and global state
            await fetchAndStoreItems(currentUserId);
            console.log('[DatabaseListeners] Items update processed successfully');
          } catch (error) {
            console.error('[DatabaseListeners] Error processing items update:', error);
          }
        },
      };

      await db.startListeners(userId, callbacks);
      this.isListening = true;
      console.log('[DatabaseListeners] Database listeners started successfully');
    } catch (error) {
      console.error('[DatabaseListeners] Failed to start database listeners:', error);
      throw error;
    }
  }

  stop(): void {
    console.log('[DatabaseListeners] Stopping database listeners');
    db.stopListeners();
    this.isListening = false;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

/**
 * Auth Listeners Class
 * Handles authentication-related real-time listeners
 * Uses Zustand store directly for state updates
 */
class AuthListeners {
  private isListening: boolean = false;
  private lastProcessedUserId: string | null = null;

  async start(): Promise<void> {
    try {
      console.log('[AuthListeners] Starting authentication listeners');
      
      // Step 1: Set up auth state change callback
      const authStateCallback = {
        onAuthStateChanged: async (firebaseUser: any) => {
          try {
            if (firebaseUser) {
              console.log('[AuthListeners] User authenticated:', firebaseUser.uid);
              await this.handleUserAuthenticated(firebaseUser.uid);
            } else {
              console.log('[AuthListeners] User signed out');
              await this.handleUserSignedOut();
            }
            
            // ✅ Set auth as available AFTER processing user state to avoid LOGIN flash
            useAppStateStore.getState().setAuthIsAvailable(true);
            console.log('[AuthListeners] Auth state available for routing');
          } catch (error) {
            console.error('[AuthListeners] Error in auth state change:', error);
          }
        }
      };

      // Step 2: Start auth listener via adapter (consistent with database pattern)
      await auth.startAuthListeners(authStateCallback);
      this.isListening = true;
      console.log('[AuthListeners] Authentication listeners started successfully');
    } catch (error) {
      console.error('[AuthListeners] Failed to start auth listeners:', error);
      throw error;
    }
  }

  private async handleUserAuthenticated(userId: string): Promise<void> {
    try {
      // Skip if we already processed this user (prevents duplicate work during initialization)
      if (this.lastProcessedUserId === userId) {
        console.log('[AuthListeners] Skipping duplicate user authentication for:', userId);
        return;
      }

      console.log('[AuthListeners] Handling user authentication:', userId);
      
      // Use common function to handle user authentication state
      const { success } = await handleUserAuthenticationState(userId);
      
      // ✅ Always start database listeners when user is authenticated
      // The listeners will check userSecretKeyExist before processing updates
      if (success) {
        try {
          await databaseListeners.start(userId);
          console.log('[AuthListeners] Database listeners started for user:', userId);
        } catch (dbError) {
          console.error('[AuthListeners] Failed to start database listeners:', dbError);
        }
      }
      
      // Track processed user to avoid duplicates
      this.lastProcessedUserId = userId;
    } catch (error) {
      console.error('[AuthListeners] Error handling user authentication:', error);
      throw error;
    }
  }

  private async handleUserSignedOut(): Promise<void> {
    try {
      console.log('[AuthListeners] Handling user sign out');
      
      // Step 1: Stop database listeners
      databaseListeners.stop();
      console.log('[AuthListeners] Database listeners stopped due to sign out');
      
      // Step 2: Update global state directly via Zustand store
      useAppStateStore.getState().setUserAndSecretKey(null, false);
      
      // Step 3: Reset processed user tracking
      this.lastProcessedUserId = null;
    } catch (error) {
      console.error('[AuthListeners] Error handling user sign out:', error);
      throw error;
    }
  }

  stop(): void {
    console.log('[AuthListeners] Stopping authentication listeners');
    auth.stopAuthListeners();
    this.isListening = false;
    this.lastProcessedUserId = null;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// Export singleton instances
export const databaseListeners = new DatabaseListeners();
export const authListeners = new AuthListeners();