// packages/common/core/services/__tests__/itemsService.test.ts
import { ItemsService, ItemsStateManager } from '../itemsService';
import { ISecretsService } from '../secretsService';
import { ICryptoService } from '../cryptoService';
import { IDatabaseAdapter } from '../../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../../adapters/platform.storage.adapter';
import { IAuthService } from '../../libraries/auth/firebase';
import { IVaultService } from '../vaultService';
import { ItemDecrypted, ItemEncrypted } from '../../types/items.types';

describe('ItemsService', () => {
  let itemsService: ItemsService;
  let itemsStateManager: ItemsStateManager;
  let mockSecretsService: jest.Mocked<ISecretsService>;
  let mockCryptoService: jest.Mocked<ICryptoService>;
  let mockDbAdapter: jest.Mocked<IDatabaseAdapter>;
  let mockStorageAdapter: jest.Mocked<IPlatformStorageAdapter>;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockVaultService: jest.Mocked<IVaultService>;

  beforeEach(() => {
    itemsStateManager = new ItemsStateManager();
    mockSecretsService = {
      getUserSecretKey: jest.fn(),
      storeUserSecretKey: jest.fn(),
      deleteUserSecretKey: jest.fn(),
      hasUserSecretKey: jest.fn(),
      deriveAndStoreUserSecretKey: jest.fn(),
    };
    mockCryptoService = {
      decryptItem: jest.fn(),
      decryptAllItems: jest.fn(),
      encryptItem: jest.fn(),
    };
    mockDbAdapter = {
      getCollection: jest.fn(),
      getDocument: jest.fn(),
      addDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      generateItemDatabaseId: jest.fn(),
      startListeners: jest.fn(),
      stopListeners: jest.fn(),
      getListenersState: jest.fn(),
      isListening: jest.fn(),
      getListenersError: jest.fn(),
      clearListenersError: jest.fn(),
    };
    mockStorageAdapter = {
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
        clearAllSecureLocalStorage: jest.fn(),
    };
    mockAuthService = {
      signInWithFirebaseToken: jest.fn(),
      signOutFromFirebase: jest.fn(),
      getCurrentUserId: jest.fn(),
      getAuth: jest.fn(),
      getFirestore: jest.fn(),
    };
    mockVaultService = {
      setLocalVault: jest.fn(),
      getLocalVault: jest.fn(),
      clearLocalVault: jest.fn(),
    };

    itemsService = new ItemsService(
      itemsStateManager,
      mockSecretsService,
      mockCryptoService,
      mockDbAdapter,
      mockStorageAdapter,
      mockAuthService,
      mockVaultService,
    );
  });

  it('should fetch and store items', async () => {
    mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
    mockDbAdapter.getCollection.mockResolvedValue([
      { id: '1', item_key_encrypted: 'key', content_encrypted: 'content' } as ItemEncrypted,
    ]);
    mockCryptoService.decryptAllItems.mockResolvedValue([
      { id: '1', title: 'Test Item' } as ItemDecrypted,
    ]);

    await itemsService.fetchAndStoreItems('user-1');

    expect(itemsStateManager.getItems()).toHaveLength(1);
    expect(mockStorageAdapter.updateVaultInSecureLocalStorage).toHaveBeenCalled();
  });

  it('should add an item', async () => {
    mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
    mockAuthService.getCurrentUserId.mockReturnValue('user-1');
    mockDbAdapter.generateItemDatabaseId.mockReturnValue('item-2');
    mockCryptoService.encryptItem.mockResolvedValue({} as ItemEncrypted);

    await itemsService.addItem({ id: '1', title: 'New Item' } as ItemDecrypted);

    expect(itemsStateManager.getItems()).toHaveLength(1);
    expect(mockDbAdapter.addDocument).toHaveBeenCalled();
  });

  it('should update an item', async () => {
    itemsStateManager.setItems([{ id: '1', title: 'Old Item' } as ItemDecrypted]);
    mockSecretsService.getUserSecretKey.mockResolvedValue('secret-key');
    mockAuthService.getCurrentUserId.mockReturnValue('user-1');
    mockCryptoService.encryptItem.mockResolvedValue({} as ItemEncrypted);

    await itemsService.updateItem('1', { id: '1', title: 'Updated Item' } as ItemDecrypted);

    expect(itemsStateManager.getItems()[0].title).toBe('Updated Item');
    expect(mockDbAdapter.updateDocument).toHaveBeenCalled();
  });

  it('should delete an item', async () => {
    itemsStateManager.setItems([{ id: '1', title: 'Test Item' } as ItemDecrypted]);
    mockAuthService.getCurrentUserId.mockReturnValue('user-1');

    await itemsService.deleteItem('1');

    expect(itemsStateManager.getItems()).toHaveLength(0);
    expect(mockDbAdapter.deleteDocument).toHaveBeenCalled();
  });
});
