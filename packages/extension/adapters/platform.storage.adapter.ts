/**
 * Extension Storage Adapter Implementation
 * 
 * Handles all extension-specific storage functionality including:
 * - Chrome storage API for secure storage
 * - Extension-specific vault storage
 */

import { StorageAdapter } from '@common/core/types/storage.types';

export class ExtensionStorageAdapter implements StorageAdapter {
  private config = {
    userSecretKeyStorageKey: 'userSecretKey',
    vaultStorageKey: 'encryptedVault',
  };

  // ===== User Secret Key Storage Operations =====

  async storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.userSecretKeyStorageKey]: key });
    } catch (error) {
      throw new Error(`Failed to store user secret key: ${error}`);
    }
  }

  async updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.config.userSecretKeyStorageKey]: key });
    } catch (error) {
      throw new Error(`Failed to update user secret key: ${error}`);
    }
  }

  async deleteUserSecretKeyFromSecureLocalStorage(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.userSecretKeyStorageKey);
    } catch (error) {
      throw new Error(`Failed to delete user secret key: ${error}`);
    }
  }

  async getUserSecretKeyFromSecureLocalStorage(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(this.config.userSecretKeyStorageKey);
      return result[this.config.userSecretKeyStorageKey] || null;
    } catch (error) {
      console.error('Failed to get user secret key:', error);
      return null;
    }
  }

  // ===== Vault Storage Operations =====

  async storeVaultToSecureLocalStorage(vault: any): Promise<void> {
    try {
      const vaultString = JSON.stringify(vault);
      await chrome.storage.local.set({ [this.config.vaultStorageKey]: vaultString });
    } catch (error) {
      throw new Error(`Failed to store vault: ${error}`);
    }
  }

  async updateVaultInSecureLocalStorage(vault: any): Promise<void> {
    try {
      const vaultString = JSON.stringify(vault);
      await chrome.storage.local.set({ [this.config.vaultStorageKey]: vaultString });
    } catch (error) {
      throw new Error(`Failed to update vault: ${error}`);
    }
  }

  async deleteVaultFromSecureLocalStorage(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.config.vaultStorageKey);
    } catch (error) {
      throw new Error(`Failed to delete vault: ${error}`);
    }
  }

  async getVaultFromSecureLocalStorage(): Promise<any | null> {
    try {
      const result = await chrome.storage.local.get(this.config.vaultStorageKey);
      const vaultString = result[this.config.vaultStorageKey];
      if (!vaultString) {
        return null;
      }
      return JSON.parse(vaultString);
    } catch (error) {
      console.error('Failed to get vault:', error);
      return null;
    }
  }
} 