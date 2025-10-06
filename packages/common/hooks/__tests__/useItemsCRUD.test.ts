/**
 * Tests for useItemsCRUD hook
 */

// Mock platform configuration before any imports
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    userPoolId: 'test-user-pool-id',
    userPoolWebClientId: 'test-client-id',
    region: 'us-east-1',
  }),
}));

import { renderHook, act } from '@testing-library/react';
import { useItemsCRUD } from '../useItemsCRUD';

// Mock dependencies
jest.mock('../../core/services/itemsService');
jest.mock('../../core/adapters/database.adapter', () => ({
  databaseAdapter: {
    getCollection: jest.fn(),
    getDocument: jest.fn(),
    addDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    generateItemDatabaseId: jest.fn(),
    startListeners: jest.fn(),
    stopListeners: jest.fn(),
    getListenersState: jest.fn(),
    isListening: jest.fn(),
    getListenersError: jest.fn(),
    clearListenersError: jest.fn(),
  }
}));

import { itemsService } from '../../core/services/itemsService';

const mockItemsService = itemsService as jest.Mocked<typeof itemsService>;

describe('useItemsCRUD', () => {
  const mockCredential = {
    id: 'cred-1',
    title: 'Test Credential',
    username: 'test@example.com',
    password: 'password123',
    url: 'https://example.com',
    notes: 'Test note',
    category: 'credentials' as const,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockBankCard = {
    id: 'card-1',
    title: 'Test Card',
    cardholderName: 'John Doe',
    cardNumber: '1234567890123456',
    expirationDate: '12/25',
    expiryMonth: 12,
    expiryYear: 2025,
    cvv: '123',
    cardType: 'visa' as const,
    bankName: 'Test Bank',
    notes: 'Test note',
    category: 'cards' as const,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSecureNote = {
    id: 'note-1',
    title: 'Test Note',
    content: 'This is a secure note',
    notes: 'Test note',
    category: 'notes' as const,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockItemsService.addItem = jest.fn();
    mockItemsService.updateItem = jest.fn();
    mockItemsService.deleteItem = jest.fn();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useItemsCRUD());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('addCredential', () => {
    it('should add credential successfully', async () => {
      mockItemsService.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.addCredential(mockCredential);
      });

      expect(mockItemsService.addItem).toHaveBeenCalledWith(mockCredential);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle add credential error', async () => {
      const errorMessage = 'Failed to add credential';
      mockItemsService.addItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.addCredential(mockCredential);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error objects', async () => {
      mockItemsService.addItem.mockRejectedValue('String error');

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.addCredential(mockCredential);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to add credential');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addBankCard', () => {
    it('should add bank card successfully', async () => {
      mockItemsService.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.addBankCard(mockBankCard);
      });

      expect(mockItemsService.addItem).toHaveBeenCalledWith(mockBankCard);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle add bank card error', async () => {
      const errorMessage = 'Failed to add bank card';
      mockItemsService.addItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.addBankCard(mockBankCard);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addSecureNote', () => {
    it('should add secure note successfully', async () => {
      mockItemsService.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.addSecureNote(mockSecureNote);
      });

      expect(mockItemsService.addItem).toHaveBeenCalledWith(mockSecureNote);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle add secure note error', async () => {
      const errorMessage = 'Failed to add secure note';
      mockItemsService.addItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.addSecureNote(mockSecureNote);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addItem (generic)', () => {
    it('should add item successfully', async () => {
      mockItemsService.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.addItem(mockCredential);
      });

      expect(mockItemsService.addItem).toHaveBeenCalledWith(mockCredential);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle add item error', async () => {
      const errorMessage = 'Failed to add item';
      mockItemsService.addItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.addItem(mockCredential);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('editItem', () => {
    it('should edit item successfully', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);
      const updates = { title: 'Updated Title' };

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.editItem('item-1', updates);
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('item-1', updates);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle edit item error', async () => {
      const errorMessage = 'Failed to edit item';
      mockItemsService.updateItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.editItem('item-1', { title: 'Updated' });
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      mockItemsService.deleteItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        await result.current.deleteItem('item-1');
      });

      expect(mockItemsService.deleteItem).toHaveBeenCalledWith('item-1');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle delete item error', async () => {
      const errorMessage = 'Failed to delete item';
      mockItemsService.deleteItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItemsCRUD());

      await act(async () => {
        try {
          await result.current.deleteItem('item-1');
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useItemsCRUD());

      // Set an error first
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('loading state management', () => {
    it('should set loading state during operations', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockItemsService.addItem.mockReturnValue(promise);

      const { result } = renderHook(() => useItemsCRUD());

      // Start the operation
      act(() => {
        result.current.addItem(mockCredential);
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Complete the operation
      await act(async () => {
        resolvePromise!();
        await promise;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });
});
