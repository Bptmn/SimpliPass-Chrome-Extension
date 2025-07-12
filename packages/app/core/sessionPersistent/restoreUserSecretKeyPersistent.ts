/**
 * restoreUserSecretKeyPersistent.ts
 * 
 * Restores the user secret key from persistent storage using device fingerprint
 */

import { decryptData } from '@app/utils/crypto';
import { generateStableFingerprintKey, validateDeviceFingerprint } from './fingerprint';
import { PersistentKeyData } from './storeUserSecretKeyPersistent';
import { getLocalStorageItem, removeLocalStorageItem } from '@extension/utils/localStorage';

const PERSISTENT_KEY_STORAGE_KEY = 'simplipass_persistent_user_secret_key';

export interface RestoreResult {
  success: boolean;
  userSecretKey?: string;
  error?: string;
  reason?: 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';
}

/**
 * Restore the user secret key from persistent storage
 * @returns RestoreResult with success status and key if successful
 */
export async function restoreUserSecretKeyPersistent(): Promise<RestoreResult> {
  try {
    console.log('[PersistentSession] Attempting to restore user secret key');
    
    // Get stored persistent key data
    const data = await getLocalStorageItem<PersistentKeyData>(PERSISTENT_KEY_STORAGE_KEY);
    
    if (!data) {
      console.log('[PersistentSession] No persistent key found');
      return {
        success: false,
        reason: 'not_found'
      };
    }
    
    // Validate version
    if (data.version !== '1.0') {
      console.warn('[PersistentSession] Incompatible persistent key version:', data.version);
      return {
        success: false,
        reason: 'corrupted'
      };
    }
    
    // Check expiration
    const now = Date.now();
    if (data.expiresAt && now > data.expiresAt) {
      console.log('[PersistentSession] Persistent key has expired');
      // Clean up expired key
      await removeLocalStorageItem(PERSISTENT_KEY_STORAGE_KEY);
      return {
        success: false,
        reason: 'expired'
      };
    }
    
    // Validate device fingerprint
    if (!validateDeviceFingerprint(data.fingerprint)) {
      console.warn('[PersistentSession] Device fingerprint mismatch');
      return {
        success: false,
        reason: 'fingerprint_mismatch'
      };
    }
    
    // Generate fingerprint key for decryption
    const fingerprintKey = await generateStableFingerprintKey();
    
    // Decrypt the user secret key
    const userSecretKey = await decryptData(data.encryptedKey, fingerprintKey);
    
    if (!userSecretKey) {
      console.error('[PersistentSession] Failed to decrypt user secret key');
      return {
        success: false,
        reason: 'decryption_failed'
      };
    }
    
    console.log('[PersistentSession] User secret key restored successfully');
    return {
      success: true,
      userSecretKey
    };
    
  } catch (error) {
    console.error('[PersistentSession] Error restoring user secret key:', error);
    return {
      success: false,
      reason: 'decryption_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a persistent key exists and is valid (not expired)
 */
export async function hasValidPersistentKey(): Promise<boolean> {
  try {
    const data = await getLocalStorageItem<PersistentKeyData>(PERSISTENT_KEY_STORAGE_KEY);
    
    if (!data) {
      return false;
    }
    
    // Check expiration
    const now = Date.now();
    if (data.expiresAt && now > data.expiresAt) {
      return false;
    }
    
    // Check fingerprint
    if (!validateDeviceFingerprint(data.fingerprint)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('[PersistentSession] Error checking persistent key validity:', error);
    return false;
  }
} 