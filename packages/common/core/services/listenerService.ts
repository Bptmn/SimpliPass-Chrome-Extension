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
import { initializeUserData } from './userService';
import { useAppStateStore } from '../../hooks/useAppState';
import { User } from '../types/auth.types';

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
        onUserUpdate: async (userData: User) => {
          await storage.updateUserInSecureLocalStorage(userData);
        },
        onItemsUpdate: async () => {
          try {
            const currentUserId = auth.getCurrentUser()?.uid;
            if (!currentUserId) {
              console.log('[DatabaseListeners] Skipping items update - auth not ready yet');
              return;
            }
            await fetchAndStoreItems(currentUserId);
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
      console.log('[AuthListeners] Handling user authentication:', userId);
      
      // Step 1: Get user data and secret key status
      const { user, hasSecretKey } = await initializeUserData(userId);
      
      if (user) {
        console.log('[AuthListeners] User authenticated with secret key:', hasSecretKey);
        
        // Step 2: Update global state directly via Zustand store
        useAppStateStore.getState().setUserAndSecretKey(user, hasSecretKey);
        
        // Step 3: Start database listeners if user has secret key
        if (hasSecretKey) {
          try {
            await databaseListeners.start(userId);
          } catch (dbError) {
            console.error('[AuthListeners] Failed to start database listeners:', dbError);
          }
        }
      }
    } catch (error) {
      console.error('[AuthListeners] Error handling user authentication:', error);
      // On error, treat as sign out
      useAppStateStore.getState().setUserAndSecretKey(null, false);
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
    } catch (error) {
      console.error('[AuthListeners] Error handling user sign out:', error);
      throw error;
    }
  }

  stop(): void {
    console.log('[AuthListeners] Stopping authentication listeners');
    auth.stopAuthListeners();
    this.isListening = false;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// Export singleton instances
export const databaseListeners = new DatabaseListeners();
export const authListeners = new AuthListeners();