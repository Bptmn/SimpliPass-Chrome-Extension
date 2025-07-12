/**
 * Extension-specific local storage implementation
 * Uses chrome.storage.local for secure storage
 */

export interface LocalStorageAdapter {
  setItem(key: string, value: unknown): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Extension localStorage implementation using chrome.storage.local
const extensionLocalStorage: LocalStorageAdapter = {
  async setItem(key: string, value: unknown): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      throw new Error('Chrome storage not available');
    }
  },
  
  async getItem<T>(key: string): Promise<T | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    } else {
      throw new Error('Chrome storage not available');
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove([key]);
    } else {
      throw new Error('Chrome storage not available');
    }
  },
  
  async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.clear();
    } else {
      throw new Error('Chrome storage not available');
    }
  },
  
  async getAllKeys(): Promise<string[]> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(null);
      return Object.keys(result);
    } else {
      throw new Error('Chrome storage not available');
    }
  }
};

// Get the extension localStorage implementation
export function getExtensionLocalStorage(): LocalStorageAdapter {
  return extensionLocalStorage;
}

// Convenience functions
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