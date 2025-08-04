// packages/common/core/libraries/database/firestore.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
  setDoc,
  Firestore,
} from 'firebase/firestore';

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
