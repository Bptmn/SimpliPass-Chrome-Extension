/**
 * Items Service - Layer 2: Business Logic
 * 
 * Handles item operations (add, update, delete, get).
 * Orchestrates between hooks and libraries.
 * Centralized data hub with state management for real-time UI updates.
 */

import { EventEmitter } from 'events';
import { CryptographyError, NetworkError } from '../types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '../types/items.types';
import { getUserSecretKey } from './secret';
import { encryptItem, decryptAllItems } from './cryptography';
import { addDocument, updateDocument, deleteDocument, getCollection } from '../libraries/database';
import { FIRESTORE_USER_ITEMS_SUBCOLLECTION } from '@shared/constants/app.constants';
import { getCurrentUserId } from '../libraries/auth/firebase';
import { storage } from '../adapters/platform.storage.adapter';
import { getLocalVault } from './vault';

// State management for UI updates
class ItemsStateManager extends EventEmitter {
  private currentItems: ItemDecrypted[] = [];
  
  setItems(items: ItemDecrypted[]) {
    this.currentItems = items;
    this.emit('itemsChanged', items);
  }
  
  getItems(): ItemDecrypted[] {
    return this.currentItems;
  }
  
  addItem(item: ItemDecrypted) {
    this.currentItems.push(item);
    this.emit('itemsChanged', this.currentItems);
  }
  
  updateItem(itemId: string, updatedItem: ItemDecrypted) {
    const index = this.currentItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.currentItems[index] = updatedItem;
      this.emit('itemsChanged', this.currentItems);
    }
  }
  
  removeItem(itemId: string) {
    this.currentItems = this.currentItems.filter(item => item.id !== itemId);
    this.emit('itemsChanged', this.currentItems);
  }
}

export const itemsStateManager = new ItemsStateManager();

/**
 * Centralized function to fetch, decrypt and store items
 * Used by both initial load and real-time listeners
 */
export async function fetchAndStoreItems(): Promise<ItemDecrypted[]> {
  try {
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }

    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Fetch encrypted items from Firestore
    const encryptedItems = await getCollection<ItemEncrypted>(`users/${userId}/my_items`);
    
    if (encryptedItems.length === 0) {
      console.log('[Items] No items found in database');
      const emptyItems: ItemDecrypted[] = [];
      
      // Update both secure storage and state
      await storage.updateVaultInSecureLocalStorage({
        items: emptyItems,
        lastSync: new Date().toISOString(),
      });
      itemsStateManager.setItems(emptyItems);
      
      return emptyItems;
    }
    
    // Decrypt all items
    const decryptedItems = await decryptAllItems(userSecretKey, encryptedItems);

    // Update both secure storage and state
    await storage.updateVaultInSecureLocalStorage({
      items: decryptedItems,
      lastSync: new Date().toISOString(),
    });
    itemsStateManager.setItems(decryptedItems);

    console.log('[Items] Successfully loaded and stored items:', decryptedItems.length, 'items');
    return decryptedItems;
    
  } catch (error) {
    console.error('[Items] Failed to fetch and store items:', error);
    throw error;
  }
}

/**
 * Load items from local storage with Firestore fallback
 */
export async function loadItemsWithFallback(): Promise<ItemDecrypted[]> {
  try {
    // Try local storage first
    const localVault = await getLocalVault();
    
    if (localVault && localVault.length > 0) {
      console.log('[Items] Using items from local storage');
      itemsStateManager.setItems(localVault);
      return localVault;
    }
    
    // Fallback to Firestore
    console.log('[Items] Local storage empty, fetching from Firestore');
    return await fetchAndStoreItems();
    
  } catch (error) {
    console.error('[Items] Failed to load items with fallback:', error);
    throw error;
  }
}

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

    // After successful add, update state
    itemsStateManager.addItem(item);

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
    
    // After successful update, update state
    itemsStateManager.updateItem(itemId, updatedItem);
    
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
    
    // After successful delete, update state
    itemsStateManager.removeItem(itemId);
    
    console.log('[Items] Item deleted successfully');
  } catch (error) {
    throw new NetworkError('Failed to delete item from database', error as Error);
  }
}

/**
 * Get all items from Database and decrypt them
 * @deprecated Use fetchAndStoreItems() or loadItemsWithFallback() instead
 */
export async function getAllItemsFromDatabase(): Promise<ItemDecrypted[]> {
  return fetchAndStoreItems();
}