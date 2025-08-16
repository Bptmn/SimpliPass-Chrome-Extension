// packages/common/core/services/__tests__/cryptoService.test.ts
import { decryptItem, decryptAllItems, encryptItem } from '../cryptoService';
import {
  CredentialDecrypted,
  ItemEncrypted,
  BankCardDecrypted,
} from '../../types/items.types';
import { CryptographyError, ItemError } from '../../types/errors.types';
import * as cryptoUtils from '@common/core/libraries/crypto';

// Mocking crypto for Node.js environment
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

jest.mock('@common/core/libraries/crypto', () => ({
  encryptData: jest.fn().mockResolvedValue('encrypted-data'),
  decryptData: jest.fn().mockResolvedValue('decrypted-data'),
  generateItemKey: jest.fn().mockResolvedValue('generated-key'),
}));

const mockedCryptoUtils = cryptoUtils as jest.Mocked<typeof cryptoUtils>;

describe('Crypto Service', () => {
  const userSecretKey = 'a-very-secret-key';
  const itemKey = 'a-secret-item-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptItem and decryptItem', () => {
    it('should correctly encrypt and decrypt a credential item', async () => {
      const decryptedCredential: CredentialDecrypted = {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'password123',
        url: 'http://example.com',
        note: 'A note',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemType: 'credential',
        itemKey,
      };

      const encryptedContent = 'encrypted-content';
      const encryptedItemKey = 'encrypted-item-key';

      mockedCryptoUtils.encryptData
        .mockResolvedValueOnce(encryptedContent) // for content
        .mockResolvedValueOnce(encryptedItemKey); // for item key

      mockedCryptoUtils.decryptData
        .mockResolvedValueOnce(itemKey) // for item key
        .mockResolvedValueOnce(JSON.stringify(decryptedCredential)); // for content

      const encryptedItem: ItemEncrypted = await encryptItem(userSecretKey, decryptedCredential);

      expect(mockedCryptoUtils.encryptData).toHaveBeenCalledWith(itemKey, JSON.stringify(decryptedCredential));
      expect(mockedCryptoUtils.encryptData).toHaveBeenCalledWith(userSecretKey, itemKey);
      expect(encryptedItem.content_encrypted).toBe(encryptedContent);
      expect(encryptedItem.item_key_encrypted).toBe(encryptedItemKey);

      const decryptedItem = await decryptItem(userSecretKey, encryptedItem);

      expect(mockedCryptoUtils.decryptData).toHaveBeenCalledWith(userSecretKey, encryptedItemKey);
      expect(mockedCryptoUtils.decryptData).toHaveBeenCalledWith(itemKey, encryptedContent);
      expect(decryptedItem).toEqual(decryptedCredential);
    });

    it('should throw CryptographyError when encryption fails', async () => {
      const decryptedCredential: CredentialDecrypted = {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'password123',
        url: 'http://example.com',
        note: 'A note',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemType: 'credential',
        itemKey,
      };

      mockedCryptoUtils.encryptData.mockRejectedValue(new Error('Encryption failed'));

      await expect(encryptItem(userSecretKey, decryptedCredential)).rejects.toThrow(CryptographyError);
    });

    it('should throw ItemError for unknown item type', async () => {
      const encryptedItem: ItemEncrypted = {
        id: '1',
        content_encrypted: 'encrypted-content',
        item_key_encrypted: 'encrypted-key',
        created_at: new Date(),
        last_used_at: new Date(),
        item_type: 'unknownType',
      };

      mockedCryptoUtils.decryptData
        .mockResolvedValueOnce(itemKey)
        .mockResolvedValueOnce(JSON.stringify({ itemType: 'unknownType' }));

      await expect(decryptItem(userSecretKey, encryptedItem)).rejects.toThrow(ItemError);
    });

    it('should throw CryptographyError for invalid key during decryption', async () => {
      const encryptedItem: ItemEncrypted = {
        id: '1',
        content_encrypted: 'encrypted-content',
        item_key_encrypted: 'encrypted-key',
        created_at: new Date(),
        last_used_at: new Date(),
        item_type: 'credential',
      };

      mockedCryptoUtils.decryptData.mockRejectedValue(new Error('Invalid key'));

      await expect(decryptItem(userSecretKey, encryptedItem)).rejects.toThrow(CryptographyError);
    });
  });
  
  describe('decryptAllItems', () => {
    it('should decrypt a list of items', async () => {
        const item1: CredentialDecrypted = { id: '1', title: 'item1', itemType: 'credential', itemKey: 'key1' } as any;
        const item2: BankCardDecrypted = { id: '2', title: 'item2', itemType: 'bank_card', itemKey: 'key2' } as any;

        const encryptedItems: ItemEncrypted[] = [
            { id: '1', content_encrypted: 'enc1', item_key_encrypted: 'encKey1' } as any,
            { id: '2', content_encrypted: 'enc2', item_key_encrypted: 'encKey2' } as any,
        ];

        mockedCryptoUtils.decryptData
            .mockResolvedValueOnce('key1')
            .mockResolvedValueOnce(JSON.stringify(item1))
            .mockResolvedValueOnce('key2')
            .mockResolvedValueOnce(JSON.stringify(item2));

        const decrypted = await decryptAllItems(userSecretKey, encryptedItems);

        expect(decrypted).toHaveLength(2);
        expect(decrypted[0].title).toBe('item1');
        expect(decrypted[1].title).toBe('item2');
    });

    it('should handle malformed items gracefully', async () => {
        const encryptedItems: ItemEncrypted[] = [
            { id: '1', content_encrypted: null as any, item_key_encrypted: 'encKey1' } as any,
            { id: '2', content_encrypted: 'enc2', item_key_encrypted: 'encKey2' } as any,
        ];

        const item2: CredentialDecrypted = { id: '2', title: 'item2', itemType: 'credential', itemKey: 'key2' } as any;

        mockedCryptoUtils.decryptData
            .mockResolvedValueOnce('key2')
            .mockResolvedValueOnce(JSON.stringify(item2));

        const decrypted = await decryptAllItems(userSecretKey, encryptedItems);

        expect(decrypted).toHaveLength(1);
        expect(decrypted[0].title).toBe('item2');
    });

    it('should throw CryptographyError when all items fail to decrypt', async () => {
        const encryptedItems: ItemEncrypted[] = [
            { id: '1', content_encrypted: 'enc1', item_key_encrypted: 'encKey1' } as any,
        ];

        mockedCryptoUtils.decryptData.mockRejectedValue(new Error('Decryption failed'));

        await expect(decryptAllItems(userSecretKey, encryptedItems)).rejects.toThrow(CryptographyError);
    });

    it('should return empty array for empty input', async () => {
        const decrypted = await decryptAllItems(userSecretKey, []);
        expect(decrypted).toEqual([]);
    });
  });

  describe('encryptItem error handling', () => {
    it('should throw CryptographyError when encryption fails', async () => {
      const decryptedCredential: CredentialDecrypted = {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'password123',
        url: 'http://example.com',
        note: 'A note',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemType: 'credential',
        itemKey,
      };

      mockedCryptoUtils.encryptData.mockRejectedValue(new Error('Encryption failed'));

      await expect(encryptItem(userSecretKey, decryptedCredential)).rejects.toThrow(CryptographyError);
    });
  });
});
