// packages/common/core/services/itemsService.ts
import { EventEmitter } from 'events';
import { CryptographyError, NetworkError, AuthenticationError, ItemError } from '../types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '../types/items.types';
import { ISecretsService } from './secretsService';
import { ICryptoService } from './cryptoService';
import { IDatabaseAdapter } from '../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../adapters/platform.storage.adapter';
import { IAuthService } from './authService';
import { IVaultService } from './vaultService';

export interface IItemsService {
    fetchAndStoreItems(currentUserId: string): Promise<ItemDecrypted[]>;
    loadItemsWithFallback(): Promise<ItemDecrypted[]>;
    addItem(item: ItemDecrypted): Promise<void>;
    updateItem(itemId: string, updatedItem: ItemDecrypted): Promise<void>;
    deleteItem(itemId: string): Promise<void>;
    // ✅ NEW: External change handling
    handleExternalDatabaseChange(encryptedItems: ItemEncrypted[]): Promise<void>;
    handleExternalItemAdded(encryptedItem: ItemEncrypted): Promise<void>;
    handleExternalItemUpdated(itemId: string, encryptedItem: ItemEncrypted): Promise<void>;
    handleExternalItemDeleted(itemId: string): Promise<void>;
}

// State management for UI updates
export class ItemsStateManager extends EventEmitter {
  private currentItems: ItemDecrypted[] = [];

  constructor() {
    super();
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
  ) {}

  public getStateManager(): ItemsStateManager {
    return this.itemsStateManager;
  }

  // ✅ Helper method for common error handling
  private handleServiceError(error: unknown, operation: string): never {
    console.error(`[ItemsService] ${operation} failed:`, error);
    
    if (error instanceof CryptographyError || error instanceof NetworkError || 
        error instanceof AuthenticationError || error instanceof ItemError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('No user secret key') || error.message.includes('not authenticated')) {
        throw new AuthenticationError('User not authenticated', error);
      }
      if (error.message.includes('Network') || error.message.includes('timeout')) {
        throw new NetworkError('Network error during item operation', error);
      }
      if (error.message.includes('encrypt') || error.message.includes('decrypt')) {
        throw new CryptographyError('Cryptography error during item operation', error);
      }
    }
    
