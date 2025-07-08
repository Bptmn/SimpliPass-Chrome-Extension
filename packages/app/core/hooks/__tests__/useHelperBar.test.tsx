import { renderHook, act } from '@testing-library/react-native';
import { useHelperBar } from '../useHelperBar';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('@app/core/logic/items', () => ({
  refreshItems: jest.fn(),
}));

jest.mock('@app/core/logic/user', () => ({
  getUserSecretKey: jest.fn(),
}));

jest.mock('@app/core/states/user', () => ({
  useUserStore: jest.fn(() => ({
    user: { uid: 'test-user-id' },
  })),
}));

jest.mock('@app/core/states', () => ({
  useCategoryStore: jest.fn(() => ({
    currentCategory: 'credentials',
  })),
}));

describe('useHelperBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the expected properties', () => {
    const { result } = renderHook(() => useHelperBar());
    
    expect(result.current.currentCategory).toBe('credentials');
    expect(result.current.addButtonText).toBe('Ajouter un identifiant');
    expect(typeof result.current.handleAdd).toBe('function');
    expect(typeof result.current.handleFAQ).toBe('function');
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should return correct button text for different categories', () => {
    const mockUseCategoryStore = jest.requireMock('@app/core/states').useCategoryStore;
    
    // Test credentials category
    mockUseCategoryStore.mockReturnValue({ currentCategory: 'credentials' });
    const { result: result1 } = renderHook(() => useHelperBar());
    expect(result1.current.addButtonText).toBe('Ajouter un identifiant');
    
    // Test bankCards category
    mockUseCategoryStore.mockReturnValue({ currentCategory: 'bankCards' });
    const { result: result2 } = renderHook(() => useHelperBar());
    expect(result2.current.addButtonText).toBe('Ajouter une carte');
    
    // Test secureNotes category
    mockUseCategoryStore.mockReturnValue({ currentCategory: 'secureNotes' });
    const { result: result3 } = renderHook(() => useHelperBar());
    expect(result3.current.addButtonText).toBe('Ajouter une note');
    
    // Test default category
    mockUseCategoryStore.mockReturnValue({ currentCategory: 'unknown' });
    const { result: result4 } = renderHook(() => useHelperBar());
    expect(result4.current.addButtonText).toBe('Ajouter');
  });

  it('should handle FAQ click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { result } = renderHook(() => useHelperBar());
    
    act(() => {
      result.current.handleFAQ();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('FAQ clicked');
    consoleSpy.mockRestore();
  });

  it('should handle refresh with valid user', async () => {
    const mockGetUserSecretKey = jest.requireMock('@app/core/logic/user').getUserSecretKey;
    const mockRefreshItems = jest.requireMock('@app/core/logic/items').refreshItems;
    
    mockGetUserSecretKey.mockResolvedValue('test-secret-key');
    mockRefreshItems.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useHelperBar());
    
    await act(async () => {
      await result.current.handleRefresh();
    });
    
    expect(mockGetUserSecretKey).toHaveBeenCalled();
    expect(mockRefreshItems).toHaveBeenCalledWith('test-user-id', 'test-secret-key');
  });

  it('should handle refresh without user', async () => {
    const mockUseUserStore = jest.requireMock('@app/core/states/user').useUserStore;
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockUseUserStore.mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useHelperBar());
    
    await act(async () => {
      await result.current.handleRefresh();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('No user logged in, cannot refresh cache');
    consoleSpy.mockRestore();
  });
}); 