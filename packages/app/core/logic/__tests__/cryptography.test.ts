jest.mock('@utils/crypto', () => ({
  encryptData: jest.fn(async (data: unknown, key: string) => {
    // Return a mock encrypted string that can be decrypted
    return `encrypted_${key}_${JSON.stringify(data)}`;
  }),
  decryptData: jest.fn(async (encryptedData: string, key: string) => {
    // Parse the mock encrypted string
    if (encryptedData.startsWith('encrypted_')) {
      const parts = encryptedData.replace('encrypted_', '').split('_');
      const actualKey = parts[0];
      const data = parts.slice(1).join('_');
      if (actualKey === key) {
        try {
          return JSON.parse(data);
        } catch {
          return data; // Return as string if not valid JSON
        }
      }
    }
    throw new Error('Invalid encrypted data');
  }),
}));

import { 
  decryptItem, 
  encryptCredential, 
  encryptBankCard,
  encryptSecureNote
} from '../cryptography';
import type { 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted 
} from '@app/core/types/types';

describe('Cryptography Logic', () => {
  const mockSecretKey = 'test-secret-key';
  
  const mockCredential: CredentialDecrypted = {
    id: 'cred-1',
    title: 'Test Credential',
    username: 'testuser',
    password: 'testpass',
    url: 'https://example.com',
    note: 'Test note',
    createdDateTime: new Date('2023-01-01'),
    lastUseDateTime: new Date('2023-01-02'),
    itemKey: 'cred-key-1',
  };

  const mockBankCard: BankCardDecrypted = {
    id: 'card-1',
    title: 'Test Card',
    bankName: 'Test Bank',
    bankDomain: 'testbank.com',
    owner: 'John Doe',
    cardNumber: '1234567890123456',
    expirationDate: { month: 12, year: 2025 },
    verificationNumber: '123',
    note: 'Test card note',
    color: '#ff0000',
    createdDateTime: new Date('2023-01-01'),
    lastUseDateTime: new Date('2023-01-02'),
    itemKey: 'card-key-1',
  };

  const mockSecureNote: SecureNoteDecrypted = {
    id: 'note-1',
    title: 'Test Note',
    note: 'This is a test secure note',
    color: '#00ff00',
    createdDateTime: new Date('2023-01-01'),
    lastUseDateTime: new Date('2023-01-02'),
    itemKey: 'note-key-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptCredential', () => {
    it('should encrypt a credential successfully', async () => {
      const result = await encryptCredential(mockSecretKey, mockCredential);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockCredential.id);
      expect(result.content_encrypted).toContain('encrypted_');
    });

    it('should handle empty credential data', async () => {
      const emptyCredential = { ...mockCredential, title: '', username: '', password: '' };
      const result = await encryptCredential(mockSecretKey, emptyCredential);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(emptyCredential.id);
    });
  });

  describe('encryptBankCard', () => {
    it('should encrypt a bank card successfully', async () => {
      const result = await encryptBankCard(mockSecretKey, mockBankCard);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockBankCard.id);
      expect(result.content_encrypted).toContain('encrypted_');
    });
  });

  describe('encryptSecureNote', () => {
    it('should encrypt a secure note successfully', async () => {
      const result = await encryptSecureNote(mockSecretKey, mockSecureNote);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockSecureNote.id);
      expect(result.content_encrypted).toContain('encrypted_');
    });
  });

  describe('decryptItem', () => {
    it('should decrypt credential items', async () => {
      const encrypted = await encryptCredential(mockSecretKey, mockCredential);
      const result = await decryptItem(mockSecretKey, encrypted);
      
      expect(result).toBeDefined();
      expect(result?.title).toBe(mockCredential.title);
      if ('username' in result!) {
        expect(result.username).toBe(mockCredential.username);
      }
    });

    it('should decrypt bank card items', async () => {
      const encrypted = await encryptBankCard(mockSecretKey, mockBankCard);
      const result = await decryptItem(mockSecretKey, encrypted);
      
      expect(result).toBeDefined();
      expect(result?.title).toBe(mockBankCard.title);
      if ('owner' in result!) {
        expect(result.owner).toBe(mockBankCard.owner);
      }
    });

    it('should decrypt secure note items', async () => {
      const encrypted = await encryptSecureNote(mockSecretKey, mockSecureNote);
      const result = await decryptItem(mockSecretKey, encrypted);
      
      expect(result).toBeDefined();
      expect(result?.title).toBe(mockSecureNote.title);
      if ('note' in result!) {
        expect(result.note).toBe(mockSecureNote.note);
      }
    });

    it('should return null for invalid item type', async () => {
      const invalidItem = {
        id: 'invalid',
        content_encrypted: 'invalid_encrypted_data',
        item_key_encrypted: 'invalid_key_data',
        created_at: new Date(),
        last_used_at: new Date(),
        item_type: 'invalid' as 'credential' | 'bank_card' | 'secure_note',
      };
      let result = null;
      try {
        result = await decryptItem(mockSecretKey, invalidItem);
      } catch {
        result = null;
      }
      expect(result).toBeNull();
    });
  });
}); 