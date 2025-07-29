/**
 * Vault Service - Layer2 Business Logic
 * 
 * Handles vault management operations including local storage and synchronization.
 * Orchestrates vault operations between hooks and libraries.
 */

import { ItemDecrypted } from '@common/core/types/items.types';
import { storage } from '../adapters/platform.storage.adapter';

/**
 * Store vault in local storage (clear text)
 */
export async function setLocalVault(items: ItemDecrypted[]): Promise<void> {
  try {
    if (!storage.storeVaultToSecureLocalStorage) {
      throw new Error('Local vault storage not supported on this platform');
    }
    
    // Store vault in clear text
    const userId = 'current'; // This should be fetched from auth context
    await storage.storeVaultToSecureLocalStorage({
      userId,
      items,
      lastModified: new Date(),
    });
  } catch (error) {
    throw new Error(`Failed to store local vault: ${error}`);
  }
}

/**
 * Load vault from local storage (clear text)
 */
export async function getLocalVault(): Promise<ItemDecrypted[]> {
  try {
    if (!storage.getVaultFromSecureLocalStorage) {
      throw new Error('Local vault storage not supported on this platform');
    }
    
    // Get vault
    const vault = await storage.getVaultFromSecureLocalStorage();
    if (!vault) {
      return [];
    }
    // Return items from vault
    return vault.items || [];
  } catch (error) {
    throw new Error(`Failed to get local vault: ${error}`);
  }
}

/**
 * Clear local vault
 */
export async function clearLocalVault(): Promise<void> {
  try {
    if (storage.deleteVaultFromSecureLocalStorage) {
      await storage.deleteVaultFromSecureLocalStorage();
    }
  } catch (error) {
    throw new Error(`Failed to clear local vault: ${error}`);
  }
}

 