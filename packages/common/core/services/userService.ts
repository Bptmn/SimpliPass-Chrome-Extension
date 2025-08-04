// packages/common/core/services/userService.ts
import { User } from '../types/auth.types';
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthAdapter } from '../adapters/auth.adapter';
import { User as FirebaseUser } from 'firebase/auth';

export interface IUserService {
  getCurrentUser(): Promise<User | null>;
  getCurrentUserAsync(): Promise<FirebaseUser | null>;
  waitForAuthStateStable(): Promise<void>;
  checkUserSecretKey(): Promise<boolean>;
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

export const checkUserSecretKey = async (): Promise<boolean> => {
  if (!userServiceInstance) {
    throw new Error('UserService not initialized');
  }
  return userServiceInstance.checkUserSecretKey();
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
    // Set the singleton instance
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
    await this.waitForAuthStateStable();
    return this.auth.getCurrentUser();
  }

  public async waitForAuthStateStable(): Promise<void> {
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
  }

  public async checkUserSecretKey(): Promise<boolean> {
    try {
      const userSecretKey = await this.storage.getUserSecretKeyFromSecureLocalStorage();
      return !!userSecretKey;
    } catch (error) {
      console.error('[UserService] Error checking user secret key:', error);
      return false;
    }
  }

  public async getCurrentUserId(): Promise<string | null> {
    const currentUser = await this.getCurrentUserAsync();
    return currentUser?.uid || null;
  }

  public async initializeUserData(userId: string): Promise<{ user: User | null; hasSecretKey: boolean; }> {
    try {
      const user = await this.getCurrentUser();
      const hasSecretKey = await this.checkUserSecretKey();
      return { user, hasSecretKey };
    } catch (error) {
      console.error('[UserService] Failed to initialize user data:', error);
      throw error;
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
      throw error;
    }
  }

  public async getFirestoreUserDocument(userId: string): Promise<User | null> {
    try {
      return await this.db.getDocument(`users/${userId}`);
    } catch (error) {
      console.error('[UserService] Failed to get Firestore user document:', error);
      throw error;
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
      throw error;
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
