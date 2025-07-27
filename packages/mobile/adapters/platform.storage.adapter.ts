/**
 * Mobile Storage Adapter Implementation
 * 
 * Handles all mobile-specific storage functionality including:
 * - iOS Keychain / Android Keystore access for secure storage
 * - Mobile-specific vault storage
 */

import { StorageAdapter } from '@common/core/adapters/platform.storage.adapter';
import { User } from '@common/core/types/auth.types';

export class MobileStorageAdapter implements StorageAdapter {
  private config = {
    userSecretKeyStorageKey: 'userSecretKey',
    userStorageKey: 'user',
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

  // ===== User Object Storage Operations =====

  async storeUserToSecureLocalStorage(user: User): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      const userString = JSON.stringify(user);
      await SecureStore.setItemAsync(this.config.userStorageKey, userString);
    } catch (error) {
      throw new Error(`Failed to store user: ${error}`);
    }
  }

  async updateUserInSecureLocalStorage(user: User): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      const userString = JSON.stringify(user);
      await SecureStore.setItemAsync(this.config.userStorageKey, userString);
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  async deleteUserFromSecureLocalStorage(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.userStorageKey);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async getUserFromSecureLocalStorage(): Promise<User | null> {
    try {
      const SecureStore = await this.getSecureStore();
      const userString = await SecureStore.getItemAsync(this.config.userStorageKey);
      if (!userString) {
        return null;
      }
      return JSON.parse(userString);
    } catch (error) {
      console.error('Failed to get user:', error);
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

  async clearAllSecureLocalStorage(): Promise<void> {
    try {
      const SecureStore = await this.getSecureStore();
      await SecureStore.deleteItemAsync(this.config.userSecretKeyStorageKey);
      await SecureStore.deleteItemAsync(this.config.userStorageKey);
      await SecureStore.deleteItemAsync(this.config.vaultStorageKey);
    } catch (error) {
      throw new Error(`Failed to clear all secure local storage: ${error}`);
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