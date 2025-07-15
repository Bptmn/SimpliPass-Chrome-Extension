/**
 * Platform Adapter Interface
 * 
 * This interface abstracts all platform-specific functionality to ensure
 * the app/ and core/ packages remain platform-agnostic.
 */

import { PlatformAdapter } from '../types/platform.types';

// Platform detection
export const detectPlatform = (): 'mobile' | 'extension' => {
  // Detect platform based on available APIs
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return 'extension';
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactNative')) {
    return 'mobile';
  }
  // Default to extension for web builds
  return 'extension';
};

// Platform adapter instance - loaded once at startup
let platformAdapter: PlatformAdapter | null = null;

// Initialize platform adapter (internal)
const initializePlatformAdapter = async (): Promise<PlatformAdapter> => {
  if (platformAdapter) {
    return platformAdapter;
  }
  const platform = detectPlatform();
  if (platform === 'mobile') {
    try {
      const { MobilePlatformAdapter } = await import('../../../mobile/adapters/platform.adapter');
      platformAdapter = new MobilePlatformAdapter();
    } catch (error) {
      throw new Error(`Failed to load mobile platform adapter: ${error}`);
    }
  } else {
    try {
      const { ExtensionPlatformAdapter } = await import('../../../extension/adapters/platform.adapter');
      platformAdapter = new ExtensionPlatformAdapter();
    } catch (error) {
      throw new Error(`Failed to load extension platform adapter: ${error}`);
    }
  }
  if (!platformAdapter) {
    throw new Error('Failed to initialize platform adapter');
  }
  return platformAdapter;
};

// Startup initialization - call this at app startup
export const initializePlatform = async (): Promise<void> => {
  try {
    await initializePlatformAdapter();
    console.log('[Platform] Platform adapter initialized successfully');
  } catch (error) {
    console.error('[Platform] Failed to initialize platform adapter:', error);
    throw error;
  }
};

// Helper function to get the initialized platform adapter
const getAdapter = (): PlatformAdapter => {
  if (!platformAdapter) {
    throw new Error('Platform adapter not initialized. Call initializePlatform() first.');
  }
  return platformAdapter;
};

// 🔌 Platform adapter functions that can be called from common code
// These functions use the pre-loaded platform implementation

export const platform: PlatformAdapter = {
  async getUserSecretKey(): Promise<string | null> {
    return getAdapter().getUserSecretKey();
  },

  async storeUserSecretKey(key: string): Promise<void> {
    return getAdapter().storeUserSecretKey(key);
  },

  async deleteUserSecretKey(): Promise<void> {
    return getAdapter().deleteUserSecretKey();
  },

  async getSessionMetadata(): Promise<any> {
    return getAdapter().getSessionMetadata();
  },

  async storeSessionMetadata(metadata: any): Promise<void> {
    return getAdapter().storeSessionMetadata(metadata);
  },

  async deleteSessionMetadata(): Promise<void> {
    return getAdapter().deleteSessionMetadata();
  },

  getPlatformName(): 'mobile' | 'extension' {
    return getAdapter().getPlatformName();
  },

  supportsBiometric(): boolean {
    return getAdapter().supportsBiometric();
  },

  supportsOfflineVault(): boolean {
    return getAdapter().supportsOfflineVault();
  },

  async copyToClipboard(text: string): Promise<void> {
    return getAdapter().copyToClipboard(text);
  },

  async getFromClipboard(): Promise<string> {
    return getAdapter().getFromClipboard();
  },

  async clearSession(): Promise<void> {
    return getAdapter().clearSession();
  },

  async getDeviceFingerprint(): Promise<string> {
    return getAdapter().getDeviceFingerprint();
  },

  async isOnline(): Promise<boolean> {
    return getAdapter().isOnline();
  },

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    return getAdapter().getNetworkStatus();
  },
};

// Re-export the interface for convenience
export type { PlatformAdapter } from '../types/platform.types'; 