import { DocumentData } from 'firebase/firestore';
import type { IDatabaseAdapter, DatabaseListenersCallbacks, DatabaseListenersState } from '../../adapters/database.adapter';

type DocumentId = string;

/**
 * Mock Database Adapter
 * 
 * This demonstrates how easy it is to swap database providers.
 * Simply implement the DatabaseAdapter interface and update the export in db.adapter.ts
 */
export const mockDb: IDatabaseAdapter = {
  getCollection: async <T extends DocumentData = DocumentData>(
    _collectionPath: string
  ): Promise<T[]> => {
    return [];
  },
  getDocument: async <T extends DocumentData = DocumentData>(
    _docPath: string
  ): Promise<T | null> => {
    return null;
  },
  addDocument: async <T extends DocumentData = DocumentData>(
    _collectionPath: string,
    _data: T
  ): Promise<DocumentId> => {
    return 'mock-id';
  },
  updateDocument: async <T extends DocumentData = DocumentData>(
    _docPath: string,
    _data: Partial<T>
  ): Promise<void> => {
    // Mock implementation
  },
  deleteDocument: async (_docPath: string): Promise<void> => {
    // Mock implementation
  },
  generateItemDatabaseId: (): string => {
    return 'mock-id';
  },
  startListeners: async (_userId: string, _callbacks: DatabaseListenersCallbacks): Promise<void> => {
    // Mock implementation
  },
  stopListeners: async (): Promise<void> => {
    // Mock implementation
  },
  getListenersState: async (): Promise<DatabaseListenersState> => ({
    isListening: false,
    error: null,
  }),
  isListening: async (): Promise<boolean> => false,
  getListenersError: async (): Promise<string | null> => null,
  clearListenersError: async (): Promise<void> => {
    // Mock implementation
  },
}; 