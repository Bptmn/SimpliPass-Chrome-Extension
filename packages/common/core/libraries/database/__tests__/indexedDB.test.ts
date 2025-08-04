// packages/common/core/libraries/database/__tests__/indexedDB.test.ts
import "fake-indexeddb/auto";
import { IndexedDBWrapper } from '../indexedDB';

// Polyfill for structuredClone
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

describe('IndexedDBWrapper', () => {
  let dbWrapper: IndexedDBWrapper;

  beforeEach(() => {
    // We can use the fake-indexeddb in memory for tests
    dbWrapper = new IndexedDBWrapper(indexedDB);
  });
  
  afterEach(async () => {
    // Clear the database after each test
    await dbWrapper.clearAll();
    dbWrapper.close();
    indexedDB.deleteDatabase('SimplipassDB');
  });

  it('should set and get an item', async () => {
    await dbWrapper.setItem('testKey', { data: 'testValue' });
    const item = await dbWrapper.getItem<{ data: string }>('testKey');
    expect(item).toEqual({ data: 'testValue' });
  });

  it('should return null for a non-existent item', async () => {
    const item = await dbWrapper.getItem('nonExistentKey');
    expect(item).toBeNull();
  });

  it('should update an existing item', async () => {
    await dbWrapper.setItem('testKey', { data: 'initialValue' });
    await dbWrapper.setItem('testKey', { data: 'updatedValue' });
    const item = await dbWrapper.getItem<{ data: string }>('testKey');
    expect(item).toEqual({ data: 'updatedValue' });
  });

  it('should remove an item', async () => {
    await dbWrapper.setItem('testKey', { data: 'testValue' });
    await dbWrapper.removeItem('testKey');
    const item = await dbWrapper.getItem('testKey');
    expect(item).toBeNull();
  });

  it('should clear all items', async () => {
    await dbWrapper.setItem('key1', { data: 'value1' });
    await dbWrapper.setItem('key2', { data: 'value2' });
    await dbWrapper.clearAll();
    const item1 = await dbWrapper.getItem('key1');
    const item2 = await dbWrapper.getItem('key2');
    expect(item1).toBeNull();
    expect(item2).toBeNull();
  });
});
