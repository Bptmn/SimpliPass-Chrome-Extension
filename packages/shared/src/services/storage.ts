import type { StorageAdapter, DatabaseAdapter } from '../types';

export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract getItem(key: string): Promise<string | null>;
  abstract setItem(key: string, value: string): Promise<void>;
  abstract removeItem(key: string): Promise<void>;
  abstract clear(): Promise<void>;
}

export abstract class BaseDatabaseAdapter implements DatabaseAdapter {
  abstract openDB(name: string, version: number): Promise<any>;
  abstract putItem(db: any, storeName: string, key: string, value: any): Promise<void>;
  abstract getItem(db: any, storeName: string, key: string): Promise<any>;
  abstract getAllItems(db: any, storeName: string): Promise<any[]>;
  abstract deleteItem(db: any, storeName: string, key: string): Promise<void>;
  abstract clearStore(db: any, storeName: string): Promise<void>;
}