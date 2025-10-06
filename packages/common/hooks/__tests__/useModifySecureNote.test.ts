// Mock platform configuration before any imports
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id'
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    region: 'us-east-1',
    userPoolId: 'test-pool-id',
    userPoolWebClientId: 'test-client-id'
  }),
}));

import { renderHook, act } from '@testing-library/react';
import { useModifySecureNote } from '../useModifySecureNote';

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

describe('useModifySecureNote', () => {
  const mockSecureNote = {
    id: 'note-1',
    type: 'secureNote' as const,
    title: 'Test Note',
    note: 'This is a test note',
    color: '#FF0000',
    category: 'secureNote' as const,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastUseDateTime: new Date('2023-01-01'),
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('handleSubmit', () => {
    it('should handle successful secure note update', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('note-1', {
        ...mockSecureNote,
        title: 'Updated Note Title',
        note: 'This is an updated note content',
        color: '#00FF00',
        lastUseDateTime: expect.any(Date),
      });

      expect(mockShowToast).toHaveBeenCalledWith('Note modifiée avec succès');
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle update error', async () => {
      const errorMessage = 'Update failed';
      mockItemsService.updateItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects', async () => {
      mockItemsService.updateItem.mockRejectedValue('String error');

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      expect(result.current.error).toBe('Erreur lors de la modification de la note.');
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should handle null secure note', async () => {
      const { result } = renderHook(() => useModifySecureNote(null));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      expect(result.current.error).toBe('Note introuvable');
      expect(mockItemsService.updateItem).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should set loading state during update', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      mockItemsService.updateItem.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      // Start the update
      act(() => {
        result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      // Check loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Complete the update
      await act(async () => {
        resolveUpdate!();
        await updatePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear error before starting update', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      // Start the update
      act(() => {
        result.current.handleSubmit(
          'Updated Note Title',
          'This is an updated note content',
          '#00FF00',
          mockShowToast
        );
      });

      // Error should be cleared at the start
      expect(result.current.error).toBeNull();
    });

    it('should handle empty note content', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          '', // Empty note content
          '#00FF00',
          mockShowToast
        );
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('note-1', {
        ...mockSecureNote,
        title: 'Updated Note Title',
        note: '', // Empty note content
        color: '#00FF00',
        lastUseDateTime: expect.any(Date),
      });

      expect(mockShowToast).toHaveBeenCalledWith('Note modifiée avec succès');
    });

    it('should handle special characters in note content', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifySecureNote(mockSecureNote));

      const specialContent = 'Note with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Note Title',
          specialContent,
          '#00FF00',
          mockShowToast
        );
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('note-1', {
        ...mockSecureNote,
        title: 'Updated Note Title',
        note: specialContent,
        color: '#00FF00',
        lastUseDateTime: expect.any(Date),
      });
    });
  });
});
