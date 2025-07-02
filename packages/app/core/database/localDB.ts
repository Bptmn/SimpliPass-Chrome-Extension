/**
 * Agnostic local database operations
 * Automatically uses the appropriate storage mechanism based on platform:
 * - Web/Extension: IndexedDB
 * - Mobile: react-native-keychain (secure storage)
 */

import { Platform } from 'react-native';

// Import platform-specific implementations
import * as IndexedDB from '@extension/utils/indexedDB';

// Mobile secure storage will be imported conditionally
interface SecureStorageModule {
  initSecureStorage: (config: StorageConfig) => Promise<void>;
  setSecureItem: <T>(key: string, value: T, config: StorageConfig) => Promise<void>;
  getSecureItem: <T>(key: string, config: StorageConfig) => Promise<T | null>;
  removeSecureItem: (key: string, config: StorageConfig) => Promise<void>;
  hasSecureItem: (key: string, config: StorageConfig) => Promise<boolean>;
  clearAllSecureItems: (config: StorageConfig) => Promise<void>;
  isSecureStorageSupported: () => boolean;
  getSecureStorageInfo: () => Promise<any>;
}

let SecureStorage: SecureStorageModule | null = null;

// Initialize secure storage module only on mobile
const initSecureStorageModule = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    try {
      const module = await import('../../../mobile/utils/secureStorage');
      SecureStorage = module as SecureStorageModule;
    } catch {
      console.error('Failed to initialize mobile storage');
    }
  }
};

// Initialize on module load
initSecureStorageModule();

interface StorageConfig {
  // IndexedDB config
  dbName?: string;
  storeName?: string;
  version?: number;
  // Secure storage config
  service?: string;
  accessControl?: any;
  accessible?: any;
}

/**
 * Detect the current platform
 */
const getPlatform = (): 'web' | 'mobile' => {
  if (Platform.OS === 'web') {
    return 'web';
  }
  return 'mobile';
};

/**
 * Initialize the appropriate storage system
 */
export const initStorage = async (config: StorageConfig = {}): Promise<void> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    await IndexedDB.initDB(config);
  } else if (platform === 'mobile' && SecureStorage) {
    await SecureStorage.initSecureStorage(config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Store an item using the appropriate storage system
 */
export const setItem = async <T>(
  key: string,
  value: T,
  config: StorageConfig = {}
): Promise<void> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    await IndexedDB.setItem(key, value, config);
  } else if (platform === 'mobile' && SecureStorage) {
    await SecureStorage.setSecureItem(key, value, config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Retrieve an item using the appropriate storage system
 */
export const getItem = async <T>(
  key: string,
  config: StorageConfig = {}
): Promise<T | null> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return await IndexedDB.getItem<T>(key, config);
  } else if (platform === 'mobile' && SecureStorage) {
    return await SecureStorage.getSecureItem<T>(key, config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Delete an item using the appropriate storage system
 */
export const removeItem = async (
  key: string,
  config: StorageConfig = {}
): Promise<void> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    await IndexedDB.removeItem(key, config);
  } else if (platform === 'mobile' && SecureStorage) {
    await SecureStorage.removeSecureItem(key, config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Check if an item exists using the appropriate storage system
 */
export const hasItem = async (
  key: string,
  config: StorageConfig = {}
): Promise<boolean> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return await IndexedDB.hasItem(key, config);
  } else if (platform === 'mobile' && SecureStorage) {
    return await SecureStorage.hasSecureItem(key, config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Get all keys (web only - not supported on mobile for security)
 */
export const getAllKeys = async (
  config: StorageConfig = {}
): Promise<string[]> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return await IndexedDB.getAllKeys(config);
  } else {
    throw new Error('Getting all keys is not supported on mobile for security reasons');
  }
};

/**
 * Clear all items using the appropriate storage system
 */
export const clearAll = async (config: StorageConfig = {}): Promise<void> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    await IndexedDB.clearAll(config);
  } else if (platform === 'mobile' && SecureStorage) {
    await SecureStorage.clearAllSecureItems(config);
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Delete the entire database (web only)
 */
export const deleteDB = async (config: StorageConfig = {}): Promise<void> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    await IndexedDB.deleteDB(config);
  } else {
    throw new Error('Deleting database is not supported on mobile');
  }
};

/**
 * Get storage size (web only)
 */
export const getStorageSize = async (config: StorageConfig = {}): Promise<number> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return await IndexedDB.getDBSize(config);
  } else {
    throw new Error('Getting storage size is not supported on mobile');
  }
};

/**
 * Check if storage is supported on the current platform
 */
export const isStorageSupported = (): boolean => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return IndexedDB.isIndexedDBSupported();
  } else if (platform === 'mobile') {
    return SecureStorage ? SecureStorage.isSecureStorageSupported() : false;
  }
  
  return false;
};

/**
 * Get storage information for the current platform
 */
export const getStorageInfo = async (config: StorageConfig = {}): Promise<any> => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    return await IndexedDB.getDBInfo(config);
  } else if (platform === 'mobile' && SecureStorage) {
    return await SecureStorage.getSecureStorageInfo();
  } else {
    throw new Error('No suitable storage system available for this platform');
  }
};

/**
 * Get the current platform
 */
export const getCurrentPlatform = (): 'web' | 'mobile' => {
  return getPlatform();
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
  return getPlatform() === 'web';
};

/**
 * Check if running on mobile
 */
export const isMobile = (): boolean => {
  return getPlatform() === 'mobile';
};
