// packages/common/core/services/authService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IUserService } from './userService';
import { AuthenticationError, NetworkError } from '../types/errors.types';
import type { MfaChallenge } from '../types/auth.types';

export interface IAuthService {
  initialize(platform?: 'extension' | 'mobile'): Promise<void>;
  login(email: string, password: string): Promise<string | MfaChallenge>;
  confirmMfa(code: string): Promise<string>;
  completeLoginAfterMfa(): Promise<string>;
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

  public async login(email: string, password: string): Promise<string | MfaChallenge> {
    try {
      console.log('[AuthService] Starting login process for:', email);
      
      // Step 1: Always sign out before login to avoid UserAlreadyAuthenticatedException
      console.log('[AuthService] Step 1: Signing out from all providers');
      await this.authAdapter.signOut();

      // Step 2: Login with auth provider (pure provider call) - handles MFA
      console.log('[AuthService] Step 3: Logging in with auth provider');
      const loginResult = await this.authAdapter.loginToAuthProvider1(email, password);
      
      // Step 3: Derive and store user secret key early (business logic)
      console.log('[AuthService] Step 2: Deriving and storing user secret key');
      const { deriveAndStoreUserSecretKey } = await import('./secretsService');
      await deriveAndStoreUserSecretKey(password);
    
      
      // Step 4: Check if MFA is required
      if (typeof loginResult === 'object' && loginResult.mfaRequired) {
        console.log('[AuthService] MFA required, returning challenge');
        return loginResult;
      }
      
      // Step 5: No MFA required, continue with Firebase login
      console.log('[AuthService] Step 5: No MFA required, continuing with Firebase login');
      const _userId = loginResult as string;
      
      // Step 6: Get Firebase token and sign in to Firebase (business logic)
      console.log('[AuthService] Step 6: Getting Firebase token and signing in to Firebase');
      const { getCognitoTokensAndFirebaseToken } = await import('../libraries/auth/cognito');
      const { firebaseToken } = await getCognitoTokensAndFirebaseToken();
      const firebaseUser = await this.authAdapter.loginToAuthProvider2(firebaseToken);

      if (!firebaseUser) {
        throw new AuthenticationError('Failed to get Firebase user after login');
      }
      
      // Step 7: Return the user ID from Firebase
      console.log('[AuthService] Step 7: Login completed successfully for user:', firebaseUser.uid);
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

  public async confirmMfa(code: string): Promise<string> {
    try {
      console.log('[AuthService] Starting MFA confirmation with code');
      
      // Step 1: Confirm MFA with Cognito only
      console.log('[AuthService] Step 1: Confirming MFA with Cognito');
      const userId = await this.authAdapter.confirmMfa(code);
      
      console.log('[AuthService] MFA confirmation completed successfully, returning to master login flow');
      return userId;
    } catch (error) {
      console.error('[AuthService] MFA confirmation failed:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof AuthenticationError || error instanceof NetworkError) {
        throw error;
      }
      
      // Categorize common MFA errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid code') || error.message.includes('CodeMismatchException')) {
          throw new AuthenticationError('Invalid MFA code. Please try again.', error);
        }
        if (error.message.includes('CodeExpiredException')) {
          throw new AuthenticationError('MFA code has expired. Please request a new code.', error);
        }
        if (error.message.includes('Network') || error.message.includes('timeout')) {
          throw new NetworkError('Network error during MFA confirmation', error);
        }
      }
      
      throw new AuthenticationError('MFA confirmation failed', error as Error);
    }
  }

  public async completeLoginAfterMfa(): Promise<string> {
    try {
      console.log('[AuthService] Completing login flow after MFA confirmation');
      
      // Step 1: Get Firebase token and sign in to Firebase (business logic)
      console.log('[AuthService] Step 1: Getting Firebase token and signing in to Firebase');
      const { getCognitoTokensAndFirebaseToken } = await import('../libraries/auth/cognito');
      const { firebaseToken } = await getCognitoTokensAndFirebaseToken();
      const firebaseUser = await this.authAdapter.loginToAuthProvider2(firebaseToken);

      if (!firebaseUser) {
        throw new AuthenticationError('Failed to get Firebase user after MFA login completion');
      }
      
      // Step 2: Return user ID
      console.log('[AuthService] Step 2: Login completion successful for user:', firebaseUser.uid);
      return firebaseUser.uid;
    } catch (error) {
      console.error('[AuthService] Login completion after MFA failed:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof AuthenticationError || error instanceof NetworkError) {
        throw error;
      }
      
      // Categorize common auth errors
      if (error instanceof Error) {
        if (error.message.includes('Firebase token')) {
          throw new AuthenticationError('Authentication failed during login completion. Please try again.', error);
        }
        if (error.message.includes('Network') || error.message.includes('timeout')) {
          throw new NetworkError('Network error during login completion', error);
        }
      }
      
      throw new AuthenticationError('Login completion failed after MFA', error as Error);
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