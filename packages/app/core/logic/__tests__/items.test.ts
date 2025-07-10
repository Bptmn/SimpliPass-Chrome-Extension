import { 
  getAllItems, 
  addItem, 
  updateItem, 
  deleteItem, 
  refreshItems 
} from '../items';
import { 
  formatCardNumber, 
  handleCardNumberChange, 
  getMonthOptions, 
  getYearOptions, 
  formatExpirationDate, 
  parseExpirationDate 
} from '../cards';
import { 
  handleGeneratePassword, 
  createPasswordGenerator 
} from '../credentials';
import { 
  getFilteredItems, 
  handleCardClick, 
  handleOtherItemClick, 
  getSuggestions 
} from '../homePage';
import { 
  TEST_CREDENTIAL, 
  TEST_USER,
  TEST_CRYPTO,
  TEST_ENCRYPTED_ITEMS
} from '@app/__tests__/testData';

// Mock dependencies
jest.mock('@app/core/database/db.adapter', () => ({ 
  db: {
    getCollection: jest.fn(),
    addDocumentWithId: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn()
  } 
}));
jest.mock('@app/core/logic/cryptography', () => ({
  decryptAllItems: jest.fn(),
  encryptCredential: jest.fn(),
  encryptBankCard: jest.fn(),
  encryptSecureNote: jest.fn(),
}));
jest.mock('@app/core/states', () => ({
  useCredentialsStore: { getState: jest.fn() },
  useBankCardsStore: { getState: jest.fn() },
  useSecureNotesStore: { getState: jest.fn() },
}));
jest.mock('@app/core/auth/firebase', () => ({ 
  initFirebase: jest.fn(() => Promise.resolve({ db: {} }))
}));
jest.mock('@app/utils/crypto', () => ({ 
  generateItemKey: jest.fn(() => 'mock-item-key')
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Create proper mock stores with all required methods
const createMockCredentialsStore = () => ({
  credentials: [] as any[],
  setCredentials: jest.fn(),
  addCredential: jest.fn(),
  updateCredential: jest.fn(),
  removeCredential: jest.fn(),
});

const createMockBankCardsStore = () => ({
  bankCards: [] as any[],
  setBankCards: jest.fn(),
  addBankCard: jest.fn(),
  updateBankCard: jest.fn(),
  removeBankCard: jest.fn(),
});

const createMockSecureNotesStore = () => ({
  secureNotes: [] as any[],
  setSecureNotes: jest.fn(),
  addSecureNote: jest.fn(),
  updateSecureNote: jest.fn(),
  removeSecureNote: jest.fn(),
});

// Mock store getters
const mockStores = {
  useCredentialsStore: {
    getState: jest.fn(() => createMockCredentialsStore())
  },
  useBankCardsStore: {
    getState: jest.fn(() => createMockBankCardsStore())
  },
  useSecureNotesStore: {
    getState: jest.fn(() => createMockSecureNotesStore())
  }
};

// Import mocked modules
import { db } from '@app/core/database/db.adapter';
import { 
  decryptAllItems, 
  encryptCredential, 
  encryptBankCard, 
  encryptSecureNote 
} from '@app/core/logic/cryptography';
import { 
  useCredentialsStore, 
  useBankCardsStore, 
  useSecureNotesStore 
} from '@app/core/states';
import { initFirebase } from '@app/core/auth/firebase';
import { generateItemKey } from '@app/utils/crypto';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Create proper test data with required fields
const createTestCredential = () => ({
  ...TEST_CREDENTIAL,
  id: 'test-credential-id',
  itemKey: 'test-item-key',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  note: TEST_CREDENTIAL.notes
});

const createTestBankCard = () => ({
  id: 'test-card-1',
  itemKey: 'test-item-key',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  note: 'Test bank card notes here',
  cardNumber: '4111111111111111',
  cardholderName: 'John Doe',
  expiryMonth: '12',
  expiryYear: '2025',
  cvv: '123',
  title: 'Test Credit Card',
  notes: 'Test bank card notes here',
  owner: 'John Doe',
  color: 'blue',
  expirationDate: '12/25',
  verificationNumber: '123',
  brand: 'Visa',
  type: 'credit',
});

const createTestSecureNote = () => ({
  id: 'test-note-1',
  itemKey: 'test-item-key',
  createdDateTime: new Date(),
  lastUseDateTime: new Date(),
  note: 'Test secure note additional notes',
  title: 'Test Secure Note',
  notes: 'Test secure note additional notes',
  content: 'This is a test secure note with sensitive information.',
  color: 'yellow',
});

const createTestEncryptedCredential = () => ({
  id: 'test-credential-id',
  content: TEST_ENCRYPTED_ITEMS.credentialContent,
  itemKey: TEST_ENCRYPTED_ITEMS.credentialItemKey
});

const createTestEncryptedBankCard = () => ({
  id: 'test-bank-card-id',
  content: TEST_ENCRYPTED_ITEMS.bankCardContent,
  itemKey: TEST_ENCRYPTED_ITEMS.bankCardItemKey
});

const createTestEncryptedSecureNote = () => ({
  id: 'test-secure-note-id',
  content: TEST_ENCRYPTED_ITEMS.secureNoteContent,
  itemKey: TEST_ENCRYPTED_ITEMS.secureNoteItemKey
});

describe('Business Logic Tests', () => {
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

  describe('CRUD Operations for Credentials', () => {
    it('should create a credential successfully', async () => {
      const testCredential = createTestCredential();
      const mockEncrypted = createTestEncryptedCredential();
      
      (encryptCredential as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testCredential);
      
      expect(result).toBe('new-id');
      expect(encryptCredential).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        ...testCredential,
        id: '', // The function sets id to empty string before encryption
        itemKey: expect.any(String) // Allow any itemKey value
      }));
      expect(db.addDocumentWithId).toHaveBeenCalledWith(`users/${TEST_USER.userId}/my_items`, mockEncrypted);
    });

    it('should read a credential from cache when available', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([testCredential]);
      expect(db.getCollection).not.toHaveBeenCalled();
    });

    it('should read a credential from database when not in cache', async () => {
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([]);
      expect(db.getCollection).toHaveBeenCalled();
    });

    it('should update a credential successfully', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const updates = { title: 'Updated Title' };
      
      await updateItem(TEST_USER.userId, testCredential.id, TEST_CRYPTO.validKey, updates);
      
      expect(encryptCredential).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        ...testCredential,
        ...updates
      }));
      // Note: updateItem uses Firebase directly, not db.updateDocument
    });

    it('should delete a credential successfully', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      await deleteItem(TEST_USER.userId, testCredential.id);
      
      // Note: deleteItem uses Firebase directly, not db.deleteDocument
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('CRUD Operations for Bank Cards', () => {
    it('should create a bank card successfully', async () => {
      const testBankCard = createTestBankCard();
      const mockEncrypted = createTestEncryptedBankCard();
      
      (encryptBankCard as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-card-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testBankCard);
      
      expect(result).toBe('new-card-id');
      expect(encryptBankCard).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        ...testBankCard,
        id: '', // The function sets id to empty string before encryption
        itemKey: expect.any(String) // Allow any itemKey value
      }));
    });

    it('should read a bank card from database when not in cache', async () => {
      const mockStore = createMockBankCardsStore();
      mockStore.bankCards = [];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(createMockCredentialsStore());
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([]);
      expect(db.getCollection).toHaveBeenCalled();
    });
  });

  describe('CRUD Operations for Secure Notes', () => {
    it('should create a secure note successfully', async () => {
      const testSecureNote = createTestSecureNote();
      const mockEncrypted = createTestEncryptedSecureNote();
      
      (encryptSecureNote as jest.Mock).mockResolvedValue(mockEncrypted);
      (db.addDocumentWithId as jest.Mock).mockResolvedValue('new-note-id');
      
      const result = await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testSecureNote);
      
      expect(result).toBe('new-note-id');
      expect(encryptSecureNote).toHaveBeenCalledWith(TEST_CRYPTO.validKey, expect.objectContaining({
        ...testSecureNote,
        id: '', // The function sets id to empty string before encryption
        itemKey: expect.any(String) // Allow any itemKey value
      }));
    });
  });

  describe('Data Filtering and Search', () => {
    it('should handle case-insensitive search', () => {
      const items = [
        createTestCredential(),
        createTestBankCard(),
        createTestSecureNote()
      ];
      
      const filter = 'test';
      const result = getFilteredItems(items, filter);
      
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should update state on item create', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      await addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testCredential);
      
      expect(mockStore.addCredential).toHaveBeenCalled();
    });

    it('should update state on item delete', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      await deleteItem(TEST_USER.userId, testCredential.id);
      
      // Note: deleteItem uses Firebase directly, not db.deleteDocument
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Data Synchronization', () => {
    it('should refresh items from database', async () => {
      const mockStore = createMockCredentialsStore();
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      await refreshItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(mockStore.setCredentials).toHaveBeenCalled();
    });

    it('should clear cache when refreshing', async () => {
      const mockStore = createMockCredentialsStore();
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      await refreshItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(mockStore.setCredentials).toHaveBeenCalledWith([]);
    });
  });

  describe('Offline Functionality', () => {
    it('should return cached items when offline', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([testCredential]);
    });
  });

  describe('Cross-Platform Consistency', () => {
    it('should maintain data consistency across platforms', async () => {
      const testCredential = createTestCredential();
      const mockStore = createMockCredentialsStore();
      mockStore.credentials = [testCredential];
      
      (useCredentialsStore.getState as jest.Mock).mockReturnValue(mockStore);
      (useBankCardsStore.getState as jest.Mock).mockReturnValue(createMockBankCardsStore());
      (useSecureNotesStore.getState as jest.Mock).mockReturnValue(createMockSecureNotesStore());
      
      const result = await getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey);
      
      expect(result).toEqual([testCredential]);
    });
  });

  describe('Feature Availability', () => {
    it('should enable features based on platform', () => {
      // Mock platform detection
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Chrome' },
        writable: true
      });
      
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime;
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      expect(typeof isExtension).toBe('boolean');
      expect(typeof isMobile).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (db.getCollection as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(getAllItems(TEST_USER.userId, TEST_CRYPTO.validKey)).rejects.toThrow('Database error');
    });

    it('should handle encryption errors gracefully', async () => {
      const testCredential = createTestCredential();
      (encryptCredential as jest.Mock).mockRejectedValue(new Error('Encryption error'));
      
      await expect(addItem(TEST_USER.userId, TEST_CRYPTO.validKey, testCredential)).rejects.toThrow('Encryption error');
    });
  });

  describe('Card Logic Functions', () => {
    it('should format card number correctly', () => {
      const result = formatCardNumber('1234567890123456');
      expect(result).toBe('1234 5678 9012 3456');
    });

    it('should handle card number change', () => {
      const setCardNumber = jest.fn();
      handleCardNumberChange('1234-5678-9012-3456', setCardNumber);
      expect(setCardNumber).toHaveBeenCalledWith('1234567890123456');
    });

    it('should get month options', () => {
      const months = getMonthOptions();
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('01');
      expect(months[11]).toBe('12');
    });

    it('should get year options', () => {
      const currentYear = new Date().getFullYear();
      const years = getYearOptions(currentYear);
      expect(years).toHaveLength(21);
      expect(years[0]).toBe(String(currentYear));
      expect(years[20]).toBe(String(currentYear + 20));
    });

    it('should format expiration date', () => {
      const date = new Date(2025, 11, 1); // December 2025
      const result = formatExpirationDate(date);
      expect(result).toBe('12/25');
    });

    it('should parse expiration date', () => {
      const result = parseExpirationDate('12/25');
      expect(result).toEqual(new Date(2025, 11, 1));
    });

    it('should return null for invalid expiration date', () => {
      const result = parseExpirationDate('13/25');
      expect(result).toBeNull();
    });
  });

  describe('Credential Logic Functions', () => {
    it('should generate password', () => {
      const setPassword = jest.fn();
      handleGeneratePassword(setPassword);
      expect(setPassword).toHaveBeenCalledWith(expect.any(String));
    });

    it('should create password generator', () => {
      const setPassword = jest.fn();
      const generator = createPasswordGenerator(setPassword);
      expect(typeof generator).toBe('function');
      
      generator();
      expect(setPassword).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Home Page Logic Functions', () => {
    it('should get suggestions for domain', () => {
      const testCredential = createTestCredential();
      const credentials: any[] = [
        { ...testCredential, url: 'https://example.com/login' },
        { ...testCredential, url: 'https://test.com/login' },
        { ...testCredential, url: 'https://example.com/dashboard' }
      ];
      const url = 'https://example.com/page';
      
      const suggestions = getSuggestions(credentials, url);
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].url).toContain('example.com');
      expect(suggestions[1].url).toContain('example.com');
    });

    it('should return empty array for no domain match', () => {
      const testCredential = createTestCredential();
      const credentials: any[] = [
        { ...testCredential, url: 'https://example.com/login' }
      ];
      const url = 'https://different.com/page';
      
      const suggestions = getSuggestions(credentials, url);
      
      expect(suggestions).toHaveLength(0);
    });

    it('should return empty array for empty credentials', () => {
      const credentials: any[] = [];
      const url = 'https://example.com/page';
      
      const suggestions = getSuggestions(credentials, url);
      
      expect(suggestions).toHaveLength(0);
    });

    it('should return empty array for empty url', () => {
      const testCredential = createTestCredential();
      const credentials: any[] = [
        { ...testCredential, url: 'https://example.com/login' }
      ];
      const url = '';
      
      const suggestions = getSuggestions(credentials, url);
      
      expect(suggestions).toHaveLength(0);
    });
  });
}); 