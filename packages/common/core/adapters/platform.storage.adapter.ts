// packages/common/core/adapters/platform.storage.adapter.ts
import { useAppStateStore } from '../../hooks/useAppState';

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

      // For extension platform, use a simpler approach without dynamic imports
      if (platform === 'extension') {
        // Import the extension storage adapter directly
        const { ExtensionStorageAdapter } = await import('../../../extension/adapters/platform.storage.adapter');
        const adapter = new ExtensionStorageAdapter();
        const method = (adapter as any)[prop];
        if (method) {
          return method.bind(adapter)(...args);
        }
        throw new Error(`Method ${String(prop)} not found in extension storage adapter`);
      }

      // For mobile platform, use dynamic import
      try {
        const { MobileStorageAdapter } = await import('../../../mobile/adapters/platform.storage.adapter');
        const adapter = new MobileStorageAdapter();
        const method = (adapter as any)[prop];
        if (method) {
          return method.bind(adapter)(...args);
        }
        throw new Error(`Method ${String(prop)} not found in mobile storage adapter`);
      } catch (error) {
        console.error('[PlatformStorageAdapter] Failed to load mobile storage adapter:', error);
        throw new Error(`Failed to load storage adapter for platform: ${platform}`);
      }
    };
  }
});
