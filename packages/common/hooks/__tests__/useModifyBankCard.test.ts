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
import { useModifyBankCard } from '../useModifyBankCard';

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

describe('useModifyBankCard', () => {
  const mockBankCard = {
    id: 'card-1',
    type: 'bankCard' as const,
    title: 'Test Card',
    bankName: 'Test Bank',
    owner: 'John Doe',
    cardNumber: '1234567890123456',
    expirationDate: {
      month: 12,
      year: 2025,
    },
    verificationNumber: '123',
    note: 'Test note',
    color: '#FF0000',
    category: 'bankCard' as const,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastUseDateTime: new Date('2023-01-01'),
  };

  const mockFormData = {
    title: 'Updated Card',
    cardNumber: '9876 5432 1098 7654',
    cardholderName: 'Jane Doe',
    expirationDate: '06/26',
    cvv: '456',
    notes: 'Updated note',
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('handleSubmit', () => {
    it('should handle successful bank card update', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      await act(async () => {
        await result.current.handleSubmit(mockFormData, '#00FF00', mockShowToast);
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('card-1', {
        ...mockBankCard,
        title: 'Updated Card',
        bankName: 'Jane Doe',
        owner: 'Jane Doe',
        cardNumber: '9876543210987654', // Spaces removed
        expirationDate: {
          month: 6,
          year: 2026,
        },
        verificationNumber: '456',
        note: 'Updated note',
        color: '#00FF00',
        lastUseDateTime: expect.any(Date),
      });

      expect(mockShowToast).toHaveBeenCalledWith('Carte modifiée avec succès');
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle update error', async () => {
      const errorMessage = 'Update failed';
      mockItemsService.updateItem.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      await act(async () => {
        await result.current.handleSubmit(mockFormData, '#00FF00', mockShowToast);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects', async () => {
      mockItemsService.updateItem.mockRejectedValue('String error');

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      await act(async () => {
        await result.current.handleSubmit(mockFormData, '#00FF00', mockShowToast);
      });

      expect(result.current.error).toBe('Erreur lors de la modification de la carte.');
      expect(result.current.loading).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should set loading state during update', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      mockItemsService.updateItem.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      // Start the update
      act(() => {
        result.current.handleSubmit(mockFormData, '#00FF00', mockShowToast);
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

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      // Start the update
      act(() => {
        result.current.handleSubmit(mockFormData, '#00FF00', mockShowToast);
      });

      // Error should be cleared at the start
      expect(result.current.error).toBeNull();
    });

    it('should handle different expiration date formats', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      const formDataWithDifferentDate = {
        ...mockFormData,
        expirationDate: '01/30', // Single digit month
      };

      await act(async () => {
        await result.current.handleSubmit(formDataWithDifferentDate, '#00FF00', mockShowToast);
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('card-1', expect.objectContaining({
        expirationDate: {
          month: 1,
          year: 2030,
        },
      }));
    });

    it('should remove spaces from card number', async () => {
      mockItemsService.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useModifyBankCard(mockBankCard));

      const formDataWithSpaces = {
        ...mockFormData,
        cardNumber: '1234 5678 9012 3456',
      };

      await act(async () => {
        await result.current.handleSubmit(formDataWithSpaces, '#00FF00', mockShowToast);
      });

      expect(mockItemsService.updateItem).toHaveBeenCalledWith('card-1', expect.objectContaining({
        cardNumber: '1234567890123456', // Spaces removed
      }));
    });
  });
});
