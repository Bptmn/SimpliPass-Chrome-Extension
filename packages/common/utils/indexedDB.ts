/**
 * Low-level IndexedDB CRUD operations for Chrome extension
 * Used for storing individual items like user secret keys, emails, etc.
 */

const DB_NAME = 'SimplipassDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyValueStore';

interface IndexedDBConfig {
  dbName?: string;
  storeName?: string;
  version?: number;
}

// Track if database has been initialized
let isInitialized = false;

/**
 * Initialize the IndexedDB database
 */
export const initDB = (config: IndexedDBConfig = {}): Promise<IDBDatabase> => {
  const { dbName = DB_NAME, storeName = STORE_NAME, version = DB_VERSION } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      isInitialized = true;
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Ensure database is initialized before performing operations
 */
const ensureInitialized = async (config: IndexedDBConfig = {}): Promise<void> => {
  if (!isInitialized) {
    await initDB(config);
  }
};

/**
 * Create or update a single item in IndexedDB
 */
export const setItem = async <T>(
  key: string, 
  value: T, 
  config: IndexedDBConfig = {}
): Promise<void> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const item = { key, value, timestamp: Date.now() };
      const putRequest = store.put(item);
      
      putRequest.onerror = () => {
        reject(new Error(`Failed to store item: ${putRequest.error?.message}`));
      };
      
      putRequest.onsuccess = () => {
        resolve();
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Retrieve a single item from IndexedDB
 */
export const getItem = async <T>(
  key: string, 
  config: IndexedDBConfig = {}
): Promise<T | null> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getRequest = store.get(key);
      
      getRequest.onerror = () => {
        reject(new Error(`Failed to retrieve item: ${getRequest.error?.message}`));
      };
      
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.value : null);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Delete a single item from IndexedDB
 */
export const removeItem = async (
  key: string, 
  config: IndexedDBConfig = {}
): Promise<void> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const deleteRequest = store.delete(key);
      
      deleteRequest.onerror = () => {
        reject(new Error(`Failed to delete item: ${deleteRequest.error?.message}`));
      };
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Check if an item exists in IndexedDB
 */
export const hasItem = async (
  key: string, 
  config: IndexedDBConfig = {}
): Promise<boolean> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const countRequest = store.count(key);
      
      countRequest.onerror = () => {
        reject(new Error(`Failed to check item existence: ${countRequest.error?.message}`));
      };
      
      countRequest.onsuccess = () => {
        resolve(countRequest.result > 0);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Get all keys from IndexedDB
 */
export const getAllKeys = async (
  config: IndexedDBConfig = {}
): Promise<string[]> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getAllKeysRequest = store.getAllKeys();
      
      getAllKeysRequest.onerror = () => {
        reject(new Error(`Failed to get all keys: ${getAllKeysRequest.error?.message}`));
      };
      
      getAllKeysRequest.onsuccess = () => {
        resolve(getAllKeysRequest.result as string[]);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Clear all items from IndexedDB
 */
export const clearAll = async (
  config: IndexedDBConfig = {}
): Promise<void> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const clearRequest = store.clear();
      
      clearRequest.onerror = () => {
        reject(new Error(`Failed to clear store: ${clearRequest.error?.message}`));
      };
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Delete the entire database
 */
export const deleteDB = async (
  config: IndexedDBConfig = {}
): Promise<void> => {
  const { dbName = DB_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to delete database: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      resolve();
    };
  });
};

/**
 * Get database size (approximate)
 */
export const getDBSize = async (
  config: IndexedDBConfig = {}
): Promise<number> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME, storeName = STORE_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const countRequest = store.count();
      
      countRequest.onerror = () => {
        reject(new Error(`Failed to get database size: ${countRequest.error?.message}`));
      };
      
      countRequest.onsuccess = () => {
        resolve(countRequest.result);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

/**
 * Utility function to check if IndexedDB is supported
 */
export const isIndexedDBSupported = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

/**
 * Utility function to get database info
 */
export const getDBInfo = async (
  config: IndexedDBConfig = {}
): Promise<{ name: string; version: number; stores: string[] }> => {
  await ensureInitialized(config);
  
  const { dbName = DB_NAME } = config;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const info = {
        name: db.name,
        version: db.version,
        stores: Array.from(db.objectStoreNames)
      };
      db.close();
      resolve(info);
    };
  });
};
