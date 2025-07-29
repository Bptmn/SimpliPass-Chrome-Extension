import * as firebaseDb from '../libraries/database/firestore';
import { DocumentData } from 'firebase/firestore';
import { User } from '../types/auth.types';

type DocumentId = string;

export interface DatabaseListenersCallbacks {
  onUserUpdate?: (userData: User) => Promise<void>;
  onItemsUpdate?: () => Promise<void>;
}

export interface DatabaseListenersState {
  isListening: boolean;
  error: string | null;
}

export interface DatabaseAdapter {
  getCollection<T extends DocumentData = DocumentData>(collectionPath: string): Promise<T[]>;
  getDocument<T extends DocumentData = DocumentData>(docPath: string): Promise<T | null>;
  addDocument<T extends DocumentData = DocumentData>(collectionPath: string, data: T): Promise<DocumentId>;
  updateDocument<T extends DocumentData = DocumentData>(docPath: string, data: Partial<T>): Promise<void>;
  deleteDocument(docPath: string): Promise<void>;
  generateItemDatabaseId(): string;
  
  // Listeners functionality
  startListeners(userId: string, callbacks: DatabaseListenersCallbacks): Promise<void>;
  stopListeners(): void;
  getListenersState(): DatabaseListenersState;
  isListening(): boolean;
  getListenersError(): string | null;
  clearListenersError(): void;
}

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., MongoDB, PostgreSQL, etc.)
export const db: DatabaseAdapter = {
  getCollection: firebaseDb.getCollection,
  getDocument: firebaseDb.getDocument,
  addDocument: firebaseDb.addDocument,
  updateDocument: firebaseDb.updateDocument,
  deleteDocument: firebaseDb.deleteDocument,
  generateItemDatabaseId: firebaseDb.generateItemDatabaseId,
  
  // Listeners functionality
  startListeners: async (userId: string, callbacks: DatabaseListenersCallbacks) => {
    firebaseDb.firestoreListeners.setCallbacks(callbacks);
    await firebaseDb.firestoreListeners.startListeners(userId);
  },
  stopListeners: () => firebaseDb.firestoreListeners.stopListeners(),
  getListenersState: () => firebaseDb.firestoreListeners.getState(),
  isListening: () => firebaseDb.firestoreListeners.isListening(),
  getListenersError: () => firebaseDb.firestoreListeners.getError(),
  clearListenersError: () => firebaseDb.firestoreListeners.clearError(),
}; 