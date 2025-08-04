// packages/common/core/adapters/platform.storage.adapter.ts
import { User } from '../types/auth.types';
import { LocalVault } from '../types/items.types';

export interface IPlatformStorageAdapter {
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

// Export a default instance for backward compatibility
export const storage: IPlatformStorageAdapter = {
  storeUserSecretKeyToSecureLocalStorage: async () => {},
  updateUserSecretKeyInSecureLocalStorage: async () => {},
  deleteUserSecretKeyFromSecureLocalStorage: async () => {},
  getUserSecretKeyFromSecureLocalStorage: async () => null,
  storeUserToSecureLocalStorage: async () => {},
  updateUserInSecureLocalStorage: async () => {},
  deleteUserFromSecureLocalStorage: async () => {},
  getUserFromSecureLocalStorage: async () => null,
  storeVaultToSecureLocalStorage: async () => {},
  updateVaultInSecureLocalStorage: async () => {},
  deleteVaultFromSecureLocalStorage: async () => {},
  getVaultFromSecureLocalStorage: async () => null,
  clearAllSecureLocalStorage: async () => {}
};

// Export initialization function for backward compatibility
export const initializeStorage = async (): Promise<void> => {
  // Platform-specific initialization will be handled by the actual implementation
  console.log('[PlatformStorageAdapter] Storage initialized');
};

// Export type alias for backward compatibility
export type StorageAdapter = IPlatformStorageAdapter;
