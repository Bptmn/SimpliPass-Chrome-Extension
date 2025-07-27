/**
 * Secret Management Service - Layer 2 Business Logic
 * 
 * Handles user secret key operations (storage, retrieval, deletion).
 */

import { storage } from '../adapters/platform.storage.adapter';
import { deriveKey } from '../../utils/crypto';
import { auth } from '../adapters/auth.adapter';

/**
 * Get user secret key from platform secure storage
 */
export async function getUserSecretKey(): Promise<string | null> {
  try {
    const userSecretKey = await storage.getUserSecretKeyFromSecureLocalStorage();
    return userSecretKey;
  } catch (error) {
    console.error('[Secret] Failed to get user secret key:', error);
    return null;
  }
}

/**
 * Store user secret key in platform secure storage
 */
export async function storeUserSecretKey(key: string): Promise<void> {
  try {
    // 1. Validate the key
    if (!key || key.length < 32) {
      throw new Error('Invalid user secret key');
    }

    // 2. Store in secure local storage (clear text)
    await storage.storeUserSecretKeyToSecureLocalStorage(key);
    
    console.log('[Secret] User secret key stored successfully');
  } catch (error) {
    console.error('[Secret] Failed to store user secret key:', error);
    throw error;
  }
}

/**
 * Delete user secret key from platform secure storage
 */
export async function deleteUserSecretKey(): Promise<void> {
  try {
    await storage.deleteUserSecretKeyFromSecureLocalStorage();
    console.log('[Secret] User secret key deleted successfully');
  } catch (error) {
    console.error('[Secret] Failed to delete user secret key:', error);
    throw error;
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

export async function deriveAndStoreUserSecretKey(password: string): Promise<void> {
  // 1. Get user salt from Cognito attributes
  const userSalt = await auth.fetchUserSalt();
  // 2. Derive user secret key
  const userSecretKey = await deriveKey(password, userSalt);
  // 3. Store in local storage
  await storeUserSecretKey(userSecretKey);
} 