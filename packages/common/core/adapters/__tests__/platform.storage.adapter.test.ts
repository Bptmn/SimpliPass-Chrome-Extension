/**
 * Tests for platform storage adapter
 */

import { AuthenticationError, CryptographyError } from '../../types/errors.types';

// Mock the storage adapter directly
const mockStorage = {
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

// Mock the platform storage adapter module
jest.mock('../platform.storage.adapter', () => ({
  storage: mockStorage
}));

describe('PlatformStorageAdapter', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('User Secret Key Management', () => {
    describe('storeUserSecretKeyToSecureLocalStorage', () => {
      it('should store user secret key successfully', async () => {
        const userSecretKey = 'secret-key-123';

        mockStorage.storeUserSecretKeyToSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.storeUserSecretKeyToSecureLocalStorage(userSecretKey);

        expect(mockStorage.storeUserSecretKeyToSecureLocalStorage).toHaveBeenCalledWith(userSecretKey);
      });

      it('should handle storage errors', async () => {
        const userSecretKey = 'secret-key-123';
        const error = new CryptographyError('Failed to store secret key');

        mockStorage.storeUserSecretKeyToSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.storeUserSecretKeyToSecureLocalStorage(userSecretKey)).rejects.toThrow(CryptographyError);
      });
    });

    describe('updateUserSecretKeyInSecureLocalStorage', () => {
      it('should update user secret key successfully', async () => {
        const userSecretKey = 'updated-secret-key-123';

        mockStorage.updateUserSecretKeyInSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.updateUserSecretKeyInSecureLocalStorage(userSecretKey);

        expect(mockStorage.updateUserSecretKeyInSecureLocalStorage).toHaveBeenCalledWith(userSecretKey);
      });

      it('should handle update errors', async () => {
        const userSecretKey = 'updated-secret-key-123';
        const error = new CryptographyError('Failed to update secret key');

        mockStorage.updateUserSecretKeyInSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.updateUserSecretKeyInSecureLocalStorage(userSecretKey)).rejects.toThrow(CryptographyError);
      });
    });

    describe('deleteUserSecretKeyFromSecureLocalStorage', () => {
      it('should delete user secret key successfully', async () => {
        mockStorage.deleteUserSecretKeyFromSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.deleteUserSecretKeyFromSecureLocalStorage();

        expect(mockStorage.deleteUserSecretKeyFromSecureLocalStorage).toHaveBeenCalled();
      });

      it('should handle delete errors', async () => {
        const error = new CryptographyError('Failed to delete secret key');

        mockStorage.deleteUserSecretKeyFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.deleteUserSecretKeyFromSecureLocalStorage()).rejects.toThrow(CryptographyError);
      });
    });

    describe('getUserSecretKeyFromSecureLocalStorage', () => {
      it('should get user secret key successfully', async () => {
        const mockSecretKey = 'secret-key-123';

        mockStorage.getUserSecretKeyFromSecureLocalStorage.mockResolvedValue(mockSecretKey);

        const result = await mockStorage.getUserSecretKeyFromSecureLocalStorage();

        expect(mockStorage.getUserSecretKeyFromSecureLocalStorage).toHaveBeenCalled();
        expect(result).toBe(mockSecretKey);
      });

      it('should return null for non-existent secret key', async () => {
        mockStorage.getUserSecretKeyFromSecureLocalStorage.mockResolvedValue(null);

        const result = await mockStorage.getUserSecretKeyFromSecureLocalStorage();

        expect(result).toBeNull();
      });

      it('should handle get errors', async () => {
        const error = new CryptographyError('Failed to get secret key');

        mockStorage.getUserSecretKeyFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.getUserSecretKeyFromSecureLocalStorage()).rejects.toThrow(CryptographyError);
      });
    });
  });

  describe('User Management', () => {
    describe('storeUserToSecureLocalStorage', () => {
      it('should store user successfully', async () => {
        const user = { id: 'user123', email: 'test@example.com' };

        mockStorage.storeUserToSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.storeUserToSecureLocalStorage(user);

        expect(mockStorage.storeUserToSecureLocalStorage).toHaveBeenCalledWith(user);
      });

      it('should handle storage errors', async () => {
        const user = { id: 'user123', email: 'test@example.com' };
        const error = new AuthenticationError('Failed to store user');

        mockStorage.storeUserToSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.storeUserToSecureLocalStorage(user)).rejects.toThrow(AuthenticationError);
      });
    });

    describe('updateUserInSecureLocalStorage', () => {
      it('should update user successfully', async () => {
        const user = { id: 'user123', email: 'updated@example.com' };

        mockStorage.updateUserInSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.updateUserInSecureLocalStorage(user);

        expect(mockStorage.updateUserInSecureLocalStorage).toHaveBeenCalledWith(user);
      });

      it('should handle update errors', async () => {
        const user = { id: 'user123', email: 'updated@example.com' };
        const error = new AuthenticationError('Failed to update user');

        mockStorage.updateUserInSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.updateUserInSecureLocalStorage(user)).rejects.toThrow(AuthenticationError);
      });
    });

    describe('deleteUserFromSecureLocalStorage', () => {
      it('should delete user successfully', async () => {
        mockStorage.deleteUserFromSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.deleteUserFromSecureLocalStorage();

        expect(mockStorage.deleteUserFromSecureLocalStorage).toHaveBeenCalled();
      });

      it('should handle delete errors', async () => {
        const error = new AuthenticationError('Failed to delete user');

        mockStorage.deleteUserFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.deleteUserFromSecureLocalStorage()).rejects.toThrow(AuthenticationError);
      });
    });

    describe('getUserFromSecureLocalStorage', () => {
      it('should get user successfully', async () => {
        const mockUser = { id: 'user123', email: 'test@example.com' };

        mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(mockUser);

        const result = await mockStorage.getUserFromSecureLocalStorage();

        expect(mockStorage.getUserFromSecureLocalStorage).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });

      it('should return null for non-existent user', async () => {
        mockStorage.getUserFromSecureLocalStorage.mockResolvedValue(null);

        const result = await mockStorage.getUserFromSecureLocalStorage();

        expect(result).toBeNull();
      });

      it('should handle get errors', async () => {
        const error = new AuthenticationError('Failed to get user');

        mockStorage.getUserFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.getUserFromSecureLocalStorage()).rejects.toThrow(AuthenticationError);
      });
    });
  });

  describe('Vault Management', () => {
    describe('storeVaultToSecureLocalStorage', () => {
      it('should store vault successfully', async () => {
        const vault = { items: [], lastSync: new Date() };

        mockStorage.storeVaultToSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.storeVaultToSecureLocalStorage(vault);

        expect(mockStorage.storeVaultToSecureLocalStorage).toHaveBeenCalledWith(vault);
      });

      it('should handle storage errors', async () => {
        const vault = { items: [], lastSync: new Date() };
        const error = new CryptographyError('Failed to store vault');

        mockStorage.storeVaultToSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.storeVaultToSecureLocalStorage(vault)).rejects.toThrow(CryptographyError);
      });
    });

    describe('updateVaultInSecureLocalStorage', () => {
      it('should update vault successfully', async () => {
        const vault = { items: [{ id: '1', title: 'Item 1' }], lastSync: new Date() };

        mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.updateVaultInSecureLocalStorage(vault);

        expect(mockStorage.updateVaultInSecureLocalStorage).toHaveBeenCalledWith(vault);
      });

      it('should handle update errors', async () => {
        const vault = { items: [{ id: '1', title: 'Item 1' }], lastSync: new Date() };
        const error = new CryptographyError('Failed to update vault');

        mockStorage.updateVaultInSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.updateVaultInSecureLocalStorage(vault)).rejects.toThrow(CryptographyError);
      });
    });

    describe('deleteVaultFromSecureLocalStorage', () => {
      it('should delete vault successfully', async () => {
        mockStorage.deleteVaultFromSecureLocalStorage.mockResolvedValue(undefined);

        await mockStorage.deleteVaultFromSecureLocalStorage();

        expect(mockStorage.deleteVaultFromSecureLocalStorage).toHaveBeenCalled();
      });

      it('should handle delete errors', async () => {
        const error = new CryptographyError('Failed to delete vault');

        mockStorage.deleteVaultFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.deleteVaultFromSecureLocalStorage()).rejects.toThrow(CryptographyError);
      });
    });

    describe('getVaultFromSecureLocalStorage', () => {
      it('should get vault successfully', async () => {
        const mockVault = { items: [{ id: '1', title: 'Item 1' }], lastSync: new Date() };

        mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);

        const result = await mockStorage.getVaultFromSecureLocalStorage();

        expect(mockStorage.getVaultFromSecureLocalStorage).toHaveBeenCalled();
        expect(result).toEqual(mockVault);
      });

      it('should return null for non-existent vault', async () => {
        mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(null);

        const result = await mockStorage.getVaultFromSecureLocalStorage();

        expect(result).toBeNull();
      });

      it('should handle get errors', async () => {
        const error = new CryptographyError('Failed to get vault');

        mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(error);

        await expect(mockStorage.getVaultFromSecureLocalStorage()).rejects.toThrow(CryptographyError);
      });
    });
  });

  describe('clearAllSecureLocalStorage', () => {
    it('should clear all storage successfully', async () => {
      mockStorage.clearAllSecureLocalStorage.mockResolvedValue(undefined);

      await mockStorage.clearAllSecureLocalStorage();

      expect(mockStorage.clearAllSecureLocalStorage).toHaveBeenCalled();
    });

    it('should handle clear errors', async () => {
      const error = new CryptographyError('Failed to clear storage');

      mockStorage.clearAllSecureLocalStorage.mockRejectedValue(error);

      await expect(mockStorage.clearAllSecureLocalStorage()).rejects.toThrow(CryptographyError);
    });
  });
});