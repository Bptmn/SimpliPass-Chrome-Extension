// packages/common/core/services/secretsService.ts
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { deriveKey } from '../../utils/crypto';

export interface ISecretsService {
  getUserSecretKey(): Promise<string | null>;
  storeUserSecretKey(key: string): Promise<void>;
  deleteUserSecretKey(): Promise<void>;
  hasUserSecretKey(): Promise<boolean>;
  deriveAndStoreUserSecretKey(password: string): Promise<void>;
}

// Create a singleton instance for the secrets service
let secretsServiceInstance: SecretsService | null = null;

export const getUserSecretKey = async (): Promise<string | null> => {
  if (!secretsServiceInstance) {
    throw new Error('SecretsService not initialized');
  }
  return secretsServiceInstance.getUserSecretKey();
};

export const storeUserSecretKey = async (key: string): Promise<void> => {
  if (!secretsServiceInstance) {
    throw new Error('SecretsService not initialized');
  }
  return secretsServiceInstance.storeUserSecretKey(key);
};

export const deleteUserSecretKey = async (): Promise<void> => {
  if (!secretsServiceInstance) {
    throw new Error('SecretsService not initialized');
  }
  return secretsServiceInstance.deleteUserSecretKey();
};

export const hasUserSecretKey = async (): Promise<boolean> => {
  if (!secretsServiceInstance) {
    throw new Error('SecretsService not initialized');
  }
  return secretsServiceInstance.hasUserSecretKey();
};

export const deriveAndStoreUserSecretKey = async (password: string): Promise<void> => {
  if (!secretsServiceInstance) {
    throw new Error('SecretsService not initialized');
  }
  return secretsServiceInstance.deriveAndStoreUserSecretKey(password);
};

export class SecretsService implements ISecretsService {
  constructor(
    private storage: IPlatformStorageAdapter,
  ) {
    // Set the singleton instance
    secretsServiceInstance = this;
  }

  public async getUserSecretKey(): Promise<string | null> {
    try {
      const userSecretKey = await this.storage.getUserSecretKeyFromSecureLocalStorage();
      return userSecretKey;
    } catch (error) {
      console.error('[Secret] Failed to get user secret key:', error);
      return null;
    }
  }

  public async storeUserSecretKey(key: string): Promise<void> {
    try {
      if (!key || key.length < 32) {
        throw new Error('Invalid user secret key');
      }
      await this.storage.storeUserSecretKeyToSecureLocalStorage(key);
      console.log('[Secret] User secret key stored successfully');
    } catch (error) {
      console.error('[Secret] Failed to store user secret key:', error);
      throw error;
    }
  }

  public async deleteUserSecretKey(): Promise<void> {
    try {
      await this.storage.deleteUserSecretKeyFromSecureLocalStorage();
      console.log('[Secret] User secret key deleted successfully');
    } catch (error) {
      console.error('[Secret] Failed to delete user secret key:', error);
      throw error;
    }
  }

  public async hasUserSecretKey(): Promise<boolean> {
    try {
      const key = await this.getUserSecretKey();
      return key !== null;
    } catch {
      return false;
    }
  }

  public async deriveAndStoreUserSecretKey(password: string): Promise<void> {
    // Import auth library directly to avoid circular dependency
    const { fetchUserSaltCognito } = await import('../libraries/auth/cognito');
    const userSalt = await fetchUserSaltCognito();
    const userSecretKey = await deriveKey(password, userSalt);
    await this.storeUserSecretKey(userSecretKey);
    
    // Step 4: Update global state to reflect that user secret key now exists
    const { useAppStateStore } = await import('../../hooks/useAppState');
    useAppStateStore.getState().setSecretKey(true);
  }
}

// Import actual adapters
import { storage } from '../adapters/platform.storage.adapter';

// Export singleton instance
export const secretsService = new SecretsService(
  storage
);
