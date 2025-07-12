/**
 * Tests for persistent user secret key deletion
 */

import { deleteUserSecretKeyPersistent, clearAllPersistentSessionData } from '../deleteUserSecretKeyPersistent';

// Mock chrome storage
const mockChromeStorage = {
  local: {
    remove: jest.fn(),
  },
};
Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
});

describe('Persistent User Secret Key Deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockChromeStorage.local.remove.mockImplementation((keys, callback) => {
      if (callback) callback();
    });
  });

  describe('deleteUserSecretKeyPersistent', () => {
    it('should delete persistent user secret key', async () => {
      await deleteUserSecretKeyPersistent();

      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith([
        'simplipass_persistent_user_secret_key'
      ]);
    });

    it('should handle storage errors gracefully', async () => {
      mockChromeStorage.local.remove.mockImplementation((keys, callback) => {
        if (callback) callback();
        throw new Error('Storage error');
      });

      await expect(deleteUserSecretKeyPersistent()).rejects.toThrow('Failed to delete persistent user secret key');
    });

    it('should handle chrome storage not available', async () => {
      // Temporarily remove chrome storage
      const originalChrome = global.chrome;
      delete (global as any).chrome;

      await expect(deleteUserSecretKeyPersistent()).rejects.toThrow('Failed to delete persistent user secret key');

      // Restore chrome storage
      global.chrome = originalChrome;
    });
  });

  describe('clearAllPersistentSessionData', () => {
    it('should clear all persistent session data', async () => {
      await clearAllPersistentSessionData();

      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith([
        'simplipass_persistent_user_secret_key',
        'simplipass_session_key',
        'simplipass_encrypted_vault',
        'simplipass_session_expires_at'
      ]);
    });

    it('should handle storage errors gracefully', async () => {
      mockChromeStorage.local.remove.mockImplementation((keys, callback) => {
        if (callback) callback();
        throw new Error('Storage error');
      });

      await expect(clearAllPersistentSessionData()).rejects.toThrow('Failed to clear persistent session data');
    });

    it('should handle chrome storage not available', async () => {
      // Temporarily remove chrome storage
      const originalChrome = global.chrome;
      delete (global as any).chrome;

      await expect(clearAllPersistentSessionData()).rejects.toThrow('Failed to clear persistent session data');

      // Restore chrome storage
      global.chrome = originalChrome;
    });
  });
}); 