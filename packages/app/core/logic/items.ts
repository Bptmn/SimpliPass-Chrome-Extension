// get all items
/*
- try to get all items from statesService.ts
- if no items, then get all encrypted items from db.adapter.ts
- decrypt all items using cryptography.ts
- store all items in states using statesService.ts
*/



// get a specific item
/*
- try to get an item from statesService.ts
- if no item, then get an encrypted item from db.adapter.ts
- decrypt the item using cryptography.ts
- store the item in states using statesService.ts
*/



// add an item to the database
/*
- encrypt the item using cryptography.ts
- store the encrypted item in db.adapter.ts
- store the encrypted item in states using statesService.ts
*/



// update an item
/*
- encrypt the item using cryptography.ts
- update the encrypted item in db.adapter.ts
- update the encrypted item in states using statesService.ts
*/



// delete an item
/*
- delete the item from db.adapter.ts
- delete the item from states using statesService.ts
*/

import { db } from '@app/core/database/db.adapter';
import { getItem, setItem, removeItem } from '@app/core/database/localDB';
import { decryptItem, decryptAllItems, encryptCredential, encryptBankCard, encryptSecureNote } from '@app/core/logic/cryptography';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import { 
  ItemEncrypted, 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted,
  CredentialEncrypted,
  BankCardEncrypted,
  SecureNoteEncrypted
} from '@app/core/types/types';

type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

/**
 * Get all items with caching strategy
 * - try to get all items from statesService.ts
 * - if no items, then get all encrypted items from db.adapter.ts
 * - decrypt all items using cryptography.ts
 * - store all items in states using statesService.ts
 */
export async function getAllItems(userId: string, userSecretKey: string): Promise<DecryptedItem[]> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  try {
    // First, try to get items from state (cache)
    const stateCredentials = credentialsStore.credentials;
    const stateBankCards = bankCardsStore.bankCards;
    const stateSecureNotes = secureNotesStore.secureNotes;
    
    const totalStateItems = stateCredentials.length + stateBankCards.length + stateSecureNotes.length;
    
    if (totalStateItems > 0) {
      console.log('[Items] Returning cached items from state:', totalStateItems, 'items');
      return [...stateCredentials, ...stateBankCards, ...stateSecureNotes];
    }
    
    // If no items in state, fetch from database
    console.log('[Items] No cached items, fetching from database...');
    const encryptedItems = await db.getCollection<ItemEncrypted>(`users/${userId}/my_items`);
    
    if (encryptedItems.length === 0) {
      console.log('[Items] No items found in database');
      return [];
    }
    
    // Decrypt all items
    const decryptedItems = await decryptAllItems(userSecretKey, encryptedItems);
    
    // Store in state for future use
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
    
    // Update state
    credentialsStore.setCredentials(credentials);
    bankCardsStore.setBankCards(bankCards);
    secureNotesStore.setSecureNotes(secureNotes);
    
    console.log('[Items] Successfully loaded and cached items:', decryptedItems.length, 'items');
    return decryptedItems;
    
  } catch (error) {
    console.error('[Items] Failed to get all items:', error);
    throw error;
  }
}

/**
 * Get a specific item with caching strategy
 * - try to get an item from statesService.ts
 * - if no item, then get an encrypted item from db.adapter.ts
 * - decrypt the item using cryptography.ts
 * - store the item in states using statesService.ts
 */
export async function getItemById(
  userId: string, 
  itemId: string, 
  userSecretKey: string
): Promise<DecryptedItem | null> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  try {
    // First, try to get item from state (cache)
    const stateItem = 
      credentialsStore.credentials.find((c: CredentialDecrypted) => c.id === itemId) ||
      bankCardsStore.bankCards.find((b: BankCardDecrypted) => b.id === itemId) ||
      secureNotesStore.secureNotes.find((s: SecureNoteDecrypted) => s.id === itemId);
    
    if (stateItem) {
      console.log('[Items] Returning cached item from state:', itemId);
      return stateItem;
    }
    
    // If not in state, fetch from database
    console.log('[Items] Item not in cache, fetching from database:', itemId);
    const encryptedItem = await db.getDocument<ItemEncrypted>(`users/${userId}/my_items/${itemId}`);
    
    if (!encryptedItem) {
      console.log('[Items] Item not found in database:', itemId);
      return null;
    }
    
    // Decrypt the item
    const decryptedItem = await decryptItem(userSecretKey, encryptedItem);
    
    if (!decryptedItem) {
      console.error('[Items] Failed to decrypt item:', itemId);
      return null;
    }
    
    // Add to state for future use
    if ('username' in decryptedItem) {
      credentialsStore.addCredential(decryptedItem as CredentialDecrypted);
    } else if ('cardNumber' in decryptedItem) {
      bankCardsStore.addBankCard(decryptedItem as BankCardDecrypted);
    } else {
      secureNotesStore.addSecureNote(decryptedItem as SecureNoteDecrypted);
    }
    
    console.log('[Items] Successfully loaded and cached item:', itemId);
    return decryptedItem;
    
  } catch (error) {
    console.error('[Items] Failed to get item:', itemId, error);
    throw error;
  }
}

/**
 * Add an item to the database
 * - encrypt the item using cryptography.ts
 * - store the encrypted item in db.adapter.ts
 * - store the encrypted item in states using statesService.ts
 */
