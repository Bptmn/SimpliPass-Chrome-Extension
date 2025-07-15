/**
 * Platform Storage Library - Layer 3: External Integration
 * 
 * Handles platform-specific storage operations.
 * Low-level operations that can be called by services.
 */

import { StorageError } from '../types/errors.types';
import { platform } from './platform.adapter';

/**
 * Store user secret key encrypted in platform storage
 */
export async function storeUserSecretKeyEncrypted(encryptedKey: string): Promise<void> {
  try {
    await platform.storeUserSecretKey(encryptedKey);
  } catch (error) {
    throw new StorageError('Failed to store user secret key', error as Error);
  }
}

/**
 * Get user secret key from platform storage
 */
export async function getUserSecretKeyEncrypted(): Promise<string | null> {
  try {
    return await platform.getUserSecretKey();
  } catch (error) {
    throw new StorageError('Failed to get user secret key', error as Error);
  }
}

/**
 * Delete user secret key from platform storage
 */
export async function deleteUserSecretKeyEncrypted(): Promise<void> {
  try {
    await platform.deleteUserSecretKey();
  } catch (error) {
    throw new StorageError('Failed to delete user secret key', error as Error);
  }
} 