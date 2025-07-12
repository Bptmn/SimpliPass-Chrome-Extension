/**
 * Tests for persistent user secret key restoration
 */

import { restoreUserSecretKeyPersistent, hasValidPersistentKey } from '../restoreUserSecretKeyPersistent';
import { generateStableFingerprintKey, validateDeviceFingerprint } from '../fingerprint';
import { decryptData } from '@app/utils/crypto';

// Mock dependencies
jest.mock('../fingerprint');
jest.mock('@app/utils/crypto');

// Mock chrome storage
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    remove: jest.fn(),
  },
};
Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
});

describe('Persistent User Secret Key Restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (generateStableFingerprintKey as jest.Mock).mockResolvedValue('fingerprint-key');
    (validateDeviceFingerprint as jest.Mock).mockReturnValue(true);
    (decryptData as jest.Mock).mockResolvedValue('decrypted-secret-key');
    
    mockChromeStorage.local.get.mockImplementation(async (_keys) => {
      return {};
    });
    mockChromeStorage.local.remove.mockImplementation(async (keys) => {
      return undefined;
    });
  });

  describe('restoreUserSecretKeyPersistent', () => {
    it('should successfully restore user secret key', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(true);
      expect(result.userSecretKey).toBe('decrypted-secret-key');
      expect(generateStableFingerprintKey).toHaveBeenCalled();
      expect(validateDeviceFingerprint).toHaveBeenCalledWith('device-fingerprint');
      expect(decryptData).toHaveBeenCalledWith('encrypted-key', 'fingerprint-key');
    });

    it('should return not_found when no persistent key exists', async () => {
      mockChromeStorage.local.get.mockImplementation(async (_keys) => ({}));

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('not_found');
    });

    it('should return expired when key has expired', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() - 1000, // Expired
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('expired');
      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith(['simplipass_persistent_user_secret_key']);
    });

    it('should return fingerprint_mismatch when device fingerprint does not match', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      (validateDeviceFingerprint as jest.Mock).mockReturnValue(false);

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('fingerprint_mismatch');
    });

    it('should return decryption_failed when decryption fails', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      (decryptData as jest.Mock).mockResolvedValue(null);

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('decryption_failed');
    });

    it('should return corrupted when version is incompatible', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '2.0', // Incompatible version
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('corrupted');
    });

    it('should return decryption_failed on storage error', async () => {
      mockChromeStorage.local.get.mockImplementation(async (_keys) => { throw new Error('Storage error'); });

      const result = await restoreUserSecretKeyPersistent();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('decryption_failed');
    });
  });

  describe('hasValidPersistentKey', () => {
    it('should return true for valid persistent key', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      const result = await hasValidPersistentKey();

      expect(result).toBe(true);
    });

    it('should return false when no persistent key exists', async () => {
      mockChromeStorage.local.get.mockImplementation(async (_keys) => ({}));

      const result = await hasValidPersistentKey();

      expect(result).toBe(false);
    });

    it('should return false when key has expired', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() - 1000, // Expired
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      const result = await hasValidPersistentKey();

      expect(result).toBe(false);
    });

    it('should return false when fingerprint does not match', async () => {
      const mockData = {
        simplipass_persistent_user_secret_key: {
          encryptedKey: 'encrypted-key',
          fingerprint: 'device-fingerprint',
          expiresAt: Date.now() + 1000,
          version: '1.0',
        },
      };

      mockChromeStorage.local.get.mockImplementation(async (_keys) => mockData);

      (validateDeviceFingerprint as jest.Mock).mockReturnValue(false);

      const result = await hasValidPersistentKey();

      expect(result).toBe(false);
    });

    it('should return false on storage error', async () => {
      mockChromeStorage.local.get.mockImplementation(async (_keys) => { throw new Error('Storage error'); });

      const result = await hasValidPersistentKey();

      expect(result).toBe(false);
    });
  });
}); 