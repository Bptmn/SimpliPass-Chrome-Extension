/**
 * Tests for homePage utility functions
 */

import { 
  getFilteredItems, 
  handleCardClick, 
  handleOtherItemClick, 
  getSuggestions, 
  shouldShowLoading, 
  getItemCounts 
} from '../homePage';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('getFilteredItems', () => {
  const mockItems = [
    { id: '1', title: 'Google Account', type: 'credential' },
    { id: '2', title: 'Facebook Login', type: 'credential' },
    { id: '3', title: 'Bank Card', type: 'bankCard' },
    { id: '4', title: 'Secure Note', type: 'secureNote' }
  ] as any[];

  it('should filter items by title (case insensitive)', () => {
    const result = getFilteredItems(mockItems, 'google');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Google Account');
  });

  it('should return empty array for no matches', () => {
    const result = getFilteredItems(mockItems, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should return all items for empty filter', () => {
    const result = getFilteredItems(mockItems, '');
    expect(result).toHaveLength(4);
  });

  it('should handle case insensitive filtering', () => {
    const result = getFilteredItems(mockItems, 'FACEBOOK');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Facebook Login');
  });

  it('should handle partial matches', () => {
    const result = getFilteredItems(mockItems, 'card');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Bank Card');
  });
});

describe('handleCardClick', () => {
  it('should call setSelected with the credential', () => {
    const mockSetSelected = jest.fn();
    const mockCredential = { id: '1', title: 'Test Credential' } as CredentialDecrypted;

    handleCardClick(mockCredential, mockSetSelected);

    expect(mockSetSelected).toHaveBeenCalledWith(mockCredential);
  });
});

describe('handleOtherItemClick', () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
  });

  it('should set selected item if it is a CredentialDecrypted', () => {
    const mockSetSelected = jest.fn();
    const mockItem = { id: '1', username: 'user', password: 'pass' };

    handleOtherItemClick(mockItem, mockSetSelected);

    expect(mockSetSelected).toHaveBeenCalledWith(mockItem);
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });

  it('should warn and not set selected for invalid items', () => {
    const mockSetSelected = jest.fn();
    const mockItem = { id: '1', title: 'Invalid Item' };

    handleOtherItemClick(mockItem, mockSetSelected);

    expect(mockSetSelected).not.toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'handleOtherItemClick: item is not a CredentialDecrypted', 
      mockItem
    );
  });

  it('should warn and not set selected for null/undefined items', () => {
    const mockSetSelected = jest.fn();

    handleOtherItemClick(null, mockSetSelected);
    handleOtherItemClick(undefined, mockSetSelected);

    expect(mockSetSelected).not.toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledTimes(2);
  });

  it('should warn and not set selected for items missing required fields', () => {
    const mockSetSelected = jest.fn();
    const mockItem = { id: '1', username: 'user' }; // missing password

    handleOtherItemClick(mockItem, mockSetSelected);

    expect(mockSetSelected).not.toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'handleOtherItemClick: item is not a CredentialDecrypted', 
      mockItem
    );
  });
});

describe('getSuggestions', () => {
  const mockCredentials = [
    { id: '1', title: 'Google', url: 'https://google.com' },
    { id: '2', title: 'Facebook', url: 'https://facebook.com' },
    { id: '3', title: 'GitHub', url: 'https://github.com' },
    { id: '4', title: 'Twitter', url: 'https://twitter.com' }
  ] as CredentialDecrypted[];

  it('should return matching credentials for a URL', () => {
    const result = getSuggestions(mockCredentials, 'https://google.com/login');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Google');
  });

  it('should return empty array for no URL', () => {
    const result = getSuggestions(mockCredentials, '');
    expect(result).toHaveLength(0);
  });

  it('should return empty array for no credentials', () => {
    const result = getSuggestions([], 'https://google.com');
    expect(result).toHaveLength(0);
  });

  it('should limit results to 3 items', () => {
    const manyCredentials = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      title: `Test ${i}`,
      url: 'https://test.com'
    })) as CredentialDecrypted[];

    const result = getSuggestions(manyCredentials, 'https://test.com');
    expect(result).toHaveLength(3);
  });

  it('should handle URLs without protocol', () => {
    const result = getSuggestions(mockCredentials, 'google.com');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Google');
  });

  it('should be case insensitive', () => {
    const result = getSuggestions(mockCredentials, 'https://GOOGLE.COM');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Google');
  });
});

describe('shouldShowLoading', () => {
  it('should return true when items are loading', () => {
    expect(shouldShowLoading(true, 5, { id: 'user' })).toBe(true);
  });

  it('should return true when no items and user exists', () => {
    expect(shouldShowLoading(false, 0, { id: 'user' })).toBe(true);
  });

  it('should return false when items exist and not loading', () => {
    expect(shouldShowLoading(false, 5, { id: 'user' })).toBe(false);
  });

  it('should return false when no user', () => {
    expect(shouldShowLoading(false, 0, null)).toBe(false);
  });

  it('should return false when loading but user is null', () => {
    expect(shouldShowLoading(true, 0, null)).toBe(true);
  });
});

describe('getItemCounts', () => {
  const mockCredentials = [
    { id: '1', type: 'credential' },
    { id: '2', type: 'credential' }
  ] as CredentialDecrypted[];

  const mockBankCards = [
    { id: '3', type: 'bankCard' },
    { id: '4', type: 'bankCard' },
    { id: '5', type: 'bankCard' }
  ] as BankCardDecrypted[];

  const mockSecureNotes = [
    { id: '6', type: 'secureNote' }
  ] as SecureNoteDecrypted[];

  const allItems = [...mockCredentials, ...mockBankCards, ...mockSecureNotes];

  it('should return correct counts for all item types', () => {
    const result = getItemCounts(allItems, mockCredentials, mockBankCards, mockSecureNotes);

    expect(result).toEqual({
      total: 6,
      credentials: 2,
      bankCards: 3,
      secureNotes: 1
    });
  });

  it('should handle empty arrays', () => {
    const result = getItemCounts([], [], [], []);

    expect(result).toEqual({
      total: 0,
      credentials: 0,
      bankCards: 0,
      secureNotes: 0
    });
  });

  it('should handle mixed item types', () => {
    const mixedItems = [
      { id: '1', type: 'credential' },
      { id: '2', type: 'bankCard' },
      { id: '3', type: 'secureNote' }
    ] as any[];

    const result = getItemCounts(mixedItems, [mixedItems[0]], [mixedItems[1]], [mixedItems[2]]);

    expect(result).toEqual({
      total: 3,
      credentials: 1,
      bankCards: 1,
      secureNotes: 1
    });
  });
});
