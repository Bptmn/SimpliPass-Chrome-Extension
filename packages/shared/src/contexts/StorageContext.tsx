import React, { createContext, ReactNode } from 'react';
import type { StorageAdapter, DatabaseAdapter } from '../types';

interface StorageContextType {
  storage: StorageAdapter;
  database: DatabaseAdapter;
}

export const StorageContext = createContext<StorageContextType | null>(null);

interface StorageProviderProps {
  children: ReactNode;
  storage: StorageAdapter;
  database: DatabaseAdapter;
}

export function StorageProvider({ children, storage, database }: StorageProviderProps) {
  const value: StorageContextType = {
    storage,
    database,
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}