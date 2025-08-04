// packages/common/core/services/authService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IUserService } from './userService';
import { IDatabaseListenerService } from './listenerService';

export interface IAuthService {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  getCurrentUser(): Promise<FirebaseUser | null>;
  getCurrentUserId(): string | null;
  startAuthListeners(): Promise<void>;
  stopAuthListeners(): void;
  setDatabaseListeners(databaseListeners: IDatabaseListenerService): void;
}

export class AuthService implements IAuthService {
  private databaseListeners: IDatabaseListenerService | null = null;

  constructor(
    private authAdapter: IAuthAdapter,
    private userService: IUserService,
    private appStateStore: typeof useAppStateStore,
    private storageAdapter: IPlatformStorageAdapter
  ) {}

  public setDatabaseListeners(databaseListeners: IDatabaseListenerService): void {
    this.databaseListeners = databaseListeners;
  }

  public async initialize(): Promise<void> {
    await this.authAdapter.initialize();
  }

  public async login(email: string, password: string): Promise<string> {
    try {
      console.log('[AuthService] Starting login process for:', email);
      
      // Step 1: Always sign out before login to avoid UserAlreadyAuthenticatedException
      console.log('[AuthService] Step 1: Signing out from all providers');
      await this.authAdapter.signOut();
      
      // Step 2: Login with Cognito (pure provider call)
      console.log('[AuthService] Step 2: Logging in with Cognito');
      await this.authAdapter.login(email, password);
      
      // Step 3: Derive and store user secret key (business logic)
      console.log('[AuthService] Step 3: Deriving and storing user secret key');
      const { deriveAndStoreUserSecretKey } = await import('./secretsService');
      await deriveAndStoreUserSecretKey(password);
      
      // Step 4: Get Firebase token from Cognito and sign in to Firebase (business logic)
      console.log('[AuthService] Step 4: Getting Firebase token and signing in to Firebase');
      const { getCognitoTokensAndFirebaseToken } = await import('../libraries/auth/cognito');
      const { signInWithFirebaseToken } = await import('../libraries/auth/firebase');
      
      const { firebaseToken } = await getCognitoTokensAndFirebaseToken();
      const firebaseUser = await signInWithFirebaseToken(firebaseToken);
      
      // Step 5: Return the user ID from Firebase
      console.log('[AuthService] Step 5: Login completed successfully for user:', firebaseUser.uid);
      return firebaseUser.uid;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    // Business logic: clear user data and sign out
    await this.userService.clearUserData();
    await this.authAdapter.signOut();
  }

  public async isAuthenticated(): Promise<boolean> {
    return await this.authAdapter.isAuthenticated();
  }

  public async fetchUserSalt(): Promise<string> {
    return await this.authAdapter.fetchUserSalt();
  }

  public async getCurrentUser(): Promise<FirebaseUser | null> {
    return await this.authAdapter.getCurrentUser();
  }

  public getCurrentUserId(): string | null {
    return this.appStateStore.getState().user?.id || null;
  }

  public async signOut(): Promise<void> {
    await this.authAdapter.signOut();
  }

  public async startAuthListeners(): Promise<void> {
    const authStateCallback = async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          await this.handleUserAuthenticated(firebaseUser.uid);
        } else {
          await this.handleUserSignedOut();
        }
        // ✅ Set auth as available AFTER processing user state to avoid LOGIN flash
        this.appStateStore.getState().setAuthIsAvailable(true);
        console.log('[AuthService] Auth state available for routing');
      } catch (error) {
        console.error('[AuthService] Error in auth state change:', error);
      }
    };
    
    await this.authAdapter.startAuthListeners(authStateCallback);
  }

  public stopAuthListeners(): void {
    this.authAdapter.stopAuthListeners();
  }

  private async handleUserAuthenticated(userId: string): Promise<void> {
    try {
      console.log('[AuthService] Handling user authentication:', userId);
      
      const { success } = await this.userService.handleUserAuthenticationState(userId);
      if (success) {
        // Business logic: user successfully authenticated
        console.log('[AuthService] User authenticated successfully:', userId);
        
        // ✅ Start database listeners when user is authenticated
        if (this.databaseListeners) {
          try {
            await this.databaseListeners.start(userId);
            console.log('[AuthService] Database listeners started for user:', userId);
          } catch (dbError) {
            console.error('[AuthService] Failed to start database listeners:', dbError);
          }
        }
      }
    } catch (error) {
      console.error('[AuthService] Error handling user authentication:', error);
      throw error;
    }
  }

  private async handleUserSignedOut(): Promise<void> {
    try {
      console.log('[AuthService] Handling user sign out');
      
      // Step 1: Stop database listeners
      if (this.databaseListeners) {
        this.databaseListeners.stop();
        console.log('[AuthService] Database listeners stopped due to sign out');
      }
      
      // Step 2: Update global state directly via Zustand store
      this.appStateStore.getState().setUserAndSecretKey(null, false);
      
      console.log('[AuthService] User signed out');
    } catch (error) {
      console.error('[AuthService] Error handling user sign out:', error);
      throw error;
    }
  }
}

// Import actual adapters and services
import { auth } from '../adapters/auth.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { userService } from './userService';
import { useAppStateStore } from '../../hooks/useAppState';

// Export singleton instance
export const authService = new AuthService(
  auth,
  userService,
  useAppStateStore,
  storage
); 