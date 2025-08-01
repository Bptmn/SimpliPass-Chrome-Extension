/**
 * Platform Adapter - Layer 3: Integration Layer
 * 
 * Centralized platform detection and platform-specific functionality.
 * Provides a single source of truth for platform detection and state.
 */

export interface PlatformAdapter {
  supportsBiometric(): boolean;
  supportsOfflineVault(): boolean;
  authenticateWithBiometrics?(): Promise<boolean>;
  getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'>;
  isBiometricAvailable?(): Promise<boolean>;
  copyToClipboard(text: string): Promise<void>;
  getFromClipboard(): Promise<string>;
  isOnline(): Promise<boolean>;
  setRememberedEmail?(email: string | null): Promise<void>;
  getRememberedEmail?(): Promise<string | null>;
}

// Global platform state
let currentPlatform: 'mobile' | 'extension' | null = null;

export const detectPlatform = (): 'mobile' | 'extension' => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return 'extension';
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactNative')) {
    return 'mobile';
  }
  return 'extension';
};

export const setPlatform = (platform: 'mobile' | 'extension'): void => {
  currentPlatform = platform;
};

export const getPlatform = (): 'mobile' | 'extension' => {
  if (!currentPlatform) {
    currentPlatform = detectPlatform();
  }
  return currentPlatform;
};

let platformAdapter: PlatformAdapter | null = null;

const initializePlatformAdapter = async (): Promise<PlatformAdapter> => {
  if (platformAdapter) {
    return platformAdapter;
  }
  
  const platform = getPlatform();
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

export const initializePlatform = async (): Promise<void> => {
  try {
    // Set the platform first
    const platform = detectPlatform();
    setPlatform(platform);
    
    // Then initialize the adapter
    await initializePlatformAdapter();
  
  } catch (error) {
    console.error('[Platform] Failed to initialize platform adapter:', error);
    throw error;
  }
};

const getAdapter = (): PlatformAdapter => {
  if (!platformAdapter) {
    throw new Error('Platform adapter not initialized. Call initializePlatform() first.');
  }
  return platformAdapter;
};

export const platform: PlatformAdapter = {

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

  async isOnline(): Promise<boolean> {
    return getAdapter().isOnline();
  },

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    return getAdapter().getNetworkStatus();
  },
}; 