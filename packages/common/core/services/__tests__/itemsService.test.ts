/**
 * Tests for itemsService
 */

import { CryptographyError, NetworkError, AuthenticationError, ItemError } from '../../types/errors.types';
import { ItemEncrypted, ItemDecrypted } from '../../types/items.types';

// Mock all dependencies before importing the service
jest.mock('../secretsService', () => ({
  SecretsService: jest.fn().mockImplementation(() => ({
    getUserSecretKey: jest.fn(),
    getVaultKey: jest.fn()
  }))
}));

jest.mock('../cryptoService', () => ({
  CryptoService: jest.fn().mockImplementation(() => ({
    encryptItem: jest.fn(),
    decryptItem: jest.fn(),
    decryptAllItems: jest.fn()
  }))
}));

jest.mock('../../adapters/database.adapter', () => ({
  DatabaseAdapter: jest.fn().mockImplementation(() => ({
    getItems: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn()
  }))
}));

jest.mock('../../adapters/platform.storage.adapter', () => ({
  PlatformStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }))
}));

jest.mock('../authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    getCurrentUserId: jest.fn()
  }))
}));

jest.mock('../vaultService', () => ({
  VaultService: jest.fn().mockImplementation(() => ({
    getVault: jest.fn(),
    setVault: jest.fn()
  }))
}));

// Import after mocking
import { ItemsService, ItemsStateManager } from '../itemsService';

