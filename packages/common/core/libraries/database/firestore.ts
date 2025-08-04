// packages/common/core/libraries/database/firestore.ts
import { 
  Firestore, 
  connectFirestoreEmulator, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  terminate,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
  updateDoc
} from 'firebase/firestore';
import { initFirebase } from '../auth/firebase';

export const getCollection = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  collectionPath: string
): Promise<T[]> => {
  const colRef = collection(firestore, collectionPath);
  const snapshot: QuerySnapshot = await getDocs(colRef);
  return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() } as unknown as T));
};

export const getDocument = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  docPath: string
): Promise<T | null> => {
  const docRef = doc(firestore, docPath);
  const snapshot: DocumentSnapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as T;
};

export const addDocument = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  collectionPath: string,
  data: T
): Promise<string> => {
  const colRef = collection(firestore, collectionPath);
  const docRef = doc(colRef); // generates a new doc ref with an ID
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef.id;
};

export const updateDocument = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  const docRef: DocumentReference<DocumentData> = doc(firestore, docPath);
  await updateDoc(docRef, data as DocumentData);
};

export const deleteDocument = async (
  firestore: Firestore,
  docPath: string
): Promise<void> => {
  const docRef = doc(firestore, docPath);
  await deleteDoc(docRef);
};

export function generateItemDatabaseId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let autoId = '';
  const bytes = new Uint8Array(20);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 20; ++i) {
      autoId += chars[bytes[i] & 0x3f];
    }
  } else {
    for (let i = 0; i < 20; ++i) {
      autoId += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return autoId;
}

let firestoreInstance: Firestore | null = null;

export const getFirestore = async (): Promise<Firestore> => {
  if (!firestoreInstance) {
    await initFirebase();
    // Access the firebaseDb directly from the auth module
    const { firebaseDb } = await import('../auth/firebase');
    if (!firebaseDb) {
      throw new Error('Failed to initialize Firestore');
    }
    firestoreInstance = firebaseDb;
  }
  return firestoreInstance!;
};

// Wrapper functions for adapter
export const getCollectionWrapper = async <T extends DocumentData = DocumentData>(
  collectionPath: string
): Promise<T[]> => {
  const firestore = await getFirestore();
  return getCollection<T>(firestore, collectionPath);
};

export const getDocumentWrapper = async <T extends DocumentData = DocumentData>(
  docPath: string
): Promise<T | null> => {
  const firestore = await getFirestore();
  return getDocument<T>(firestore, docPath);
};

export const addDocumentWrapper = async <T extends DocumentData = DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> => {
  const firestore = await getFirestore();
  return addDocument<T>(firestore, collectionPath, data);
};

export const updateDocumentWrapper = async <T extends DocumentData = DocumentData>(
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  const firestore = await getFirestore();
  return updateDocument<T>(firestore, docPath, data);
};

export const deleteDocumentWrapper = async (
  docPath: string
): Promise<void> => {
  const firestore = await getFirestore();
  return deleteDocument(firestore, docPath);
};
