/**
 * Extension-specific local storage implementation
 * Thin wrapper around platform storage adapter for extension-specific needs
 */

import { storage } from '@common/core/adapters/platform.storage.adapter';

export interface LocalStorageAdapter {
  setItem(key: string, value: unknown): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Extension localStorage implementation using platform storage adapter
const extensionLocalStorage: LocalStorageAdapter = {
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      // Use platform storage adapter for secure storage
      await storage.storeVaultToSecureLocalStorage({ [key]: value });
    } catch (error) {
      throw new Error(`Failed to set item ${key}: ${error}`);
    }
  },
  
  async getItem<T>(key: string): Promise<T | null> {
    try {
      // Use platform storage adapter for secure storage
      const vault = await storage.getVaultFromSecureLocalStorage();
      if (!vault || !vault[key]) {
        return null;
      }
      return vault[key] as T;
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      // Get current vault, remove key, and store back
      const vault = await storage.getVaultFromSecureLocalStorage();
      if (vault && vault[key]) {
        delete vault[key];
        await storage.updateVaultInSecureLocalStorage(vault);
      }
    } catch (error) {
      throw new Error(`Failed to remove item ${key}: ${error}`);
    }
  },
  
  async clear(): Promise<void> {
    try {
      await storage.clearAllSecureLocalStorage();
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  },
  
  async getAllKeys(): Promise<string[]> {
    try {
      const vault = await storage.getVaultFromSecureLocalStorage();
      return vault ? Object.keys(vault) : [];
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
};

// Get the extension localStorage implementation
export function getExtensionLocalStorage(): LocalStorageAdapter {
  return extensionLocalStorage;
}

// Convenience functions using platform storage adapter
export async function setLocalStorageItem(key: string, value: unknown): Promise<void> {
  const storage = getExtensionLocalStorage();
  await storage.setItem(key, value);
}

export async function getLocalStorageItem<T>(key: string): Promise<T | null> {
  const storage = getExtensionLocalStorage();
  return await storage.getItem<T>(key);
}

export async function removeLocalStorageItem(key: string): Promise<void> {
  const storage = getExtensionLocalStorage();
  await storage.removeItem(key);
}

export async function clearLocalStorage(): Promise<void> {
  const storage = getExtensionLocalStorage();
  await storage.clear();
}

export async function getAllLocalStorageKeys(): Promise<string[]> {
  const storage = getExtensionLocalStorage();
  return await storage.getAllKeys();
} 