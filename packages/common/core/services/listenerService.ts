// packages/common/core/services/listenerService.ts
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IItemsService } from './itemsService';
import { IUserService } from './userService';
import { IAuthService } from './authService';
import { User as FirebaseUser } from 'firebase/auth';

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
          await this.storage.updateUserInSecureLocalStorage(userData);
        },
        onItemsUpdate: async () => {
          try {
            console.log('[DatabaseListeners] Items updated in database, checking if user has secret key...');
            
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
            
            console.log('[DatabaseListeners] User has secret key, refreshing local storage and state...');
            // ✅ Use fetchAndStoreItems to update local storage and global state
            await this.itemsService.fetchAndStoreItems(currentUserId);
            console.log('[DatabaseListeners] Items update processed successfully');
          } catch (error) {
            console.error('[DatabaseListeners] Error processing items update:', error);
          }
        },
      };

      await this.db.startListeners(userId, callbacks);
      this.isListening = true;
      console.log('[DatabaseListeners] Database listeners started successfully');
    } catch (error) {
      console.error('[DatabaseListeners] Failed to start database listeners:', error);
      throw error;
    }
  }

  stop(): void {
    console.log('[DatabaseListeners] Stopping database listeners');
    this.db.stopListeners();
    this.isListening = false;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

class AuthListeners implements IAuthListenerService {
  private isListening: boolean = false;
  private lastProcessedUserId: string | null = null;

  constructor(
    private authService: IAuthService,
    private userService: IUserService,
    private databaseListeners: IDatabaseListenerService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  async start(): Promise<void> {
    try {
      console.log('[AuthListeners] Starting authentication listeners');
      
      // Set the database listeners on the auth service so it can start them when user is authenticated
      this.authService.setDatabaseListeners(this.databaseListeners);
      await this.authService.startAuthListeners();
      this.isListening = true;
      console.log('[AuthListeners] Authentication listeners started successfully');
    } catch (error) {
      console.error('[AuthListeners] Failed to start auth listeners:', error);
      throw error;
    }
  }

  private async handleUserAuthenticated(userId: string): Promise<void> {
    if (this.lastProcessedUserId === userId) {
      return;
    }
    const { success } = await this.userService.handleUserAuthenticationState(userId);
    if (success) {
      await this.databaseListeners.start(userId);
    }
    this.lastProcessedUserId = userId;
  }

  private async handleUserSignedOut(): Promise<void> {
    this.databaseListeners.stop();
    this.appStateStore.getState().setUserAndSecretKey(null, false);
    this.lastProcessedUserId = null;
  }

  stop(): void {
    this.authService.stopAuthListeners();
    this.isListening = false;
    this.lastProcessedUserId = null;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// To be instantiated in a dependency injection container
export { DatabaseListeners, AuthListeners };

// Import actual adapters and services
import { auth } from '../adapters/auth.adapter';
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { authService } from './authService';
import { userService } from './userService';
import { itemsService } from './itemsService';
import { useAppStateStore } from '../../hooks/useAppState';

// Export instances for backward compatibility
export const databaseListeners = new DatabaseListeners(
  db,
  storage,
  itemsService,
  userService,
  useAppStateStore
);

export const authListeners = new AuthListeners(
  authService,
  userService,
  databaseListeners,
  useAppStateStore
);
