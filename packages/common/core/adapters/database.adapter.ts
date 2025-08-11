// packages/common/core/adapters/database.adapter.ts
import * as firebaseDb from '../libraries/database/firestore';
import { DocumentData } from 'firebase/firestore';
import { User } from '../types/auth.types';

type DocumentId = string;

export interface DatabaseListenersCallbacks {
  onUserUpdate?: (userData: User) => Promise<void>;
  onItemsUpdate?: (encryptedItems: any[]) => Promise<void>;
}

export interface DatabaseListenersState {
  isListening: boolean;
  error: string | null;
}

export interface IDatabaseAdapter {
  getCollection<T extends DocumentData = DocumentData>(collectionPath: string): Promise<T[]>;
  getDocument<T extends DocumentData = DocumentData>(docPath: string): Promise<T | null>;
  addDocument<T extends DocumentData = DocumentData>(collectionPath: string, data: T): Promise<DocumentId>;
  updateDocument<T extends DocumentData = DocumentData>(docPath: string, data: Partial<T>): Promise<void>;
  deleteDocument(docPath: string): Promise<void>;
  generateItemDatabaseId(): string;
  
  startListeners(userId: string, callbacks: DatabaseListenersCallbacks): Promise<void>;
  stopListeners(): Promise<void>;
  getListenersState(): Promise<DatabaseListenersState>;
  isListening(): Promise<boolean>;
  getListenersError(): Promise<string | null>;
  clearListenersError(): Promise<void>;
}

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., MongoDB, PostgreSQL, etc.)
export const db: IDatabaseAdapter = new Proxy({} as IDatabaseAdapter, {
  get(target, prop) {
    const propName = prop as string;
    
    // Map adapter methods to their respective library functions
    const methodMap: Record<string, any> = {
      getCollection: firebaseDb.getCollectionWrapper,
      getDocument: firebaseDb.getDocumentWrapper,
      addDocument: firebaseDb.addDocumentWrapper,
      updateDocument: firebaseDb.updateDocumentWrapper,
      deleteDocument: firebaseDb.deleteDocumentWrapper,
      generateItemDatabaseId: firebaseDb.generateItemDatabaseId,
      startListeners: firebaseDb.startListenersWrapper,
      stopListeners: firebaseDb.stopListenersWrapper,
      getListenersState: firebaseDb.getListenersStateWrapper,
      isListening: firebaseDb.isListeningWrapper,
      getListenersError: firebaseDb.getListenersErrorWrapper,
      clearListenersError: firebaseDb.clearListenersErrorWrapper,
    };

    const method = methodMap[propName];
    if (method) {
      // Special handling for synchronous methods
      if (propName === 'generateItemDatabaseId') {
        return (...args: any[]) => method(...args); // Return synchronously
      }
      // Async methods
      return async (...args: any[]) => method(...args);
    }
    
    throw new Error(`Method ${propName} not found in database adapter`);
  }
});
