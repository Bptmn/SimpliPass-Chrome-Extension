// packages/common/utils/__tests__/crypto.test.ts
import {
  deriveKey,
  encryptData,
  decryptData,
  generateItemKey,
  base64UrlToBytes,
  bytesToBase64,
  base64ToBytes,
} from '@common/core/libraries/crypto';

// Mocking crypto for Node.js environment
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

describe('Crypto Utils', () => {
  const masterPassword = 'mysecretpassword';
  const saltBase64Url = 'somesalt_somesalt_somesalt';
  let derivedKey: string;

  beforeAll(async () => {
    derivedKey = await deriveKey(masterPassword, saltBase64Url);
  });

  describe('deriveKey', () => {
    it('should derive a key of the correct length', async () => {
      // The derived key is base64url encoded from 256 bits (32 bytes)
      // Base64 encoding increases size by a factor of 4/3, so 32 bytes -> 44 chars, but it's unpadded.
      // The regex also accounts for base64url characters
      expect(derivedKey).toMatch(/^[A-Za-z0-9\-_]{43}$/);
    });

    it('should produce the same key for the same inputs', async () => {
      const key1 = await deriveKey(masterPassword, saltBase64Url);
      const key2 = await deriveKey(masterPassword, saltBase64Url);
      expect(key1).toEqual(key2);
    });

    it('should produce different keys for different salts', async () => {
      // Use a valid base64url salt
      const differentSalt = 'another-salt_another-salt_another-salt';
      const key1 = await deriveKey(masterPassword, saltBase64Url);
      const key2 = await deriveKey(masterPassword, differentSalt);
      expect(key1).not.toEqual(key2);
    });

    it('should produce different keys for different passwords', async () => {
        const differentPassword = 'another-password';
        const key1 = await deriveKey(masterPassword, saltBase64Url);
        const key2 = await deriveKey(differentPassword, saltBase64Url);
        expect(key1).not.toEqual(key2);
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data successfully', () => {
      const plainText = 'This is a secret message.';
      const encryptedData = encryptData(derivedKey, plainText);
      const decryptedData = decryptData(derivedKey, encryptedData);

      expect(decryptedData).toEqual(plainText);
    });

    it('should fail decryption with the wrong key', async () => {
      const plainText = 'This is a secret message.';
      // Generate a different but valid key
      const wrongKey = await deriveKey('wrongpassword', saltBase64Url);
      const encryptedData = encryptData(derivedKey, plainText);

      expect(() => decryptData(wrongKey, encryptedData)).toThrow('Decryption failed');
    });

    it('should handle empty strings', () => {
        const plainText = '';
        const encryptedData = encryptData(derivedKey, plainText);
        const decryptedData = decryptData(derivedKey, encryptedData);
        expect(decryptedData).toEqual(plainText);
    });

    it('should handle special characters', () => {
        const plainText = '`~!@#$%^&*()_+-=[]{}|;:",./<>?';
        const encryptedData = encryptData(derivedKey, plainText);
        const decryptedData = decryptData(derivedKey, encryptedData);
        expect(decryptedData).toEqual(plainText);
    });
  });

  describe('generateItemKey', () => {
    it('should generate a random key in base64url format', () => {
      const key = generateItemKey();
      // 32 bytes of random data, base64url encoded. Should be 43 chars if unpadded.
      expect(key).toMatch(/^[A-Za-z0-9\-_]{43}$/);
    });

    it('should generate different keys on subsequent calls', () => {
        const key1 = generateItemKey();
        const key2 = generateItemKey();
        expect(key1).not.toEqual(key2);
    });
  });

  describe('base64 conversions', () => {
    it('should convert byte array to base64 and back', () => {
        const originalBytes = new Uint8Array([1,2,3,4,5]);
        const base64String = bytesToBase64(originalBytes);
        const finalBytes = base64ToBytes(base64String);
        expect(finalBytes).toEqual(originalBytes);
    });

    it('should convert base64url to byte array and back', () => {
        const originalString = 'somesalt_somesalt_somesalt';
        const bytes = base64UrlToBytes(originalString);
        // Re-encoding may not produce the exact same string due to padding, but bytes should be same
        const b64 = bytesToBase64(bytes);
        const urlb64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
        const finalBytes = base64UrlToBytes(urlb64);
        expect(finalBytes).toEqual(bytes);
    });
  });
});
