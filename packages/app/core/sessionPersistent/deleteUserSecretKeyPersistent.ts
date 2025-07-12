/**
 * deleteUserSecretKeyPersistent.ts
 * 
 * Deletes the persistent user secret key from storage
 */

import { removeLocalStorageItem } from '@extension/utils/localStorage';

const PERSISTENT_KEY_STORAGE_KEY = 'simplipass_persistent_user_secret_key';

/**
 * Delete the persistent user secret key from storage
 */
export async function deleteUserSecretKeyPersistent(): Promise<void> {
  try {
    console.log('[PersistentSession] Deleting persistent user secret key');
    
    await removeLocalStorageItem(PERSISTENT_KEY_STORAGE_KEY);
    
    console.log('[PersistentSession] Persistent user secret key deleted successfully');
  } catch (error) {
    console.error('[PersistentSession] Error deleting persistent user secret key:', error);
    throw new Error('Failed to delete persistent user secret key');
  }
}

/**
 * Clear all persistent session data
 * This includes the persistent key and any related session data
 */
export async function clearAllPersistentSessionData(): Promise<void> {
  try {
    console.log('[PersistentSession] Clearing all persistent session data');
    
    // Remove persistent key
    await deleteUserSecretKeyPersistent();
    
    // Remove any other session-related data
    const keysToRemove = [
      PERSISTENT_KEY_STORAGE_KEY,
      'simplipass_session_key',
      'simplipass_encrypted_vault',
      'simplipass_session_expires_at'
    ];
    
    for (const key of keysToRemove) {
      await removeLocalStorageItem(key);
    }
    
    console.log('[PersistentSession] All persistent session data cleared successfully');
  } catch (error) {
    console.error('[PersistentSession] Error clearing persistent session data:', error);
    throw new Error('Failed to clear persistent session data');
  }
} 