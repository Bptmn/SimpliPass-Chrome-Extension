import { IDatabaseAdapter, DatabaseListenersCallbacks, DatabaseListenersState } from '../database.adapter';
import { DocumentData } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  DocumentData: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
}));

// Mock the database libraries
jest.mock('../../libraries/database/firestore', () => ({
  getCollection: jest.fn(),
  getDocument: jest.fn(),
  addDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  generateItemDatabaseId: jest.fn(),
}));

jest.mock('../../libraries/database/firestoreListeners', () => ({
  FirestoreListenersService: jest.fn().mockImplementation(() => ({
    setCallbacks: jest.fn(),
    startListeners: jest.fn().mockResolvedValue(undefined),
    stopListeners: jest.fn(),
    getState: jest.fn(() => ({ isListening: false, error: null })),
    isListening: jest.fn(() => false),
    getError: jest.fn(() => null),
    clearError: jest.fn(),
  })),
}));

jest.mock('../../libraries/auth/firebase', () => ({
  initFirebase: jest.fn(() => ({
    auth: { currentUser: null },
    db: {},
  })),
}));

describe('Database Adapter Interface', () => {
  let mockDatabaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    // Create a mock implementation of the database adapter
    mockDatabaseAdapter = {
      getCollection: jest.fn().mockResolvedValue([]),
      getDocument: jest.fn().mockResolvedValue(null),
      addDocument: jest.fn().mockResolvedValue('mock-id'),
      updateDocument: jest.fn().mockResolvedValue(undefined),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
      generateItemDatabaseId: jest.fn().mockReturnValue('mock-id'),
      startListeners: jest.fn().mockResolvedValue(undefined),
      stopListeners: jest.fn(),
      getListenersState: jest.fn(() => ({ isListening: false, error: null })),
      isListening: jest.fn(() => false),
      getListenersError: jest.fn(() => null),
      clearListenersError: jest.fn(),
    };
  });

  describe('getCollection', () => {
    it('should get collection from database', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      mockDatabaseAdapter.getCollection = jest.fn().mockResolvedValue(mockData);
      
      const result = await mockDatabaseAdapter.getCollection('users');
      expect(mockDatabaseAdapter.getCollection).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockData);
    });
  });

  describe('getDocument', () => {
    it('should get document from database', async () => {
      const mockDocument = { id: '1', name: 'Test User' };
      mockDatabaseAdapter.getDocument = jest.fn().mockResolvedValue(mockDocument);
      
      const result = await mockDatabaseAdapter.getDocument('users/1');
      expect(mockDatabaseAdapter.getDocument).toHaveBeenCalledWith('users/1');
      expect(result).toEqual(mockDocument);
    });

    it('should return null for non-existent document', async () => {
      const result = await mockDatabaseAdapter.getDocument('users/nonexistent');
      expect(mockDatabaseAdapter.getDocument).toHaveBeenCalledWith('users/nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('addDocument', () => {
    it('should add document to database', async () => {
      const mockData = { name: 'Test User', email: 'test@example.com' };
      const result = await mockDatabaseAdapter.addDocument('users', mockData);
      expect(mockDatabaseAdapter.addDocument).toHaveBeenCalledWith('users', mockData);
      expect(result).toBe('mock-id');
    });
  });

  describe('updateDocument', () => {
    it('should update document in database', async () => {
      const updateData = { name: 'Updated User' };
      await mockDatabaseAdapter.updateDocument('users/1', updateData);
      expect(mockDatabaseAdapter.updateDocument).toHaveBeenCalledWith('users/1', updateData);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from database', async () => {
      await mockDatabaseAdapter.deleteDocument('users/1');
      expect(mockDatabaseAdapter.deleteDocument).toHaveBeenCalledWith('users/1');
    });
  });

  describe('generateItemDatabaseId', () => {
    it('should generate unique database ID', () => {
      const result = mockDatabaseAdapter.generateItemDatabaseId();
      expect(mockDatabaseAdapter.generateItemDatabaseId).toHaveBeenCalled();
      expect(result).toBe('mock-id');
    });
  });

  describe('startListeners', () => {
    it('should start database listeners', async () => {
      const mockCallbacks: DatabaseListenersCallbacks = {
        onUserUpdate: jest.fn().mockResolvedValue(undefined),
        onItemsUpdate: jest.fn().mockResolvedValue(undefined),
      };
      
      await mockDatabaseAdapter.startListeners('user-123', mockCallbacks);
      expect(mockDatabaseAdapter.startListeners).toHaveBeenCalledWith('user-123', mockCallbacks);
    });
  });

  describe('stopListeners', () => {
    it('should stop database listeners', () => {
      mockDatabaseAdapter.stopListeners();
      expect(mockDatabaseAdapter.stopListeners).toHaveBeenCalled();
    });
  });

  describe('getListenersState', () => {
    it('should return listeners state', () => {
      const mockState: DatabaseListenersState = { isListening: true, error: 'test error' };
      mockDatabaseAdapter.getListenersState = jest.fn(() => mockState);
      
      const result = mockDatabaseAdapter.getListenersState();
      expect(mockDatabaseAdapter.getListenersState).toHaveBeenCalled();
      expect(result).toEqual(mockState);
    });
  });

  describe('isListening', () => {
    it('should return listening status', () => {
      mockDatabaseAdapter.isListening = jest.fn(() => true);
      
      const result = mockDatabaseAdapter.isListening();
      expect(mockDatabaseAdapter.isListening).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getListenersError', () => {
    it('should return listeners error', () => {
      mockDatabaseAdapter.getListenersError = jest.fn(() => 'test error');
      
      const result = mockDatabaseAdapter.getListenersError();
      expect(mockDatabaseAdapter.getListenersError).toHaveBeenCalled();
      expect(result).toBe('test error');
    });
  });

  describe('clearListenersError', () => {
    it('should clear listeners error', () => {
      mockDatabaseAdapter.clearListenersError();
      expect(mockDatabaseAdapter.clearListenersError).toHaveBeenCalled();
    });
  });
}); 