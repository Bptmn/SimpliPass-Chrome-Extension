/**
 * Mobile Storage Adapter Implementation
 * 
 * Handles all mobile-specific storage functionality including:
 * - iOS Keychain / Android Keystore access for secure storage
 * - Mobile-specific vault storage
 */

import { StorageAdapter } from '@common/core/types/storage.types';

export class MobileStorageAdapter implements StorageAdapter {
  private config = {
    userSecretKeyStorageKey: 'userSecretKey',
    vaultStorageKey: 'encryptedVault',
  };

  // ===== User Secret Key Storage Operations =====

  async storeUserSecretKeyToSecureLocalStorage(key: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync(this.config.userSecretKeyStorageKey, key);
    } catch (error) {
      throw new Error(`Failed to store user secret key: ${error}`);
    }
  }

  async updateUserSecretKeyInSecureLocalStorage(key: string): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.setItemAsync(this.config.userSecretKeyStorageKey, key);
    } catch (error) {
      throw new Error(`Failed to update user secret key: ${error}`);
    }
  }

  async deleteUserSecretKeyFromSecureLocalStorage(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.userSecretKeyStorageKey);
    } catch (error) {
      throw new Error(`Failed to delete user secret key: ${error}`);
    }
  }

  async getUserSecretKeyFromSecureLocalStorage(): Promise<string | null> {
    try {
      const SecureStore = await this.getSecureStore();
      return await SecureStore.getItemAsync(this.config.userSecretKeyStorageKey);
    } catch (error) {
      console.error('Failed to get user secret key:', error);
      return null;
    }
  }

  // ===== Vault Storage Operations =====

  async storeVaultToSecureLocalStorage(vault: any): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      const vaultString = JSON.stringify(vault);
      await SecureStore.setItemAsync(this.config.vaultStorageKey, vaultString);
    } catch (error) {
      throw new Error(`Failed to store vault: ${error}`);
    }
  }

  async updateVaultInSecureLocalStorage(vault: any): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      const vaultString = JSON.stringify(vault);
      await SecureStore.setItemAsync(this.config.vaultStorageKey, vaultString);
    } catch (error) {
      throw new Error(`Failed to update vault: ${error}`);
    }
  }

  async deleteVaultFromSecureLocalStorage(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.vaultStorageKey);
    } catch (error) {
      throw new Error(`Failed to delete vault: ${error}`);
    }
  }

  async getVaultFromSecureLocalStorage(): Promise<any | null> {
    try {
      const SecureStore = await this.getSecureStore();
      const vaultString = await SecureStore.getItemAsync(this.config.vaultStorageKey);
      if (!vaultString) {
        return null;
      }
      return JSON.parse(vaultString);
    } catch (error) {
      console.error('Failed to get vault:', error);
      return null;
    }
  }

  // ===== Private Helper Methods =====

  private async getSecureStore() {
    try {
      return await import('expo-secure-store');
    } catch {
      throw new Error('SecureStore not available');
    }
  }
} 