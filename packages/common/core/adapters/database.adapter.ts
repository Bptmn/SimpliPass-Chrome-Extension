// packages/common/core/adapters/database.adapter.ts
import * as firebaseDb from '../libraries/database/firestore';
import { getCollection, getDocument, addDocument, updateDocument, deleteDocument, generateItemDatabaseId } from '../libraries/database/firestore';
import { FirestoreListenersService } from '../libraries/database/firestoreListeners';
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

// Helper function to get listeners service
const getListenersService = async (): Promise<FirestoreListenersService> => {
  const firestore = await firebaseDb.getFirestore();
  return new FirestoreListenersService(firestore);
};

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., MongoDB, PostgreSQL, etc.)
export const db: IDatabaseAdapter = {
  getCollection: async <T extends DocumentData = DocumentData>(
    collectionPath: string
  ): Promise<T[]> => {
    const firestore = await firebaseDb.getFirestore();
    return getCollection<T>(firestore, collectionPath);
  },
  getDocument: async <T extends DocumentData = DocumentData>(
    docPath: string
  ): Promise<T | null> => {
    const firestore = await firebaseDb.getFirestore();
    return getDocument<T>(firestore, docPath);
  },
  addDocument: async <T extends DocumentData = DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<DocumentId> => {
    const firestore = await firebaseDb.getFirestore();
    return addDocument<T>(firestore, collectionPath, data);
  },
  updateDocument: async <T extends DocumentData = DocumentData>(
    docPath: string,
    data: Partial<T>
  ): Promise<void> => {
    const firestore = await firebaseDb.getFirestore();
    return updateDocument<T>(firestore, docPath, data);
  },
  deleteDocument: async (docPath: string): Promise<void> => {
    const firestore = await firebaseDb.getFirestore();
    return deleteDocument(firestore, docPath);
  },
  generateItemDatabaseId: firebaseDb.generateItemDatabaseId,
  
  // Listeners functionality
  startListeners: async (userId: string, callbacks: DatabaseListenersCallbacks) => {
    const listeners = await getListenersService();
    listeners.setCallbacks(callbacks);
    await listeners.startListeners(userId);
  },
  stopListeners: async () => {
    const listeners = await getListenersService();
    listeners.stopListeners();
  },
  getListenersState: async () => {
    const listeners = await getListenersService();
    return listeners.getState();
  },
  isListening: async () => {
    const listeners = await getListenersService();
    return listeners.isListening();
  },
  getListenersError: async () => {
    const listeners = await getListenersService();
    return listeners.getError();
  },
  clearListenersError: async () => {
    const listeners = await getListenersService();
    listeners.clearError();
  },
};
