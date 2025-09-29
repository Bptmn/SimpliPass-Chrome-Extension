/**
 * Tests for database adapter
 */

import { db } from '../database.adapter';
import { NetworkError } from '../../types/errors.types';

// Mock Firebase Firestore
jest.mock('../../libraries/database/firestore', () => ({
  getCollectionWrapper: jest.fn(),
  getDocumentWrapper: jest.fn(),
  addDocumentWrapper: jest.fn(),
  updateDocumentWrapper: jest.fn(),
  deleteDocumentWrapper: jest.fn(),
  generateItemDatabaseId: jest.fn(),
  startListenersWrapper: jest.fn(),
  stopListenersWrapper: jest.fn(),
  getListenersStateWrapper: jest.fn(),
  isListeningWrapper: jest.fn(),
  getListenersErrorWrapper: jest.fn(),
  clearListenersErrorWrapper: jest.fn()
}));

describe('DatabaseAdapter', () => {
  let mockFirestore: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Firestore functions
    mockFirestore = require('../../libraries/database/firestore');
  });

  describe('getCollection', () => {
    it('should get collection successfully', async () => {
      const collectionPath = 'users/user123/items';
      const mockData = [
        { id: '1', title: 'Item 1' },
        { id: '2', title: 'Item 2' }
      ];

      mockFirestore.getCollectionWrapper.mockResolvedValue(mockData);

      const result = await db.getCollection(collectionPath);

      expect(mockFirestore.getCollectionWrapper).toHaveBeenCalledWith(collectionPath);
      expect(result).toEqual(mockData);
    });

    it('should handle collection errors', async () => {
      const collectionPath = 'users/user123/items';
      const error = new NetworkError('Failed to get collection');

      mockFirestore.getCollectionWrapper.mockRejectedValue(error);

      await expect(db.getCollection(collectionPath)).rejects.toThrow(NetworkError);
    });
  });

  describe('getDocument', () => {
    it('should get document successfully', async () => {
      const docPath = 'users/user123';
      const mockData = { id: 'user123', email: 'test@example.com' };

      mockFirestore.getDocumentWrapper.mockResolvedValue(mockData);

      const result = await db.getDocument(docPath);

      expect(mockFirestore.getDocumentWrapper).toHaveBeenCalledWith(docPath);
      expect(result).toEqual(mockData);
    });

    it('should return null for non-existent document', async () => {
      const docPath = 'users/nonexistent';

      mockFirestore.getDocumentWrapper.mockResolvedValue(null);

      const result = await db.getDocument(docPath);

      expect(result).toBeNull();
    });

    it('should handle document errors', async () => {
      const docPath = 'users/user123';
      const error = new NetworkError('Failed to get document');

      mockFirestore.getDocumentWrapper.mockRejectedValue(error);

      await expect(db.getDocument(docPath)).rejects.toThrow(NetworkError);
    });
  });

  describe('addDocument', () => {
    it('should add document successfully', async () => {
      const collectionPath = 'users/user123/items';
      const data = { title: 'New Item', type: 'credential' };
      const mockId = 'item123';

      mockFirestore.addDocumentWrapper.mockResolvedValue(mockId);

      const result = await db.addDocument(collectionPath, data);

      expect(mockFirestore.addDocumentWrapper).toHaveBeenCalledWith(collectionPath, data);
      expect(result).toBe(mockId);
    });

    it('should handle add document errors', async () => {
      const collectionPath = 'users/user123/items';
      const data = { title: 'New Item' };
      const error = new NetworkError('Failed to add document');

      mockFirestore.addDocumentWrapper.mockRejectedValue(error);

      await expect(db.addDocument(collectionPath, data)).rejects.toThrow(NetworkError);
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const docPath = 'users/user123/items/item123';
      const data = { title: 'Updated Item' };

      mockFirestore.updateDocumentWrapper.mockResolvedValue(undefined);

      await db.updateDocument(docPath, data);

      expect(mockFirestore.updateDocumentWrapper).toHaveBeenCalledWith(docPath, data);
    });

    it('should handle update document errors', async () => {
      const docPath = 'users/user123/items/item123';
      const data = { title: 'Updated Item' };
      const error = new NetworkError('Failed to update document');

      mockFirestore.updateDocumentWrapper.mockRejectedValue(error);

      await expect(db.updateDocument(docPath, data)).rejects.toThrow(NetworkError);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const docPath = 'users/user123/items/item123';

      mockFirestore.deleteDocumentWrapper.mockResolvedValue(undefined);

      await db.deleteDocument(docPath);

      expect(mockFirestore.deleteDocumentWrapper).toHaveBeenCalledWith(docPath);
    });

    it('should handle delete document errors', async () => {
      const docPath = 'users/user123/items/item123';
      const error = new NetworkError('Failed to delete document');

      mockFirestore.deleteDocumentWrapper.mockRejectedValue(error);

      await expect(db.deleteDocument(docPath)).rejects.toThrow(NetworkError);
    });
  });

  describe('generateItemDatabaseId', () => {
    it('should generate unique ID', () => {
      const mockId = 'item123';

      mockFirestore.generateItemDatabaseId.mockReturnValue(mockId);

      const result = db.generateItemDatabaseId();

      expect(mockFirestore.generateItemDatabaseId).toHaveBeenCalled();
      expect(result).toBe(mockId);
    });
  });

  describe('startListeners', () => {
    it('should start listeners successfully', async () => {
      const userId = 'user123';
      const callbacks = {
        onUserUpdate: jest.fn(),
        onItemsUpdate: jest.fn()
      };

      mockFirestore.startListenersWrapper.mockResolvedValue(undefined);

      await db.startListeners(userId, callbacks);

      expect(mockFirestore.startListenersWrapper).toHaveBeenCalledWith(userId, callbacks);
    });

    it('should handle start listeners errors', async () => {
      const userId = 'user123';
      const callbacks = {
        onUserUpdate: jest.fn(),
        onItemsUpdate: jest.fn()
      };
      const error = new NetworkError('Failed to start listeners');

      mockFirestore.startListenersWrapper.mockRejectedValue(error);

      await expect(db.startListeners(userId, callbacks)).rejects.toThrow(NetworkError);
    });
  });

  describe('stopListeners', () => {
    it('should stop listeners successfully', async () => {
      mockFirestore.stopListenersWrapper.mockResolvedValue(undefined);

      await db.stopListeners();

      expect(mockFirestore.stopListenersWrapper).toHaveBeenCalled();
    });

    it('should handle stop listeners errors', async () => {
      const error = new NetworkError('Failed to stop listeners');

      mockFirestore.stopListenersWrapper.mockRejectedValue(error);

      await expect(db.stopListeners()).rejects.toThrow(NetworkError);
    });
  });

  describe('getListenersState', () => {
    it('should return listeners state', async () => {
      const mockState = {
        isListening: true,
        error: null
      };

      mockFirestore.getListenersStateWrapper.mockResolvedValue(mockState);

      const result = await db.getListenersState();

      expect(mockFirestore.getListenersStateWrapper).toHaveBeenCalled();
      expect(result).toEqual(mockState);
    });

    it('should handle get listeners state errors', async () => {
      const error = new NetworkError('Failed to get listeners state');

      mockFirestore.getListenersStateWrapper.mockRejectedValue(error);

      await expect(db.getListenersState()).rejects.toThrow(NetworkError);
    });
  });

  describe('isListening', () => {
    it('should return listening status', async () => {
      mockFirestore.isListeningWrapper.mockResolvedValue(true);

      const result = await db.isListening();

      expect(mockFirestore.isListeningWrapper).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle is listening errors', async () => {
      const error = new NetworkError('Failed to check listening status');

      mockFirestore.isListeningWrapper.mockRejectedValue(error);

      await expect(db.isListening()).rejects.toThrow(NetworkError);
    });
  });

  describe('getListenersError', () => {
    it('should return listeners error', async () => {
      const mockError = 'Connection failed';

      mockFirestore.getListenersErrorWrapper.mockResolvedValue(mockError);

      const result = await db.getListenersError();

      expect(mockFirestore.getListenersErrorWrapper).toHaveBeenCalled();
      expect(result).toBe(mockError);
    });

    it('should handle get listeners error errors', async () => {
      const error = new NetworkError('Failed to get listeners error');

      mockFirestore.getListenersErrorWrapper.mockRejectedValue(error);

      await expect(db.getListenersError()).rejects.toThrow(NetworkError);
    });
  });

  describe('clearListenersError', () => {
    it('should clear listeners error successfully', async () => {
      mockFirestore.clearListenersErrorWrapper.mockResolvedValue(undefined);

      await db.clearListenersError();

      expect(mockFirestore.clearListenersErrorWrapper).toHaveBeenCalled();
    });

    it('should handle clear listeners error errors', async () => {
      const error = new NetworkError('Failed to clear listeners error');

      mockFirestore.clearListenersErrorWrapper.mockRejectedValue(error);

      await expect(db.clearListenersError()).rejects.toThrow(NetworkError);
    });
  });
});
