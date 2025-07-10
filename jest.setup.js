// TextEncoder polyfill for Jest
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Comprehensive IndexedDB mock for tests
class MockIDBRequest {
  constructor() {
    this.readyState = 'pending';
    this.result = null;
    this.error = null;
    this.onsuccess = null;
    this.onerror = null;
    this.onupgradeneeded = null;
  }

  setResult(result) {
    this.readyState = 'done';
    this.result = result;
    if (this.onsuccess) {
      this.onsuccess({ target: this });
    }
  }

  setError(error) {
    this.readyState = 'done';
    this.error = error;
    if (this.onerror) {
      this.onerror({ target: this });
    }
  }

  triggerUpgradeNeeded() {
    if (this.onupgradeneeded) {
      this.onupgradeneeded({ target: this });
    }
  }
}

class MockIDBDatabase {
  constructor(name, version = 1) {
    this.name = name;
    this.version = version;
    this.objectStoreNames = [];
    this.stores = new Map();
  }

  createObjectStore(name, options = {}) {
    const store = new MockIDBObjectStore(name, options);
    this.stores.set(name, store);
    this.objectStoreNames.push(name);
    return store;
  }

  transaction(storeNames, mode = 'readonly') {
    return new MockIDBTransaction(this, storeNames, mode);
  }

  close() {
    // Mock close operation
  }
}

class MockIDBObjectStore {
  constructor(name, options = {}) {
    this.name = name;
    this.keyPath = options.keyPath;
    this.autoIncrement = options.autoIncrement || false;
    this.data = new Map();
  }

  put(value, key) {
    const request = new MockIDBRequest();
    setTimeout(() => {
      const finalKey = key || value.key || Date.now();
      this.data.set(finalKey, value);
      request.setResult(finalKey);
    }, 0);
    return request;
  }

  get(key) {
    const request = new MockIDBRequest();
    setTimeout(() => {
      const value = this.data.get(key);
      request.setResult(value);
    }, 0);
    return request;
  }

  delete(key) {
    const request = new MockIDBRequest();
    setTimeout(() => {
      this.data.delete(key);
      request.setResult(undefined);
    }, 0);
    return request;
  }

  clear() {
    const request = new MockIDBRequest();
    setTimeout(() => {
      this.data.clear();
      request.setResult(undefined);
    }, 0);
    return request;
  }

  count(key) {
    const request = new MockIDBRequest();
    setTimeout(() => {
      if (key) {
        request.setResult(this.data.has(key) ? 1 : 0);
      } else {
        request.setResult(this.data.size);
      }
    }, 0);
    return request;
  }

  getAllKeys() {
    const request = new MockIDBRequest();
    setTimeout(() => {
      request.setResult(Array.from(this.data.keys()));
    }, 0);
    return request;
  }
}

class MockIDBTransaction {
  constructor(database, storeNames, mode) {
    this.database = database;
    this.mode = mode;
    this.stores = storeNames.map(name => database.stores.get(name));
  }

  objectStore(name) {
    const store = this.database.stores.get(name);
    if (!store) {
      throw new Error(`Object store '${name}' not found`);
    }
    return store;
  }
}

// Global IndexedDB mock with proper database initialization
const databases = new Map();

global.indexedDB = {
  open: (dbName, version = 1) => {
    const request = new MockIDBRequest();
    
    setTimeout(() => {
      let db = databases.get(dbName);
      
      if (!db) {
        // Create new database
        db = new MockIDBDatabase(dbName, version);
        databases.set(dbName, db);
        
        // Trigger upgrade needed event
        request.triggerUpgradeNeeded();
      }
      
      // Always create keyValueStore if it doesn't exist (for SimplipassDB)
      if (dbName === 'SimplipassDB' && !db.stores.has('keyValueStore')) {
        db.createObjectStore('keyValueStore', { keyPath: 'key' });
      }
      
      request.setResult(db);
    }, 0);
    
    return request;
  },
  deleteDatabase: (dbName) => {
    const request = new MockIDBRequest();
    setTimeout(() => {
      databases.delete(dbName);
      request.setResult(undefined);
    }, 0);
    return request;
  }
};

// Mock chrome.storage.local.clear to call its callback
if (typeof global.chrome === 'undefined') {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn((callback) => {
          if (callback) callback();
        }),
      },
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
      },
    },
    runtime: {
      id: 'test-extension-id',
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
} else if (global.chrome.storage?.local?.clear) {
  global.chrome.storage.local.clear = jest.fn((callback) => {
    if (callback) callback();
  });
}

// Extend Jest matchers for React Native Testing Library
require('@testing-library/jest-native/extend-expect'); 