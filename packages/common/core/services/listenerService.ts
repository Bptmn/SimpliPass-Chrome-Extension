/**
 * Database Listeners Service - Layer 2: Business Logic
 * 
 * Handles real-time database listeners through the database adapter.
 * Updates local storage when changes occur in the database.
 * Uses centralized items service for data operations.
 */

import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { fetchAndStoreItems } from './itemsService';
import { User } from '../types/auth.types';

export interface DatabaseListenersState {
  isListening: boolean;
  error: string | null;
}

class DatabaseListenersService {
  private state: DatabaseListenersState = {
    isListening: false,
    error: null,
  };

  /**
   * Start all listeners
   */
  async startListeners(userId: string): Promise<void> {
    try {
      console.log('[DatabaseListeners] Starting listeners...');
      
      // Set up callbacks for database events
      const callbacks = {
        onUserUpdate: async (userData: User) => {
          console.log('[DatabaseListeners] User data updated:', userData);
          
          // Update user in secure storage
          await storage.updateUserInSecureLocalStorage(userData);
          
          console.log('[DatabaseListeners] User data synced to local storage');
        },
        onItemsUpdate: async () => {
          try {
            console.log('[DatabaseListeners] Items collection changed');
            
            // Use the centralized function instead of duplicating logic
            await fetchAndStoreItems();
            
            console.log('[DatabaseListeners] Items synced via centralized service');
          } catch (error) {
            console.error('[DatabaseListeners] Error processing items update:', error);
            this.state.error = error instanceof Error ? error.message : 'Failed to process items';
          }
        },
      };

      // Start listeners through the database adapter
      await db.startListeners(userId, callbacks);
      
      this.state.isListening = true;
      this.state.error = null;
      
      console.log('[DatabaseListeners] All listeners started successfully');
    } catch (error) {
      console.error('[DatabaseListeners] Failed to start listeners:', error);
      this.state.error = error instanceof Error ? error.message : 'Failed to start listeners';
      throw error;
    }
  }

  /**
   * Stop all listeners
   */
  stopListeners(): void {
    console.log('[DatabaseListeners] Stopping listeners...');
    
    // Stop listeners through the database adapter
    db.stopListeners();
    
    this.state.isListening = false;
    console.log('[DatabaseListeners] All listeners stopped');
  }

  /**
   * Get current listener state
   */
  getState(): DatabaseListenersState {
    return { ...this.state };
  }

  /**
   * Check if listeners are active
   */
  isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Get current error
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.error = null;
  }
}

// Export singleton instance
export const databaseListeners = new DatabaseListenersService(); 