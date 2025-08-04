// packages/common/core/services/__tests__/listenerService.test.ts
import { DatabaseListeners, AuthListeners } from '../listenerService';
import { IDatabaseAdapter } from '../../adapters/database.adapter';
import { IAuthAdapter } from '../../adapters/auth.adapter';
import { IPlatformStorageAdapter } from '../../adapters/platform.storage.adapter';
import { IItemsService } from '../itemsService';
import { IUserService } from '../userService';
import { IAuthService } from '../authService';
import { useAppStateStore } from '../../../hooks/useAppState';
import { User as FirebaseUser } from 'firebase/auth';

const mockSetAuthIsAvailable = jest.fn();
const mockSetUserAndSecretKey = jest.fn();
jest.mock('../../../hooks/useAppState', () => ({
  useAppStateStore: {
    getState: () => ({
      setAuthIsAvailable: mockSetAuthIsAvailable,
      setUserAndSecretKey: mockSetUserAndSecretKey,
      userSecretKeyExist: true,
    }),
  },
}));

describe('ListenerService', () => {
  let mockDbAdapter: jest.Mocked<IDatabaseAdapter>;
  let mockAuthAdapter: jest.Mocked<IAuthAdapter>;
  let mockStorageAdapter: jest.Mocked<IPlatformStorageAdapter>;
  let mockItemsService: jest.Mocked<IItemsService>;
  let mockUserService: jest.Mocked<IUserService>;
  
  beforeEach(() => {
    mockDbAdapter = {
        getDocument: jest.fn(),
        getCollection: jest.fn(),
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
    mockAuthAdapter = {
        initialize: jest.fn(),
        login: jest.fn(),
        isAuthenticated: jest.fn(),
        signOut: jest.fn(),
        fetchUserSalt: jest.fn(),
        startAuthListeners: jest.fn(),
        stopAuthListeners: jest.fn(),
        getCurrentUser: jest.fn(),
        onAuthStateChanged: jest.fn(),
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
    mockItemsService = {
      fetchAndStoreItems: jest.fn(),
      loadItemsWithFallback: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };
    mockUserService = {
        getCurrentUser: jest.fn(),
        getCurrentUserAsync: jest.fn(),
        waitForAuthStateStable: jest.fn(),
        checkUserSecretKey: jest.fn(),
        getCurrentUserId: jest.fn(),
        initializeUserData: jest.fn(),
        handleUserAuthenticationState: jest.fn(),
        clearUserData: jest.fn(),
        getFirestoreUserDocument: jest.fn(),
        refreshUserInfo: jest.fn(),
    };

    mockSetAuthIsAvailable.mockClear();
    mockSetUserAndSecretKey.mockClear();
  });

  describe('DatabaseListeners', () => {
    it('should start and stop listeners', async () => {
      const dbListeners = new DatabaseListeners(mockDbAdapter, mockStorageAdapter, mockItemsService, mockUserService, useAppStateStore);
      await dbListeners.start('user-1');
      expect(mockDbAdapter.startListeners).toHaveBeenCalled();
      expect(dbListeners.isActive()).toBe(true);
      dbListeners.stop();
      expect(mockDbAdapter.stopListeners).toHaveBeenCalled();
      expect(dbListeners.isActive()).toBe(false);
    });
  });

  describe('AuthListeners', () => {
    it('should handle user authentication and sign out', async () => {
        const mockAuthService = {
            initialize: jest.fn(),
            login: jest.fn(),
            isAuthenticated: jest.fn(),
            signOut: jest.fn(),
            fetchUserSalt: jest.fn(),
            getCurrentUser: jest.fn(),
            startAuthListeners: jest.fn(),
            stopAuthListeners: jest.fn(),
        };

        const dbListeners = new DatabaseListeners(mockDbAdapter, mockStorageAdapter, mockItemsService, mockUserService, useAppStateStore);
        const authListeners = new AuthListeners(mockAuthService as IAuthService, mockUserService, dbListeners, useAppStateStore);

        mockUserService.handleUserAuthenticationState.mockResolvedValue({ success: true, user: {} as any, hasSecretKey: true });

        await authListeners.start();
        expect(mockAuthService.startAuthListeners).toHaveBeenCalled();
        
        // The auth service now handles the auth state changes internally
        // We just verify that the listeners are started and stopped correctly
        expect(authListeners.isActive()).toBe(true);
        
        authListeners.stop();
        expect(mockAuthService.stopAuthListeners).toHaveBeenCalled();
        expect(authListeners.isActive()).toBe(false);
    });
  });
});
