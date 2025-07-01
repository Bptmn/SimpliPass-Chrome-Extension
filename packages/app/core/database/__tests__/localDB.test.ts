/**
 * Tests for localDB functions (web platform only)
 */

// Mock React Native Platform before importing localDB
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web'
  }
}));

// Mock the mobile secure storage module
jest.mock('../../../../mobile/utils/secureStorage', () => ({
  initSecureStorage: jest.fn(),
  setSecureItem: jest.fn(),
  getSecureItem: jest.fn(),
  removeSecureItem: jest.fn(),
  hasSecureItem: jest.fn(),
  clearAllSecureItems: jest.fn(),
  isSecureStorageSupported: jest.fn(),
  getSecureStorageInfo: jest.fn(),
}));

import { 
  setItem, 
  getItem, 
  removeItem, 
  hasItem, 
  clearAll,
  isStorageSupported,
  getCurrentPlatform,
  isWeb,
  isMobile
} from '../localDB';

describe('localDB (Web Platform)', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await clearAll();
  });

  afterEach(async () => {
    // Clear storage after each test
    await clearAll();
  });

  describe('Platform detection', () => {
    it('should detect web platform', () => {
      expect(getCurrentPlatform()).toBe('web');
      expect(isWeb()).toBe(true);
      expect(isMobile()).toBe(false);
    });

    it('should check if storage is supported', () => {
      expect(isStorageSupported()).toBe(true);
    });
  });

  describe('Basic CRUD operations', () => {
    it('should store and retrieve a string value', async () => {
      const key = 'testString';
      const value = 'test value';
      
      await setItem(key, value);
      const retrieved = await getItem<string>(key);
      
      expect(retrieved).toBe(value);
    });

    it('should store and retrieve an object value', async () => {
      const key = 'testObject';
      const value = { name: 'test', id: 123 };
      
      await setItem(key, value);
      const retrieved = await getItem<typeof value>(key);
      
      expect(retrieved).toEqual(value);
    });

    it('should store and retrieve a number value', async () => {
      const key = 'testNumber';
      const value = 42;
      
      await setItem(key, value);
      const retrieved = await getItem<number>(key);
      
      expect(retrieved).toBe(value);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await getItem<string>('nonExistentKey');
      expect(retrieved).toBeNull();
    });

    it('should check if item exists', async () => {
      const key = 'testExists';
      const value = 'test value';
      
      expect(await hasItem(key)).toBe(false);
      
      await setItem(key, value);
      expect(await hasItem(key)).toBe(true);
    });

    it('should remove items', async () => {
      const key = 'testRemove';
      const value = 'test value';
      
      await setItem(key, value);
      expect(await hasItem(key)).toBe(true);
      
      await removeItem(key);
      expect(await hasItem(key)).toBe(false);
      expect(await getItem(key)).toBeNull();
    });

    it('should clear all items', async () => {
      const key1 = 'test1';
      const key2 = 'test2';
      
      await setItem(key1, 'value1');
      await setItem(key2, 'value2');
      
      expect(await hasItem(key1)).toBe(true);
      expect(await hasItem(key2)).toBe(true);
      
      await clearAll();
      
      expect(await hasItem(key1)).toBe(false);
      expect(await hasItem(key2)).toBe(false);
    });

    it('should update existing items', async () => {
      const key = 'testUpdate';
      const value1 = 'value1';
      const value2 = 'value2';
      
      await setItem(key, value1);
      expect(await getItem(key)).toBe(value1);
      
      await setItem(key, value2);
      expect(await getItem(key)).toBe(value2);
    });
  });

  describe('Error handling', () => {
    it('should handle null/undefined values', async () => {
      const key = 'testNull';
      
      await setItem(key, null);
      const retrieved = await getItem(key);
      expect(retrieved).toBeNull();
    });
  });
}); 