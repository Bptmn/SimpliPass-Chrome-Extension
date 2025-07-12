import { renderHook, act } from '@testing-library/react-native';
import { useHelperBar } from '../useHelperBar';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('@app/core/logic/user', () => ({
  getUserSecretKey: jest.fn(),
}));

const mockUseUserStore = jest.fn(() => ({
  user: { uid: 'test-user-id' },
}));

jest.mock('@app/core/states/user', () => ({
  useUserStore: mockUseUserStore,
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
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockUseUserStore.mockReturnValue({ user: null as any });
    
    const { result } = renderHook(() => useHelperBar());
    
    await act(async () => {
      await result.current.handleRefresh();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('No user logged in, cannot refresh cache');
    consoleSpy.mockRestore();
  });
}); 