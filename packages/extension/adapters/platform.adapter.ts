/**
 * Extension Platform Adapter Implementation
 * 
 * Handles all Chrome extension-specific functionality including:
 * - chrome.storage.local for secure storage
 * - Background script communication
 * - Extension-specific APIs
 * - Local vault management
 */

import { PlatformAdapter, EncryptedVault } from '../../app/core/adapters';
import { getPlatformConfig } from '../../app/core/adapters/platform.detection';

export class ExtensionPlatformAdapter implements PlatformAdapter {
  private config = getPlatformConfig();

  // ===== Storage Operations =====

  async getUserSecretKey(): Promise<string | null> {
    try {
      // Try to get from chrome.storage.local
      const result = await chrome.storage.local.get([this.config.storageKey]);
      const encryptedKey = result[this.config.storageKey];
      
      if (!encryptedKey) {
        return null;
      }

      // Decrypt the key using device fingerprint
      const deviceFingerprint = await this.getDeviceFingerprint();
      const decryptedKey = await this.decryptWithFingerprint(encryptedKey, deviceFingerprint);
      
      return decryptedKey;
    } catch (error) {
      throw new Error(`Failed to retrieve user secret key from storage: ${error}`);
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      // Encrypt the key with device fingerprint
      const deviceFingerprint = await this.getDeviceFingerprint();
      const encryptedKey = await this.encryptWithFingerprint(key, deviceFingerprint);
      
      // Store in chrome.storage.local
      await chrome.storage.local.set({ [this.config.storageKey]: encryptedKey });
    } catch (error) {
      throw new Error(`Failed to store user secret key in storage: ${error}`);
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.config.storageKey]);
    } catch (error) {
      throw new Error(`Failed to delete user secret key from storage: ${error}`);
    }
  }

  // ===== Vault Operations (Extension only) =====

  async getEncryptedVault(): Promise<EncryptedVault | null> {
    try {
      const result = await chrome.storage.local.get([this.config.vaultKey!]);
      return result[this.config.vaultKey!] || null;
    } catch (error) {
      throw new Error(`Failed to retrieve encrypted vault: ${error}`);
    }
  }

  async storeEncryptedVault(vault: EncryptedVault): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.vaultKey!]: vault });
    } catch (error) {
      throw new Error(`Failed to store encrypted vault: ${error}`);
    }
  }

  async deleteEncryptedVault(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.config.vaultKey!]);
    } catch (error) {
      throw new Error(`Failed to delete encrypted vault: ${error}`);
    }
  }

  // ===== Platform Information =====

  getPlatformName(): 'mobile' | 'extension' {
    return 'extension';
  }

  supportsBiometric(): boolean {
    return false; // Chrome extensions don't support biometrics
  }

  supportsOfflineVault(): boolean {
    return true; // Extensions can store encrypted vault locally
  }

  // ===== Authentication =====

  async authenticateWithBiometrics(): Promise<boolean> {
    throw new Error('Biometric authentication not supported in Chrome extension');
  }

  async isBiometricAvailable(): Promise<boolean> {
    return false;
  }

  // ===== Clipboard Operations =====

  async copyToClipboard(text: string): Promise<void> {
    try {
      // Use the clipboard API
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      // Use the clipboard API
      return await navigator.clipboard.readText();
    } catch (error) {
      throw new Error(`Failed to get from clipboard: ${error}`);
    }
  }

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      // Clear all extension storage
      await chrome.storage.local.clear();
      
      // Clear any other session-related data
      const keys = [
        'userSession',
        'userSettings',
        'uiState',
        'searchState',
        'lastSync',
        'deviceFingerprint',
      ];

      await chrome.storage.local.remove(keys);
    } catch (error) {
      throw new Error(`Failed to clear session data: ${error}`);
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    try {
      // Try to get existing fingerprint
      const result = await chrome.storage.local.get([this.config.deviceFingerprintKey!]);
      let fingerprint = result[this.config.deviceFingerprintKey!];
      
      if (!fingerprint) {
        // Generate new fingerprint based on browser/device characteristics
        fingerprint = await this.generateDeviceFingerprint();
        
        // Store the fingerprint
        await chrome.storage.local.set({ [this.config.deviceFingerprintKey!]: fingerprint });
      }
      
      return fingerprint;
    } catch (error) {
      throw new Error(`Failed to get device fingerprint: ${error}`);
    }
  }

  // ===== Network Operations =====

  async isOnline(): Promise<boolean> {
    try {
      return navigator.onLine;
    } catch (error) {
      console.warn('Failed to check network status:', error);
      return false;
    }
  }

  async getNetworkStatus(): Promise<'online' | 'offline' | 'unknown'> {
    try {
      if (navigator.onLine) {
        return 'online';
      } else {
        return 'offline';
      }
    } catch (error) {
      console.warn('Failed to get network status:', error);
      return 'unknown';
    }
  }

  // ===== Private Helper Methods =====

  private async generateDeviceFingerprint(): Promise<string> {
    try {
      // Create a fingerprint based on browser characteristics
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
      ];
      
      const fingerprint = components.join('|');
      const hash = await this.simpleHash(fingerprint);
      
      return `extension-${hash}`;
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
      return 'extension-unknown';
    }
  }

  private async simpleHash(str: string): Promise<string> {
    // Simple hash function for fingerprint generation
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async encryptWithFingerprint(data: string, fingerprint: string): Promise<string> {
    try {
      // Simple encryption using fingerprint as key
      // In a real implementation, you'd use proper encryption
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = encoder.encode(fingerprint);
      
      // Simple XOR encryption (for demo purposes)
      const encrypted = new Uint8Array(dataBuffer.length);
      for (let i = 0; i < dataBuffer.length; i++) {
        encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length];
      }
      
      return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  private async decryptWithFingerprint(encryptedData: string, fingerprint: string): Promise<string> {
    try {
      // Simple decryption using fingerprint as key
      // In a real implementation, you'd use proper decryption
      const decoder = new TextDecoder();
      const encrypted = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));
      const keyBuffer = new TextEncoder().encode(fingerprint);
      
      // Simple XOR decryption (for demo purposes)
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length];
      }
      
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  // ===== Extension-Specific Methods =====

  /**
   * Send message to background script
   */
  async sendMessageToBackground(message: any): Promise<any> {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      throw new Error(`Failed to send message to background: ${error}`);
    }
  }

  /**
   * Get extension manifest
   */
  getExtensionManifest(): chrome.runtime.Manifest {
    return chrome.runtime.getManifest();
  }

  /**
   * Get extension version
   */
  getExtensionVersion(): string {
    return chrome.runtime.getManifest().version;
  }

  /**
   * Check if running in background script
   */
  isBackgroundScript(): boolean {
    return typeof window === 'undefined' || !window.location;
  }

  /**
   * Check if running in content script
   */
  isContentScript(): boolean {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'chrome-extension:';
  }

  /**
   * Check if running in popup
   */
  isPopup(): boolean {
    return typeof window !== 'undefined' && window.location && window.location.pathname.includes('popup');
  }

  /**
   * Get current tab
   */
  async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab || null;
    } catch (error) {
      console.warn('Failed to get current tab:', error);
      return null;
    }
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string | null> {
    try {
      const tab = await this.getCurrentTab();
      return tab?.url || null;
    } catch (error) {
      console.warn('Failed to get current URL:', error);
      return null;
    }
  }

  /**
   * Inject content script
   */
  async injectContentScript(tabId: number, script: string): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (scriptContent) => {
          // Execute the script content
          eval(scriptContent);
        },
        args: [script],
      });
    } catch (error) {
      throw new Error(`Failed to inject content script: ${error}`);
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<number> {
    try {
      return await chrome.storage.local.getBytesInUse();
    } catch (error) {
      console.warn('Failed to get storage usage:', error);
      return 0;
    }
  }

  /**
   * Check if storage is available
   */
  async isStorageAvailable(): Promise<boolean> {
    try {
      await chrome.storage.local.get(['test']);
      return true;
    } catch (error) {
      return false;
    }
  }
} 