/**
 * Listeners Service - Layer 2: Business Logic
 * 
 * Handles both authentication and database listeners through their respective adapters.
 * Manages real-time updates for user authentication state and database changes.
 * Updates local storage when changes occur.
 */

import { db } from '../adapters/database.adapter';
import { auth } from '../adapters/auth.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { fetchAndStoreItems } from './itemsService';
import { initializeUserData } from './userService';
import { User } from '../types/auth.types';

export interface ListenersState {
  isDatabaseListening: boolean;
  isAuthListening: boolean;
  databaseError: string | null;
  authError: string | null;
}

/**
 * Database Listeners Class
 * Handles all database-related real-time listeners
 */
class DatabaseListeners {
  private isListening: boolean = false;
  private error: string | null = null;

  // Start database listeners
  async start(userId: string): Promise<void> {
    try {
      console.log('[DatabaseListeners] Starting database listeners for user:', userId);
      
      // Set up callbacks for database events
      const callbacks = {
        onUserUpdate: async (userData: User) => {
          // Update user in secure storage
          await storage.updateUserInSecureLocalStorage(userData);
        },
        onItemsUpdate: async () => {
          try {
            // Use the centralized function instead of duplicating logic
            await fetchAndStoreItems();
          } catch (error) {
            console.error('[DatabaseListeners] Error processing items update:', error);
            this.error = error instanceof Error ? error.message : 'Failed to process items';
          }
        },
      };

      // Start listeners through the database adapter
      await db.startListeners(userId, callbacks);
      
      this.isListening = true;
      this.error = null;
      console.log('[DatabaseListeners] Database listeners started successfully');
    } catch (error) {
      console.error('[DatabaseListeners] Failed to start database listeners:', error);
      this.error = error instanceof Error ? error.message : 'Failed to start database listeners';
      throw error;
    }
  }

  // Stop database listeners
  stop(): void {
    console.log('[DatabaseListeners] Stopping database listeners');
    db.stopListeners();
    this.isListening = false;
    this.error = null;
  }

  // Check if database listeners are active
  isActive(): boolean {
    return this.isListening;
  }

  // Get current error
  getError(): string | null {
    return this.error;
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }
}

/**
 * Auth Listeners Class
 * Handles all authentication-related real-time listeners
 */
class AuthListeners {
  private isListening: boolean = false;
  private error: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private onAuthStateChange: ((user: User | null, isUserFullyInitialized: boolean) => void) | null = null;

  // Set callback for auth state changes
  setAuthStateChangeCallback(callback: (user: User | null, isUserFullyInitialized: boolean) => void): void {
    this.onAuthStateChange = callback;
  }

  // Start authentication listeners
  start(): void {
    try {
      console.log('[AuthListeners] Starting authentication listeners');
      
      // Set up auth state change handler
      this.unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        try {
          this.error = null;
          
          if (firebaseUser) {
            console.log('[AuthListeners] User authenticated:', firebaseUser.uid);
            
            // Initialize user data
            const { user: authUser, hasSecretKey } = await initializeUserData(firebaseUser.uid);
            
            // Notify callback if set
            if (this.onAuthStateChange) {
              this.onAuthStateChange(authUser, hasSecretKey);
            }
          } else {
            console.log('[AuthListeners] User signed out');
            
            // Notify callback if set
            if (this.onAuthStateChange) {
              this.onAuthStateChange(null, false);
            }
          }
        } catch (error) {
          console.error('[AuthListeners] Error in auth state change:', error);
          this.error = error instanceof Error ? error.message : 'Auth state change error';
        }
      });
      
      this.isListening = true;
      this.error = null;
      console.log('[AuthListeners] Authentication listeners started successfully');
    } catch (error) {
      console.error('[AuthListeners] Failed to start auth listeners:', error);
      this.error = error instanceof Error ? error.message : 'Failed to start auth listeners';
      throw error;
    }
  }

  // Stop authentication listeners
  stop(): void {
    console.log('[AuthListeners] Stopping authentication listeners');
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isListening = false;
    this.error = null;
  }

  // Check if auth listeners are active
  isActive(): boolean {
    return this.isListening;
  }

  // Get current error
  getError(): string | null {
    return this.error;
  }

  // Clear error
  clearError(): void {
    this.error = null;
  }
}

// Export singleton instances
export const databaseListeners = new DatabaseListeners();
export const authListeners = new AuthListeners();