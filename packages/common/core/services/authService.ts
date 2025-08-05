// packages/common/core/services/authService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IUserService } from './userService';
import { AuthenticationError, NetworkError } from '../types/errors.types';

export interface IAuthService {
  initialize(platform?: 'extension' | 'mobile'): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  logout(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  getCurrentUser(): Promise<FirebaseUser | null>;
  getCurrentUserId(): string | null;
}

export class AuthService implements IAuthService {
  constructor(
    private authAdapter: IAuthAdapter,
    private userService: IUserService,
    private appStateStore: typeof useAppStateStore,
    private storageAdapter: IPlatformStorageAdapter
  ) {}

  public async initialize(platform?: 'extension' | 'mobile'): Promise<void> {
    try {
      await this.authAdapter.initialize(platform);
    } catch (error) {
      console.error('[AuthService] Failed to initialize auth:', error);
      throw new NetworkError('Failed to initialize authentication', error as Error);
    }
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
      // ✅ Use adapter instead of direct library calls
      const firebaseUser = await this.authAdapter.getCurrentUser();
      if (!firebaseUser) {
        throw new AuthenticationError('Failed to get Firebase user after login');
      }
      
      // Step 5: Return the user ID from Firebase
      console.log('[AuthService] Step 5: Login completed successfully for user:', firebaseUser.uid);
      return firebaseUser.uid;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof AuthenticationError || error instanceof NetworkError) {
        throw error;
      }
      
      // Categorize common auth errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials') || error.message.includes('User not found')) {
          throw new AuthenticationError('Invalid email or password', error);
        }
        if (error.message.includes('Network') || error.message.includes('timeout')) {
          throw new NetworkError('Network error during login', error);
        }
      }
      
      throw new AuthenticationError('Login failed', error as Error);
    }
  }

  public async logout(): Promise<void> {
    try {
      // Business logic: clear user data and sign out
      await this.userService.clearUserData();
      await this.authAdapter.signOut();
    } catch (error) {
      console.error('[AuthService] Logout failed:', error);
      throw new AuthenticationError('Failed to sign out', error as Error);
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    try {
      return await this.authAdapter.isAuthenticated();
    } catch (error) {
      console.error('[AuthService] Failed to check authentication status:', error);
      return false;
    }
  }

  public async fetchUserSalt(): Promise<string> {
    try {
      return await this.authAdapter.fetchUserSalt();
    } catch (error) {
      console.error('[AuthService] Failed to fetch user salt:', error);
      throw new NetworkError('Failed to fetch user salt', error as Error);
    }
  }

  public async getCurrentUser(): Promise<FirebaseUser | null> {
    try {
      return await this.authAdapter.getCurrentUser();
    } catch (error) {
      console.error('[AuthService] Failed to get current user:', error);
      return null;
    }
  }

  public getCurrentUserId(): string | null {
    return this.appStateStore.getState().user?.id || null;
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