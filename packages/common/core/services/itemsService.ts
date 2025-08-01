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
import { getUserSecretKey } from './secretsService';
import { encryptItem, decryptAllItems } from './cryptoService';
import { db } from '../adapters/database.adapter';
import { FIRESTORE_USER_ITEMS_SUBCOLLECTION } from '@shared/constants/app.constants';
import { getCurrentUserId } from '../libraries/auth/firebase';
import { storage } from '../adapters/platform.storage.adapter';
import { getLocalVault } from './vaultService';

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
export async function fetchAndStoreItems(currentUserId: string): Promise<ItemDecrypted[]> {
  try {
    // 1. Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('No user secret key found');
    }

    // 2. Fetch encrypted items from database
    const encryptedItems = await db.getCollection<ItemEncrypted>(`users/${currentUserId}/my_items`);
    
    if (encryptedItems.length === 0) {
      console.log('[Items] No items found in database');
      const emptyItems: ItemDecrypted[] = [];
      
          // 4a. Update secure storage (empty case)
    await storage.updateVaultInSecureLocalStorage({
      userId: currentUserId,
      items: emptyItems,
      lastModified: new Date(),
    });
      
      // 4b. Update state manager (empty case)
      itemsStateManager.setItems(emptyItems);
      
      return emptyItems;
    }
    
    // 4. Decrypt all items
    const decryptedItems = await decryptAllItems(userSecretKey, encryptedItems);

    // 5. Update secure storage
    await storage.updateVaultInSecureLocalStorage({
      userId: currentUserId,
      items: decryptedItems,
      lastModified: new Date(),
    });

    // 6. Update state manager
    itemsStateManager.setItems(decryptedItems);

    // 7. Log success
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
    // 1. Try local storage first
    const localVault = await getLocalVault();
    
    if (localVault && localVault.length > 0) {
      console.log('[Items] Using items from local storage');
      
      // 2a. Update state manager (local storage case)
      itemsStateManager.setItems(localVault);
      return localVault;
    }
    
    // 2b. Fallback to database
    console.log('[Items] Local storage empty, fetching from database');
    const currentUserId = getCurrentUserId();
    if (!currentUserId) throw new Error('User not authenticated');
    return await fetchAndStoreItems(currentUserId);
    
  } catch (error) {
    console.error('[Items] Failed to load items with fallback:', error);
    throw error;
  }
}

/**
 * Add a new item
 */
export async function addItem(item: ItemDecrypted): Promise<void> {
  try {
    // 1. Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }

    // 2. Get user id
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(userId);

    // 3. Generate database ID
    const databaseId = db.generateItemDatabaseId();

    // 4. Create complete item with database ID
    const completeItem = { ...item, id: databaseId };

    // 5. Encrypt complete item
    const encryptedItem = await encryptItem(userSecretKey, completeItem);
    
    // 6. Add item to database
    await db.addDocument(collectionPath, { ...encryptedItem, id: databaseId });

    // 7. Update state manager with complete item
    itemsStateManager.addItem(completeItem);

    // 8. Log success
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
export async function updateItem(
  itemId: string,
  updatedItem: ItemDecrypted
): Promise<void> {
  try {
    // 1. Get user secret key
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      throw new Error('User not authenticated');
    }
    
    // 2. Encrypt updated item
    const encryptedUpdates = await encryptItem(userSecretKey, updatedItem);

    // 3. Get user id
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);

    // 4. Update item in database
    await db.updateDocument(`${collectionPath}/${itemId}`, encryptedUpdates);
    
    // 5. Update state manager
    itemsStateManager.updateItem(itemId, updatedItem);
    
    // 6. Log success
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
export async function deleteItem(itemId: string): Promise<void> {
  try {
    // 1. Get user id
    const realUserId = getCurrentUserId();
    if (!realUserId) throw new Error('User not authenticated');
    const collectionPath = FIRESTORE_USER_ITEMS_SUBCOLLECTION(realUserId);

    // 2. Delete item from database
    await db.deleteDocument(`${collectionPath}/${itemId}`);
    
    // 3. Update state manager
    itemsStateManager.removeItem(itemId);
    
    // 4. Log success
    console.log('[Items] Item deleted successfully');
  } catch (error) {
    throw new NetworkError('Failed to delete item from database', error as Error);
  }
}

/**
 * Get all items and decrypt them
 * @deprecated Use fetchAndStoreItems() or loadItemsWithFallback() instead
 */
export async function getAllItems(): Promise<ItemDecrypted[]> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) throw new Error('User not authenticated');
  return fetchAndStoreItems(currentUserId);
}