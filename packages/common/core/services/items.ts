/**
 * Items Service - Layer 2: Business Logic
 * 
 * Handles item operations (add, update, delete, get).
 * Orchestrates between hooks and libraries.
 */

import { CryptographyError, NetworkError } from '../types/errors.types';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, ItemEncrypted, ItemDecrypted } from '../types/items.types';
import { getUserSecretKey } from './secret';
import { encryptCredential, encryptBankCard, encryptSecureNote, decryptAllItems } from './cryptography';
import { addDocument, updateDocument, deleteDocument, getCollection } from '../libraries/database';
import { FIRESTORE_USER_ITEMS_SUBCOLLECTION } from '@shared/constants/app.constants';
import { getCurrentUserId } from '../libraries/auth/firebase';

/**
 * Add a new credential to Firestore
 */
export async function addCredentialToDatabase(credential: CredentialDecrypted): Promise<void> {
  try {
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(userId);

    const encryptedCredential = await encryptCredential(userSecretKey, credential);
    await addDocument(collectionPath, encryptedCredential);
    
    console.log('[Items] Credential added successfully');
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new NetworkError('Failed to add credential to database', error);
    }
    throw new CryptographyError('Failed to encrypt credential', error as Error);
  }
}

/**
 * Add a new bank card to Firestore
 */
export async function addBankCardToDatabase(bankCard: BankCardDecrypted): Promise<void> {
  try {
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(userId);

    const encryptedBankCard = await encryptBankCard(userSecretKey, bankCard);
    await addDocument(collectionPath, encryptedBankCard);
    
    console.log('[Items] Bank card added successfully');
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new NetworkError('Failed to add bank card to database', error);
    }
    throw new CryptographyError('Failed to encrypt bank card', error as Error);
  }
}

/**
 * Add a new secure note to Firestore
 */
export async function addSecureNoteToDatabase(secureNote: SecureNoteDecrypted): Promise<void> {
  try {
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(userId);

    const encryptedSecureNote = await encryptSecureNote(userSecretKey, secureNote);
    await addDocument(collectionPath, encryptedSecureNote);
    
    console.log('[Items] Secure note added successfully');
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new NetworkError('Failed to add secure note to database', error);
    }
    throw new CryptographyError('Failed to encrypt secure note', error as Error);
  }
}

/**
 * Update an existing item
 */
export async function updateItemInDatabase(
  userId: string,
  itemId: string,
  userSecretKey: string,
  updatedItem: ItemDecrypted
): Promise<void> {
  try {
    let encryptedUpdates;
    // Determine the type and call the correct encrypt function
    if ('username' in updatedItem && 'password' in updatedItem) {
      encryptedUpdates = await encryptCredential(userSecretKey, updatedItem);
    } else if ('cardNumber' in updatedItem && 'expirationDate' in updatedItem) {
      encryptedUpdates = await encryptBankCard(userSecretKey, updatedItem);
    } else if ('note' in updatedItem && !('username' in updatedItem)) {
      encryptedUpdates = await encryptSecureNote(userSecretKey, updatedItem);
    } else {
      throw new Error('Unknown item type for encryption');
    }
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);
    await updateDocument(`${collectionPath}/${itemId}`, encryptedUpdates);
    
    console.log('[Items] Item updated successfully');
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new NetworkError('Failed to update item in database', error);
    }
    throw new CryptographyError('Failed to encrypt item updates', error as Error);
  }
}

/**
 * Delete an item
 */
export async function deleteItemFromDatabase(userId: string, itemId: string): Promise<void> {
  try {
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);
    await deleteDocument(`${collectionPath}/${itemId}`);
    console.log('[Items] Item deleted successfully');
  } catch (error) {
    throw new NetworkError('Failed to delete item from database', error as Error);
  }
}

/**
 * Get all items from Firestore and decrypt them
 */
export async function getAllItemsFromDatabase(): Promise<ItemDecrypted[]> {
 
  try {

    // Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }

    // Get user id
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Get all items from Firestore
    const encryptedItems = await getCollection<ItemEncrypted>(`users/${userId}/my_items`);
    
    if (encryptedItems.length === 0) {
      console.log('[Items] No items found in database');
      return [];
    }
    
    // Decrypt all items and return them
    const decryptedItems = await decryptAllItems(userSecretKey, encryptedItems);

    console.log('[Items] Successfully loaded and cached items:', decryptedItems.length, 'items');
    return decryptedItems;
    
  } catch (error) {
    console.error('[Items] Failed to get all items:', error);
    throw error;
  }
}