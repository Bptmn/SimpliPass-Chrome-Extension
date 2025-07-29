import { MobileStorageAdapter } from '@mobile/adapters/platform.storage.adapter';
import { ExtensionStorageAdapter } from '@extension/adapters/platform.storage.adapter';
import { User } from '../types/auth.types';
import { LocalVault } from '../types/items.types';
import { getPlatform } from './platform.adapter';

export interface StorageAdapter {
  // User Secret Key Storage
  storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void>;
  updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void>;
  deleteUserSecretKeyFromSecureLocalStorage(): Promise<void>;
  getUserSecretKeyFromSecureLocalStorage(): Promise<string | null>;
  
  // User Object Storage
  storeUserToSecureLocalStorage(user: User): Promise<void>;
  updateUserInSecureLocalStorage(user: User): Promise<void>;
  deleteUserFromSecureLocalStorage(): Promise<void>;
  getUserFromSecureLocalStorage(): Promise<User | null>;
  
  // Vault Storage
  storeVaultToSecureLocalStorage(vault: LocalVault): Promise<void>;
  updateVaultInSecureLocalStorage(vault: LocalVault): Promise<void>;
  deleteVaultFromSecureLocalStorage(): Promise<void>;
  getVaultFromSecureLocalStorage(): Promise<LocalVault | null>;
  
  // General
  clearAllSecureLocalStorage(): Promise<void>;
}

let storageAdapter: StorageAdapter | null = null;

const initializeStorageAdapter = async (): Promise<StorageAdapter> => {
  if (storageAdapter) {
    return storageAdapter;
  }
  
  const platform = getPlatform();
  if (platform === 'mobile') {
    storageAdapter = new MobileStorageAdapter();
  } else {
    storageAdapter = new ExtensionStorageAdapter();
  }
  if (!storageAdapter) {
    throw new Error('Failed to initialize storage adapter');
  }
  return storageAdapter;
};

export const initializeStorage = async (): Promise<void> => {
  try {
    await initializeStorageAdapter();
    console.log('[Storage] Storage adapter initialized successfully');
  } catch (error) {
    console.error('[Storage] Failed to initialize storage adapter:', error);
    throw error;
  }
};

const getAdapter = (): StorageAdapter => {
  if (!storageAdapter) {
    throw new Error('Storage adapter not initialized. Call initializeStorage() first.');
  }
  return storageAdapter;
};

export const storage: StorageAdapter = {
  // User Secret Key Storage
  async storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void> {
    return getAdapter().storeUserSecretKeyToSecureLocalStorage(key);
  },
  async updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void> {
    return getAdapter().updateUserSecretKeyInSecureLocalStorage(key);
  },
  async deleteUserSecretKeyFromSecureLocalStorage(): Promise<void> {
    return getAdapter().deleteUserSecretKeyFromSecureLocalStorage();
  },
  async getUserSecretKeyFromSecureLocalStorage(): Promise<string | null> {
    return getAdapter().getUserSecretKeyFromSecureLocalStorage();
  },
  
  // User Object Storage
  async storeUserToSecureLocalStorage(user: User): Promise<void> {
    return getAdapter().storeUserToSecureLocalStorage(user);
  },
  async updateUserInSecureLocalStorage(user: User): Promise<void> {
    return getAdapter().updateUserInSecureLocalStorage(user);
  },
  async deleteUserFromSecureLocalStorage(): Promise<void> {
    return getAdapter().deleteUserFromSecureLocalStorage();
  },
  async getUserFromSecureLocalStorage(): Promise<User | null> {
    return getAdapter().getUserFromSecureLocalStorage();
  },
  
  // Vault Storage
  async storeVaultToSecureLocalStorage(vault: LocalVault): Promise<void> {
    return getAdapter().storeVaultToSecureLocalStorage(vault);
  },
  async updateVaultInSecureLocalStorage(vault: LocalVault): Promise<void> {
    return getAdapter().updateVaultInSecureLocalStorage(vault);
  },
  async deleteVaultFromSecureLocalStorage(): Promise<void> {
    return getAdapter().deleteVaultFromSecureLocalStorage();
  },
  async getVaultFromSecureLocalStorage(): Promise<LocalVault | null> {
    return getAdapter().getVaultFromSecureLocalStorage();
  },
  
  // General
  async clearAllSecureLocalStorage(): Promise<void> {
    return getAdapter().clearAllSecureLocalStorage();
  },
}; 