export async function addItem(
  userId: string,
  userSecretKey: string,
  item: Omit<DecryptedItem, 'id'>
): Promise<string> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  try {
    let encryptedItem: ItemEncrypted;
    let newItem: DecryptedItem;
    
    // Encrypt based on item type
    if ('username' in item) {
      const credential = item as Omit<CredentialDecrypted, 'id'>;
      encryptedItem = await encryptCredential(userSecretKey, { ...credential, id: '' });
      newItem = { ...credential, id: '' } as CredentialDecrypted;
    } else if ('cardNumber' in item) {
      const bankCard = item as Omit<BankCardDecrypted, 'id'>;
      encryptedItem = await encryptBankCard(userSecretKey, { ...bankCard, id: '' });
      newItem = { ...bankCard, id: '' } as BankCardDecrypted;
    } else {
      const secureNote = item as Omit<SecureNoteDecrypted, 'id'>;
      encryptedItem = await encryptSecureNote(userSecretKey, { ...secureNote, id: '' });
      newItem = { ...secureNote, id: '' } as SecureNoteDecrypted;
    }
    
    // Store in database
    const newId = await db.addDocument(`users/${userId}/my_items`, encryptedItem);
    
    // Update the item with the new ID
    const itemWithId = { ...newItem, id: newId } as DecryptedItem;
    
    // Add to state
    if ('username' in itemWithId) {
      credentialsStore.addCredential(itemWithId as CredentialDecrypted);
    } else if ('cardNumber' in itemWithId) {
      bankCardsStore.addBankCard(itemWithId as BankCardDecrypted);
    } else {
      secureNotesStore.addSecureNote(itemWithId as SecureNoteDecrypted);
    }
    
    console.log('[Items] Successfully added item:', newId);
    return newId;
    
  } catch (error) {
    console.error('[Items] Failed to add item:', error);
    throw error;
  }
}

/**
 * Update an item
 * - encrypt the item using cryptography.ts
 * - update the encrypted item in db.adapter.ts
 * - update the encrypted item in states using statesService.ts
 */
export async function updateItem(
  userId: string,
  itemId: string,
  userSecretKey: string,
  updates: Partial<DecryptedItem>
): Promise<void> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  try {
    // Get current item from state
    const currentItem = 
      credentialsStore.credentials.find((c: CredentialDecrypted) => c.id === itemId) ||
      bankCardsStore.bankCards.find((b: BankCardDecrypted) => b.id === itemId) ||
      secureNotesStore.secureNotes.find((s: SecureNoteDecrypted) => s.id === itemId);
    
    if (!currentItem) {
      throw new Error(`Item not found: ${itemId}`);
    }
    
    // Merge updates
    const updatedItem = { ...currentItem, ...updates } as DecryptedItem;
    
    // Encrypt the updated item
    let encryptedItem: ItemEncrypted;
    
    if ('username' in updatedItem) {
      encryptedItem = await encryptCredential(userSecretKey, updatedItem as CredentialDecrypted);
    } else if ('cardNumber' in updatedItem) {
      encryptedItem = await encryptBankCard(userSecretKey, updatedItem as BankCardDecrypted);
    } else {
      encryptedItem = await encryptSecureNote(userSecretKey, updatedItem as SecureNoteDecrypted);
    }
    
    // Update in database
    await db.updateDocument(`users/${userId}/my_items/${itemId}`, encryptedItem);
    
    // Update in state
    if ('username' in updatedItem) {
      credentialsStore.updateCredential(updatedItem as CredentialDecrypted);
    } else if ('cardNumber' in updatedItem) {
      bankCardsStore.updateBankCard(updatedItem as BankCardDecrypted);
    } else {
      secureNotesStore.updateSecureNote(updatedItem as SecureNoteDecrypted);
    }
    
    console.log('[Items] Successfully updated item:', itemId);
    
  } catch (error) {
    console.error('[Items] Failed to update item:', itemId, error);
    throw error;
  }
}

/**
 * Delete an item
 * - delete the item from db.adapter.ts
 * - delete the item from states using statesService.ts
 */
export async function deleteItem(userId: string, itemId: string): Promise<void> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  try {
    // Delete from database
    await db.deleteDocument(`users/${userId}/my_items/${itemId}`);
    
    // Remove from state
    const credentialIndex = credentialsStore.credentials.findIndex((c: CredentialDecrypted) => c.id === itemId);
    if (credentialIndex !== -1) {
      credentialsStore.removeCredential(itemId);
    } else {
      const bankCardIndex = bankCardsStore.bankCards.findIndex((b: BankCardDecrypted) => b.id === itemId);
      if (bankCardIndex !== -1) {
        bankCardsStore.removeBankCard(itemId);
      } else {
        secureNotesStore.removeSecureNote(itemId);
      }
    }
    
    console.log('[Items] Successfully deleted item:', itemId);
    
  } catch (error) {
    console.error('[Items] Failed to delete item:', itemId, error);
    throw error;
  }
}

/**
 * Clear all cached items from state
 */
export function clearItemsCache(): void {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  credentialsStore.setCredentials([]);
  bankCardsStore.setBankCards([]);
  secureNotesStore.setSecureNotes([]);
  console.log('[Items] Cleared items cache');
}

/**
 * Refresh items from database (bypass cache)
 */
export async function refreshItems(userId: string, userSecretKey: string): Promise<DecryptedItem[]> {
  console.log('[Items] Refreshing items from database...');
  clearItemsCache();
  return await getAllItems(userId, userSecretKey);
}