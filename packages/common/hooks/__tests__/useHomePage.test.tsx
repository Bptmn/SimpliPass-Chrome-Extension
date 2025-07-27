import { renderHook, act, waitFor } from '@testing-library/react';
import { useHomePage } from '../useHomePage';
import { loadUserProfile } from '@common/core/services/user';
import { fetchAndStoreItems } from '@common/core/services/items';
import { 
  shouldShowLoading,
  getItemCounts
} from '@common/utils/homePage';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, User } from '@common/core/types/types';

// Mock dependencies
jest.mock('@common/core/services/user');
jest.mock('@common/core/services/items');
jest.mock('@common/utils/homePage');
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));
jest.mock('../useItems', () => ({
  useItems: () => ({
    items: [],
    credentials: [],
    bankCards: [],
    secureNotes: [],
    loading: false,
    error: null
  })
}));
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  })
}));

const mockLoadUserProfile = loadUserProfile as jest.MockedFunction<typeof loadUserProfile>;
const mockFetchAndStoreItems = fetchAndStoreItems as jest.MockedFunction<typeof fetchAndStoreItems>;
const mockShouldShowLoading = shouldShowLoading as jest.MockedFunction<typeof shouldShowLoading>;
const mockGetItemCounts = getItemCounts as jest.MockedFunction<typeof getItemCounts>;

describe('useHomePage', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  const mockCredential: CredentialDecrypted = {
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
  };

  const mockBankCard: BankCardDecrypted = {
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
  };

  const mockSecureNote: SecureNoteDecrypted = {
    id: '3',
    itemType: 'secureNote',
    title: 'Test Note',
    note: 'Test content',
    color: '#000000',
    itemKey: 'key3',
    createdDateTime: new Date(),
    lastUseDateTime: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadUserProfile.mockResolvedValue(mockUser);
    mockFetchAndStoreItems.mockResolvedValue();
    mockShouldShowLoading.mockImplementation((itemsLoading: boolean, itemsLength: number, user: any) => false);
    mockGetItemCounts.mockImplementation(() => ({
      total: 3,
      credentials: 1,
      bankCards: 1,
      secureNotes: 1
    }));
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useHomePage());

      expect(result.current.user).toBe(null);
      expect(result.current.filter).toBe('');
      expect(result.current.selected).toBe(null);
      expect(result.current.selectedBankCard).toBe(null);
      expect(result.current.selectedSecureNote).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.setFilter).toBe('function');
      expect(typeof result.current.setSelected).toBe('function');
      expect(typeof result.current.setSelectedBankCard).toBe('function');
      expect(typeof result.current.setSelectedSecureNote).toBe('function');
      expect(typeof result.current.refreshData).toBe('function');
    });
  });

  describe('user profile loading', () => {
    it('should load user profile on mount', async () => {
      renderHook(() => useHomePage());

      await waitFor(() => {
        expect(mockLoadUserProfile).toHaveBeenCalled();
      });
    });

    it('should set user when profile loads successfully', async () => {
      const { result } = renderHook(() => useHomePage());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should handle user profile loading error', async () => {
      const profileError = new Error('Failed to load profile');
      mockLoadUserProfile.mockRejectedValue(profileError);

      const { result } = renderHook(() => useHomePage());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load profile');
      });
    });
  });

  describe('loading state', () => {
    it('should determine loading state correctly', () => {
      mockShouldShowLoading.mockImplementation((itemsLoading: boolean, itemsLength: number, user: any) => true);

      const { result } = renderHook(() => useHomePage());

      expect(result.current.loading).toBe(true);
    });

    it('should not show loading when items are available', () => {
      mockShouldShowLoading.mockImplementation((itemsLoading: boolean, itemsLength: number, user: any) => false);

      const { result } = renderHook(() => useHomePage());

      expect(result.current.loading).toBe(false);
    });
  });

  describe('item counts logging', () => {
    it('should log item counts when items change', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderHook(() => useHomePage());

      expect(mockGetItemCounts).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[useHomePage] Item counts:', {
        total: 3,
        credentials: 1,
        bankCards: 1,
        secureNotes: 1
      });

      consoleSpy.mockRestore();
    });
  });

  describe('data refresh', () => {
    it('should refresh data successfully', async () => {
      const { result } = renderHook(() => useHomePage());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(mockFetchAndStoreItems).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('should handle data refresh error', async () => {
      const refreshError = new Error('Failed to refresh data');
      mockFetchAndStoreItems.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useHomePage());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.error).toBe('Failed to refresh data');
    });
  });

  describe('state management', () => {
    it('should update filter state', () => {
      const { result } = renderHook(() => useHomePage());

      act(() => {
        result.current.setFilter('test filter');
      });

      expect(result.current.filter).toBe('test filter');
    });

    it('should update selected state', () => {
      const { result } = renderHook(() => useHomePage());

      act(() => {
        result.current.setSelected(mockCredential);
      });

      expect(result.current.selected).toEqual(mockCredential);
    });

    it('should update selected bank card state', () => {
      const { result } = renderHook(() => useHomePage());

      act(() => {
        result.current.setSelectedBankCard(mockBankCard);
      });

      expect(result.current.selectedBankCard).toEqual(mockBankCard);
    });

    it('should update selected secure note state', () => {
      const { result } = renderHook(() => useHomePage());

      act(() => {
        result.current.setSelectedSecureNote(mockSecureNote);
      });

      expect(result.current.selectedSecureNote).toEqual(mockSecureNote);
    });
  });

  describe('error handling', () => {
    it('should handle user profile loading error', async () => {
      const profileError = new Error('Profile loading failed');
      mockLoadUserProfile.mockRejectedValue(profileError);

      const { result } = renderHook(() => useHomePage());

      await waitFor(() => {
        expect(result.current.error).toBe('Profile loading failed');
      });
    });

    it('should handle data refresh error', async () => {
      const refreshError = new Error('Data refresh failed');
      mockFetchAndStoreItems.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useHomePage());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.error).toBe('Data refresh failed');
    });

    it('should handle unknown errors', async () => {
      const unknownError = { message: undefined };
      mockLoadUserProfile.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useHomePage());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user profile');
      });
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useHomePage());

      const initialSetFilter = result.current.setFilter;
      const initialSetSelected = result.current.setSelected;
      const initialRefreshData = result.current.refreshData;

      rerender();

      expect(result.current.setFilter).toBe(initialSetFilter);
      expect(result.current.setSelected).toBe(initialSetSelected);
      expect(result.current.refreshData).toBe(initialRefreshData);
    });
  });
}); 