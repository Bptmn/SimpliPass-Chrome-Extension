/**
 * Platform Adapter Factory
 * 
 * Creates and returns the appropriate platform adapter based on
 * the current platform detection.
 */

import { PlatformAdapter } from '@common/core/types/platform.types';

// Mobile platform adapter implementation
class MobilePlatformAdapter implements PlatformAdapter {
  async getUserSecretKey(): Promise<string | null> {
    try {
      // For mobile, we'll use AsyncStorage or SecureStore
      // This is a placeholder implementation
      console.log('[Mobile] Getting user secret key');
      return null;
    } catch (error) {
      console.error('[Mobile] Failed to get user secret key:', error);
      return null;
    }
  }

  async storeUserSecretKey(_key: string, _metadata?: any): Promise<void> {
    try {
      // For mobile, we'll use AsyncStorage or SecureStore
      console.log('[Mobile] Storing user secret key');
    } catch (error) {
      console.error('[Mobile] Failed to store user secret key:', error);
      throw error;
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      console.log('[Mobile] Deleting user secret key');
    } catch (error) {
      console.error('[Mobile] Failed to delete user secret key:', error);
      throw error;
    }
  }

  getPlatformName(): 'mobile' | 'extension' {
    return 'mobile';
  }

  supportsBiometric(): boolean {
    return true; // Mobile supports biometrics
  }

  supportsOfflineVault(): boolean {
    return false; // Mobile always fetches from Firestore
  }

  async copyToClipboard(_text: string): Promise<void> {
    try {
      // For mobile, we'll use the clipboard API
      console.log('[Mobile] Copying to clipboard');
    } catch (error) {
      console.error('[Mobile] Failed to copy to clipboard:', error);
      throw error;
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      // For mobile, we'll use the clipboard API
      console.log('[Mobile] Getting from clipboard');
      return '';
    } catch (error) {
      console.error('[Mobile] Failed to read from clipboard:', error);
      throw error;
    }
  }

  async clearSession(): Promise<void> {
    try {
      console.log('[Mobile] Clearing session');
    } catch (error) {
      console.error('[Mobile] Failed to clear session:', error);
      throw error;
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    // Generate a device fingerprint based on available information
    const fingerprint = [
      'mobile',
      new Date().getTime(),
    ].join('|');
    
    return btoa(fingerprint);
  }

  async isOnline(): Promise<boolean> {
    return true; // Assume online for mobile
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    return 'online'; // Assume online for mobile
  }

  // Session metadata methods
  async getSessionMetadata(): Promise<any> {
    try {
      console.log('[Mobile] Getting session metadata');
      return null;
    } catch (error) {
      console.error('[Mobile] Failed to get session metadata:', error);
      return null;
    }
  }

  async storeSessionMetadata(_metadata: any): Promise<void> {
    try {
      console.log('[Mobile] Storing session metadata');
    } catch (error) {
      console.error('[Mobile] Failed to store session metadata:', error);
      throw error;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      console.log('[Mobile] Deleting session metadata');
    } catch (error) {
      console.error('[Mobile] Failed to delete session metadata:', error);
      throw error;
    }
  }
}

// Extension platform adapter implementation
class ExtensionPlatformAdapter implements PlatformAdapter {
  async getUserSecretKey(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('userSecretKey');
      return result.userSecretKey || null;
    } catch (error) {
      console.error('[Extension] Failed to get user secret key:', error);
      return null;
    }
  }

  async storeUserSecretKey(_key: string, _metadata?: any): Promise<void> {
    try {
      await chrome.storage.local.set({ userSecretKey: _key });
      console.log('[Extension] User secret key stored');
    } catch (error) {
      console.error('[Extension] Failed to store user secret key:', error);
      throw error;
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      await chrome.storage.local.remove('userSecretKey');
      console.log('[Extension] User secret key deleted');
    } catch (error) {
      console.error('[Extension] Failed to delete user secret key:', error);
      throw error;
    }
  }

  getPlatformName(): 'mobile' | 'extension' {
    return 'extension';
  }

  supportsBiometric(): boolean {
    return false; // Extensions don't support biometrics
  }

  supportsOfflineVault(): boolean {
    return true; // Extensions have local encrypted vault
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('[Extension] Text copied to clipboard');
    } catch (error) {
      console.error('[Extension] Failed to copy to clipboard:', error);
      throw error;
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('[Extension] Failed to read from clipboard:', error);
      throw error;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('[Extension] Session cleared');
    } catch (error) {
      console.error('[Extension] Failed to clear session:', error);
      throw error;
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    // Generate a device fingerprint based on available information
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTime(),
    ].join('|');
    
    return btoa(fingerprint);
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    if (navigator.onLine) {
      return 'online';
    } else {
      return 'offline';
    }
  }

  // Session metadata methods
  async getSessionMetadata(): Promise<any> {
    try {
      const result = await chrome.storage.local.get('sessionMetadata');
      return result.sessionMetadata || null;
    } catch (error) {
      console.error('[Extension] Failed to get session metadata:', error);
      return null;
    }
  }

  async storeSessionMetadata(_metadata: any): Promise<void> {
    try {
      await chrome.storage.local.set({ sessionMetadata: _metadata });
      console.log('[Extension] Session metadata stored');
    } catch (error) {
      console.error('[Extension] Failed to store session metadata:', error);
      throw error;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      await chrome.storage.local.remove('sessionMetadata');
      console.log('[Extension] Session metadata deleted');
    } catch (error) {
      console.error('[Extension] Failed to delete session metadata:', error);
      throw error;
    }
  }
}

// Factory function to get the appropriate platform adapter
export async function getPlatformAdapter(): Promise<PlatformAdapter> {
  // Detect platform
  const isExtension = typeof chrome !== 'undefined' && chrome.storage;
  const isMobile = typeof navigator !== 'undefined' && navigator.userAgent.includes('ReactNative');
  
  if (isExtension) {
    return new ExtensionPlatformAdapter();
  } else if (isMobile) {
    return new MobilePlatformAdapter();
  } else {
    // Default to mobile adapter for web
    return new MobilePlatformAdapter();
  }
}

/**
 * Clear the platform adapter instance
 * This is used for testing or when switching users
 */
export function clearPlatformAdapter(): void {
  // This function is no longer needed as getPlatformAdapter handles singleton
  // and the new ExtensionPlatformAdapter does not have a static instance.
  // Keeping it for now, but it will be removed if not used elsewhere.
} 