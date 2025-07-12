import { 
  getAllItems, 
  addItem,
  updateItem,
  deleteItem,
  refreshItems
} from '../items';
import type { 
  CredentialDecrypted, 
  BankCardDecrypted, 
  SecureNoteDecrypted 
} from '@app/core/types/types';
import { db } from '@app/core/database/db.adapter';
import { encryptCredential, encryptBankCard, encryptSecureNote, decryptAllItems } from '../cryptography';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock the crypto module
jest.mock('../cryptography', () => ({
  encryptCredential: jest.fn(),
  encryptBankCard: jest.fn(),
  encryptSecureNote: jest.fn(),
  decryptAllItems: jest.fn(),
}));

// Mock the database module
jest.mock('@app/core/database/db.adapter', () => ({
  getCollection: jest.fn(),
  addDocumentWithId: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
}));

// Mock the user store
jest.mock('@app/core/states', () => ({
  useCredentialsStore: {
    getState: jest.fn(() => ({
      credentials: [],
      setCredentials: jest.fn(),
    })),
  },
  useBankCardsStore: {
    getState: jest.fn(() => ({
      bankCards: [],
      setBankCards: jest.fn(),
    })),
  },
  useSecureNotesStore: {
    getState: jest.fn(() => ({
      secureNotes: [],
      setSecureNotes: jest.fn(),
    })),
  },
}));

// Mock the firebase module
jest.mock('@app/core/auth/firebase', () => ({ 
  initFirebase: jest.fn(() => Promise.resolve({ db: {} }))
}));

// Mock the utils module
jest.mock('@app/utils/crypto', () => ({ 
  generateItemKey: jest.fn(() => 'mock-item-key')
}));

// Mock the firestore module
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

