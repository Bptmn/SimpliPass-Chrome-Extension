/**
 * storeUserSecretKeyPersistent.ts
 * 
 * Stores the user secret key encrypted with device fingerprint
 * Only used when user opts in to "Remember me" functionality
 */

import { encryptData } from '@app/utils/crypto';
import { generateStableFingerprintKey, generateStableFingerprint } from './fingerprint';
import { setLocalStorageItem, getLocalStorageItem } from '@extension/utils/localStorage';

export interface PersistentKeyData {
  encryptedKey: string;
  fingerprint: string;
  expiresAt: number;
  version: string;
}

const PERSISTENT_KEY_VERSION = '1.0';
const PERSISTENT_KEY_STORAGE_KEY = 'simplipass_persistent_user_secret_key';

/**
 * Store the user secret key encrypted with device fingerprint
 * @param userSecretKey The user's secret key to store
 * @param expiresAt Timestamp when the key should expire
 */
export async function storeUserSecretKeyPersistent(
  userSecretKey: string, 
  expiresAt: number
): Promise<void> {
  try {
    console.log('[PersistentSession] Storing user secret key with device fingerprint');
    
    // Generate fingerprint key for this device
    const fingerprintKey = await generateStableFingerprintKey();
    const fingerprint = generateStableFingerprint();
    
    // Encrypt the user secret key with the fingerprint key
    const encryptedKey = await encryptData(userSecretKey, fingerprintKey);
    
    // Create the persistent key data
    const persistentKeyData: PersistentKeyData = {
      encryptedKey,
      fingerprint,
      expiresAt,
      version: PERSISTENT_KEY_VERSION,
    };
    
    // Store using platform-agnostic storage
    await setLocalStorageItem(PERSISTENT_KEY_STORAGE_KEY, persistentKeyData);
    
    console.log('[PersistentSession] User secret key stored successfully');
  } catch (error) {
    console.error('[PersistentSession] Error storing user secret key:', error);
    throw new Error('Failed to store user secret key persistently');
  }
}

/**
 * Check if persistent key storage is available and enabled
 */
export async function isPersistentKeyStorageAvailable(): Promise<boolean> {
  try {
    const data = await getLocalStorageItem(PERSISTENT_KEY_STORAGE_KEY);
    return !!data;
  } catch (error) {
    console.warn('[PersistentSession] Error checking persistent key availability:', error);
    return false;
  }
}

/**
 * Get the expiration timestamp of the stored persistent key
 */
export async function getPersistentKeyExpiration(): Promise<number | null> {
  try {
    const data = await getLocalStorageItem<PersistentKeyData>(PERSISTENT_KEY_STORAGE_KEY);
    return data?.expiresAt || null;
  } catch (error) {
    console.warn('[PersistentSession] Error getting persistent key expiration:', error);
    return null;
  }
} 