// packages/common/core/libraries/database/indexedDB.ts

/**
 * A wrapper around the IndexedDB API to make it more modular and testable.
 */
export class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private version: number;
  private indexedDB: IDBFactory;

  constructor(
    indexedDB: IDBFactory,
    config: { dbName?: string; storeName?: string; version?: number } = {},
  ) {
    this.indexedDB = indexedDB;
    this.dbName = config.dbName || 'SimplipassDB';
    this.storeName = config.storeName || 'keyValueStore';
    this.version = config.version || 1;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(new Error(`Failed to open DB: ${request.error?.message}`));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await this.openDB();
    }
    return this.db;
  }
  
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const item = { key, value, timestamp: Date.now() };
    const putRequest = store.put(item);

    return new Promise((resolve, reject) => {
      putRequest.onerror = () => reject(new Error(`Failed to store item: ${putRequest.error?.message}`));
      putRequest.onsuccess = () => resolve();
    });
  }

  public async getItem<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const getRequest = store.get(key);

    return new Promise((resolve, reject) => {
      getRequest.onerror = () => reject(new Error(`Failed to retrieve item: ${getRequest.error?.message}`));
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.value : null);
      };
    });
  }

  public async removeItem(key: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const deleteRequest = store.delete(key);

    return new Promise((resolve, reject) => {
      deleteRequest.onerror = () => reject(new Error(`Failed to delete item: ${deleteRequest.error?.message}`));
      deleteRequest.onsuccess = () => resolve();
    });
  }
  
  public async clearAll(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const clearRequest = store.clear();

    return new Promise((resolve, reject) => {
      clearRequest.onerror = () => reject(new Error(`Failed to clear store: ${clearRequest.error?.message}`));
      clearRequest.onsuccess = () => resolve();
    });
  }
}
