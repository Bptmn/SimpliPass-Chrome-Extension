// packages/common/core/services/initializationService.ts
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';
import { IAuthListenerService } from './listenerService';
import { NetworkError, AuthenticationError, PlatformError } from '@common/types/errors.types';
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

      // Step 4: Smart auth initialization
      await this.smartInitializeAuth(platform);
      
      // Step 5: Smart listener initialization
      await this.smartInitializeListeners();
      
      // Step 6: Mark initialization complete and set auth as available
      this.appStateStore.getState().setInitializing(false);
      this.appStateStore.getState().setAuthIsAvailable(true);
      
      console.log('[InitializationService] Application fully initialized');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application initialization failed';
      console.error('[InitializationService] Initialization failed:', error);
      
      // Update global state with error and set auth as available (even if failed)
      this.appStateStore.getState().setInitializing(false, errorMessage);
      this.appStateStore.getState().setAuthIsAvailable(true);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof NetworkError || error instanceof AuthenticationError || error instanceof PlatformError) {
        throw error;
      }
      
      throw new NetworkError('Application initialization failed', error as Error);
    }
  }

  // ✅ NEW: Smart auth initialization with native checks
  private async smartInitializeAuth(platform: Platform): Promise<void> {
    try {
      // ✅ NATIVE CHECK: Check if auth is already available
      const isAuthAvailable = await this.checkAuthAvailability();
      if (isAuthAvailable) {
        console.log('[InitializationService] Auth already available, skipping auth initialization');
        return;
      }

      console.log('[InitializationService] Initializing auth provider');
      await this.authService.initialize(platform);
    } catch (error) {
      console.error('[InitializationService] Failed to initialize auth:', error);
      throw new AuthenticationError('Failed to initialize authentication', error as Error);
    }
  }

  // ✅ NEW: Smart listener initialization with native checks
  private async smartInitializeListeners(): Promise<void> {
    try {
      // ✅ NATIVE CHECK: Check if listeners are already active
      if (this.authListeners.isActive()) {
        console.log('[InitializationService] Listeners already active, skipping');
        return;
      }

      console.log('[InitializationService] Starting auth listeners');
      await this.authListeners.start();
    } catch (error) {
      console.error('[InitializationService] Failed to start auth listeners:', error);
      throw new NetworkError('Failed to start authentication listeners', error as Error);
    }
  }

  // ✅ NEW: Check actual auth availability using native methods
  private async checkAuthAvailability(): Promise<boolean> {
    try {
      // ✅ Use adapter instead of direct library calls
      const isAuthenticated = await this.authService.isAuthenticated();
      if (isAuthenticated) {
        console.log('[InitializationService] User is authenticated, auth available');
        return true;
      }

      // Check if auth adapter is properly initialized
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        console.log('[InitializationService] Auth adapter properly initialized, auth provider ready');
        return true;
      }

      console.log('[InitializationService] No auth available, will initialize');
      return false;
    } catch (error) {
      console.log('[InitializationService] Error checking auth availability:', error);
      return false;
    }
  }

  public resetInitializationState(): void {
    try {
      console.log('[InitializationService] Resetting initialization state');
      this.appStateStore.getState().setInitializing(false, null);
    } catch (error) {
      console.error('[InitializationService] Failed to reset initialization state:', error);
      // Don't throw here as this is a cleanup operation
    }
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