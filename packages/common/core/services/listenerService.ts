// packages/common/core/services/listenerService.ts
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IItemsService } from './itemsService';
import { IUserService } from './userService';
import { IAuthService } from './authService';
import { useAppStateStore } from '../../hooks/useAppState';
import { User as FirebaseUser } from 'firebase/auth';

export interface IListenerService {
  start(userId: string): Promise<void>;
  stop(): void;
  isActive(): boolean;
}

class DatabaseListeners implements IListenerService {
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

class AuthListeners implements IListenerService {
  private isListening: boolean = false;
  private lastProcessedUserId: string | null = null;

  constructor(
    private authService: IAuthService,
    private userService: IUserService,
    private databaseListeners: IListenerService,
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

// Export instances for backward compatibility
export const databaseListeners = new DatabaseListeners(
  {} as IDatabaseAdapter,
  {} as IPlatformStorageAdapter,
  {} as IItemsService,
  {} as IUserService,
  {} as typeof useAppStateStore
);

export const authListeners = new AuthListeners(
  {} as IAuthService,
  {} as IUserService,
  databaseListeners,
  {} as typeof useAppStateStore
);
