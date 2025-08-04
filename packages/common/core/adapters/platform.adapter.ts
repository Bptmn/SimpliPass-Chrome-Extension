/**
 * Platform Adapter - Layer 3: Integration Layer
 * 
 * Centralized platform detection and platform-specific functionality.
 * Provides a single source of truth for platform detection and state.
 */

import { useAppStateStore, type Platform } from '../../hooks/useAppState';

export interface PlatformAdapter {
  // Core platform capabilities
  getAppVersion(): Promise<string>;
  getPlatformInfo(): Promise<{ platform: string; version: string }>;
  
  // Biometric authentication (optional)
  authenticateWithBiometrics(): Promise<boolean>;
  isBiometricAvailable(): Promise<boolean>;
  
  // Offline vault support (optional)
  supportsOfflineVault(): Promise<boolean>;
  supportsBiometric(): Promise<boolean>;
  
  // Remembered email (optional)
  setRememberedEmail(email: string | null): Promise<void>;
  getRememberedEmail(): Promise<string | null>;
  
  // Clipboard operations
  copyToClipboard(text: string): Promise<void>;
  getFromClipboard(): Promise<string>;
  
  // Network operations
  isOnline(): Promise<boolean>;
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
  
  // Session management
  clearSession(): Promise<void>;
  
  // Session metadata (optional)
  storeSessionMetadata(metadata: any): Promise<void>;
  getSessionMetadata(): Promise<any>;
  deleteSessionMetadata(): Promise<void>;
}

// 🔌 Current implementation using platform-specific adapters
// This can be easily swapped for other platform implementations
export const platform: PlatformAdapter = new Proxy({} as PlatformAdapter, {
  get(target, prop) {
    return async (...args: any[]) => {
      // Get platform from global state
      const platform = useAppStateStore.getState().platform;
      if (!platform) {
        throw new Error('Platform not set in global state');
      }

      // Dynamically import the appropriate platform adapter
      let adapter;
      if (platform === 'mobile') {
        const { MobilePlatformAdapter } = await import('../../../mobile/adapters/platform.adapter');
        adapter = new MobilePlatformAdapter();
      } else {
        const { ExtensionPlatformAdapter } = await import('../../../extension/adapters/platform.adapter');
        adapter = new ExtensionPlatformAdapter();
      }

      const method = (adapter as any)[prop];
      if (method) return method(...args);
      
      // Handle optional methods with default values
      const optionalMethodDefaults: Record<string, any> = {
        authenticateWithBiometrics: Promise.resolve(false),
        isBiometricAvailable: Promise.resolve(false),
        supportsBiometric: Promise.resolve(false),
        setRememberedEmail: Promise.resolve(),
        getRememberedEmail: Promise.resolve(null),
        copyToClipboard: Promise.resolve(),
        getFromClipboard: Promise.resolve(''),
        isOnline: Promise.resolve(true),
        getNetworkStatus: Promise.resolve('online'),
        clearSession: Promise.resolve(),
        storeSessionMetadata: Promise.resolve(),
        getSessionMetadata: Promise.resolve(null),
        deleteSessionMetadata: Promise.resolve(),
      };
      
      if (prop in optionalMethodDefaults) return optionalMethodDefaults[prop as string];
      
      throw new Error(`Method ${String(prop)} not found in platform adapter`);
    };
  }
});

// Pure provider functions for platform operations
export const initializePlatform = (platform: Platform) => {
  useAppStateStore.getState().setPlatform(platform);
};
export const detectPlatform = (platform: Platform) => {
  useAppStateStore.getState().setPlatform(platform);
};
export const setPlatform = (platform: Platform) => {
  useAppStateStore.getState().setPlatform(platform);
};
export const getPlatform = () => {
  return useAppStateStore.getState().platform;
}; 