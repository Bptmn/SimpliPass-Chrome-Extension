export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface DatabaseAdapter {
  openDB(name: string, version: number): Promise<any>;
  putItem(db: any, storeName: string, key: string, value: any): Promise<void>;
  getItem(db: any, storeName: string, key: string): Promise<any>;
  getAllItems(db: any, storeName: string): Promise<any[]>;
  deleteItem(db: any, storeName: string, key: string): Promise<void>;
  clearStore(db: any, storeName: string): Promise<void>;
}