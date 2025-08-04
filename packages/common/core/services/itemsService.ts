// packages/common/core/services/itemsService.ts
import { EventEmitter } from 'events';
import { CryptographyError, NetworkError } from '../types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '../types/items.types';
import { ISecretsService } from './secretsService';
import { ICryptoService } from './cryptoService';
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from '../libraries/auth/firebase';
import { IVaultService } from './vaultService';

export interface IItemsService {
    fetchAndStoreItems(currentUserId: string): Promise<ItemDecrypted[]>;
    loadItemsWithFallback(): Promise<ItemDecrypted[]>;
    addItem(item: ItemDecrypted): Promise<void>;
    updateItem(itemId: string, updatedItem: ItemDecrypted): Promise<void>;
    deleteItem(itemId: string): Promise<void>;
}

// Create singleton instances
let itemsServiceInstance: ItemsService | null = null;
let itemsStateManagerInstance: ItemsStateManager | null = null;

export const addItem = async (item: ItemDecrypted): Promise<void> => {
  if (!itemsServiceInstance) {
    throw new Error('ItemsService not initialized');
  }
  return itemsServiceInstance.addItem(item);
};

export const updateItem = async (itemId: string, updatedItem: ItemDecrypted): Promise<void> => {
  if (!itemsServiceInstance) {
    throw new Error('ItemsService not initialized');
  }
  return itemsServiceInstance.updateItem(itemId, updatedItem);
};

export const deleteItem = async (itemId: string): Promise<void> => {
  if (!itemsServiceInstance) {
    throw new Error('ItemsService not initialized');
  }
  return itemsServiceInstance.deleteItem(itemId);
};

export const getAllItems = async (): Promise<ItemDecrypted[]> => {
  if (!itemsStateManagerInstance) {
    throw new Error('ItemsStateManager not initialized');
  }
  return itemsStateManagerInstance.getItems();
};

export const fetchAndStoreItems = async (currentUserId: string): Promise<ItemDecrypted[]> => {
  if (!itemsServiceInstance) {
    throw new Error('ItemsService not initialized');
  }
  return itemsServiceInstance.fetchAndStoreItems(currentUserId);
};

export const loadItemsWithFallback = async (): Promise<ItemDecrypted[]> => {
  if (!itemsServiceInstance) {
    throw new Error('ItemsService not initialized');
  }
  return itemsServiceInstance.loadItemsWithFallback();
};

export const itemsStateManager = (): ItemsStateManager => {
  if (!itemsStateManagerInstance) {
    throw new Error('ItemsStateManager not initialized');
  }
  return itemsStateManagerInstance;
};

// State management for UI updates
export class ItemsStateManager extends EventEmitter {
  private currentItems: ItemDecrypted[] = [];

  constructor() {
    super();
    itemsStateManagerInstance = this;
  }

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

export class ItemsService implements IItemsService {
  constructor(
    private itemsStateManager: ItemsStateManager,
    private secretsService: ISecretsService,
    private cryptoService: ICryptoService,
    private db: IDatabaseAdapter,
    private storage: IPlatformStorageAdapter,
    private authService: IAuthService,
    private vaultService: IVaultService,
  ) {
    // Set the singleton instance
    itemsServiceInstance = this;
  }

  public async fetchAndStoreItems(currentUserId: string): Promise<ItemDecrypted[]> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('No user secret key found');
      }

      const encryptedItems = await this.db.getCollection<ItemEncrypted>(`users/${currentUserId}/my_items`);
      
      if (encryptedItems.length === 0) {
        const emptyItems: ItemDecrypted[] = [];
        await this.storage.updateVaultInSecureLocalStorage({
          userId: currentUserId,
          items: emptyItems,
          lastModified: new Date(),
        });
        this.itemsStateManager.setItems(emptyItems);
        return emptyItems;
      }
      
      const decryptedItems = await this.cryptoService.decryptAllItems(userSecretKey, encryptedItems);

      await this.storage.updateVaultInSecureLocalStorage({
        userId: currentUserId,
        items: decryptedItems,
        lastModified: new Date(),
      });

      this.itemsStateManager.setItems(decryptedItems);
      return decryptedItems;
    } catch (error) {
      console.error('[Items] Failed to fetch and store items:', error);
      throw error;
    }
  }
  
  public async loadItemsWithFallback(): Promise<ItemDecrypted[]> {
    try {
      const localVault = await this.vaultService.getLocalVault();
      
      if (localVault && localVault.length > 0) {
        this.itemsStateManager.setItems(localVault);
        return localVault;
      }
      
      const currentUserId = this.authService.getCurrentUserId();
      if (!currentUserId) throw new Error('User not authenticated');
      return await this.fetchAndStoreItems(currentUserId);
      
    } catch (error) {
      console.error('[Items] Failed to load items with fallback:', error);
      throw error;
    }
  }

  public async addItem(item: ItemDecrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }

      const userId = this.authService.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      const collectionPath = `users/${userId}/my_items`;

      const databaseId = this.db.generateItemDatabaseId();
      const completeItem = { ...item, id: databaseId };
      const encryptedItem = await this.cryptoService.encryptItem(userSecretKey, completeItem);
      
      await this.db.addDocument(collectionPath, { ...encryptedItem, id: databaseId });
      this.itemsStateManager.addItem(completeItem);

    } catch (error) {
      if (error instanceof NetworkError) {
        throw new NetworkError('Failed to add item to database', error);
      }
      throw new CryptographyError('Failed to encrypt item', error as Error);
    }
  }
  
  public async updateItem(itemId: string, updatedItem: ItemDecrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }
      
      const encryptedUpdates = await this.cryptoService.encryptItem(userSecretKey, updatedItem);

      const realUserId = this.authService.getCurrentUserId();
      if (!realUserId) throw new Error('User not authenticated');
      const collectionPath = `users/${realUserId}/my_items`;

      await this.db.updateDocument(`${collectionPath}/${itemId}`, encryptedUpdates);
      this.itemsStateManager.updateItem(itemId, updatedItem);
      
    } catch (error) {
      if (error instanceof NetworkError) {
        throw new NetworkError('Failed to update item in database', error);
      }
      throw new CryptographyError('Failed to encrypt item updates', error as Error);
    }
  }

  public async deleteItem(itemId: string): Promise<void> {
    try {
      const realUserId = this.authService.getCurrentUserId();
      if (!realUserId) throw new Error('User not authenticated');
      const collectionPath = `users/${realUserId}/my_items`;

      await this.db.deleteDocument(`${collectionPath}/${itemId}`);
      this.itemsStateManager.removeItem(itemId);
      
    } catch (error) {
      throw new NetworkError('Failed to delete item from database', error as Error);
    }
  }
}

// Import actual adapters and services
import { auth } from '../adapters/auth.adapter';
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { authService } from './authService';
import { vaultService } from './vaultService';
import { secretsService } from './secretsService';
import { cryptoService } from './cryptoService';

// Export singleton instance
export const itemsService = new ItemsService(
  new ItemsStateManager(),
  secretsService,
  cryptoService,
  db,
  storage,
  authService,
  vaultService
);
