/**
 * Mobile-specific local storage implementation
 * Uses secure storage (keychain) for sensitive data
 */

export interface LocalStorageAdapter {
  setItem(key: string, value: unknown): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Mobile localStorage implementation using secure storage
const mobileLocalStorage: LocalStorageAdapter = {
  async setItem(_key: string, _value: unknown): Promise<void> {
    // TODO: Implement setItem for secure storage
    throw new Error('setItem not implemented for secure storage');
  },
  
  async getItem<T>(_key: string): Promise<T | null> {
    // TODO: Implement getItem for secure storage
    throw new Error('getItem not implemented for secure storage');
  },
  
  async removeItem(_key: string): Promise<void> {
    // TODO: Implement removeItem for secure storage
    throw new Error('removeItem not implemented for secure storage');
  },
  
  async clear(): Promise<void> {
    // TODO: Implement clear for secure storage
    // This might need to be implemented differently for keychain
    throw new Error('Clear not implemented for secure storage');
  },
  
  async getAllKeys(): Promise<string[]> {
    // TODO: Implement getAllKeys for secure storage
    // Keychain doesn't support listing all keys for security reasons
    throw new Error('getAllKeys not supported for secure storage');
  }
};

// Get the mobile localStorage implementation
export function getMobileLocalStorage(): LocalStorageAdapter {
  return mobileLocalStorage;
}

// Convenience functions
export async function setLocalStorageItem(_key: string, _value: unknown): Promise<void> {
  const storage = getMobileLocalStorage();
  await storage.setItem(_key, _value);
}

export async function getLocalStorageItem<T>(_key: string): Promise<T | null> {
  const storage = getMobileLocalStorage();
  return await storage.getItem<T>(_key);
}

export async function removeLocalStorageItem(_key: string): Promise<void> {
  const storage = getMobileLocalStorage();
  await storage.removeItem(_key);
}

export async function clearLocalStorage(): Promise<void> {
  const storage = getMobileLocalStorage();
  await storage.clear();
}

export async function getAllLocalStorageKeys(): Promise<string[]> {
  const storage = getMobileLocalStorage();
  return await storage.getAllKeys();
} 