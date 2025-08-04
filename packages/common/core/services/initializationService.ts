// packages/common/core/services/initializationService.ts
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';
import { IListenerService } from './listenerService';
import { useAppStateStore } from '../../hooks/useAppState';

export interface IInitializationService {
  initializeApp(): Promise<void>;
  resetInitializationState(): void;
}

export class InitializationService implements IInitializationService {
  constructor(
    private authAdapter: IAuthAdapter,
    private storageAdapter: IPlatformStorageAdapter,
    private authService: IAuthService,
    private authListeners: IListenerService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  public async initializeApp(): Promise<void> {
    // Step 1: Check if already initializing
    const currentState = this.appStateStore.getState();
    if (currentState.isInitializing) {
      console.log('[InitializationService] App is already initializing, skipping');
      return;
    }

    try {
      console.log('[InitializationService] Starting application initialization');
      
      // Step 2: Update global state - start initialization
      this.appStateStore.getState().setInitializing(true, null);

      // Step 3: Initialize auth provider
      await this.authService.initialize();
      console.log('[InitializationService] Auth provider initialized successfully');
      
      // Step 4: Initialize platform detection
      await this.initializePlatform();
      console.log('[InitializationService] Platform detection initialized successfully');
      
      // Step 5: Initialize storage (if supported)
      console.log('[InitializationService] Storage initialization completed');
      
      // Step 6: Initialize auth listeners
      const user = await this.authService.getCurrentUser();
      if (user) {
        await this.authListeners.start(user.uid);
        console.log('[InitializationService] Auth listeners started successfully');
      }
      
      // Step 7: Mark initialization complete
      this.appStateStore.getState().setInitializing(false);
      
      console.log('[InitializationService] Application fully initialized');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      console.error('[InitializationService] Initialization failed:', error);
      
      // Update global state with error
      this.appStateStore.getState().setInitializing(false, errorMessage);
      throw error;
    }
  }

  public resetInitializationState(): void {
    console.log('[InitializationService] Resetting initialization state');
    this.appStateStore.getState().setInitializing(false, null);
  }

  private async initializePlatform(): Promise<void> {
    // Platform initialization logic
    // This would typically detect mobile vs extension and set up platform-specific features
    console.log('[InitializationService] Platform detection completed');
  }
}

// Export singleton instance
export const initializationService = new InitializationService(
  {} as IAuthAdapter,
  {} as IPlatformStorageAdapter,
  {} as IAuthService,
  {} as IListenerService,
  {} as typeof useAppStateStore
); 