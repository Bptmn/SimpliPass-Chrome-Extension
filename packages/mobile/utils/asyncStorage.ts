/**
 * Low-level AsyncStorage CRUD operations for React Native mobile app
 * Used for storing individual items like user secret keys, emails, etc.
 */

// Note: This import will be available when @react-native-async-storage/async-storage is installed
// For now, we'll use a type declaration to avoid TypeScript errors
declare const AsyncStorage: {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiRemove(keys: string[]): Promise<void>;
};

interface AsyncStorageConfig {
  prefix?: string;
}

const DEFAULT_PREFIX = 'Simplipass_';

/**
 * Initialize the AsyncStorage (no-op for AsyncStorage, but kept for interface consistency)
 */
export const initDB = async (_config: AsyncStorageConfig = {}): Promise<void> => {
  // AsyncStorage doesn't need initialization, but we keep this for interface consistency
  return Promise.resolve();
};

/**
 * Create or update a single item in AsyncStorage
 */
export const setItem = async <T>(
  key: string, 
  value: T, 
  config: AsyncStorageConfig = {}
): Promise<void> => {
  const { prefix = DEFAULT_PREFIX } = config;
  const fullKey = `${prefix}${key}`;
  
  try {
    const item = { 
      key, 
      value, 
      timestamp: Date.now() 
    };
    await AsyncStorage.setItem(fullKey, JSON.stringify(item));
  } catch (error) {
    throw new Error(`Failed to store item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Retrieve a single item from AsyncStorage
 */
export const getItem = async <T>(
  key: string, 
  config: AsyncStorageConfig = {}
): Promise<T | null> => {
  const { prefix = DEFAULT_PREFIX } = config;
  const fullKey = `${prefix}${key}`;
  
  try {
    const itemString = await AsyncStorage.getItem(fullKey);
    if (!itemString) {
      return null;
    }
    
    const item = JSON.parse(itemString);
    return item.value;
  } catch (error) {
    throw new Error(`Failed to retrieve item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a single item from AsyncStorage
 */
export const removeItem = async (
  key: string, 
  config: AsyncStorageConfig = {}
): Promise<void> => {
  const { prefix = DEFAULT_PREFIX } = config;
  const fullKey = `${prefix}${key}`;
  
  try {
    await AsyncStorage.removeItem(fullKey);
  } catch (error) {
    throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if an item exists in AsyncStorage
 */
export const hasItem = async (
  key: string, 
  config: AsyncStorageConfig = {}
): Promise<boolean> => {
  const { prefix = DEFAULT_PREFIX } = config;
  const fullKey = `${prefix}${key}`;
  
  try {
    const item = await AsyncStorage.getItem(fullKey);
    return item !== null;
  } catch (error) {
    throw new Error(`Failed to check item existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get all keys from AsyncStorage
 */
export const getAllKeys = async (
  config: AsyncStorageConfig = {}
): Promise<string[]> => {
  const { prefix = DEFAULT_PREFIX } = config;
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    // Filter keys that match our prefix and remove the prefix from the returned keys
    return allKeys
      .filter((key: string) => key.startsWith(prefix))
      .map((key: string) => key.replace(prefix, ''));
  } catch (error) {
    throw new Error(`Failed to get all keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Clear all items from AsyncStorage
 */
export const clearAll = async (
  config: AsyncStorageConfig = {}
): Promise<void> => {
  const { prefix = DEFAULT_PREFIX } = config;
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter((key: string) => key.startsWith(prefix));
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    throw new Error(`Failed to clear store: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete the entire database (clear all items with our prefix)
 */
export const deleteDB = async (
  config: AsyncStorageConfig = {}
): Promise<void> => {
  return clearAll(config);
};

/**
 * Get database size (approximate)
 */
export const getDBSize = async (
  _config: AsyncStorageConfig = {}
): Promise<number> => {
  const { prefix = DEFAULT_PREFIX } = _config;
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter((key: string) => key.startsWith(prefix)).length;
  } catch (error) {
    throw new Error(`Failed to get database size: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Utility function to check if AsyncStorage is supported
 */
export const isAsyncStorageSupported = (): boolean => {
  return typeof AsyncStorage !== 'undefined';
};

/**
 * Utility function to get database info
 */
export const getDBInfo = async (
  _config: AsyncStorageConfig = {}
): Promise<{ name: string; version: number; stores: string[] }> => {
  try {
    return {
      name: 'AsyncStorage',
      version: 1,
      stores: ['default'] // AsyncStorage doesn't have multiple stores like IndexedDB
    };
  } catch (error) {
    throw new Error(`Failed to get database info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get storage size in bytes (approximate)
 */
export const getStorageSize = async (
  config: AsyncStorageConfig = {}
): Promise<number> => {
  const { prefix = DEFAULT_PREFIX } = config;
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    let totalSize = 0;
    for (const key of allKeys.filter((key: string) => key.startsWith(prefix)) as string[]) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
    
    return totalSize;
  } catch (error) {
    throw new Error(`Failed to get storage size: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 