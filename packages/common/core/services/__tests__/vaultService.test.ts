/**
 * Tests for vaultService
 * 
 * Tests vault clearing functionality
 */

// Mock dependencies BEFORE imports
jest.mock('../../adapters/platform.storage.adapter', () => ({
  storage: {
    deleteVaultFromSecureLocalStorage: jest.fn(),
    getVaultFromSecureLocalStorage: jest.fn(),
    storeVaultToSecureLocalStorage: jest.fn(),
  },
}));

jest.mock('../authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('../../libraries/auth/firebase', () => ({
  initFirebase: jest.fn(),
  getFirebaseAuth: jest.fn(),
  startAuthListeners: jest.fn(),
  stopAuthListeners: jest.fn(),
  signOutFromFirebase: jest.fn(),
}));

import { vaultService } from '../vaultService';
import { storage } from '../../adapters/platform.storage.adapter';
import { authService } from '../authService';

describe('vaultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearLocalVault', () => {
    it('should clear vault from storage', async () => {
      const mockDeleteVault = jest.fn().mockResolvedValue(undefined);
      (storage.deleteVaultFromSecureLocalStorage as jest.Mock) = mockDeleteVault;

      await vaultService.clearLocalVault();

      expect(mockDeleteVault).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const mockDeleteVault = jest.fn().mockRejectedValue(new Error('Storage error'));
      (storage.deleteVaultFromSecureLocalStorage as jest.Mock) = mockDeleteVault;

      await expect(vaultService.clearLocalVault()).rejects.toThrow();
    });

    it('should work even if deleteVaultFromSecureLocalStorage is not available', async () => {
      // Simulate storage adapter without deleteVaultFromSecureLocalStorage
      (storage.deleteVaultFromSecureLocalStorage as jest.Mock) = undefined as any;

      // Should not throw
      await expect(vaultService.clearLocalVault()).resolves.not.toThrow();
    });
  });

  describe('getLocalVault', () => {
    it('should return empty array if no vault exists', async () => {
      const mockGetVault = jest.fn().mockResolvedValue(null);
      (storage.getVaultFromSecureLocalStorage as jest.Mock) = mockGetVault;

      const result = await vaultService.getLocalVault();

      expect(result).toEqual([]);
      expect(mockGetVault).toHaveBeenCalledTimes(1);
    });

    it('should return items from vault', async () => {
      const mockVault = {
        userId: 'test-user',
        items: [
          { id: '1', title: 'Test Item', itemType: 'credential' },
        ],
        lastModified: new Date(),
      };
      const mockGetVault = jest.fn().mockResolvedValue(mockVault);
      (storage.getVaultFromSecureLocalStorage as jest.Mock) = mockGetVault;

      const result = await vaultService.getLocalVault();

      expect(result).toEqual(mockVault.items);
      expect(mockGetVault).toHaveBeenCalledTimes(1);
    });
  });

  describe('setLocalVault', () => {
    it('should store vault in storage', async () => {
      const mockStoreVault = jest.fn().mockResolvedValue(undefined);
      (storage.storeVaultToSecureLocalStorage as jest.Mock) = mockStoreVault;
      
      const mockGetCurrentUser = jest.fn().mockResolvedValue({ uid: 'test-user' });
      (authService.getCurrentUser as jest.Mock) = mockGetCurrentUser;

      const items = [
        { id: '1', title: 'Test Item', itemType: 'credential' },
      ];

      await vaultService.setLocalVault(items);

      expect(mockStoreVault).toHaveBeenCalledTimes(1);
      expect(mockStoreVault).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user',
          items,
          lastModified: expect.any(Date),
        })
      );
    });
  });
});
