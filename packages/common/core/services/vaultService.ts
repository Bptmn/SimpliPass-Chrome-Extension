// packages/common/core/services/vaultService.ts
import { ItemDecrypted } from '@common/core/types/items.types';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';

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
    // Set the singleton instance
    vaultServiceInstance = this;
  }

  public async setLocalVault(items: ItemDecrypted[]): Promise<void> {
    try {
      if (!this.storage.storeVaultToSecureLocalStorage) {
        throw new Error('Local vault storage not supported on this platform');
      }
      
      const user = await this.authService.getCurrentUser();
      const userId = user?.uid || 'current';
      await this.storage.storeVaultToSecureLocalStorage({
        userId,
        items,
        lastModified: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to store local vault: ${error}`);
    }
  }

  public async getLocalVault(): Promise<ItemDecrypted[]> {
    try {
      if (!this.storage.getVaultFromSecureLocalStorage) {
        throw new Error('Local vault storage not supported on this platform');
      }
      
      const vault = await this.storage.getVaultFromSecureLocalStorage();
      if (!vault) {
        return [];
      }
      return vault.items || [];
    } catch (error) {
      throw new Error(`Failed to get local vault: ${error}`);
    }
  }

  public async clearLocalVault(): Promise<void> {
    try {
      if (this.storage.deleteVaultFromSecureLocalStorage) {
        await this.storage.deleteVaultFromSecureLocalStorage();
      }
    } catch (error) {
      throw new Error(`Failed to clear local vault: ${error}`);
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