    throw new ItemError(`Failed to ${operation}`, error as Error);
  }

  public async fetchAndStoreItems(currentUserId: string): Promise<ItemDecrypted[]> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('No user secret key found');
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
      this.handleServiceError(error, 'fetch and store items');
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
      if (!currentUserId) throw new AuthenticationError('User not authenticated');
      return await this.fetchAndStoreItems(currentUserId);
      
    } catch (error) {
      this.handleServiceError(error, 'load items with fallback');
    }
  }

  public async addItem(item: ItemDecrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('User not authenticated');
      }

      const userId = this.authService.getCurrentUserId();
      if (!userId) throw new AuthenticationError('User not authenticated');
      const collectionPath = `users/${userId}/my_items`;

      const databaseId = this.db.generateItemDatabaseId();
      const completeItem = { ...item, id: databaseId };
      const encryptedItem = await this.cryptoService.encryptItem(userSecretKey, completeItem);
      
      // ✅ Update all 3 sources for internal changes
      await this.db.addDocument(collectionPath, { ...encryptedItem, id: databaseId });
      await this.storage.updateVaultInSecureLocalStorage({
        userId,
        items: [...this.itemsStateManager.getItems(), completeItem],
        lastModified: new Date(),
      });
      this.itemsStateManager.addItem(completeItem);

    } catch (error) {
      this.handleServiceError(error, 'add item');
    }
  }
  
  public async updateItem(itemId: string, updatedItem: ItemDecrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('User not authenticated');
      }
      
      const encryptedUpdates = await this.cryptoService.encryptItem(userSecretKey, updatedItem);

      const realUserId = this.authService.getCurrentUserId();
      if (!realUserId) throw new AuthenticationError('User not authenticated');
      const collectionPath = `users/${realUserId}/my_items`;

      // ✅ Update all 3 sources for internal changes
      await this.db.updateDocument(`${collectionPath}/${itemId}`, encryptedUpdates);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: realUserId,
        items: this.itemsStateManager.getItems().map(item => item.id === itemId ? updatedItem : item),
        lastModified: new Date(),
      });
      this.itemsStateManager.updateItem(itemId, updatedItem);
      
    } catch (error) {
      this.handleServiceError(error, 'update item');
    }
  }

  public async deleteItem(itemId: string): Promise<void> {
    try {
      const realUserId = this.authService.getCurrentUserId();
      if (!realUserId) throw new AuthenticationError('User not authenticated');
      const collectionPath = `users/${realUserId}/my_items`;

      // ✅ Update all 3 sources for internal changes
      await this.db.deleteDocument(`${collectionPath}/${itemId}`);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: realUserId,
        items: this.itemsStateManager.getItems().filter(item => item.id !== itemId),
        lastModified: new Date(),
      });
      this.itemsStateManager.removeItem(itemId);
      
    } catch (error) {
      this.handleServiceError(error, 'delete item');
    }
  }

  // External change handling
  public async handleExternalDatabaseChange(encryptedItems: ItemEncrypted[]): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('No user secret key found for external change');
      }

      const decryptedItems = await this.cryptoService.decryptAllItems(userSecretKey, encryptedItems);
      this.itemsStateManager.setItems(decryptedItems);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: this.authService.getCurrentUserId() || 'unknown',
        items: decryptedItems,
        lastModified: new Date(),
      });
    } catch (error) {
      console.error('[ItemsService] Failed to handle external database change:', error);
      throw new ItemError('Failed to handle external database change', error as Error);
    }
  }

  public async handleExternalItemAdded(encryptedItem: ItemEncrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('No user secret key found for external change');
      }

      const decryptedItem = await this.cryptoService.decryptItem(userSecretKey, encryptedItem);
      if (!decryptedItem) {
        throw new ItemError('Failed to decrypt external item');
      }
      
      this.itemsStateManager.addItem(decryptedItem);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: this.authService.getCurrentUserId() || 'unknown',
        items: [...this.itemsStateManager.getItems(), decryptedItem],
        lastModified: new Date(),
      });
    } catch (error) {
      console.error('[ItemsService] Failed to handle external item added:', error);
      throw new ItemError('Failed to handle external item added', error as Error);
    }
  }

  public async handleExternalItemUpdated(itemId: string, encryptedItem: ItemEncrypted): Promise<void> {
    try {
      const userSecretKey = await this.secretsService.getUserSecretKey();
      if (!userSecretKey) {
        throw new AuthenticationError('No user secret key found for external change');
      }

      const decryptedItem = await this.cryptoService.decryptItem(userSecretKey, encryptedItem);
      if (!decryptedItem) {
        throw new ItemError('Failed to decrypt external item');
      }
      
      this.itemsStateManager.updateItem(itemId, decryptedItem);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: this.authService.getCurrentUserId() || 'unknown',
        items: this.itemsStateManager.getItems().map(item => item.id === itemId ? decryptedItem : item),
        lastModified: new Date(),
      });
    } catch (error) {
      console.error('[ItemsService] Failed to handle external item updated:', error);
      throw new ItemError('Failed to handle external item updated', error as Error);
    }
  }

  public async handleExternalItemDeleted(itemId: string): Promise<void> {
    try {
      this.itemsStateManager.removeItem(itemId);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: this.authService.getCurrentUserId() || 'unknown',
        items: this.itemsStateManager.getItems(),
        lastModified: new Date(),
      });
    } catch (error) {
      console.error('[ItemsService] Failed to handle external item deleted:', error);
      throw new ItemError('Failed to handle external item deleted', error as Error);
    }
  }
}

// Import actual adapters and services
import { db } from '../adapters/database.adapter';
import { storage } from '../adapters/platform.storage.adapter';
import { authService } from './authService';
import { vaultService } from './vaultService';
import { secretsService } from './secretsService';
import { CryptoService } from './cryptoService';

// Create service instances
const cryptoServiceInstance = new CryptoService();

// Export service instance for dependency injection
export const itemsService = new ItemsService(
  new ItemsStateManager(),
  secretsService,
  cryptoServiceInstance,
  db,
  storage,
  authService,
  vaultService
);

// Export state manager for UI components that need direct access
export const itemsStateManager = itemsService.getStateManager();

// Export individual methods for backward compatibility
export const loadItemsWithFallback = () => itemsService.loadItemsWithFallback();
export const addItem = (item: ItemDecrypted) => itemsService.addItem(item);
export const updateItem = (itemId: string, updatedItem: ItemDecrypted) => itemsService.updateItem(itemId, updatedItem);
export const deleteItem = (itemId: string) => itemsService.deleteItem(itemId);
export const getAllItems = () => itemsService.getStateManager().getItems();
export const fetchAndStoreItems = (currentUserId: string) => itemsService.fetchAndStoreItems(currentUserId);
