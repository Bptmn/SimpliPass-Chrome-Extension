/**
 * Secure storage operations for React Native using react-native-keychain
 * Provides hardware-backed secure storage (Keychain on iOS, Keystore on Android)
 */

import * as Keychain from 'react-native-keychain';

interface SecureStorageConfig {
  service?: string;
  accessControl?: Keychain.ACCESS_CONTROL;
  accessible?: Keychain.ACCESSIBLE;
}

const DEFAULT_SERVICE = 'com.simplipass.app';

/**
 * Initialize secure storage (no-op for keychain, but kept for API consistency)
 */
export const initSecureStorage = async (
  config: SecureStorageConfig = {}
): Promise<void> => {
  // Keychain doesn't need initialization, but we can check if it's available
  try {
    await Keychain.getSupportedBiometryType();
  } catch (error) {
    throw new Error(`Keychain not available: ${error}`);
  }
};

/**
 * Store a secure item in the keychain
 */
export const setSecureItem = async <T>(
  key: string,
  value: T,
  config: SecureStorageConfig = {}
): Promise<void> => {
  const { service = DEFAULT_SERVICE, accessControl, accessible } = config;
  
  try {
    const serializedValue = JSON.stringify(value);
    
    const options: Keychain.Options = {
      service,
      accessControl,
      accessible,
    };
    
    await Keychain.setInternetCredentials(key, key, serializedValue, options);
  } catch (error) {
    throw new Error(`Failed to store secure item: ${error}`);
  }
};

/**
 * Retrieve a secure item from the keychain
 */
export const getSecureItem = async <T>(
  key: string,
  config: SecureStorageConfig = {}
): Promise<T | null> => {
  const { service = DEFAULT_SERVICE } = config;
  
  try {
    const credentials = await Keychain.getInternetCredentials(service);
    
    if (!credentials || credentials.username !== key) {
      return null;
    }
    
    return JSON.parse(credentials.password);
  } catch (error) {
    // If item doesn't exist, return null instead of throwing
    if (error === Keychain.ERRORS.ITEM_NOT_FOUND) {
      return null;
    }
    throw new Error(`Failed to retrieve secure item: ${error}`);
  }
};

/**
 * Delete a secure item from the keychain
 */
export const removeSecureItem = async (
  key: string,
  config: SecureStorageConfig = {}
): Promise<void> => {
  const { service = DEFAULT_SERVICE } = config;
  
  try {
    await Keychain.resetInternetCredentials(service);
  } catch (error) {
    throw new Error(`Failed to remove secure item: ${error}`);
  }
};

/**
 * Check if a secure item exists in the keychain
 */
export const hasSecureItem = async (
  key: string,
  config: SecureStorageConfig = {}
): Promise<boolean> => {
  const { service = DEFAULT_SERVICE } = config;
  
  try {
    const credentials = await Keychain.getInternetCredentials(service);
    return credentials !== false && credentials.username === key;
  } catch (error) {
    return false;
  }
};

/**
 * Get all keys from the keychain (limited functionality)
 * Note: Keychain doesn't provide a direct way to list all items
 */
export const getAllSecureKeys = async (
  config: SecureStorageConfig = {}
): Promise<string[]> => {
  // Keychain doesn't provide a way to list all items for security reasons
  // This is a limitation of the platform APIs
  throw new Error('Keychain does not support listing all keys for security reasons');
};

/**
 * Clear all secure items from the keychain
 */
export const clearAllSecureItems = async (
  config: SecureStorageConfig = {}
): Promise<void> => {
  try {
    await Keychain.clearAll();
  } catch (error) {
    throw new Error(`Failed to clear all secure items: ${error}`);
  }
};

/**
 * Check if secure storage is supported
 */
export const isSecureStorageSupported = (): boolean => {
  return true; // Keychain is always available on React Native
};

/**
 * Get secure storage info
 */
export const getSecureStorageInfo = async (): Promise<{
  type: string;
}> => {
  return {
    type: 'keychain',
  };
}; 