// packages/common/core/services/secretsService.ts
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { deriveKey } from '../../utils/crypto';
import { IAuthAdapter } from '../adapters/auth.adapter';

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

export class SecretsService implements ISecretsService {
  constructor(
    private storage: IPlatformStorageAdapter,
    private auth: IAuthAdapter,
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
    const userSalt = await this.auth.fetchUserSalt();
    const userSecretKey = await deriveKey(password, userSalt);
    await this.storeUserSecretKey(userSecretKey);
  }
}
