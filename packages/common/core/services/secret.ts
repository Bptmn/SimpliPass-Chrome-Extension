/**
 * Secret Management Service - Layer 2: Business Logic
 * 
 * Handles user secret key operations (storage, retrieval, deletion).
 * Manages device fingerprint for encryption.
 */

import { AuthenticationError } from '../types/errors.types';
import { getPlatformAdapter } from '../platform';
import { encryptWithDeviceFingerprint, decryptWithDeviceFingerprint } from './cryptography';
import { useAuthStore } from '../states/auth.state';
import { fetchUserAttributesCognito } from '../libraries/auth/cognito';
import { deriveKey } from '../../utils/crypto';

/**
 * Get user secret key from state or platform storage
 */
export async function getUserSecretKey(): Promise<string | null> {
  // 1. Check Zustand state first
  const keyInState = useAuthStore.getState().userSecretKey;
  if (keyInState) {
    return keyInState;
  }
  try {
    const adapter = await getPlatformAdapter();
    const encryptedKey = await adapter.getUserSecretKey();
    if (!encryptedKey) {
      return null;
    }
    // Decrypt the key using device fingerprint
    const decryptedKey = await decryptWithDeviceFingerprint(encryptedKey);
    // Store in state for future use
    useAuthStore.getState().setUserSecretKey(decryptedKey);
    return decryptedKey;
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
    // 1. Store in Zustand state (clear)
    useAuthStore.getState().setUserSecretKey(key);

    // 2. Encrypt the key using device fingerprint
    const encryptedKey = await encryptWithDeviceFingerprint(key);
    const adapter = await getPlatformAdapter();

    // 3. Store in platform storage (encrypted)
    await adapter.storeUserSecretKey(encryptedKey);
    
    console.log('[Secret] User secret key stored successfully');
  } catch (error) {
    console.error('[Secret] Failed to store user secret key:', error);
    throw new AuthenticationError('Failed to store user secret key', error as Error);
  }
}

/**
 * Delete user secret key from state and platform storage
 */
export async function deleteUserSecretKey(): Promise<void> {
  try {
    // Clear from Zustand state
    useAuthStore.getState().clearUserSecretKey();
    const adapter = await getPlatformAdapter();
    await adapter.deleteUserSecretKey();
    console.log('[Secret] User secret key deleted successfully');
  } catch (error) {
    console.error('[Secret] Failed to delete user secret key:', error);
    throw new AuthenticationError('Failed to delete user secret key', error as Error);
  }
}

/**
 * Get device fingerprint for encryption
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const adapter = await getPlatformAdapter();
    return await adapter.getDeviceFingerprint();
  } catch (error) {
    console.warn('[Secret] Failed to get device fingerprint:', error);
    return `device_${Date.now()}`;
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
  // 1. Fetch user attributes from Cognito
  const attributes = await fetchUserAttributesCognito();
  const userSalt = attributes['custom:salt'] as string;
  if (!userSalt) {
    throw new Error('User salt not found in Cognito attributes');
  }
  // 2. Derive user secret key
  const userSecretKey = await deriveKey(password, userSalt);
  // 3. Store in state and local storage
  await storeUserSecretKey(userSecretKey);
} 