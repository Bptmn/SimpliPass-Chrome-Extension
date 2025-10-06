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
import { useModifyCredential } from '../useModifyCredential';

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

describe('useModifyCredential', () => {
  const mockCredential = {
    id: 'cred-1',
    type: 'credential' as const,
    title: 'Test Credential',
    username: 'test@example.com',
    password: 'password123',
    url: 'https://example.com',
    note: 'Test note',
    category: 'login' as const,
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
      const { result } = renderHook(() => useModifyCredential(mockCredential));

      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('handleSubmit', () => {
    it('should handle successful credential update', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifyCredential(mockCredential));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
          mockShowToast
        );
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('cred-1', {
        ...mockCredential,
        title: 'Updated Title',
        username: 'updated@example.com',
        password: 'newpassword123',
        url: 'https://updated.com',
        note: 'Updated note',
        lastUseDateTime: expect.any(Date),
      });

      expect(mockShowToast).toHaveBeenCalledWith('Identifiant modifié avec succès');
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle update error', async () => {
      const errorMessage = 'Update failed';
      mockItemsService.updateItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useModifyCredential(mockCredential));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
          mockShowToast
        );
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects', async () => {
      mockItemsService.updateItem.mockRejectedValue('String error');

      const { result } = renderHook(() => useModifyCredential(mockCredential));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
          mockShowToast
        );
      });

      expect(result.current.error).toBe('Erreur lors de la modification de l\'identifiant.');
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should handle null credential', async () => {
      const { result } = renderHook(() => useModifyCredential(null));

      await act(async () => {
        await result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
          mockShowToast
        );
      });

      expect(result.current.error).toBe('Identifiant introuvable');
      expect(mockItemsService.updateItem).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should set loading state during update', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      mockItemsService.updateItem.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useModifyCredential(mockCredential));

      // Start the update
      act(() => {
        result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
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

      const { result } = renderHook(() => useModifyCredential(mockCredential));

      // Set an initial error
      act(() => {
        result.current.handleSubmit(
          'Updated Title',
          'updated@example.com',
          'newpassword123',
          'https://updated.com',
          'Updated note',
          mockShowToast
        );
      });

      // Error should be cleared at the start
      expect(result.current.error).toBeNull();
    });
  });
});
