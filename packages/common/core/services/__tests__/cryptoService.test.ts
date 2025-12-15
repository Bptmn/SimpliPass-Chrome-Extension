/**
 * Tests for cryptoService
 * 
 * Tests encryption and decryption of items using cryptoService
 */

import { encryptItem, decryptItem, decryptAllItems, CryptoService } from '../cryptoService';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, ItemEncrypted } from '@common/types/items.types';
import { deriveKey, generateItemKey } from '@common/core/libraries/crypto';

// Mocking crypto for Node.js environment
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

describe('cryptoService', () => {
  const masterPassword = 'TestPassword123!';
  const saltBase64Url = 'testsalt_testsalt_testsalt';
  let userSecretKey: string;

  beforeAll(async () => {
    // Derive user secret key from password
    userSecretKey = await deriveKey(masterPassword, saltBase64Url);
  });

  describe('encryptItem and decryptItem', () => {
    it('should encrypt and decrypt a credential successfully', async () => {
      const itemKey = generateItemKey();
      const credential: CredentialDecrypted = {
        id: 'test-credential-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Credential',
        username: 'test@example.com',
        password: 'TestPassword123!',
        note: 'Test note',
        url: 'https://example.com',
        itemType: 'credential',
        itemKey,
      };

      // Encrypt
      const encrypted = await encryptItem(userSecretKey, credential);

      // Verify encrypted structure
      expect(encrypted.id).toBe(credential.id);
      expect(encrypted.content_encrypted).toBeDefined();
      expect(encrypted.item_key_encrypted).toBeDefined();
      expect(typeof encrypted.content_encrypted).toBe('string');
      expect(typeof encrypted.item_key_encrypted).toBe('string');

      // Decrypt
      const decrypted = await decryptItem(userSecretKey, encrypted);

      expect(decrypted).not.toBeNull();
      expect(decrypted?.id).toBe(credential.id);
      expect(decrypted?.title).toBe(credential.title);
      expect(decrypted?.username).toBe(credential.username);
      expect(decrypted?.password).toBe(credential.password);
      expect(decrypted?.note).toBe(credential.note);
      expect(decrypted?.url).toBe(credential.url);
      expect(decrypted?.itemType).toBe('credential');
    });

    it('should encrypt and decrypt a bank card successfully', async () => {
      const itemKey = generateItemKey();
      const bankCard: BankCardDecrypted = {
        id: 'test-card-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Card',
        owner: 'John Doe',
        cardNumber: '4111111111111111',
        expirationDate: '12/25',
        verificationNumber: '123',
        bankName: 'Test Bank',
        bankDomain: 'testbank.com',
        note: 'Test note',
        color: '#FF0000',
        itemType: 'bank_card',
        itemKey,
      };

      // Encrypt
      const encrypted = await encryptItem(userSecretKey, bankCard);

      // Decrypt
      const decrypted = await decryptItem(userSecretKey, encrypted);

      expect(decrypted).not.toBeNull();
      expect(decrypted?.id).toBe(bankCard.id);
      expect(decrypted?.title).toBe(bankCard.title);
      expect(decrypted?.owner).toBe(bankCard.owner);
      expect(decrypted?.cardNumber).toBe(bankCard.cardNumber);
      expect(decrypted?.expirationDate).toBe(bankCard.expirationDate);
      expect(decrypted?.verificationNumber).toBe(bankCard.verificationNumber);
      expect(decrypted?.itemType).toBe('bank_card');
    });

    it('should encrypt and decrypt a secure note successfully', async () => {
      const itemKey = generateItemKey();
      const secureNote: SecureNoteDecrypted = {
        id: 'test-note-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Note',
        note: 'This is a secure note with sensitive information',
        color: '#00FF00',
        itemType: 'secure_note',
        itemKey,
      };

      // Encrypt
      const encrypted = await encryptItem(userSecretKey, secureNote);

      // Decrypt
      const decrypted = await decryptItem(userSecretKey, encrypted);

      expect(decrypted).not.toBeNull();
      expect(decrypted?.id).toBe(secureNote.id);
      expect(decrypted?.title).toBe(secureNote.title);
      expect(decrypted?.note).toBe(secureNote.note);
      expect(decrypted?.itemType).toBe('secure_note');
    });

    it('should fail to decrypt with wrong user secret key', async () => {
      const itemKey = generateItemKey();
      const credential: CredentialDecrypted = {
        id: 'test-credential-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Credential',
        username: 'test@example.com',
        password: 'TestPassword123!',
        note: '',
        url: '',
        itemType: 'credential',
        itemKey,
      };

      // Encrypt with correct key
      const encrypted = await encryptItem(userSecretKey, credential);

      // Try to decrypt with wrong key
      const wrongKey = await deriveKey('WrongPassword123!', saltBase64Url);

      await expect(decryptItem(wrongKey, encrypted)).rejects.toThrow();
    });

    it('should handle empty fields correctly', async () => {
      const itemKey = generateItemKey();
      const credential: CredentialDecrypted = {
        id: 'test-credential-empty',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Empty Credential',
        username: '',
        password: '',
        note: '',
        url: '',
        itemType: 'credential',
        itemKey,
      };

      const encrypted = await encryptItem(userSecretKey, credential);
      const decrypted = await decryptItem(userSecretKey, encrypted);

      expect(decrypted).not.toBeNull();
      expect(decrypted?.username).toBe('');
      expect(decrypted?.password).toBe('');
      expect(decrypted?.note).toBe('');
      expect(decrypted?.url).toBe('');
    });
  });

  describe('decryptAllItems', () => {
    it('should decrypt multiple items successfully', async () => {
      const itemKey1 = generateItemKey();
      const itemKey2 = generateItemKey();
      
      const credential: CredentialDecrypted = {
        id: 'test-credential-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Credential 1',
        username: 'test1@example.com',
        password: 'Password1',
        note: '',
        url: '',
        itemType: 'credential',
        itemKey: itemKey1,
      };

      const bankCard: BankCardDecrypted = {
        id: 'test-card-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Card',
        owner: 'John Doe',
        cardNumber: '4111111111111111',
        expirationDate: '12/25',
        verificationNumber: '123',
        bankName: 'Test Bank',
        bankDomain: '',
        note: '',
        color: '',
        itemType: 'bank_card',
        itemKey: itemKey2,
      };

      // Encrypt both items
      const encrypted1 = await encryptItem(userSecretKey, credential);
      const encrypted2 = await encryptItem(userSecretKey, bankCard);

      // Decrypt all items
      const decryptedItems = await decryptAllItems(userSecretKey, [encrypted1, encrypted2]);

      expect(decryptedItems).toHaveLength(2);
      expect(decryptedItems[0].id).toBe(credential.id);
      expect(decryptedItems[1].id).toBe(bankCard.id);
    });

    it('should handle empty items list', async () => {
      const decryptedItems = await decryptAllItems(userSecretKey, []);
      expect(decryptedItems).toHaveLength(0);
    });

    it('should skip invalid items and continue with valid ones', async () => {
      const itemKey = generateItemKey();
      const credential: CredentialDecrypted = {
        id: 'test-credential-1',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Credential',
        username: 'test@example.com',
        password: 'Password1',
        note: '',
        url: '',
        itemType: 'credential',
        itemKey,
      };

      const encrypted = await encryptItem(userSecretKey, credential);
      
      // Create invalid item
      const invalidItem: ItemEncrypted = {
        id: 'invalid-item',
        created_at: new Date('2024-01-01'),
        content_encrypted: 'invalid-encrypted-data',
        item_key_encrypted: 'invalid-key',
        last_used_at: new Date('2024-01-02'),
        item_type: 'credential',
      };

      // Should skip invalid item and return valid one
      const decryptedItems = await decryptAllItems(userSecretKey, [encrypted, invalidItem]);
      
      // Should have at least the valid item
      expect(decryptedItems.length).toBeGreaterThanOrEqual(1);
      expect(decryptedItems[0].id).toBe(credential.id);
    });
  });

  describe('CryptoService class', () => {
    it('should work as a class instance', async () => {
      const cryptoService = new CryptoService();
      const itemKey = generateItemKey();
      
      const credential: CredentialDecrypted = {
        id: 'test-credential-class',
        createdDateTime: new Date('2024-01-01'),
        lastUseDateTime: new Date('2024-01-02'),
        title: 'Test Credential',
        username: 'test@example.com',
        password: 'TestPassword123!',
        note: '',
        url: '',
        itemType: 'credential',
        itemKey,
      };

      const encrypted = await cryptoService.encryptItem(userSecretKey, credential);
      const decrypted = await cryptoService.decryptItem(userSecretKey, encrypted);

      expect(decrypted).not.toBeNull();
      expect(decrypted?.id).toBe(credential.id);
      expect(decrypted?.username).toBe(credential.username);
      expect(decrypted?.password).toBe(credential.password);
    });
  });
});
