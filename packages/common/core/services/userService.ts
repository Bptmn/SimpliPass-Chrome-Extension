// packages/common/core/services/userService.ts
import { User } from '@common/types/auth.types';
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { User as FirebaseUser } from 'firebase/auth';
import { hasUserSecretKey } from './secretsService';
import { NetworkError, AuthenticationError, StorageError } from '@common/types/errors.types';

export interface IUserService {
  getCurrentUser(): Promise<User | null>;
  getCurrentUserAsync(): Promise<FirebaseUser | null>;
  waitForAuthStateStable(): Promise<void>;
  getCurrentUserId(): Promise<string | null>;
  initializeUserData(userId: string): Promise<{ user: User | null; hasSecretKey: boolean; }>;
  handleUserAuthenticationState(userId: string): Promise<{ user: User | null; hasSecretKey: boolean; success: boolean; }>;
  clearUserData(): Promise<void>;
  getFirestoreUserDocument(userId: string): Promise<User | null>;
  refreshUserInfo(userId: string): Promise<User | null>;
}

// Create a singleton instance for the user service
let userServiceInstance: UserService | null = null;

export const getCurrentUser = async (): Promise<User | null> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.getCurrentUser();
};

export const getCurrentUserId = async (): Promise<string | null> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.getCurrentUserId();
};

export const initializeUserData = async (userId: string): Promise<{ user: User | null; hasSecretKey: boolean; }> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.initializeUserData(userId);
};

export const clearUserData = async (): Promise<void> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.clearUserData();
};

export const getFirestoreUserDocument = async (userId: string): Promise<User | null> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.getFirestoreUserDocument(userId);
};

export const refreshUserInfo = async (userId: string): Promise<User | null> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.refreshUserInfo(userId);
};

export const getCurrentUserAsync = async (): Promise<FirebaseUser | null> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.getCurrentUserAsync();
};

export class UserService implements IUserService {
  constructor(
    private db: IDatabaseAdapter,
    private storage: IPlatformStorageAdapter,
    private auth: IAuthAdapter,
    private appStateStore: typeof useAppStateStore,
  ) {
    // Set the singleton instance for global access
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    userServiceInstance = this;
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = await this.getCurrentUserAsync();
      if (!currentUser) {
        return null;
      }
      const userDoc = await this.db.getDocument(`users/${currentUser.uid}`);
      if (!userDoc) {
        return null;
      }
      return {
        id: currentUser.uid,
        email: userDoc.email,
        username: userDoc.username || userDoc.email,
        createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
        updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error('[UserService] Failed to get current user:', error);
      return null;
    }
  }

  public async getCurrentUserAsync(): Promise<FirebaseUser | null> {
    try {
      await this.waitForAuthStateStable();
      return this.auth.getCurrentUser();
    } catch (error) {
      console.error('[UserService] Failed to get current user async:', error);
      return null;
    }
  }

  public async waitForAuthStateStable(): Promise<void> {
    try {
      // Simple polling approach to wait for auth state to stabilize
      let attempts = 0;
      const maxAttempts = 10;
      const delay = 100; // 100ms between attempts
      
      while (attempts < maxAttempts) {
        const currentUser = await this.auth.getCurrentUser();
        if (currentUser !== undefined) {
          return; // Auth state is stable
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      }
      
      // If we reach here, auth state didn't stabilize in time
      console.warn('[UserService] Auth state did not stabilize within expected time');
    } catch (error) {
      console.error('[UserService] Error waiting for auth state to stabilize:', error);
      throw new AuthenticationError('Failed to wait for auth state to stabilize', error as Error);
    }
  }

  public async getCurrentUserId(): Promise<string | null> {
    try {
      const currentUser = await this.getCurrentUserAsync();
      return currentUser?.uid || null;
    } catch (error) {
      console.error('[UserService] Failed to get current user ID:', error);
      return null;
    }
  }

  // Get user data from database and check if user has a secret key
  public async initializeUserData(userId: string): Promise<{ user: User | null; hasSecretKey: boolean; }> {
    try {
      const user = await this.getCurrentUser();
      const hasSecretKey = await hasUserSecretKey();
      return { user, hasSecretKey };
    } catch (error) {
      console.error('[UserService] Failed to initialize user data:', error);
      throw new AuthenticationError('Failed to initialize user data', error as Error);
    }
  }

  public async handleUserAuthenticationState(userId: string): Promise<{ user: User | null; hasSecretKey: boolean; success: boolean; }> {
    try {
      const { user, hasSecretKey } = await this.initializeUserData(userId);
      if (user) {
        this.appStateStore.getState().setUserAndSecretKey(user, hasSecretKey);
        return { user, hasSecretKey, success: true };
      } else {
        this.appStateStore.getState().setUserAndSecretKey(null, false);
        return { user: null, hasSecretKey: false, success: false };
      }
    } catch (error) {
      console.error('[UserService] Error handling user authentication state:', error);
      this.appStateStore.getState().setUserAndSecretKey(null, false);
      return { user: null, hasSecretKey: false, success: false };
    }
  }

  public async clearUserData(): Promise<void> {
    try {
      await this.storage.clearAllSecureLocalStorage();
    } catch (error) {
      console.error('[UserService] Failed to clear user data:', error);
      throw new StorageError('Failed to clear user data', error as Error);
    }
  }

  public async getFirestoreUserDocument(userId: string): Promise<User | null> {
    try {
      return await this.db.getDocument(`users/${userId}`);
    } catch (error) {
      console.error('[UserService] Failed to get Firestore user document:', error);
      throw new NetworkError('Failed to get user document from database', error as Error);
    }
  }

  public async refreshUserInfo(userId: string): Promise<User | null> {
    try {
      const userDoc = await this.getFirestoreUserDocument(userId);
      if (!userDoc) {
        throw new Error('User document not found in Firestore');
      }
      return {
        id: userId,
        email: userDoc.email,
        username: userDoc.username || userDoc.email,
        createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
        updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error('[UserService] Failed to refresh user info:', error);
      throw new NetworkError('Failed to refresh user information', error as Error);
    }
  }
}

// Import actual adapters and store
import { auth } from '../adapters/auth.adapter';
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { useAppStateStore } from '../../hooks/useAppState';

// Export singleton instance
export const userService = new UserService(
  db,
  storage,
  auth,
  useAppStateStore
);
