// packages/common/core/services/itemsService.ts
import { EventEmitter } from 'events';
import { CryptographyError, NetworkError, AuthenticationError, ItemError } from '@common/types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '@common/types/items.types';
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
}

// State management for UI updates
export class ItemsStateManager extends EventEmitter {
  private currentItems: ItemDecrypted[] = [];
  private loading: boolean = false;
  private error: string | null = null;

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

  // Loading state management
  setLoading(loading: boolean) {
    this.loading = loading;
    this.emit('loadingChanged', loading);
  }

  isLoading(): boolean {
    return this.loading;
  }

  // Error state management
  setError(error: string | null) {
    this.error = error;
    this.emit('errorChanged', error);
  }

  getError(): string | null {
    return this.error;
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
      this.itemsStateManager.setLoading(true);
      this.itemsStateManager.setError(null);

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch items';
      this.itemsStateManager.setError(errorMessage);
      this.handleServiceError(error, 'fetch and store items');
    } finally {
      this.itemsStateManager.setLoading(false);
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
      
      // ✅ Update database and local storage only
      // Let the database listener handle state manager updates
      const documentData = { ...encryptedItem, id: databaseId };
      await this.db.addDocument(collectionPath, documentData);
      await this.storage.updateVaultInSecureLocalStorage({
        userId,
        items: [...this.itemsStateManager.getItems(), completeItem],
        lastModified: new Date(),
      });
      // Removed: this.itemsStateManager.addItem(completeItem);

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

      // ✅ Update database and local storage only
      // Let the database listener handle state manager updates
      await this.db.updateDocument(`${collectionPath}/${itemId}`, encryptedUpdates);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: realUserId,
        items: this.itemsStateManager.getItems().map(item => item.id === itemId ? updatedItem : item),
        lastModified: new Date(),
      });
      // Removed: this.itemsStateManager.updateItem(itemId, updatedItem);
      
    } catch (error) {
      this.handleServiceError(error, 'update item');
    }
  }

  public async deleteItem(itemId: string): Promise<void> {
    try {
      const realUserId = this.authService.getCurrentUserId();
      if (!realUserId) throw new AuthenticationError('User not authenticated');
      const collectionPath = `users/${realUserId}/my_items`;

      // ✅ Update database and local storage only
      // Let the database listener handle state manager updates
      await this.db.deleteDocument(`${collectionPath}/${itemId}`);
      await this.storage.updateVaultInSecureLocalStorage({
        userId: realUserId,
        items: this.itemsStateManager.getItems().filter(item => item.id !== itemId),
        lastModified: new Date(),
      });
      // Removed: this.itemsStateManager.removeItem(itemId);
      
    } catch (error) {
      this.handleServiceError(error, 'delete item');
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
