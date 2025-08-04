// packages/common/core/services/__tests__/userService.test.ts
import { UserService, IUserService } from '../userService';
import { IDatabaseAdapter } from '../../adapters/database.adapter';
import { IPlatformStorageAdapter } from '../../adapters/platform.storage.adapter';
import { IAuthAdapter } from '../../adapters/auth.adapter';
import { useAppStateStore } from '../../../hooks/useAppState';
import { User } from '../../types/auth.types';
import { User as FirebaseUser } from 'firebase/auth';

const mockSetUserAndSecretKey = jest.fn();
jest.mock('../../../hooks/useAppState', () => ({
  useAppStateStore: {
    getState: () => ({
      setUserAndSecretKey: mockSetUserAndSecretKey,
    }),
  },
}));

describe('UserService', () => {
  let userService: IUserService;
  let mockDbAdapter: jest.Mocked<IDatabaseAdapter>;
  let mockStorageAdapter: jest.Mocked<IPlatformStorageAdapter>;
  let mockAuthAdapter: jest.Mocked<IAuthAdapter>;

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
    
    userService = new UserService(mockDbAdapter, mockStorageAdapter, mockAuthAdapter, useAppStateStore);
    mockSetUserAndSecretKey.mockClear();
  });

  it('should get current user', async () => {
    const firebaseUser = { uid: 'user-1' } as FirebaseUser;
    const userDoc = { email: 'test@test.com', username: 'testuser' };
    mockAuthAdapter.getCurrentUser.mockReturnValue(firebaseUser);
    mockAuthAdapter.onAuthStateChanged.mockImplementation((callback) => {
        callback(firebaseUser);
        return Promise.resolve(() => {});
    });
    mockDbAdapter.getDocument.mockResolvedValue(userDoc);
    
    const user = await userService.getCurrentUser();
    
    expect(user?.email).toBe(userDoc.email);
    expect(mockDbAdapter.getDocument).toHaveBeenCalledWith('users/user-1');
  });

  it('should handle user authentication state', async () => {
    const firebaseUser = { uid: 'user-1' } as FirebaseUser;
    const userDoc = { email: 'test@test.com', username: 'testuser' };
    mockAuthAdapter.getCurrentUser.mockReturnValue(firebaseUser);
    mockAuthAdapter.onAuthStateChanged.mockImplementation((callback) => {
        callback(firebaseUser);
        return Promise.resolve(() => {});
    });
    mockDbAdapter.getDocument.mockResolvedValue(userDoc);
    mockStorageAdapter.getUserSecretKeyFromSecureLocalStorage.mockResolvedValue('a-secret-key');

    const result = await userService.handleUserAuthenticationState('user-1');

    expect(result.success).toBe(true);
    expect(result.hasSecretKey).toBe(true);
    expect(mockSetUserAndSecretKey).toHaveBeenCalledWith(expect.any(Object), true);
  });
  
  it('should clear user data', async () => {
    await userService.clearUserData();
    expect(mockStorageAdapter.clearAllSecureLocalStorage).toHaveBeenCalled();
  });
});
