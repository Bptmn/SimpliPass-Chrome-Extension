// packages/common/core/services/listenerService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IItemsService } from './itemsService';
import { IUserService } from './userService';
import { useAppStateStore } from '../../hooks/useAppState';
import { NetworkError, AuthenticationError, ItemError } from '../types/errors.types';

export interface IAuthListenerService {
  start(): Promise<void>;
  stop(): void;
  isActive(): boolean;
}

export interface IDatabaseListenerService {
  start(userId: string): Promise<void>;
  stop(): void;
  isActive(): boolean;
}

class DatabaseListeners implements IDatabaseListenerService {
  private isListening: boolean = false;

  constructor(
    private db: IDatabaseAdapter,
    private storage: IPlatformStorageAdapter,
    private itemsService: IItemsService,
    private userService: IUserService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  async start(userId: string): Promise<void> {
    try {
      console.log('[DatabaseListeners] Starting database listeners for user:', userId);
      
      const callbacks = {
        onUserUpdate: async (userData: any) => {
          try {
            await this.storage.updateUserInSecureLocalStorage(userData);
          } catch (error) {
            console.error('[DatabaseListeners] Failed to update user in storage:', error);
            // Don't throw here as this is a callback - just log the error
          }
        },
        onItemsUpdate: async (encryptedItems: any[]) => {
          try {
            console.log('[DatabaseListeners] Items updated in database, fetching latest data...');
            
            // ✅ Check if user has secret key before processing updates
            const appState = this.appStateStore.getState();
            if (!appState.userSecretKeyExist) {
              console.log('[DatabaseListeners] Skipping items update - user secret key not available yet');
              return;
            }
            
            const currentUser = await this.userService.getCurrentUserAsync();
            const currentUserId = currentUser?.uid;
            if (!currentUserId) {
              console.log('[DatabaseListeners] Skipping items update - auth not ready yet');
              return;
            }
            
            // ✅ SIMPLE APPROACH: Always fetch and store latest data
            console.log('[DatabaseListeners] Fetching and storing latest items...');
            await this.itemsService.fetchAndStoreItems(currentUserId);
            console.log('[DatabaseListeners] Latest items fetched and stored successfully');
          } catch (error) {
            console.error('[DatabaseListeners] Error processing items update:', error);
            // Don't throw here as this is a callback - just log the error
          }
        },
      };

      await this.db.startListeners(userId, callbacks);
      this.isListening = true;
      console.log('[DatabaseListeners] Database listeners started successfully');
    } catch (error) {
      console.error('[DatabaseListeners] Failed to start database listeners:', error);
      throw new NetworkError('Failed to start database listeners', error as Error);
    }
  }

  stop(): void {
    try {
      console.log('[DatabaseListeners] Stopping database listeners');
      this.db.stopListeners();
      this.isListening = false;
    } catch (error) {
      console.error('[DatabaseListeners] Error stopping database listeners:', error);
      // Don't throw here as stop should be idempotent
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}

class AuthListeners implements IAuthListenerService {
  private authListenerUnsubscribe: (() => void) | null = null;
  private lastProcessedUserId: string | null = null;

  constructor(
    private authAdapter: IAuthAdapter,
    private userService: IUserService,
    private databaseListeners: IDatabaseListenerService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  // ✅ NEW: Check if listeners are actually active
  public areListenersActive(): boolean {
    return this.authListenerUnsubscribe !== null;
  }

  async start(): Promise<void> {
    try {
      // ✅ NATIVE CHECK: Use actual listener state
      if (this.areListenersActive()) {
        console.log('[AuthListeners] Already listening, skipping start');
        return;
      }

      console.log('[AuthListeners] Starting authentication listeners');
      
      const authStateCallback = async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            await this.handleUserAuthenticated(firebaseUser.uid);
          } else {
            await this.handleUserSignedOut();
          }
          this.appStateStore.getState().setAuthIsAvailable(true);
        } catch (error) {
          console.error('[AuthListeners] Error in auth state change:', error);
          // Don't throw here as this is a callback - just log the error
        }
      };
      
      await this.authAdapter.startAuthListeners(authStateCallback);
      // Store the unsubscribe function to track active state
      this.authListenerUnsubscribe = () => {
        this.authAdapter.stopAuthListeners();
      };
      console.log('[AuthListeners] Authentication listeners started successfully');
    } catch (error) {
      console.error('[AuthListeners] Failed to start auth listeners:', error);
      throw new NetworkError('Failed to start authentication listeners', error as Error);
    }
  }

  private async handleUserAuthenticated(userId: string): Promise<void> {
    if (this.lastProcessedUserId === userId) {
      return;
    }
    
    try {
      console.log('[AuthListeners] Handling user authentication:', userId);
      
      const { success } = await this.userService.handleUserAuthenticationState(userId);
      if (success) {
        console.log('[AuthListeners] User data retrieved successfully');
        
        // ✅ Start database listeners when user is authenticated
        try {
          await this.databaseListeners.start(userId);
        } catch (dbError) {
          console.error('[AuthListeners] Failed to start database listeners:', dbError);
          // Don't throw here as auth is still successful even if DB listeners fail
        }
      }
    } catch (error) {
      console.error('[AuthListeners] Error handling user authentication:', error);
      throw new AuthenticationError('Failed to handle user authentication', error as Error);
    }
    
    this.lastProcessedUserId = userId;
  }

  private async handleUserSignedOut(): Promise<void> {
    try {
      console.log('[AuthListeners] Handling user sign out');
      
      // Step 1: Stop database listeners
      this.databaseListeners.stop();
      console.log('[AuthListeners] Database listeners stopped due to sign out');
      
      // Step 2: Update global state directly via Zustand store
      this.appStateStore.getState().setUserAndSecretKey(null, false);
      
      console.log('[AuthListeners] User signed out');
    } catch (error) {
      console.error('[AuthListeners] Error handling user sign out:', error);
      throw new AuthenticationError('Failed to handle user sign out', error as Error);
    }
    
    this.lastProcessedUserId = null;
  }

  stop(): void {
    // ✅ NATIVE CHECK: Use actual listener state
    if (!this.areListenersActive()) {
      console.log('[AuthListeners] Not listening, skipping stop');
      return;
    }

    try {
      console.log('[AuthListeners] Stopping authentication listeners');
      this.authAdapter.stopAuthListeners();
      this.authListenerUnsubscribe = null;
      console.log('[AuthListeners] Authentication listeners stopped');
    } catch (error) {
      console.error('[AuthListeners] Error stopping authentication listeners:', error);
      // Don't throw here as stop should be idempotent
    }
  }

  isActive(): boolean {
    return this.areListenersActive();
  }
}

// To be instantiated in a dependency injection container
export { DatabaseListeners, AuthListeners };

// Import actual adapters and services
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { auth } from '../adapters/auth.adapter';
import { userService } from './userService';
import { itemsService } from './itemsService';

// Export singleton instances
export const databaseListeners = new DatabaseListeners(
  db,
  storage,
  itemsService,
  userService,
  useAppStateStore
);

export const authListeners = new AuthListeners(
  auth,
  userService,
  databaseListeners,
  useAppStateStore
);
