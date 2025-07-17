/**
 * Items Service - Layer 2: Business Logic
 * 
 * Handles item operations (add, update, delete, get).
 * Orchestrates between hooks and libraries.
 */

import { CryptographyError, NetworkError } from '../types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '../types/items.types';
import { getUserSecretKey } from './secret';
import { encryptItem, decryptAllItems } from './cryptography';
import { addDocument, updateDocument, deleteDocument, getCollection } from '../libraries/database';
import { FIRESTORE_USER_ITEMS_SUBCOLLECTION } from '@shared/constants/app.constants';
import { getCurrentUserId } from '../libraries/auth/firebase';

/**
 * Add a new item to Database
 */
export async function addItemToDatabase(item: ItemDecrypted): Promise<void> {
  try {
    // Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }

    // Get user id
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(userId);

    // Encrypt item
    const encryptedItem = await encryptItem(userSecretKey, item);
    
    // Add item to database
    await addDocument(collectionPath, { ...encryptedItem, id: item.id });

    // Log success
    console.log('[Items] Item added successfully:', item.itemType);
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new NetworkError('Failed to add item to database', error);
    }
    throw new CryptographyError('Failed to encrypt item', error as Error);
  }
}

/**
 * Update an existing item
 */
export async function updateItemInDatabase(
  itemId: string,
  updatedItem: ItemDecrypted
): Promise<void> {
  try {
    // Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }
    // Use the unified encryptItem function for all item types
    const encryptedUpdates = await encryptItem(userSecretKey, updatedItem);

    // Get user id
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);

    // Update item in database
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
export async function deleteItemFromDatabase(itemId: string): Promise<void> {
  try {
    // Get user id
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);

    // Delete item from database
    await deleteDocument(`${collectionPath}/${itemId}`);
    console.log('[Items] Item deleted successfully');
  } catch (error) {
    throw new NetworkError('Failed to delete item from database', error as Error);
  }
}

/**
 * Get all items from Database and decrypt them
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

    // Get all items from Database
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