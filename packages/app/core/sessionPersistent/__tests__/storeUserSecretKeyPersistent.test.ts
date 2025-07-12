/**
 * Tests for persistent user secret key storage
 */

import { storeUserSecretKeyPersistent, isPersistentKeyStorageAvailable } from '../storeUserSecretKeyPersistent';
import { generateStableFingerprintKey, generateStableFingerprint } from '../fingerprint';
import { encryptData } from '@app/utils/crypto';

// Mock dependencies
jest.mock('../fingerprint');
jest.mock('@app/utils/crypto');

// Mock chrome storage with actual storage simulation
const mockStorage = new Map();
const mockChromeStorage = {
  local: {
    set: jest.fn(async (data, callback) => {
      Object.entries(data).forEach(([key, value]) => {
        mockStorage.set(key, value);
      });
      if (callback) callback();
      return Promise.resolve();
    }),
    get: jest.fn(async (keys, callback) => {
      const result: Record<string, any> = {};
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          result[key] = mockStorage.get(key);
        });
      } else if (typeof keys === 'string') {
        result[keys] = mockStorage.get(keys);
      } else if (keys === null || keys === undefined) {
        // Get all keys
        mockStorage.forEach((value, key) => {
          result[key] = value;
        });
      }
      if (callback) callback(result);
      return Promise.resolve(result);
    }),
  },
};
Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
});

describe('Persistent User Secret Key Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (generateStableFingerprintKey as jest.Mock).mockResolvedValue('fingerprint-key');
    (generateStableFingerprint as jest.Mock).mockReturnValue('device-fingerprint');
    (encryptData as jest.Mock).mockResolvedValue('encrypted-key');
    
    mockChromeStorage.local.set.mockImplementation(async (data, callback) => {
      if (callback) callback();
      return Promise.resolve();
    });
    mockChromeStorage.local.get.mockImplementation(async (keys, callback) => {
      if (callback) callback({});
      return Promise.resolve({});
    });
  });

  describe('storeUserSecretKeyPersistent', () => {
    it('should store user secret key with device fingerprint', async () => {
      const userSecretKey = 'test-secret-key';
      const expiresAt = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days

      await storeUserSecretKeyPersistent(userSecretKey, expiresAt);

      expect(generateStableFingerprintKey).toHaveBeenCalled();
      expect(generateStableFingerprint).toHaveBeenCalled();
      expect(encryptData).toHaveBeenCalledWith(userSecretKey, 'fingerprint-key');
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt,
          version: '1.0',
        },
      });
    });

    it('should handle storage errors gracefully', async () => {
      const userSecretKey = 'test-secret-key';
      const expiresAt = Date.now() + (15 * 24 * 60 * 60 * 1000);

      mockChromeStorage.local.set.mockImplementation(async (data, callback) => {
        if (callback) callback();
        throw new Error('Storage error');
      });

      await expect(storeUserSecretKeyPersistent(userSecretKey, expiresAt)).rejects.toThrow('Failed to store user secret key persistently');
    });

    it('should handle encryption errors gracefully', async () => {
      const userSecretKey = 'test-secret-key';
      const expiresAt = Date.now() + (15 * 24 * 60 * 60 * 1000);

      (encryptData as jest.Mock).mockRejectedValue(new Error('Encryption failed'));

      await expect(storeUserSecretKeyPersistent(userSecretKey, expiresAt)).rejects.toThrow('Failed to store user secret key persistently');
    });
  });

  describe('isPersistentKeyStorageAvailable', () => {
    it('should return true when persistent key exists', async () => {
      mockChromeStorage.local.get.mockImplementation(async (keys, callback) => {
        if (callback) callback({
          simplipass_persistent_user_secret_key: {
            encryptedKey: 'encrypted-key',
            fingerprint: 'device-fingerprint',
            expiresAt: Date.now() + 1000,
            version: '1.0',
          },
        });
        return Promise.resolve({
          simplipass_persistent_user_secret_key: {
            encryptedKey: 'encrypted-key',
            fingerprint: 'device-fingerprint',
            expiresAt: Date.now() + 1000,
            version: '1.0',
          },
        });
      });

      const result = await isPersistentKeyStorageAvailable();

      expect(result).toBe(true);
    });

    it('should return false when persistent key does not exist', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        if (callback) callback({});
      });

      const result = await isPersistentKeyStorageAvailable();

      expect(result).toBe(false);
    });

    it('should return false on storage error', async () => {
      mockChromeStorage.local.get.mockImplementation(async (keys, callback) => {
        if (callback) callback();
        throw new Error('Storage error');
      });

      const result = await isPersistentKeyStorageAvailable();

      expect(result).toBe(false);
    });
  });
}); 