// packages/common/core/services/vaultService.ts
import { ItemDecrypted } from '@common/types/items.types';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';
import { StorageError, PlatformError, AuthenticationError } from '@common/types/errors.types';

export interface IVaultService {
  setLocalVault(items: ItemDecrypted[]): Promise<void>;
  getLocalVault(): Promise<ItemDecrypted[]>;
  clearLocalVault(): Promise<void>;
}

// Create a singleton instance for the vault service
let vaultServiceInstance: VaultService | null = null;

export const setLocalVault = async (items: ItemDecrypted[]): Promise<void> => {
  if (!vaultServiceInstance) {
    throw new Error('VaultService not initialized');
  }
  return vaultServiceInstance.setLocalVault(items);
};

export const getLocalVault = async (): Promise<ItemDecrypted[]> => {
  if (!vaultServiceInstance) {
    throw new Error('VaultService not initialized');
  }
  return vaultServiceInstance.getLocalVault();
};

export const clearLocalVault = async (): Promise<void> => {
  if (!vaultServiceInstance) {
    throw new Error('VaultService not initialized');
  }
  return vaultServiceInstance.clearLocalVault();
};

export class VaultService implements IVaultService {
  constructor(
    private storage: IPlatformStorageAdapter,
    private authService: IAuthService,
  ) {
    // Set the singleton instance for global access
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    vaultServiceInstance = this;
  }

  public async setLocalVault(items: ItemDecrypted[]): Promise<void> {
    try {
      if (!this.storage.storeVaultToSecureLocalStorage) {
        throw new PlatformError('Local vault storage not supported on this platform');
      }
      
      const user = await this.authService.getCurrentUser();
      const userId = user?.uid || 'current';
      await this.storage.storeVaultToSecureLocalStorage({
        userId,
        items,
        lastModified: new Date(),
      });
    } catch (error) {
      console.error('[VaultService] Failed to store local vault:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof StorageError || error instanceof PlatformError || error instanceof AuthenticationError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          throw new PlatformError('Vault storage not supported on this platform', error);
        }
        if (error.message.includes('storage') || error.message.includes('store')) {
          throw new StorageError('Failed to store vault data', error);
        }
        if (error.message.includes('auth') || error.message.includes('user')) {
          throw new AuthenticationError('Failed to get user for vault storage', error);
        }
      }
      
      throw new StorageError('Failed to store local vault', error as Error);
    }
  }

  public async getLocalVault(): Promise<ItemDecrypted[]> {
    try {
      if (!this.storage.getVaultFromSecureLocalStorage) {
        throw new PlatformError('Local vault storage not supported on this platform');
      }
      
      const vault = await this.storage.getVaultFromSecureLocalStorage();
      if (!vault) {
        return [];
      }
      return vault.items || [];
    } catch (error) {
      console.error('[VaultService] Failed to get local vault:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof StorageError || error instanceof PlatformError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          throw new PlatformError('Vault storage not supported on this platform', error);
        }
        if (error.message.includes('storage') || error.message.includes('get')) {
          throw new StorageError('Failed to retrieve vault data', error);
        }
      }
      
      throw new StorageError('Failed to get local vault', error as Error);
    }
  }

  public async clearLocalVault(): Promise<void> {
    try {
      if (this.storage.deleteVaultFromSecureLocalStorage) {
        await this.storage.deleteVaultFromSecureLocalStorage();
      }
    } catch (error) {
      console.error('[VaultService] Failed to clear local vault:', error);
      
      // ✅ Proper error categorization for UI layer
      if (error instanceof StorageError || error instanceof PlatformError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          throw new PlatformError('Vault storage not supported on this platform', error);
        }
        if (error.message.includes('storage') || error.message.includes('delete')) {
          throw new StorageError('Failed to clear vault data', error);
        }
      }
      
      throw new StorageError('Failed to clear local vault', error as Error);
    }
  }
}

// Import actual adapters and services
import { storage } from '../adapters/platform.storage.adapter';
import { authService } from './authService';

// Export singleton instance
export const vaultService = new VaultService(
  storage,
  authService
);