describe('ItemsStateManager', () => {
  let stateManager: ItemsStateManager;

  beforeEach(() => {
    stateManager = new ItemsStateManager();
  });

  describe('setItems', () => {
    it('should set items and emit itemsChanged event', () => {
      const mockItems: ItemDecrypted[] = [
        { id: '1', title: 'Test Item 1', type: 'credential' },
        { id: '2', title: 'Test Item 2', type: 'credential' }
      ];

      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.setItems(mockItems);

      expect(stateManager.getItems()).toEqual(mockItems);
      expect(listener).toHaveBeenCalledWith(mockItems);
    });
  });

  describe('getItems', () => {
    it('should return current items', () => {
      const mockItems: ItemDecrypted[] = [
        { id: '1', title: 'Test Item', type: 'credential' }
      ];

      stateManager.setItems(mockItems);
      expect(stateManager.getItems()).toEqual(mockItems);
    });
  });

  describe('addItem', () => {
    it('should add item and emit itemsChanged event', () => {
      const initialItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' }
      ];
      const newItem: ItemDecrypted = { id: '2', title: 'Item 2', type: 'credential' };

      stateManager.setItems(initialItems);
      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.addItem(newItem);

      expect(stateManager.getItems()).toHaveLength(2);
      expect(stateManager.getItems()).toContain(newItem);
      expect(listener).toHaveBeenCalledWith([...initialItems, newItem]);
    });
  });

  describe('updateItem', () => {
    it('should update existing item and emit itemsChanged event', () => {
      const initialItems: ItemDecrypted[] = [
        { id: '1', title: 'Original Title', type: 'credential' }
      ];
      const updatedItem: ItemDecrypted = { id: '1', title: 'Updated Title', type: 'credential' };

      stateManager.setItems(initialItems);
      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.updateItem('1', updatedItem);

      expect(stateManager.getItems()[0]).toEqual(updatedItem);
      expect(listener).toHaveBeenCalledWith([updatedItem]);
    });

    it('should not update non-existent item', () => {
      const initialItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' }
      ];

      stateManager.setItems(initialItems);
      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.updateItem('non-existent', { id: '2', title: 'New Item', type: 'credential' });

      expect(stateManager.getItems()).toEqual(initialItems);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item and emit itemsChanged event', () => {
      const initialItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' },
        { id: '2', title: 'Item 2', type: 'credential' }
      ];

      stateManager.setItems(initialItems);
      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.removeItem('1');

      expect(stateManager.getItems()).toHaveLength(1);
      expect(stateManager.getItems()).not.toContainEqual({ id: '1', title: 'Item 1', type: 'credential' });
      expect(listener).toHaveBeenCalledWith([{ id: '2', title: 'Item 2', type: 'credential' }]);
    });

    it('should not remove non-existent item', () => {
      const initialItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' }
      ];

      stateManager.setItems(initialItems);
      const listener = jest.fn();
      stateManager.on('itemsChanged', listener);

      stateManager.removeItem('non-existent');

      expect(stateManager.getItems()).toEqual(initialItems);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('ItemsService', () => {
  let itemsService: ItemsService;
  let itemsStateManager: ItemsStateManager;
  let mockSecretsService: any;
  let mockCryptoService: any;
  let mockDatabaseAdapter: any;
  let mockPlatformStorageAdapter: any;
  let mockAuthService: any;
  let mockVaultService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create state manager
    itemsStateManager = new ItemsStateManager();

    // Mock secrets service
    mockSecretsService = {
      getUserSecretKey: jest.fn(),
      getVaultKey: jest.fn()
    };

    // Mock crypto service
    mockCryptoService = {
      encryptItem: jest.fn(),
      decryptItem: jest.fn(),
      decryptAllItems: jest.fn()
    };

    // Mock database adapter
    mockDatabaseAdapter = {
      getCollection: jest.fn(),
      getDocument: jest.fn(),
      addDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      generateItemDatabaseId: jest.fn()
    };

    // Mock platform storage adapter
    mockPlatformStorageAdapter = {
      storeUserSecretKeyToSecureLocalStorage: jest.fn(),
      updateUserSecretKeyInSecureLocalStorage: jest.fn(),
      deleteUserSecretKeyFromSecureLocalStorage: jest.fn(),
      getUserSecretKeyFromSecureLocalStorage: jest.fn(),
      storeUserToSecureLocalStorage: jest.fn(),
      updateUserInSecureLocalStorage: jest.fn(),
      deleteUserFromSecureLocalStorage: jest.fn(),
      getUserFromSecureLocalStorage: jest.fn(),
      storeVaultToSecureLocalStorage: jest.fn(),
      updateVaultInSecureLocalStorage: jest.fn(),
      deleteVaultFromSecureLocalStorage: jest.fn(),
      getVaultFromSecureLocalStorage: jest.fn(),
      clearAllSecureLocalStorage: jest.fn()
    };

    // Mock auth service
    mockAuthService = {
      getCurrentUserId: jest.fn().mockReturnValue('user123')
    };

    // Mock vault service
    mockVaultService = {
      getVault: jest.fn(),
      setVault: jest.fn(),
      getLocalVault: jest.fn()
    };

    // Create service instance
    itemsService = new ItemsService(
      itemsStateManager,
      mockSecretsService,
      mockCryptoService,
      mockDatabaseAdapter,
      mockPlatformStorageAdapter,
      mockAuthService,
      mockVaultService
    );
  });

  describe('fetchAndStoreItems', () => {
    it('should fetch and decrypt items successfully', async () => {
      const userId = 'user123';
      const mockEncryptedItems: ItemEncrypted[] = [
        { id: '1', content_encrypted: 'encrypted1', item_key_encrypted: 'key1' },
        { id: '2', content_encrypted: 'encrypted2', item_key_encrypted: 'key2' }
      ];
      const mockDecryptedItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' },
        { id: '2', title: 'Item 2', type: 'credential' }
      ];

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockDatabaseAdapter.getCollection.mockResolvedValue(mockEncryptedItems);
      mockCryptoService.decryptAllItems.mockResolvedValue(mockDecryptedItems);

      const result = await itemsService.fetchAndStoreItems(userId);

      expect(mockSecretsService.getUserSecretKey).toHaveBeenCalled();
      expect(mockDatabaseAdapter.getCollection).toHaveBeenCalledWith(`users/${userId}/my_items`);
      expect(mockCryptoService.decryptAllItems).toHaveBeenCalledWith('secret-key', mockEncryptedItems);
      expect(result).toEqual(mockDecryptedItems);
    });

    it('should handle database errors', async () => {
      const userId = 'user123';
      const error = new NetworkError('Database connection failed');

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockDatabaseAdapter.getCollection.mockRejectedValue(error);

      await expect(itemsService.fetchAndStoreItems(userId)).rejects.toThrow(NetworkError);
    });

    it('should handle decryption errors', async () => {
      const userId = 'user123';
      const mockEncryptedItems: ItemEncrypted[] = [
        { id: '1', content_encrypted: 'encrypted1', item_key_encrypted: 'key1' }
      ];
      const error = new CryptographyError('Decryption failed');

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockDatabaseAdapter.getCollection.mockResolvedValue(mockEncryptedItems);
      mockCryptoService.decryptAllItems.mockRejectedValue(error);

      await expect(itemsService.fetchAndStoreItems(userId)).rejects.toThrow(CryptographyError);
    });
  });

  describe('loadItemsWithFallback', () => {
    it('should load items from vault when available', async () => {
      const mockItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' }
      ];
      const mockVault = { items: mockItems };

      mockVaultService.getLocalVault.mockResolvedValue(mockVault);

      const result = await itemsService.loadItemsWithFallback();

      expect(mockVaultService.getLocalVault).toHaveBeenCalled();
      expect(result).toEqual(mockItems);
    });

    it('should fallback to database when vault is empty', async () => {
      const userId = 'user123';
      const mockEncryptedItems: ItemEncrypted[] = [
        { id: '1', content_encrypted: 'encrypted1', item_key_encrypted: 'key1' }
      ];
      const mockDecryptedItems: ItemDecrypted[] = [
        { id: '1', title: 'Item 1', type: 'credential' }
      ];

      mockVaultService.getLocalVault.mockResolvedValue({ items: [] });
      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockDatabaseAdapter.getCollection.mockResolvedValue(mockEncryptedItems);
      mockCryptoService.decryptAllItems.mockResolvedValue(mockDecryptedItems);

      const result = await itemsService.loadItemsWithFallback();

      expect(mockDatabaseAdapter.getCollection).toHaveBeenCalledWith(`users/${userId}/my_items`);
      expect(result).toEqual(mockDecryptedItems);
    });
  });

  describe('addItem', () => {
    it('should add item successfully', async () => {
      const userId = 'user123';
      const newItem: ItemDecrypted = { id: '1', title: 'New Item', type: 'credential' };
      const encryptedItem: ItemEncrypted = { id: '1', content_encrypted: 'encrypted', item_key_encrypted: 'key' };

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockCryptoService.encryptItem.mockResolvedValue(encryptedItem);
      mockDatabaseAdapter.generateItemDatabaseId.mockReturnValue('item-id');
      mockDatabaseAdapter.addDocument.mockResolvedValue('item-id');

      await itemsService.addItem(newItem);

      expect(mockSecretsService.getUserSecretKey).toHaveBeenCalled();
      expect(mockCryptoService.encryptItem).toHaveBeenCalledWith('secret-key', { ...newItem, id: 'item-id' });
      expect(mockDatabaseAdapter.addDocument).toHaveBeenCalledWith(`users/${userId}/my_items`, encryptedItem);
    });

    it('should handle encryption errors', async () => {
      const newItem: ItemDecrypted = { id: '1', title: 'New Item', type: 'credential' };
      const error = new CryptographyError('Encryption failed');

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockCryptoService.encryptItem.mockRejectedValue(error);

      await expect(itemsService.addItem(newItem)).rejects.toThrow(CryptographyError);
    });
  });

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const userId = 'user123';
      const updatedItem: ItemDecrypted = { id: '1', title: 'Updated Item', type: 'credential' };
      const encryptedItem: ItemEncrypted = { id: '1', content_encrypted: 'encrypted', item_key_encrypted: 'key' };

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockCryptoService.encryptItem.mockResolvedValue(encryptedItem);
      mockDatabaseAdapter.updateDocument.mockResolvedValue(undefined);

      await itemsService.updateItem('1', updatedItem);

      expect(mockSecretsService.getUserSecretKey).toHaveBeenCalled();
      expect(mockCryptoService.encryptItem).toHaveBeenCalledWith('secret-key', updatedItem);
      expect(mockDatabaseAdapter.updateDocument).toHaveBeenCalledWith(`users/${userId}/my_items/1`, encryptedItem);
    });

    it('should handle update errors', async () => {
      const updatedItem: ItemDecrypted = { id: '1', title: 'Updated Item', type: 'credential' };
      const error = new ItemError('Update failed');

      mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
      mockCryptoService.encryptItem.mockResolvedValue({ id: '1', content_encrypted: 'encrypted', item_key_encrypted: 'key' });
      mockDatabaseAdapter.updateDocument.mockRejectedValue(error);

      await expect(itemsService.updateItem('1', updatedItem)).rejects.toThrow(ItemError);
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      const userId = 'user123';
      const itemId = '1';

      mockAuthService.getCurrentUserId.mockReturnValue(userId);
      mockDatabaseAdapter.deleteDocument.mockResolvedValue(undefined);

      await itemsService.deleteItem(itemId);

      expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
      expect(mockDatabaseAdapter.deleteDocument).toHaveBeenCalledWith(`users/${userId}/my_items/${itemId}`);
    });

    it('should handle delete errors', async () => {
      const itemId = '1';
      const error = new ItemError('Delete failed');

      mockAuthService.getCurrentUserId.mockReturnValue('user123');
      mockDatabaseAdapter.deleteDocument.mockRejectedValue(error);

      await expect(itemsService.deleteItem(itemId)).rejects.toThrow(ItemError);
    });
  });
});
