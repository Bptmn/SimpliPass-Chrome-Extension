
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

export const detectPlatform = (): 'mobile' | 'extension' => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return 'extension';
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactNative')) {    return 'mobile';
  }
  return 'extension';
};

let platformAdapter: PlatformAdapter | null = null;

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

export const initializePlatform = async (): Promise<void> => {
  try {
    await initializePlatformAdapter();
    console.log('[Platform] Platform adapter initialized successfully');
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