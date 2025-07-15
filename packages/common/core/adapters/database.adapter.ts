import * as firebaseDb from '../database/firestore';
import { DocumentData } from 'firebase/firestore';

type DocumentId = string;

export interface DatabaseAdapter {
  getCollection<T extends DocumentData = DocumentData>(collectionPath: string): Promise<T[]>;
  getDocument<T extends DocumentData = DocumentData>(docPath: string): Promise<T | null>;
  addDocument<T extends DocumentData = DocumentData>(collectionPath: string, data: T): Promise<DocumentId>;
  updateDocument<T extends DocumentData = DocumentData>(docPath: string, data: Partial<T>): Promise<void>;
  deleteDocument(docPath: string): Promise<void>;
  addDocumentWithId<T extends DocumentData = DocumentData>(collectionPath: string, data: T): Promise<DocumentId>;
}

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., MongoDB, PostgreSQL, etc.)
export const db: DatabaseAdapter = {
  getCollection: firebaseDb.getCollection,
  getDocument: firebaseDb.getDocument,
  addDocument: firebaseDb.addDocument,
  updateDocument: firebaseDb.updateDocument,
  deleteDocument: firebaseDb.deleteDocument,
  addDocumentWithId: firebaseDb.addDocumentWithId,
}; 