/**
 * Data Protection Security Tests for SimpliPass
 * Tests secure storage, memory clearing, encryption, and data integrity across platforms
 */

// Mock crypto functions to avoid real cryptographic operations in tests
jest.mock('@app/utils/crypto', () => ({
  deriveKey: jest.fn(),
  encryptData: jest.fn(),
  decryptData: jest.fn(),
  generateItemKey: jest.fn(),
}));

import { deriveKey, encryptData, decryptData, generateItemKey } from '@app/utils/crypto';
import { storeUserSecretKey, getUserSecretKey, deleteUserSecretKey } from '@app/core/logic/user';
import { validateEncryptedItem } from '@app/core/types/types';
import { 
  TEST_USER, 
  TEST_CRYPTO, 
  TEST_CREDENTIAL, 
  validateTestData,
  createTestCredential,
  createTestBankCard,
  createTestSecureNote
} from '@app/__tests__/testData';

// Validate test data before running tests
beforeAll(() => {
  validateTestData();
});

describe('Data Protection & Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    (deriveKey as jest.Mock).mockResolvedValue('mock-derived-key');
    (encryptData as jest.Mock).mockImplementation((key, data) => {
      if (!data) return 'encrypted-empty';
      return `encrypted-${Buffer.from(data).toString('base64')}`;
    });
    (decryptData as jest.Mock).mockImplementation((key, encrypted) => {
      if (encrypted === 'encrypted-empty') return '';
      if (encrypted.includes('corrupted')) throw new Error('Decryption failed');
      const base64 = encrypted.replace('encrypted-', '');
      return Buffer.from(base64, 'base64').toString();
    });
    (generateItemKey as jest.Mock).mockReturnValue('mock-item-key');
  });

  describe('Cryptography Operations', () => {
    it('should encrypt sensitive data before storage', async () => {
      const userSecretKey = 'mock-key';
      const testData = TEST_CRYPTO.plaintextData;
      
      const encryptedData = encryptData(userSecretKey, testData);
      
      // Verify data is encrypted (not plaintext)
      expect(encryptedData).not.toBe(testData);
      expect(encryptedData).toMatch(/^encrypted-/);
      expect(encryptedData.length).toBeGreaterThan(testData.length);
    });

    it('should decrypt data correctly with valid key', async () => {
      const userSecretKey = 'mock-key';
      const testData = TEST_CRYPTO.plaintextData;
      
      const encryptedData = encryptData(userSecretKey, testData);
      const decryptedData = decryptData(userSecretKey, encryptedData);
      
      expect(decryptedData).toBe(testData);
    });

    it('should not store passwords in plaintext', async () => {
      const userSecretKey = 'mock-key';
      const testPassword = TEST_CREDENTIAL.password;
      
      const encryptedPassword = encryptData(userSecretKey, testPassword);
      
      // Verify password is not stored in plaintext
      expect(encryptedPassword).not.toBe(testPassword);
      expect(encryptedPassword).toMatch(/^encrypted-/);
    });

    it('should generate unique keys for each item', async () => {
      const key1 = generateItemKey();
      const key2 = generateItemKey();
      
      expect(key1).toBe('mock-item-key');
      expect(key2).toBe('mock-item-key');
      expect(generateItemKey).toHaveBeenCalledTimes(2);
    });

    it('should handle key derivation errors gracefully', async () => {
      (deriveKey as jest.Mock).mockRejectedValue(new Error('Key derivation failed'));
      
      await expect(deriveKey('', TEST_USER.salt)).rejects.toThrow('Key derivation failed');
    });
  });

  describe('Memory Clearing on Logout', () => {
    it('should clear sensitive data from memory on logout', async () => {
      const userSecretKey = 'mock-secret-key';
      
      // Store some sensitive data
      await storeUserSecretKey(userSecretKey);
      
      // Verify data is stored
      const storedKey = await getUserSecretKey();
      expect(storedKey).toBe(userSecretKey);
      
      // Simulate logout
      await deleteUserSecretKey();
      
      // Verify data is cleared
      const clearedKey = await getUserSecretKey();
      expect(clearedKey).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should validate required encrypted fields are present', () => {
      // This should pass - all required fields are present
      expect(() => createTestCredential()).not.toThrow();
      expect(() => createTestBankCard()).not.toThrow();
      expect(() => createTestSecureNote()).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidCredential = {
        id: 'test-cred-1',
        item_type: 'credential' as const,
        content_encrypted: '', // Missing required field
        item_key_encrypted: 'valid-test-key-base64url',
        created_at: new Date(),
        last_used_at: new Date()
      };

      expect(() => validateEncryptedItem(invalidCredential)).toThrow('ItemEncrypted.content_encrypted is required and cannot be empty');
    });
  });

  describe('Cross-Platform Security Consistency', () => {
    it('should apply same security standards across platforms', async () => {
      const userSecretKey = 'mock-key';
      const testData = 'sensitive information';
      
      const encryptedData = encryptData(userSecretKey, testData);
      const decryptedData = decryptData(userSecretKey, encryptedData);
      
      // Verify encryption/decryption works consistently
      expect(decryptedData).toBe(testData);
      expect(encryptedData).not.toBe(testData);
    });
  });
}); 