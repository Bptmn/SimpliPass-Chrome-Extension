/**
 * useHomePage hook tests for SimpliPass
 * Tests state, effect, error, and platform logic
 */

import { renderHook, act } from '@testing-library/react-native';
import { useHomePage } from '../useHomePage';

// Mock dependencies
const mockCredential = {
  id: '1',
  title: 'Test',
  username: 'user',
  password: 'pass',
  createdDateTime: new Date('2023-01-01T00:00:00Z'),
  lastUseDateTime: new Date('2023-01-02T00:00:00Z'),
  note: '',
  url: 'https://example.com',
  itemKey: 'key',
};

jest.mock('@app/core/states', () => ({
  useCredentialsStore: () => ({ credentials: [mockCredential] }),
  useBankCardsStore: () => ({ bankCards: [] }),
  useSecureNotesStore: () => ({ secureNotes: [] }),
  useCategoryStore: () => ({ currentCategory: 'credentials', setCurrentCategory: jest.fn() }),
}));
jest.mock('@app/core/states/user', () => ({
  useUserStore: () => ({ user: { uid: 'u1', email: 'test@example.com' } }),
}));
jest.mock('@app/core/logic/items', () => ({
  getAllItems: jest.fn(),
}));
jest.mock('@app/core/logic/user', () => ({
  getUserSecretKey: jest.fn(() => Promise.resolve('secret')),
}));
jest.mock('@app/core/hooks', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));

describe('useHomePage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with credentials and user', () => {
    const { result } = renderHook(() => useHomePage());
    expect(result.current.credentials.length).toBeGreaterThan(0);
    expect(result.current.user).toBeDefined();
    expect(result.current.category).toBe('credentials');
  });

  it('should allow setting filter', () => {
    const { result } = renderHook(() => useHomePage());
    act(() => {
      result.current.setFilter('test');
    });
    expect(result.current.filter).toBe('test');
  });

  it('should provide getFilteredItems function', () => {
    const { result } = renderHook(() => useHomePage());
    act(() => {
      result.current.setFilter('Test');
    });
    const filtered = result.current.getFilteredItems();
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should handle card click', () => {
    const { result } = renderHook(() => useHomePage());
    act(() => {
      result.current.handleCardClick(mockCredential);
    });
    expect(result.current.selected).toEqual(mockCredential);
  });

  it('should handle other item click', () => {
    const { result } = renderHook(() => useHomePage());
    act(() => {
      result.current.handleOtherItemClick(mockCredential);
    });
    expect(result.current.selected).toEqual(mockCredential);
  });

  it('should provide getSuggestions function', () => {
    const { result } = renderHook(() => useHomePage({ url: 'https://example.com' }));
    const suggestions = result.current.getSuggestions();
    expect(Array.isArray(suggestions)).toBe(true);
  });

  it('should handle copy handlers', () => {
    const { result } = renderHook(() => useHomePage());
    expect(() => result.current.handleCopyCredential()).not.toThrow();
    expect(() => result.current.handleCopyOther()).not.toThrow();
  });

  it('should handle add suggestion', () => {
    const { result } = renderHook(() => useHomePage({ url: 'https://example.com' }));
    expect(() => result.current.handleAddSuggestion()).not.toThrow();
  });
}); 