/**
 * Platform Storage Library - Layer 3: External Integration
 * 
 * Handles platform-specific storage operations.
 * Low-level operations that can be called by services.
 */

import { StorageError } from '../types/errors.types';
import { getPlatformAdapter } from './adapter.factory';

/**
 * Store user secret key encrypted in platform storage
 */
export async function storeUserSecretKeyEncrypted(encryptedKey: string): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    await adapter.storeUserSecretKey(encryptedKey);
  } catch (error) {
    throw new StorageError('Failed to store user secret key', error as Error);
  }
}

/**
 * Get user secret key from platform storage
 */
export async function getUserSecretKeyEncrypted(): Promise<string | null> {
  try {
    const adapter = await getPlatformAdapter();
    return await adapter.getUserSecretKey();
  } catch (error) {
    throw new StorageError('Failed to get user secret key', error as Error);
  }
}

/**
 * Delete user secret key from platform storage
 */
export async function deleteUserSecretKeyEncrypted(): Promise<void> {
  try {
    const adapter = await getPlatformAdapter();
    await adapter.deleteUserSecretKey();
  } catch (error) {
    throw new StorageError('Failed to delete user secret key', error as Error);
  }
} 