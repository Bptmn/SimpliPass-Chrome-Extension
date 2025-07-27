/**
 * Firestore Listeners Service - Layer 2: Business Logic
 * 
 * Handles real-time Firestore listeners for user and items collections.
 * Updates local storage when changes occur in Firestore.
 * Uses centralized items service for data operations.
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  query,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '../libraries/auth/firebase';
import { storage } from '../adapters/platform.storage.adapter';
import { getCurrentUserId } from '../libraries/auth';
import { User } from '../types/auth.types';
import { fetchAndStoreItems } from './items';

export interface FirestoreListenersState {
  isListening: boolean;
  userListener: Unsubscribe | null;
  itemsListener: Unsubscribe | null;
  error: string | null;
}

class FirestoreListenersService {
  private state: FirestoreListenersState = {
    isListening: false,
    userListener: null,
    itemsListener: null,
    error: null,
  };

  private getSafeFirestore() {
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    return firestore;
  }

  /**
   * Start listening to user collection changes
   */
  private startUserListener(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          reject(new Error('No authenticated user found'));
          return;
        }

        const userDocRef = doc(this.getSafeFirestore(), `users/${userId}`);
        
        this.state.userListener = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.data() as User;
              const user: User = {
                id: snapshot.id,
                email: userData.email,
                username: userData.username,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
              };
              console.log('[FirestoreListeners] User data updated:', user);
              
              // Update user in secure storage
              await storage.updateUserInSecureLocalStorage(user);
              
              // Notify UI components (could emit an event here)
              console.log('[FirestoreListeners] User data synced to local storage');
            }
          },
          (error) => {
            console.error('[FirestoreListeners] User listener error:', error);
            this.state.error = error.message;
          }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start listening to items collection changes
   * Now uses centralized items.ts functions instead of duplicating logic
   */
  private startItemsListener(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          reject(new Error('No authenticated user found'));
          return;
        }

        // Query the user's items subcollection
        const itemsQuery = query(
          collection(this.getSafeFirestore(), `users/${userId}/my_items`)
        );
        
        this.state.itemsListener = onSnapshot(
          itemsQuery,
          async (_snapshot) => {
            try {
              console.log('[FirestoreListeners] Items collection changed');
              
              // Use the centralized function instead of duplicating logic
              await fetchAndStoreItems();
              
              console.log('[FirestoreListeners] Items synced via centralized service');
            } catch (error) {
              console.error('[FirestoreListeners] Error processing items update:', error);
              this.state.error = error instanceof Error ? error.message : 'Failed to process items';
            }
          },
          (error) => {
            console.error('[FirestoreListeners] Items listener error:', error);
            this.state.error = error.message;
          }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start all listeners
   */
  async startListeners(): Promise<void> {
    try {
      console.log('[FirestoreListeners] Starting listeners...');
      
      // Start user listener
      await this.startUserListener();
      
      // Start items listener
      await this.startItemsListener();
      
      this.state.isListening = true;
      this.state.error = null;
      
      console.log('[FirestoreListeners] All listeners started successfully');
    } catch (error) {
      console.error('[FirestoreListeners] Failed to start listeners:', error);
      this.state.error = error instanceof Error ? error.message : 'Failed to start listeners';
      throw error;
    }
  }

  /**
   * Stop all listeners
   */
  stopListeners(): void {
    console.log('[FirestoreListeners] Stopping listeners...');
    
    if (this.state.userListener) {
      this.state.userListener();
      this.state.userListener = null;
    }
    
    if (this.state.itemsListener) {
      this.state.itemsListener();
      this.state.itemsListener = null;
    }
    
    this.state.isListening = false;
    console.log('[FirestoreListeners] All listeners stopped');
  }

  /**
   * Get current listener state
   */
  getState(): FirestoreListenersState {
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
export const firestoreListeners = new FirestoreListenersService(); 