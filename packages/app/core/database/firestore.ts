// Firestore CRUD functions using Firebase JS SDK
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
  setDoc
} from 'firebase/firestore';

// Firebase is already initialized in @firebase.ts and exports the 'db' instance
import { db } from '@app/core/auth/firebase';

/**
 * Get all documents from a collection
 */
export const getCollection = async <T extends DocumentData = DocumentData>(
  collectionPath: string
): Promise<T[]> => {
  const colRef = collection(db, collectionPath);
  const snapshot: QuerySnapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
};

/**
 * Get a specific document by path
 */
export const getDocument = async <T extends DocumentData = DocumentData>(
  docPath: string
): Promise<T | null> => {
  const docRef = doc(db, docPath);
  const snapshot: DocumentSnapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as T;
};

/**
 * Add a document to a collection (auto-generated ID)
 */
export const addDocument = async <T extends DocumentData = DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> => {
  const colRef = collection(db, collectionPath);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
};

/**
 * Update a document (merge: true for partial update)
 */
export const updateDocument = async <T extends DocumentData = DocumentData>(
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  const docRef: DocumentReference<DocumentData> = doc(db, docPath);
  await updateDoc(docRef as any, data as any);
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  docPath: string
): Promise<void> => {
  const docRef = doc(db, docPath);
  await deleteDoc(docRef);
};

/**
 * Add a document to a collection with a generated ID and include the ID in the data
 */
export const addDocumentWithId = async <T extends DocumentData = DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> => {
  const colRef = collection(db, collectionPath);
  const docRef = doc(colRef); // generates a new doc ref with an ID
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef.id;
};