describe('Items Logic', () => {
  const TEST_USER = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };
  
  const TEST_CRYPTO = {
    validKey: 'test-secret-key',
  };

  // Create proper test data with required fields
  const createTestCredential = (): CredentialDecrypted => ({
    id: 'test-credential-id',
    itemKey: 'test-item-key',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
    note: 'Test credential notes here',
    title: 'Test Credential',
    url: 'https://example.com/login',
    username: 'testuser',
    password: 'testpassword',
  });
  
  const createTestBankCard = (): BankCardDecrypted => ({
    id: 'test-bank-card-id',
    itemKey: 'test-item-key',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
    title: 'Test Bank Card',
    bankName: 'Test Bank',
    bankDomain: 'testbank.com',
    owner: 'John Doe',
    cardNumber: '1234567890123456',
    expirationDate: { month: 12, year: 2025 },
    verificationNumber: '123',
    note: 'Test card note',
    color: '#ff0000',
  });
  
  const createTestSecureNote = (): SecureNoteDecrypted => ({
    id: 'test-secure-note-id',
    itemKey: 'test-item-key',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
    title: 'Test Secure Note',
    note: 'This is a test secure note',
    color: '#00ff00',
  });
  
  const createTestEncryptedCredential = () => ({
    id: 'test-credential-id',
    content: 'encrypted-credential-content',
    itemKey: 'test-item-key'
  });
  
  const createTestEncryptedBankCard = () => ({
    id: 'test-bank-card-id',
    content: 'encrypted-bank-card-content',
    itemKey: 'test-item-key'
  });
  
  const createTestEncryptedSecureNote = () => ({
    id: 'test-secure-note-id',
    content: 'encrypted-secure-note-content',
    itemKey: 'test-item-key'
  });
  
  const createMockCredentialsStore = () => ({
    credentials: [] as CredentialDecrypted[],
    setCredentials: jest.fn(),
  });
  
  const createMockBankCardsStore = () => ({
    bankCards: [] as BankCardDecrypted[],
    setBankCards: jest.fn(),
  });
  
  const createMockSecureNotesStore = () => ({
    secureNotes: [] as SecureNoteDecrypted[],
    setSecureNotes: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    (db.getCollection as jest.Mock).mockResolvedValue([]);
    (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-id');
    (db.updateDocument as jest.Mock).mockResolvedValue(undefined);
    (db.deleteDocument as jest.Mock).mockResolvedValue(undefined);
    
    (encryptCredential as jest.Mock).mockResolvedValue(createTestEncryptedCredential());
    (encryptBankCard as jest.Mock).mockResolvedValue(createTestEncryptedBankCard());
    (encryptSecureNote as jest.Mock).mockResolvedValue(createTestEncryptedSecureNote());
    (decryptAllItems as jest.Mock).mockResolvedValue([]);
    
    // Setup store mocks
    (useCredentialsStore.getState as jest.Mock).mockReturnValue(createMockCredentialsStore());
    (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
    (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
  });

  describe('addItem', () => {
    it('should add a credential successfully', async () => {
      const testCredential = createTestCredential();
      const mockEncrypted = createTestEncryptedCredential();
      
      (encryptCredential as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testCredential);
      
      expect(result).toBe('new-id');
      expect(encryptCredential).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        title: testCredential.title,
        username: testCredential.username,
        password: testCredential.password,
        itemKey: expect.any(String) // Allow any itemKey value
      }));
      expect(db.addDocumentWithId).toHaveBeenCalledWith(`users/${TEST_USER.userId}/my_items`, mockEncrypted);
    });
  });

  describe('getAllItems', () => {
    it('should return cached items when available', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([testCredential]);
      expect(db.getCollection).not.toHaveBeenCalled();
    });

    it('should fetch from database when no cached items', async () => {
      (db.getCollection as jest.Mock).mockResolvedValue([]);
      (decryptAllItems as jest.Mock).mockResolvedValue([]);
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([]);
      expect(db.getCollection).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update a credential successfully', async () => {
      const testCredential = createTestCredential();
      const updates = { title: 'Updated Title' };
      
      (encryptCredential as jest.Mock).mockResolvedValue(createTestEncryptedCredential());
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      
      await updateItem(TEST_USER.userId, testCredential.id, TEST_CRYPTO.validKey, updates);
      
      expect(encryptCredential).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        ...testCredential,
        ...updates
      }));
      // Note: updateItem uses Firebase directly, not db.updateDocument
    });
  });

  describe('deleteItem', () => {
    it('should delete an item successfully', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      
      await deleteItem(TEST_USER.userId, 'test-item-id');
      
      // Note: deleteItem uses Firebase directly, not db.deleteDocument
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('addItem with different types', () => {
    it('should add a bank card successfully', async () => {
      const testBankCard = createTestBankCard();
      const mockEncrypted = createTestEncryptedBankCard();
      
      (encryptBankCard as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-card-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testBankCard);
      
      expect(result).toBe('new-card-id');
      expect(encryptBankCard).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        title: testBankCard.title,
        cardNumber: testBankCard.cardNumber,
        itemKey: expect.any(String)
      }));
    });

    it('should add a secure note successfully', async () => {
      const testSecureNote = createTestSecureNote();
      const mockEncrypted = createTestEncryptedSecureNote();
      
      (encryptSecureNote as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-note-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testSecureNote);
      
      expect(result).toBe('new-note-id');
      expect(encryptSecureNote).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        title: testSecureNote.title,
        note: testSecureNote.note,
        itemKey: expect.any(String)
      }));
    });
  });

  describe('getAllItems with different scenarios', () => {
    it('should handle empty database', async () => {
      (db.getCollection as jest.Mock).mockResolvedValue([]);
      (decryptAllItems as jest.Mock).mockResolvedValue([]);
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([]);
      expect(db.getCollection).toHaveBeenCalled();
    });
  });

  describe('deleteItem with different types', () => {
    it('should delete a credential successfully', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      
      await deleteItem(TEST_USER.userId, 'test-item-id');
      
      // Note: deleteItem uses Firebase directly, not db.deleteDocument
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('refreshItems', () => {
    it('should refresh items and update stores', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (db.getCollection as jest.Mock).mockResolvedValue([]);
      (decryptAllItems as jest.Mock).mockResolvedValue([testCredential]);
      
      await refreshItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(mockStore.setCredentials).toHaveBeenCalled();
    });

    it('should handle empty database during refresh', async () => {
      const mockStore = createMockCredentialsStore();
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (db.getCollection as jest.Mock).mockResolvedValue([]);
      (decryptAllItems as jest.Mock).mockResolvedValue([]);
      
      await refreshItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(mockStore.setCredentials).toHaveBeenCalledWith([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (db.getCollection as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey)).rejects.toThrow('Database error');
    });
  });
}); 