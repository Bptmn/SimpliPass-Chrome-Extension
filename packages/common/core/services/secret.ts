/**
 * Secret Management Service - Layer 2: Business Logic
 * 
 * Handles user secret key operations (storage, retrieval, deletion).
 * Manages device fingerprint for encryption.
 */

import { AuthenticationError } from '../types/errors.types';
import { platform } from '../platform';
import { encryptWithDeviceFingerprintKey, decryptWithDeviceFingerprintKey } from './cryptography';
import { useAuthStore } from '../states/auth.state';
import { deriveKey } from '../../utils/crypto';
import { auth } from '../adapters/auth.adapter';

/**
 * Get user secret key from state or platform storage
 */
export async function getUserSecretKey(): Promise<string | null> {
  const session = useAuthStore.getState().session;
  if (!session) {
    throw new AuthenticationError('User not authenticated');
  }
  try {
    const encryptedKey = await platform.getUserSecretKey();
    if (!encryptedKey) {
      return null;
    }
    // Decrypt the key using device fingerprint
    return await decryptWithDeviceFingerprintKey(encryptedKey);
  } catch (error) {
    console.error('[Secret] Failed to get user secret key:', error);
    return null;
  }
}

/**
 * Store user secret key in state and platform storage
 */
export async function storeUserSecretKey(key: string): Promise<void> {
  try {
    // 1. Validate the key
    if (!key || key.length < 32) {
      throw new Error('Invalid user secret key');
    }
    // 2. Encrypt the key using device fingerprint
    const encryptedKey = await encryptWithDeviceFingerprintKey(key);

    // 3. Store in platform storage (encrypted)
    await platform.storeUserSecretKey(encryptedKey);
    
    // 4. Update Zustand state
    useAuthStore.getState().setUserSecretKey(key);
    console.log('[Secret] User secret key stored successfully');
  } catch (error) {
    console.error('[Secret] Failed to store user secret key:', error);
    throw error;
  }
}

/**
 * Delete user secret key from state and platform storage
 */
export async function deleteUserSecretKey(): Promise<void> {
  try {
    // Clear from Zustand state
    useAuthStore.getState().clearUserSecretKey();
    await platform.deleteUserSecretKey();
    console.log('[Secret] User secret key deleted successfully');
  } catch (error) {
    console.error('[Secret] Failed to delete user secret key:', error);
    throw error;
  }
}

/**
 * Get device fingerprint for encryption
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    return await platform.getDeviceFingerprint();
  } catch (error) {
    console.error('[Secret] Failed to get device fingerprint:', error);
    throw error;
  }
}

/**
 * Generate device fingerprint key from device fingerprint and user salt
 */
export async function generateDeviceFingerprintKey(): Promise<string> {
  try {
    // 1. Get device fingerprint from platform adapter
    const deviceFingerprint = await getDeviceFingerprint();
    
    // 2. Get user salt from Cognito attributes
    const userSalt = await auth.getUserSalt();
    
    // 3. Derive a proper cryptographic key from device fingerprint and user salt
    const deviceFingerprintKey = await deriveKey(deviceFingerprint, userSalt);
    
    return deviceFingerprintKey;
  } catch (error) {
    console.error('[Secret] Failed to generate device fingerprint key:', error);
    throw new Error(`Failed to generate device fingerprint key: ${error}`);
  }
}

/**
 * Check if user secret key exists
 */
export async function hasUserSecretKey(): Promise<boolean> {
  try {
    const key = await getUserSecretKey();
    return key !== null;
  } catch {
    return false;
  }
} 

export async function initializeUserSecretKey(password: string): Promise<void> {
  // 1. Get user salt from Cognito attributes
  const userSalt = await auth.getUserSalt();
  // 2. Derive user secret key
  const userSecretKey = await deriveKey(password, userSalt);
  // 3. Store in state and local storage
  await storeUserSecretKey(userSecretKey);
} 