/**
 * Extension Platform Adapter Implementation
 * 
 * Handles all extension-specific functionality including:
 * - Chrome storage API
 * - Extension-specific storage
 * - Clipboard operations
 * - Network detection
 */

import { PlatformAdapter, EncryptedVault } from '@common/core/types/platform.types';

export class ExtensionPlatformAdapter implements PlatformAdapter {
  private config = {
    storageKey: 'userSecretKey',
    vaultKey: 'encryptedVault',
    sessionKey: 'sessionData',
  };

  // ===== Storage Operations =====

  async getUserSecretKey(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(this.config.storageKey);
      return result[this.config.storageKey] || null;
    } catch (error) {
      throw new Error(`Failed to retrieve user secret key from storage: ${error}`);
    }
  }

  async storeUserSecretKey(key: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.storageKey]: key });
    } catch (error) {
      throw new Error(`Failed to store user secret key in storage: ${error}`);
    }
  }

  async deleteUserSecretKey(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.storageKey);
    } catch (error) {
      throw new Error(`Failed to delete user secret key from storage: ${error}`);
    }
  }

  // ===== Platform Information =====

  getPlatformName(): 'extension' {
    return 'extension';
  }

  supportsBiometric(): boolean {
    return false; // Extensions don't support biometrics
  }

  supportsOfflineVault(): boolean {
    return true;
  }

  // ===== Authentication =====

  async authenticateWithBiometrics(): Promise<boolean> {
    throw new Error('Biometric authentication not supported in extension');
  }

  async isBiometricAvailable(): Promise<boolean> {
    return false;
  }

  // ===== Clipboard Operations =====

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  async getFromClipboard(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      throw new Error(`Failed to get from clipboard: ${error}`);
    }
  }

  // ===== Session Management =====

  async clearSession(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      throw new Error(`Failed to clear session data: ${error}`);
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    try {
      // Use a combination of user agent and extension ID
      const userAgent = navigator.userAgent;
      const extensionId = chrome.runtime.id;
      return `extension-${extensionId}-${userAgent.length}`;
    } catch (error) {
      throw new Error(`Failed to get device fingerprint: ${error}`);
    }
  }

  // ===== Network Operations =====

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

  // ===== Email Remembering =====

  async setRememberedEmail(email: string | null): Promise<void> {
    try {
      if (email) {
        await chrome.storage.local.set({ remembered_email: email });
      } else {
        await chrome.storage.local.remove('remembered_email');
      }
    } catch (error) {
      console.warn('Failed to set remembered email:', error);
    }
  }

  async getRememberedEmail(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('remembered_email');
      return result.remembered_email || null;
    } catch (error) {
      console.warn('Failed to get remembered email:', error);
      return null;
    }
  }

  // ===== Session Metadata =====

  async storeSessionMetadata(metadata: string): Promise<void> {
    try {
      await chrome.storage.local.set({ session_metadata: metadata });
    } catch (error) {
      throw new Error(`Failed to store session metadata: ${error}`);
    }
  }

  async getSessionMetadata(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('session_metadata');
      return result.session_metadata || null;
    } catch (error) {
      console.warn('Failed to get session metadata:', error);
      return null;
    }
  }

  async deleteSessionMetadata(): Promise<void> {
    try {
      await chrome.storage.local.remove('session_metadata');
    } catch (error) {
      throw new Error(`Failed to delete session metadata: ${error}`);
    }
  }

  // ===== App Information =====

  getAppVersion(): string {
    return chrome.runtime.getManifest().version || '1.0.0';
  }

  // ===== Vault Operations =====

  async getEncryptedVault(): Promise<EncryptedVault | null> {
    try {
      const result = await chrome.storage.local.get(this.config.vaultKey);
      return result[this.config.vaultKey] || null;
    } catch (error) {
      console.warn('Failed to get encrypted vault:', error);
      return null;
    }
  }

  async storeEncryptedVault(vault: EncryptedVault): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.vaultKey]: vault });
    } catch (error) {
      throw new Error(`Failed to store encrypted vault: ${error}`);
    }
  }

  async deleteEncryptedVault(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.vaultKey);
    } catch (error) {
      throw new Error(`Failed to delete encrypted vault: ${error}`);
    }
  }
} 