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
    const callbacks = {
      onUserUpdate: async (userData: any) => {
        await this.storage.updateUserInSecureLocalStorage(userData);
      },
      onItemsUpdate: async () => {
        try {
          const appState = this.appStateStore.getState();
          if (!appState.userSecretKeyExist) {
            return;
          }
          const currentUser = await this.userService.getCurrentUserAsync();
          const currentUserId = currentUser?.uid;
          if (!currentUserId) {
            return;
          }
          await this.itemsService.fetchAndStoreItems(currentUserId);
        } catch (error) {
          console.error('[DatabaseListeners] Error processing items update:', error);
        }
      },
    };
    await this.db.startListeners(userId, callbacks);
    this.isListening = true;
  }

  stop(): void {
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
    await this.authService.startAuthListeners();
    this.isListening = true;
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
