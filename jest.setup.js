// TextEncoder polyfill for Jest
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta for Vite environment variables in tests
global.import = {
  meta: {
    env: {
      // Add any Vite environment variables you need in tests
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id',
      VITE_COGNITO_USER_POOL_ID: 'test-user-pool-id',
      VITE_COGNITO_CLIENT_ID: 'test-client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    }
  }
};

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
    this._objectStoreNames = [];
    this.stores = new Map();
  }

  createObjectStore(name, options = {}) {
    const store = new MockIDBObjectStore(name, options);
    this.stores.set(name, store);
    this._objectStoreNames.push(name);
    return store;
  }

  transaction(storeNames, mode = 'readonly') {
    return new MockIDBTransaction(this, storeNames, mode);
  }

  close() {
    // Mock close operation
  }

  get objectStoreNames() {
    return {
      contains: (name) => this._objectStoreNames.includes(name),
      length: this._objectStoreNames.length,
      [Symbol.iterator]: () => this._objectStoreNames[Symbol.iterator](),
    };
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
      let isNewDatabase = false;
      
      if (!db) {
        // Create new database
        db = new MockIDBDatabase(dbName, version);
        databases.set(dbName, db);
        isNewDatabase = true;
      }
      
      // Set the result first so it's available in onupgradeneeded
      request.result = db;
      
      if (isNewDatabase) {
        // Trigger upgrade needed event with the database object
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: request });
        }
      }
      
      // Always create keyValueStore if it doesn't exist (for SimplipassDB)
      if (dbName === 'SimplipassDB' && !db.stores.has('keyValueStore')) {
        db.createObjectStore('keyValueStore', { keyPath: 'key' });
      }
      
      // Trigger success event
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
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
        get: jest.fn((keys, callback) => {
          // Return empty object for any key lookup
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              result[key] = undefined;
            });
          } else if (typeof keys === 'string') {
            result[keys] = undefined;
          }
          if (callback) {
            callback(result);
          }
          return Promise.resolve(result);
        }),
        set: jest.fn((data, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        remove: jest.fn((keys, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        clear: jest.fn((callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
      },
      sync: {
        get: jest.fn((keys, callback) => {
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              result[key] = undefined;
            });
          } else if (typeof keys === 'string') {
            result[keys] = undefined;
          }
          if (callback) {
            callback(result);
          }
          return Promise.resolve(result);
        }),
        set: jest.fn((data, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        remove: jest.fn((keys, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        clear: jest.fn((callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
      },
    },
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    tabs: {
      query: jest.fn(),
      sendMessage: jest.fn(),
    },
  };
}

// Mock navigator.clipboard
Object.assign(global, {
  navigator: {
    ...global.navigator,
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue(''),
    },
  },
});

// Mock window.alert
global.alert = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Extend Jest matchers for React Native Testing Library
require('@testing-library/jest-native/extend-expect'); 