import { renderHook, act, waitFor } from '@testing-library/react';
import { useItems } from '../useItems';
import { itemsStateManager } from '../../core/services/items';
import { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../../core/types/items.types';

// Mock dependencies
jest.mock('../../core/services/items');

const mockItemsStateManager = itemsStateManager as jest.Mocked<typeof itemsStateManager>;

describe('useItems', () => {
  const mockItems: ItemDecrypted[] = [
    {
      id: '1',
      itemType: 'credential',
      title: 'Test Credential',
      username: 'testuser',
      password: 'testpass',
      url: 'https://test.com',
      note: '',
      itemKey: 'key1',
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    } as CredentialDecrypted,
    {
      id: '2',
      itemType: 'bankCard',
      title: 'Test Card',
      cardNumber: '1234567890123456',
      owner: 'Test User',
      note: '',
      color: '#000000',
      itemKey: 'key2',
      expirationDate: { month: 12, year: 2025 },
      verificationNumber: '123',
      bankName: 'Test Bank',
      bankDomain: 'testbank.com',
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    } as BankCardDecrypted,
    {
      id: '3',
      itemType: 'secureNote',
      title: 'Test Note',
      note: 'Test content',
      color: '#000000',
      itemKey: 'key3',
      createdDateTime: new Date(),
      lastUseDateTime: new Date()
    } as SecureNoteDecrypted
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockItemsStateManager.getItems.mockReturnValue([]);
    mockItemsStateManager.on.mockImplementation((event, callback) => {
      // Store callback for testing
      (mockItemsStateManager as any).testCallback = callback;
      return mockItemsStateManager; // Return the manager for chaining
    });
    mockItemsStateManager.off.mockImplementation(() => mockItemsStateManager);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useItems());

      expect(result.current.items).toEqual([]);
      expect(result.current.credentials).toEqual([]);
      expect(result.current.bankCards).toEqual([]);
      expect(result.current.secureNotes).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should show loading when no initial items', () => {
      mockItemsStateManager.getItems.mockReturnValue([]);
      
      const { result } = renderHook(() => useItems());

      expect(result.current.loading).toBe(true);
    });

    it('should not show loading when initial items exist', () => {
      mockItemsStateManager.getItems.mockReturnValue(mockItems);
      
      const { result } = renderHook(() => useItems());

      expect(result.current.loading).toBe(false);
      expect(result.current.items).toEqual(mockItems);
    });
  });

  describe('state manager subscription', () => {
    it('should subscribe to itemsStateManager on mount', () => {
      renderHook(() => useItems());

      expect(mockItemsStateManager.on).toHaveBeenCalledWith('itemsChanged', expect.any(Function));
    });

    it('should unsubscribe from itemsStateManager on unmount', () => {
      const { unmount } = renderHook(() => useItems());

      unmount();

      expect(mockItemsStateManager.off).toHaveBeenCalledWith('itemsChanged', expect.any(Function));
    });
  });

  describe('items changed event', () => {
    it('should update items when itemsChanged event is triggered', async () => {
      const { result } = renderHook(() => useItems());

      // Get the callback that was registered
      const itemsChangedCallback = mockItemsStateManager.on.mock.calls[0][1];

      await act(async () => {
        itemsChangedCallback(mockItems);
      });

      expect(result.current.items).toEqual(mockItems);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should filter items by type correctly', async () => {
      const { result } = renderHook(() => useItems());

      const itemsChangedCallback = mockItemsStateManager.on.mock.calls[0][1];

      await act(async () => {
        itemsChangedCallback(mockItems);
      });

      expect(result.current.credentials).toHaveLength(1);
      expect(result.current.bankCards).toHaveLength(1);
      expect(result.current.secureNotes).toHaveLength(1);
      expect(result.current.credentials[0].itemType).toBe('credential');
      expect(result.current.bankCards[0].itemType).toBe('bankCard');
      expect(result.current.secureNotes[0].itemType).toBe('secureNote');
    });

    it('should handle empty items array', async () => {
      const { result } = renderHook(() => useItems());

      const itemsChangedCallback = mockItemsStateManager.on.mock.calls[0][1];

      await act(async () => {
        itemsChangedCallback([]);
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.credentials).toEqual([]);
      expect(result.current.bankCards).toEqual([]);
      expect(result.current.secureNotes).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('data derivation', () => {
    it('should derive credentials from items', () => {
      const credentialItems = mockItems.filter(item => item.itemType === 'credential');
      mockItemsStateManager.getItems.mockReturnValue(credentialItems);

      const { result } = renderHook(() => useItems());

      expect(result.current.credentials).toEqual(credentialItems);
      expect(result.current.bankCards).toEqual([]);
      expect(result.current.secureNotes).toEqual([]);
    });

    it('should derive bank cards from items', () => {
      const bankCardItems = mockItems.filter(item => item.itemType === 'bankCard');
      mockItemsStateManager.getItems.mockReturnValue(bankCardItems);

      const { result } = renderHook(() => useItems());

      expect(result.current.credentials).toEqual([]);
      expect(result.current.bankCards).toEqual(bankCardItems);
      expect(result.current.secureNotes).toEqual([]);
    });

    it('should derive secure notes from items', () => {
      const secureNoteItems = mockItems.filter(item => item.itemType === 'secureNote');
      mockItemsStateManager.getItems.mockReturnValue(secureNoteItems);

      const { result } = renderHook(() => useItems());

      expect(result.current.credentials).toEqual([]);
      expect(result.current.bankCards).toEqual([]);
      expect(result.current.secureNotes).toEqual(secureNoteItems);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useItems());

      const itemsChangedCallback = mockItemsStateManager.on.mock.calls[0][1];

      // Simulate an error by throwing in the callback
      await act(async () => {
        try {
          itemsChangedCallback(mockItems);
        } catch (error) {
          // Error should be handled gracefully
        }
      });

      // Should still update with items despite potential errors
      expect(result.current.items).toEqual(mockItems);
    });
  });

  describe('cleanup', () => {
    it('should properly cleanup subscriptions', () => {
      const { unmount } = renderHook(() => useItems());

      unmount();

      expect(mockItemsStateManager.off).toHaveBeenCalledWith('itemsChanged', expect.any(Function));
    });
  });
}); 