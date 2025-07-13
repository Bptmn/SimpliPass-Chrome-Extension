/**
 * Items Logic - Unified Architecture
 * 
 * Handles all item operations (credentials, bank cards, secure notes).
 * Integrates with platform adapters and states.
 */

import { getPlatformAdapter } from '../adapters/adapter.factory';
import { 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted,
  ItemEncrypted 
} from '@app/core/types/types';
import { 
  encryptCredential, 
  encryptBankCard, 
  encryptSecureNote, 
  decryptAllItems 
} from './cryptography';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import { generateItemKey } from '@app/utils/crypto';
import { doc, updateDoc, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { initFirebase } from '@app/core/auth/firebase';
import { getUserSecretKey } from './auth';

// ===== Types =====

type DecryptedItem = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

export interface CreateItemData {
  title: string;
  type: 'credential' | 'bank_card' | 'secure_note';
  data: Partial<CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted>;
}

// ===== Main Functions =====

/**
 * Refresh state items from storage
 * Flow: Local vault → Firestore → Local vault → States
 */
export async function refreshStateItems(userId: string): Promise<void> {
  try {
    console.log('[Items] Starting refreshStateItems for user:', userId);
    
    const adapter = await getPlatformAdapter();
    const userSecretKey = await getUserSecretKey();
    
    if (!userSecretKey) {
      throw new Error('User secret key not available');
    }
    
    // Step 1: Try to load from local vault
    console.log('[Items] Attempting to load from local vault...');
    const localVault = await adapter.getEncryptedVault?.();
    
    if (localVault && localVault.encryptedData) {
      console.log('[Items] Local vault found, decrypting...');
      const decryptedItems = await decryptVaultFromStorage(localVault, userSecretKey);
      
      if (decryptedItems.length > 0) {
        console.log('[Items] Successfully loaded', decryptedItems.length, 'items from local vault');
        await updateStatesWithItems(decryptedItems);
        return;
      }
    }
    
    // Step 2: No local vault or empty, fetch from Firestore
    console.log('[Items] No local vault data, fetching from Firestore...');
    const { db } = await initFirebase();
    const itemsCollection = collection(db, 'users', userId, 'my_items');
    const querySnapshot = await getDocs(itemsCollection);
    
    if (querySnapshot.empty) {
      console.log('[Items] No items found in Firestore');
      await updateStatesWithItems([]);
      return;
    }
    
    // Step 3: Decrypt items from Firestore
    const encryptedItems: ItemEncrypted[] = [];
    querySnapshot.forEach((doc) => {
      encryptedItems.push({ id: doc.id, ...doc.data() } as ItemEncrypted);
    });
    
    console.log('[Items] Found', encryptedItems.length, 'encrypted items in Firestore');
    const decryptedItems = await decryptAllItems(userSecretKey, encryptedItems);
    
    // Step 4: Store decrypted items in local vault
    if (decryptedItems.length > 0) {
      console.log('[Items] Storing decrypted items in local vault...');
      const deviceFingerprintKey = await adapter.getDeviceFingerprint();
      const vaultData = await encryptVaultForStorage(decryptedItems, deviceFingerprintKey);
      await adapter.storeEncryptedVault?.(vaultData);
    }
    
    // Step 5: Update states with decrypted items
    console.log('[Items] Updating states with', decryptedItems.length, 'items');
    await updateStatesWithItems(decryptedItems);
    
  } catch (error) {
    console.error('[Items] Failed to refresh state items:', error);
    throw error;
  }
}

/**
 * Get a specific item by ID
 */
export async function getItemById(
  userId: string, 
  itemId: string, 
  userSecretKey: string
): Promise<DecryptedItem | null> {
  try {
    // First try to get from states
    const stateItem = getItemFromStates(itemId);
    if (stateItem) {
      console.log('[Items] Returning cached item from state:', itemId);
      return stateItem;
    }
    
    // Item not in states, trigger refresh
    console.log('[Items] Item not in cache, refreshing states...');
    await refreshStateItems(userId);
    
    // Try again after refresh
    const refreshedItem = getItemFromStates(itemId);
    if (refreshedItem) {
      console.log('[Items] Found item after refresh:', itemId);
      return refreshedItem;
    }
    
    console.log('[Items] Item not found after refresh:', itemId);
    return null;
    
  } catch (error) {
    console.error('[Items] Failed to get item:', itemId, error);
    throw error;
  }
}

/**
 * Add a new item
 */
export async function addItem(
  userId: string,
  userSecretKey: string,
  item: Omit<DecryptedItem, 'id' | 'itemKey'>
): Promise<string> {
  try {
    const itemKey = generateItemKey();
    const itemWithKey = { ...item, itemKey } as DecryptedItem;
    
    // Encrypt the item
    let encryptedItem: ItemEncrypted;
    
    if ('username' in itemWithKey) {
      encryptedItem = await encryptCredential(userSecretKey, itemWithKey as CredentialDecrypted);
    } else if ('cardNumber' in itemWithKey) {
      encryptedItem = await encryptBankCard(userSecretKey, itemWithKey as BankCardDecrypted);
    } else {
      encryptedItem = await encryptSecureNote(userSecretKey, itemWithKey as SecureNoteDecrypted);
    }
    
    // Store in database
    const { db } = await initFirebase();
    const newId = await addDocumentToDatabase(userId, encryptedItem);
    
    // Add to states
    addItemToStates(itemWithKey);
    
    // Save to unified vault
    // await unifiedSaveVault();
    
    console.log('[Items] Successfully added item:', newId);
    return newId;
    
  } catch (error) {
    console.error('[Items] Failed to add item:', error);
    throw error;
  }
}

/**
 * Update an existing item
 */
export async function updateItem(
  userId: string,
  itemId: string,
  userSecretKey: string,
  updates: Partial<DecryptedItem>
): Promise<void> {
  try {
    // Get current item from states
    const currentItem = getItemFromStates(itemId);
    
    if (!currentItem) {
      throw new Error(`Item not found: ${itemId}`);
    }
    
    // Update the item
    const updatedItem = { ...currentItem, ...updates, itemKey: currentItem.itemKey } as DecryptedItem;
    
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
    const { db } = await initFirebase();
    const docRef = doc(db, 'users', userId, 'my_items', itemId);
    await updateDoc(docRef, encryptedItem as any);
    
    // Update states
    updateItemInStates(updatedItem);
    
    // Save to unified vault
    // await unifiedSaveVault();
    
    console.log('[Items] Successfully updated item:', itemId);
    
  } catch (error) {
    console.error('[Items] Failed to update item:', itemId, error);
    throw error;
  }
}

/**
 * Delete an item
 */
export async function deleteItem(userId: string, itemId: string): Promise<void> {
  try {
    // Delete from database
    const { db } = await initFirebase();
    const docRef = doc(db, 'users', userId, 'my_items', itemId);
    await deleteDoc(docRef);
    
    // Remove from states
    removeItemFromStates(itemId);
    
    // Save to unified vault
    // await unifiedSaveVault();
    
    console.log('[Items] Successfully deleted item:', itemId);
    
  } catch (error) {
    console.error('[Items] Failed to delete item:', itemId, error);
    throw error;
  }
}

/**
 * Clear all cached items
 */
export async function clearItemsCache(): Promise<void> {
  try {
    const credentialsStore = useCredentialsStore.getState();
    const bankCardsStore = useBankCardsStore.getState();
    const secureNotesStore = useSecureNotesStore.getState();
    
    credentialsStore.setCredentials([]);
    bankCardsStore.setBankCards([]);
    secureNotesStore.setSecureNotes([]);
    
         // Clear unified vault
     const adapter = await getPlatformAdapter();
     if (adapter.supportsOfflineVault()) {
       await adapter.deleteEncryptedVault?.();
     }
    
    console.log('[Items] Cache and vault cleared');
    
  } catch (error) {
    console.error('[Items] Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Refresh items from database
 */
export async function refreshItems(userId: string, userSecretKey: string): Promise<DecryptedItem[]> {
  console.log('[Items] Refreshing items from database...');
  await clearItemsCache();
  await refreshStateItems(userId);
  
  // Return items from states
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  const allItems: DecryptedItem[] = [
    ...credentialsStore.credentials as any[],
    ...bankCardsStore.bankCards as any[],
    ...secureNotesStore.secureNotes as any[]
  ];
  
  return allItems;
}

// ===== Helper Functions =====

/**
 * Decrypt vault from local storage
 */
async function decryptVaultFromStorage(
  vault: any, 
  userSecretKey: string
): Promise<DecryptedItem[]> {
  try {
    // This would decrypt the vault using the userSecretKey
    // For now, returning empty array as placeholder
    console.log('[Items] Decrypting vault from storage...');
    return [];
  } catch (error) {
    console.error('[Items] Failed to decrypt vault from storage:', error);
    return [];
  }
}

/**
 * Encrypt vault for local storage
 */
async function encryptVaultForStorage(
  items: DecryptedItem[], 
  deviceFingerprintKey: string
): Promise<any> {
  try {
    // This would encrypt the items using the deviceFingerprintKey
    // For now, returning mock vault data
    console.log('[Items] Encrypting vault for storage...');
    return {
      version: '1.0',
      encryptedData: 'mock-encrypted-data',
      iv: 'mock-iv',
      salt: 'mock-salt',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[Items] Failed to encrypt vault for storage:', error);
    throw error;
  }
}

/**
 * Get encrypted items from database
 */
async function getEncryptedItemsFromDatabase(_userId: string): Promise<ItemEncrypted[]> {
  // This would be implemented based on your database adapter
  // For now, returning empty array as placeholder
  return [];
}

/**
 * Add document to database
 */
async function addDocumentToDatabase(_userId: string, _encryptedItem: ItemEncrypted): Promise<string> {
  // This would be implemented based on your database adapter
  // For now, returning a mock ID
  return `item-${Date.now()}`;
}

/**
 * Get item from states
 */
function getItemFromStates(itemId: string): DecryptedItem | null {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  const credential = credentialsStore.credentials.find((c: any) => c.id === itemId);
  if (credential) return credential as unknown as DecryptedItem;
  
  const bankCard = bankCardsStore.bankCards.find((b: any) => b.id === itemId);
  if (bankCard) return bankCard as unknown as DecryptedItem;
  
  const secureNote = secureNotesStore.secureNotes.find((s: any) => s.id === itemId);
  if (secureNote) return secureNote as unknown as DecryptedItem;
  
  return null;
}

/**
 * Add item to states
 */
function addItemToStates(item: DecryptedItem): void {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  if ('username' in item) {
    credentialsStore.addCredential(item as any);
  } else if ('cardNumber' in item) {
    bankCardsStore.addBankCard(item as any);
  } else {
    secureNotesStore.addSecureNote(item as any);
  }
}

/**
 * Update item in states
 */
function updateItemInStates(item: DecryptedItem): void {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  if ('username' in item) {
    credentialsStore.updateCredential(item as any, (item as any).id);
  } else if ('cardNumber' in item) {
    bankCardsStore.updateBankCard(item as any);
  } else {
    secureNotesStore.updateSecureNote(item as any);
  }
}

/**
 * Remove item from states
 */
function removeItemFromStates(itemId: string): void {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  // Note: These methods might not exist, using type assertion for now
  (credentialsStore as any).removeCredential?.(itemId);
  bankCardsStore.removeBankCard(itemId);
  secureNotesStore.removeSecureNote(itemId);
}

/**
 * Update states with items
 */
async function updateStatesWithItems(items: DecryptedItem[]): Promise<void> {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  
  const credentials: any[] = [];
  const bankCards: any[] = [];
  const secureNotes: any[] = [];
  
  items.forEach((item: DecryptedItem) => {
    if ('username' in item) {
      credentials.push(item);
    } else if ('cardNumber' in item) {
      bankCards.push(item);
    } else {
      secureNotes.push(item);
    }
  });
  
  credentialsStore.setCredentials(credentials);
  bankCardsStore.setBankCards(bankCards);
  secureNotesStore.setSecureNotes(secureNotes);
}