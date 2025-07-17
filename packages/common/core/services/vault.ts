/**
 * Vault Service - Layer2 Business Logic
 * 
 * Handles vault management operations including local storage and synchronization.
 * Orchestrates vault operations between hooks and libraries.
 */

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';
import { storage } from '../adapters/platform.storage.adapter';

type ItemDecrypted = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Store vault in local storage (clear text)
 */
export async function setLocalVault(items: ItemDecrypted[]): Promise<void> {
  try {
    if (!storage.storeVaultToSecureLocalStorage) {
      throw new Error('Local vault storage not supported on this platform');
    }
    
    // Store vault in clear text
    await storage.storeVaultToSecureLocalStorage({
      version: '1.0',
      data: JSON.stringify(items),
      createdAt: new Date(),
      updatedAt: new Date(),
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
    
    // Parse the clear text data
    return JSON.parse(vault.encryptedData);
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

 