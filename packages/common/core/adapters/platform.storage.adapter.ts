// packages/common/core/adapters/platform.storage.adapter.ts
import { useAppStateStore, type Platform } from '../../hooks/useAppState';

export interface IPlatformStorageAdapter {
  // User Secret Key Storage
  storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void>;
  updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void>;
  deleteUserSecretKeyFromSecureLocalStorage(): Promise<void>;
  getUserSecretKeyFromSecureLocalStorage(): Promise<string | null>;
  
  // User Object Storage
  storeUserToSecureLocalStorage(user: any): Promise<void>;
  updateUserInSecureLocalStorage(user: any): Promise<void>;
  deleteUserFromSecureLocalStorage(): Promise<void>;
  getUserFromSecureLocalStorage(): Promise<any | null>;
  
  // Vault Storage
  storeVaultToSecureLocalStorage(vault: any): Promise<void>;
  updateVaultInSecureLocalStorage(vault: any): Promise<void>;
  deleteVaultFromSecureLocalStorage(): Promise<void>;
  getVaultFromSecureLocalStorage(): Promise<any | null>;
  
  // General
  clearAllSecureLocalStorage(): Promise<void>;
}

// 🔌 Current implementation using platform-specific storage adapters
// This can be easily swapped for other storage providers
export const storage: IPlatformStorageAdapter = new Proxy({} as IPlatformStorageAdapter, {
  get(target, prop) {
    return async (...args: any[]) => {
      // Get platform from global state
      const platform = useAppStateStore.getState().platform;
      if (!platform) {
        throw new Error('Platform not set in global state');
      }

      // Dynamically import the appropriate storage adapter
      let adapter;
      if (platform === 'mobile') {
        const { MobileStorageAdapter } = await import('../../../mobile/adapters/platform.storage.adapter');
        adapter = new MobileStorageAdapter();
      } else {
        const { ExtensionStorageAdapter } = await import('../../../extension/adapters/platform.storage.adapter');
        adapter = new ExtensionStorageAdapter();
      }

      const method = (adapter as any)[prop];
      if (method) {
        return method(...args);
      }
      
      throw new Error(`Method ${String(prop)} not found in platform storage adapter`);
    };
  }
});
