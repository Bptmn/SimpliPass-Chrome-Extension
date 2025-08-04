// packages/common/core/services/initializationService.ts
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';
import { IAuthListenerService } from './listenerService';
import type { Platform } from '../../hooks/useAppState';

export interface IInitializationService {
  initializeApp(platform: Platform): Promise<void>;
  resetInitializationState(): void;
}

export class InitializationService implements IInitializationService {
  constructor(
    private authAdapter: IAuthAdapter,
    private storageAdapter: IPlatformStorageAdapter,
    private authService: IAuthService,
    private authListeners: IAuthListenerService,
    private appStateStore: typeof useAppStateStore,
  ) {}

  public async initializeApp(platform: Platform): Promise<void> {
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

      // Step 3: Set platform in global state
      this.appStateStore.getState().setPlatform(platform);
      console.log('[InitializationService] Platform set to:', platform);

      // Step 4: Initialize auth provider
      await this.authService.initialize();
      console.log('[InitializationService] Auth provider initialized successfully');
      
      // Step 5: Initialize storage (if supported)
      console.log('[InitializationService] Storage initialization completed');
      
      // Step 6: Initialize auth listeners (start regardless of user login state)
      await this.authListeners.start();
      console.log('[InitializationService] Auth listeners started successfully');
      
      // Step 7: Mark initialization complete and set auth as available
      this.appStateStore.getState().setInitializing(false);
      this.appStateStore.getState().setAuthIsAvailable(true);
      
      console.log('[InitializationService] Application fully initialized');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      console.error('[InitializationService] Initialization failed:', error);
      
      // Update global state with error and set auth as available (even if failed)
      this.appStateStore.getState().setInitializing(false, errorMessage);
      this.appStateStore.getState().setAuthIsAvailable(true);
      throw error;
    }
  }

  public resetInitializationState(): void {
    console.log('[InitializationService] Resetting initialization state');
    this.appStateStore.getState().setInitializing(false, null);
  }
}

// Import actual service instances
import { authService } from './authService';
import { authListeners } from './listenerService';
import { auth } from '../adapters/auth.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { useAppStateStore } from '../../hooks/useAppState';

// Export singleton instance
export const initializationService = new InitializationService(
  auth,
  storage,
  authService,
  authListeners,
  useAppStateStore
); 