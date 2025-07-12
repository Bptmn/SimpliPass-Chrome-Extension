/**
 * Vault management for Chrome extension
 * Handles encrypted vault storage and state synchronization
 */

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, ItemEncrypted } from '@app/core/types/types';
import { decryptAllItems, encryptCredential, encryptBankCard, encryptSecureNote } from '@app/core/logic/cryptography';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from './localStorage';

const VAULT_KEY = 'simplipass_encrypted_vault';

type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

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

    // Separate items by type and store in states
    const credentials: CredentialDecrypted[] = [];
    const bankCards: BankCardDecrypted[] = [];
    const secureNotes: SecureNoteDecrypted[] = [];

    decryptedItems.forEach((item: DecryptedItem) => {
      if ('username' in item) {
        credentials.push(item as CredentialDecrypted);
      } else if ('cardNumber' in item) {
        bankCards.push(item as BankCardDecrypted);
      } else {
        secureNotes.push(item as SecureNoteDecrypted);
      }
    });

    // Update states
    const credentialsStore = useCredentialsStore.getState();
    const bankCardsStore = useBankCardsStore.getState();
    const secureNotesStore = useSecureNotesStore.getState();

    credentialsStore.setCredentials(credentials);
    bankCardsStore.setBankCards(bankCards);
    secureNotesStore.setSecureNotes(secureNotes);

    console.log('[Vault] Successfully loaded vault into states:', {
      credentials: credentials.length,
      bankCards: bankCards.length,
      secureNotes: secureNotes.length
    });

    return true;
  } catch (error) {
    console.error('[Vault] Failed to load vault from storage:', error);
    return false;
  }
}

/**
 * Create encrypted vault from current states and store it locally
 * @param userSecretKey User's secret key for encryption
 */
export async function createEncryptedVault(userSecretKey: string): Promise<void> {
  try {
    const credentialsStore = useCredentialsStore.getState();
    const bankCardsStore = useBankCardsStore.getState();
    const secureNotesStore = useSecureNotesStore.getState();

    const credentials = credentialsStore.credentials;
    const bankCards = bankCardsStore.bankCards;
    const secureNotes = secureNotesStore.secureNotes;

    // Encrypt all items
    const encryptedCredentials: ItemEncrypted[] = [];
    const encryptedBankCards: ItemEncrypted[] = [];
    const encryptedSecureNotes: ItemEncrypted[] = [];

    for (const credential of credentials) {
      const encrypted = await encryptCredential(userSecretKey, credential);
      encryptedCredentials.push(encrypted);
    }

    for (const bankCard of bankCards) {
      const encrypted = await encryptBankCard(userSecretKey, bankCard);
      encryptedBankCards.push(encrypted);
    }

    for (const secureNote of secureNotes) {
      const encrypted = await encryptSecureNote(userSecretKey, secureNote);
      encryptedSecureNotes.push(encrypted);
    }

    // Store encrypted vault
    const encryptedVault = {
      credentials: encryptedCredentials,
      bankCards: encryptedBankCards,
      secureNotes: encryptedSecureNotes
    };

    await setLocalStorageItem(VAULT_KEY, encryptedVault);

    console.log('[Vault] Successfully created encrypted vault:', {
      credentials: encryptedCredentials.length,
      bankCards: encryptedBankCards.length,
      secureNotes: encryptedSecureNotes.length
    });
  } catch (error) {
    console.error('[Vault] Failed to create encrypted vault:', error);
    throw error;
  }
}

/**
 * Clear the encrypted vault from local storage
 */
export async function clearVault(): Promise<void> {
  try {
    await removeLocalStorageItem(VAULT_KEY);
    console.log('[Vault] Encrypted vault cleared from storage');
  } catch (error) {
    console.error('[Vault] Failed to clear vault:', error);
    throw error;
  }
}

/**
 * Check if encrypted vault exists in storage
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