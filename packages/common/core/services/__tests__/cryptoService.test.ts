// packages/common/core/services/__tests__/cryptoService.test.ts
import { CryptoService } from '../cryptoService';
import {
  CredentialDecrypted,
  ItemEncrypted,
  BankCardDecrypted,
  SecureNoteDecrypted,
} from '../../types/items.types';
import * as cryptoUtils from '@common/utils/crypto';

// Mocking crypto for Node.js environment
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

jest.mock('@common/utils/crypto', () => ({
  ...jest.requireActual('@common/utils/crypto'),
  encryptData: jest.fn().mockImplementation((key: string, data: string) => Promise.resolve(`encrypted-${data}`)),
  decryptData: jest.fn().mockImplementation((key: string, data: string) => Promise.resolve(data.replace('encrypted-', ''))),
}));

const mockedCryptoUtils = cryptoUtils as jest.Mocked<typeof cryptoUtils>;

describe('Crypto Service', () => {
  const userSecretKey = 'a-very-secret-key';
  const itemKey = 'a-secret-item-key';
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  afterEach(() => {
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

      const encryptedItem: ItemEncrypted = await cryptoService.encryptItem(userSecretKey, decryptedCredential);

      expect(mockedCryptoUtils.encryptData).toHaveBeenCalledWith(itemKey, JSON.stringify(decryptedCredential));
      expect(mockedCryptoUtils.encryptData).toHaveBeenCalledWith(userSecretKey, itemKey);
      expect(encryptedItem.content_encrypted).toBe(encryptedContent);
      expect(encryptedItem.item_key_encrypted).toBe(encryptedItemKey);

      const decryptedItem = await cryptoService.decryptItem(userSecretKey, encryptedItem);

      expect(mockedCryptoUtils.decryptData).toHaveBeenCalledWith(userSecretKey, encryptedItemKey);
      expect(mockedCryptoUtils.decryptData).toHaveBeenCalledWith(itemKey, encryptedContent);
      expect(decryptedItem).toEqual(decryptedCredential);
    });
  });
  
  describe('decryptAllItems', () => {
    it('should decrypt a list of items', async () => {
        const item1: CredentialDecrypted = { id: '1', title: 'item1', itemType: 'credential', itemKey: 'key1' } as any;
        const item2: BankCardDecrypted = { id: '2', title: 'item2', itemType: 'bankCard', itemKey: 'key2' } as any;

        const encryptedItems: ItemEncrypted[] = [
            { id: '1', content_encrypted: 'enc1', item_key_encrypted: 'encKey1' } as any,
            { id: '2', content_encrypted: 'enc2', item_key_encrypted: 'encKey2' } as any,
        ];

        mockedCryptoUtils.decryptData
            .mockResolvedValueOnce('key1')
            .mockResolvedValueOnce(JSON.stringify(item1))
            .mockResolvedValueOnce('key2')
            .mockResolvedValueOnce(JSON.stringify(item2));

        const decrypted = await cryptoService.decryptAllItems(userSecretKey, encryptedItems);

        expect(decrypted).toHaveLength(2);
        expect(decrypted[0].title).toBe('item1');
        expect(decrypted[1].title).toBe('item2');
    });
  });
});
