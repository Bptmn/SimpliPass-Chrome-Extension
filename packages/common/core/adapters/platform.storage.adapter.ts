import { MobileStorageAdapter } from '@mobile/adapters/platform.storage.adapter';
import { ExtensionStorageAdapter } from '@extension/adapters/platform.storage.adapter';

export interface StorageAdapter {
  storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void>;
  updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void>;
  deleteUserSecretKeyFromSecureLocalStorage(): Promise<void>;
  getUserSecretKeyFromSecureLocalStorage(): Promise<string | null>;
  storeVaultToSecureLocalStorage(vault: any): Promise<void>;
  updateVaultInSecureLocalStorage(vault: any): Promise<void>;
  deleteVaultFromSecureLocalStorage(): Promise<void>;
  getVaultFromSecureLocalStorage(): Promise<any | null>;
}

export const detectPlatform = (): 'mobile' | 'extension' => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return 'extension';
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactNative')) {
    return 'mobile';
  }
  return 'extension';
};

let storageAdapter: StorageAdapter | null = null;

const initializeStorageAdapter = async (): Promise<StorageAdapter> => {
  if (storageAdapter) {
    return storageAdapter;
  }
  const platform = detectPlatform();
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
  async storeVaultToSecureLocalStorage(vault: any): Promise<void> {
    return getAdapter().storeVaultToSecureLocalStorage(vault);
  },
  async updateVaultInSecureLocalStorage(vault: any): Promise<void> {
    return getAdapter().updateVaultInSecureLocalStorage(vault);
  },
  async deleteVaultFromSecureLocalStorage(): Promise<void> {
    return getAdapter().deleteVaultFromSecureLocalStorage();
  },
  async getVaultFromSecureLocalStorage(): Promise<any | null> {
    return getAdapter().getVaultFromSecureLocalStorage();
  },
}; 