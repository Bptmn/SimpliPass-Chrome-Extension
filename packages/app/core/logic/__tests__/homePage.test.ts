import { getFilteredItems } from '../homePage';
import { CredentialDecrypted } from '@app/core/types/types';

describe('HomePage Logic', () => {
  const mockCredentials: CredentialDecrypted[] = [
    {
      id: '1',
      title: 'Google Account',
      username: 'user@gmail.com',
      password: 'password123',
      url: 'https://google.com',
      note: 'Personal account',
      createdDateTime: new Date('2023-01-01'),
      lastUseDateTime: new Date('2023-01-02'),
      itemKey: 'key1',
    },
    {
      id: '2',
      title: 'GitHub Account',
      username: 'developer',
      password: 'devpass',
      url: 'https://github.com',
      note: 'Work account',
      createdDateTime: new Date('2023-01-01'),
      lastUseDateTime: new Date('2023-01-02'),
      itemKey: 'key2',
    },
    {
      id: '3',
      title: 'Amazon Shopping',
      username: 'shopper@amazon.com',
      password: 'shop123',
      url: 'https://amazon.com',
      note: 'Shopping account',
      createdDateTime: new Date('2023-01-01'),
      lastUseDateTime: new Date('2023-01-02'),
      itemKey: 'key3',
    },
  ];

  describe('getFilteredItems', () => {
    it('should return all items when filter is empty', () => {
      const result = getFilteredItems(mockCredentials, '');
      expect(result).toEqual(mockCredentials);
    });

    it('should filter items by title (case insensitive)', () => {
      const result = getFilteredItems(mockCredentials, 'google');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Google Account');
    });

    it('should filter items by partial title match', () => {
      const result = getFilteredItems(mockCredentials, 'account');
      expect(result).toHaveLength(2);
      expect(result.map(item => item.title)).toContain('Google Account');
      expect(result.map(item => item.title)).toContain('GitHub Account');
    });

    it('should return empty array when no matches found', () => {
      const result = getFilteredItems(mockCredentials, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should handle case insensitive search', () => {
      const result = getFilteredItems(mockCredentials, 'GITHUB');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('GitHub Account');
    });

    it('should handle items with empty title', () => {
      const itemsWithEmptyTitle = [
        ...mockCredentials,
        {
          id: '4',
          title: '',
          username: 'empty',
          password: 'pass',
          url: 'https://example.com',
          note: '',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key4',
        },
      ];

      const result = getFilteredItems(itemsWithEmptyTitle, '');
      expect(result).toEqual(itemsWithEmptyTitle);
    });

    it('should handle items with null title', () => {
      const itemsWithNullTitle = [
        ...mockCredentials,
        {
          id: '4',
          title: null as any,
          username: 'null',
          password: 'pass',
          url: 'https://example.com',
          note: '',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key4',
        },
      ];

      const result = getFilteredItems(itemsWithNullTitle, '');
      expect(result).toEqual(itemsWithNullTitle);
    });

    it('should handle empty items array', () => {
      const result = getFilteredItems([], 'test');
      expect(result).toEqual([]);
    });

    it('should handle special characters in filter', () => {
      const itemsWithSpecialChars = [
        ...mockCredentials,
        {
          id: '4',
          title: 'Test@Account',
          username: 'test',
          password: 'pass',
          url: 'https://example.com',
          note: '',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key4',
        },
      ];

      const result = getFilteredItems(itemsWithSpecialChars, '@');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test@Account');
    });
  });
}); 