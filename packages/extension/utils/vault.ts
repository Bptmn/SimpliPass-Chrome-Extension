/**
 * Vault management for Chrome extension
 * Handles encrypted vault storage and state synchronization
 */

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';
import { ItemEncrypted, ItemDecrypted } from '@common/core/types/items.types';
import { decryptAllItems, encryptItem } from '@common/core/services/cryptoService';

import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from './localStorage';

const VAULT_KEY = 'simplipass_encrypted_vault';

// type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Load encrypted vault from local storage and decrypt items into states
 * @param userSecretKey User's secret key for decryption
 * @returns true if vault was loaded successfully, false if no vault exists
 */
export async function loadVaultFromStorage(userSecretKey: string): Promise<boolean> {
  try {
    // Get encrypted vault from local storage
    const encryptedVault = await getLocalStorageItem<{
      credentials: ItemEncrypted[];
      bankCards: ItemEncrypted[];
      secureNotes: ItemEncrypted[];
    }>(VAULT_KEY);

    if (!encryptedVault) {
      console.log('[Vault] No encrypted vault found in storage');
      return false;
    }

    // Decrypt all items
    const allEncryptedItems: ItemEncrypted[] = [
      ...(encryptedVault.credentials || []),
      ...(encryptedVault.bankCards || []),
      ...(encryptedVault.secureNotes || [])
    ];

    if (allEncryptedItems.length === 0) {
      console.log('[Vault] Encrypted vault is empty');
      return false;
    }

    const decryptedItems = await decryptAllItems(userSecretKey, allEncryptedItems);

    // Note: State management removed as it's handled by the centralized items service

    console.log('[Vault] Successfully loaded vault into states:', {
      totalItems: decryptedItems.length
    });

    return true;
  } catch (error) {
    console.error('[Vault] Failed to load vault from storage:', error);
    return false;
  }
}

/**
 * Save current states to encrypted vault in local storage
 * @param userSecretKey User's secret key for encryption
 * @returns true if vault was saved successfully
 */
export async function saveVaultToStorage(userSecretKey: string): Promise<boolean> {
  try {
    // Note: State management removed as it's handled by the centralized items service
    const allItems: ItemDecrypted[] = [];

    if (allItems.length === 0) {
      console.log('[Vault] No items to save, skipping vault storage');
      return true;
    }

    // Separate items by type
    const credentials: CredentialDecrypted[] = [];
    const bankCards: BankCardDecrypted[] = [];
    const secureNotes: SecureNoteDecrypted[] = [];

    allItems.forEach((item: ItemDecrypted) => {
      if (item.itemType === 'credential') {
        credentials.push(item as CredentialDecrypted);
      } else if (item.itemType === 'bankCard') {
        bankCards.push(item as BankCardDecrypted);
      } else if (item.itemType === 'secureNote') {
        secureNotes.push(item as SecureNoteDecrypted);
      }
    });

    // Encrypt all items
    const encryptedCredentials: ItemEncrypted[] = [];
    const encryptedBankCards: ItemEncrypted[] = [];
    const encryptedSecureNotes: ItemEncrypted[] = [];

    // Encrypt credentials
    for (const credential of credentials) {
      const encrypted = await encryptItem(userSecretKey, credential);
      encryptedCredentials.push(encrypted);
    }

    // Encrypt bank cards
    for (const bankCard of bankCards) {
      const encrypted = await encryptItem(userSecretKey, bankCard);
      encryptedBankCards.push(encrypted);
    }

    // Encrypt secure notes
    for (const secureNote of secureNotes) {
      const encrypted = await encryptItem(userSecretKey, secureNote);
      encryptedSecureNotes.push(encrypted);
    }

    // Save to local storage
    const vaultData = {
      credentials: encryptedCredentials,
      bankCards: encryptedBankCards,
      secureNotes: encryptedSecureNotes,
      version: '1.0',
      lastUpdated: new Date().toISOString(),
    };

    await setLocalStorageItem(VAULT_KEY, vaultData);

    console.log('[Vault] Successfully saved vault to storage:', {
      credentials: encryptedCredentials.length,
      bankCards: encryptedBankCards.length,
      secureNotes: encryptedSecureNotes.length
    });

    return true;
  } catch (error) {
    console.error('[Vault] Failed to save vault to storage:', error);
    return false;
  }
}

/**
 * Clear encrypted vault from local storage
 */
export async function clearVaultFromStorage(): Promise<void> {
  try {
    await removeLocalStorageItem(VAULT_KEY);
    console.log('[Vault] Cleared vault from storage');
  } catch (error) {
    console.error('[Vault] Failed to clear vault from storage:', error);
  }
}

/**
 * Check if vault exists in local storage
 */
export async function vaultExists(): Promise<boolean> {
  try {
    const vault = await getLocalStorageItem(VAULT_KEY);
    return vault !== null;
  } catch (error) {
    console.error('[Vault] Failed to check vault existence:', error);
    return false;
  }
} 