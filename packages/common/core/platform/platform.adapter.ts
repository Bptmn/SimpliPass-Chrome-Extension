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

// Platform adapter factory
let platformAdapter: PlatformAdapter | null = null;

export const getPlatformAdapter = async (): Promise<PlatformAdapter> => {
  if (!platformAdapter) {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      // For mobile, we'll use the default adapter for now
      // The actual mobile adapter will be loaded at runtime
      platformAdapter = new DefaultPlatformAdapter();
    } else {
      // For extension and web, use the extension adapter
      try {
        const { ExtensionPlatformAdapter } = await import('@extension/adapters/platform.adapter');
        platformAdapter = new ExtensionPlatformAdapter();
      } catch (error) {
        console.warn('[PlatformAdapter] Failed to load extension adapter, using default:', error);
        platformAdapter = new DefaultPlatformAdapter();
      }
    }
  }
  
  return platformAdapter;
};

// Re-export the type for convenience
export type { PlatformAdapter } from '../types/platform.types';

// Default platform adapter implementation
export class DefaultPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey(): Promise<string | null> {
    console.warn('[DefaultPlatformAdapter] getUserSecretKey not implemented');
    return null;
  }

  async storeUserSecretKey(_key: string, _metadata?: any): Promise<void> {
    console.warn('[DefaultPlatformAdapter] storeUserSecretKey not implemented');
  }

  async deleteUserSecretKey(): Promise<void> {
    console.warn('[DefaultPlatformAdapter] deleteUserSecretKey not implemented');
  }

  async getSessionMetadata(): Promise<any> {
    console.warn('[DefaultPlatformAdapter] getSessionMetadata not implemented');
    return null;
  }

  async storeSessionMetadata(_metadata: any): Promise<void> {
    console.warn('[DefaultPlatformAdapter] storeSessionMetadata not implemented');
  }

  async deleteSessionMetadata(): Promise<void> {
    console.warn('[DefaultPlatformAdapter] deleteSessionMetadata not implemented');
  }

  getPlatformName(): 'mobile' | 'extension' {
    return 'extension';
  }

  supportsBiometric(): boolean {
    return false;
  }

  supportsOfflineVault(): boolean {
    return false;
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    console.warn('[DefaultPlatformAdapter] authenticateWithBiometrics not implemented');
    return false;
  }

  async isBiometricAvailable(): Promise<boolean> {
    console.warn('[DefaultPlatformAdapter] isBiometricAvailable not implemented');
    return false;
  }

  async copyToClipboard(_text: string): Promise<void> {
    console.warn('[DefaultPlatformAdapter] copyToClipboard not implemented');
  }

  async getFromClipboard(): Promise<string> {
    console.warn('[DefaultPlatformAdapter] getFromClipboard not implemented');
    return '';
  }

  async clearSession(): Promise<void> {
    console.warn('[DefaultPlatformAdapter] clearSession not implemented');
  }

  async getDeviceFingerprint(): Promise<string> {
    console.warn('[DefaultPlatformAdapter] getDeviceFingerprint not implemented');
    return 'default-fingerprint';
  }

  async isOnline(): Promise<boolean> {
    console.warn('[DefaultPlatformAdapter] isOnline not implemented');
    return true;
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    console.warn('[DefaultPlatformAdapter] getNetworkStatus not implemented');
    return 'online';
  }

  async setRememberedEmail(_email: string | null): Promise<void> {
    console.warn('[DefaultPlatformAdapter] setRememberedEmail not implemented');
  }

  async getRememberedEmail(): Promise<string | null> {
    console.warn('[DefaultPlatformAdapter] getRememberedEmail not implemented');
    return null;
  }
} 