import { DocumentData } from 'firebase/firestore';
import type { DatabaseAdapter } from '../adapters/database.adapter';

type DocumentId = string;

/**
 * Mock Database Adapter
 * 
 * This demonstrates how easy it is to swap database providers.
 * Simply implement the DatabaseAdapter interface and update the export in db.adapter.ts
 */
export const mockDb: DatabaseAdapter = {
  getCollection: async <T extends DocumentData = DocumentData>(
    collectionPath: string
  ): Promise<T[]> => {
    console.log('[Mock DB] Getting collection:', collectionPath);
    // Mock implementation - returns empty array
    return [];
  },

  getDocument: async <T extends DocumentData = DocumentData>(
    docPath: string
  ): Promise<T | null> => {
    console.log('[Mock DB] Getting document:', docPath);
    // Mock implementation - returns null
    return null;
  },

  addDocument: async <T extends DocumentData = DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<DocumentId> => {
    console.log('[Mock DB] Adding document to:', collectionPath, data);
    // Mock implementation - returns mock ID
    return 'mock-doc-id';
  },

  updateDocument: async <T extends DocumentData = DocumentData>(
    docPath: string,
    data: Partial<T>
  ): Promise<void> => {
    console.log('[Mock DB] Updating document:', docPath, data);
    // Mock implementation - does nothing
  },

  deleteDocument: async (docPath: string): Promise<void> => {
    console.log('[Mock DB] Deleting document:', docPath);
    // Mock implementation - does nothing
  },

  addDocumentWithId: async <T extends DocumentData = DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<DocumentId> => {
    console.log('[Mock DB] Adding document with ID to:', collectionPath, data);
    // Mock implementation - returns mock ID
    return 'mock-doc-id';
  },
}; 