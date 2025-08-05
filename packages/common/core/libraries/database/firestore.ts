// packages/common/core/libraries/database/firestore.ts
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../auth/firebase';

// ✅ Provider-agnostic timestamp conversion
const convertFirestoreTimestamps = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      // Convert Firestore Timestamp to standard Date
      converted[key] = value.toDate();
    } else if (Array.isArray(value)) {
      // Handle arrays recursively
      converted[key] = value.map(item => convertFirestoreTimestamps(item));
    } else if (value && typeof value === 'object') {
      // Handle nested objects recursively
      converted[key] = convertFirestoreTimestamps(value);
    } else {
      // Keep other values as-is
      converted[key] = value;
    }
  }
  
  return converted;
};

// Pure provider function: Get collection
export const getCollection = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  collectionPath: string
): Promise<T[]> => {
  const colRef = collection(firestore, collectionPath);
  const snapshot: QuerySnapshot = await getDocs(colRef);
  return snapshot.docs.map(docSnapshot => {
    const data = { id: docSnapshot.id, ...docSnapshot.data() };
    // ✅ Convert timestamps to standard dates
    return convertFirestoreTimestamps(data) as unknown as T;
  });
};

// Pure provider function: Get document
export const getDocument = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  docPath: string
): Promise<T | null> => {
  const docRef = doc(firestore, docPath);
  const snapshot: DocumentSnapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = { id: snapshot.id, ...snapshot.data() };
  // ✅ Convert timestamps to standard dates
  return convertFirestoreTimestamps(data) as unknown as T;
};

// Pure provider function: Add document
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

// Pure provider function: Update document
export const updateDocument = async <T extends DocumentData = DocumentData>(
  firestore: Firestore,
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  const docRef: DocumentReference<DocumentData> = doc(firestore, docPath);
  await updateDoc(docRef, data as DocumentData);
};

// Pure provider function: Delete document
export const deleteDocument = async (
  firestore: Firestore,
  docPath: string
): Promise<void> => {
  const docRef = doc(firestore, docPath);
  await deleteDoc(docRef);
};

// Pure provider function: Generate database ID
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

// Pure provider function: Listen to document changes
export const listenToDocument = (
  firestore: Firestore,
  docPath: string,
  callback: (data: any) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const docRef = doc(firestore, docPath);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        // ✅ Convert timestamps to standard dates
        callback(convertFirestoreTimestamps(data));
      } else {
        callback(null);
      }
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

// Pure provider function: Listen to collection changes
export const listenToCollection = (
  firestore: Firestore,
  collectionPath: string,
  callback: (data: any[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const colRef = collection(firestore, collectionPath);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      // ✅ Convert timestamps to standard dates
      callback(convertFirestoreTimestamps(data));
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};
// Wrapper functions for adapter compatibility (pure provider functions)
export const getCollectionWrapper = async <T extends DocumentData = DocumentData>(
  collectionPath: string
): Promise<T[]> => {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return getCollection<T>(firestore, collectionPath);
};

export const getDocumentWrapper = async <T extends DocumentData = DocumentData>(
  docPath: string
): Promise<T | null> => {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return getDocument<T>(firestore, docPath);
};

export const addDocumentWrapper = async <T extends DocumentData = DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> => {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return addDocument<T>(firestore, collectionPath, data);
};

export const updateDocumentWrapper = async <T extends DocumentData = DocumentData>(
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return updateDocument<T>(firestore, docPath, data);
};

export const deleteDocumentWrapper = async (
  docPath: string
): Promise<void> => {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return deleteDocument(firestore, docPath);
};

// Listener management (business logic in library)
let userListener: Unsubscribe | null = null;
let itemsListener: Unsubscribe | null = null;
const listenersState: { isListening: boolean; error: string | null } = {
  isListening: false,
  error: null
};

export const startListenersWrapper = async (userId: string, callbacks: { onUserUpdate?: (userData: any) => Promise<void>; onItemsUpdate?: (encryptedItems: any[]) => Promise<void> }): Promise<void> => {
  try {
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    // Start user listener
    userListener = listenToDocument(
      firestore,
      `users/${userId}`,
      async (userData) => {
        if (userData && callbacks.onUserUpdate) {
          const user = {
            id: userData.id,
            email: userData.email || '',
            username: userData.username || '',
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
          };
          await callbacks.onUserUpdate(user);
        }
      },
      (error) => {
        listenersState.error = error.message;
      }
    );

    // Start items listener
    itemsListener = listenToCollection(
      firestore,
      `users/${userId}/my_items`,
      async (encryptedItems) => {
        if (callbacks.onItemsUpdate) {
          await callbacks.onItemsUpdate(encryptedItems);
        }
      },
      (error) => {
        listenersState.error = error.message;
      }
    );

    listenersState.isListening = true;
    listenersState.error = null;
  } catch (error) {
    listenersState.error = error instanceof Error ? error.message : 'Failed to start listeners';
    throw error;
  }
};

export const stopListenersWrapper = async (): Promise<void> => {
  if (userListener) {
    userListener();
    userListener = null;
  }
  if (itemsListener) {
    itemsListener();
    itemsListener = null;
  }
  listenersState.isListening = false;
};

export const getListenersStateWrapper = async (): Promise<{ isListening: boolean; error: string | null }> => {
  return { ...listenersState };
};

export const isListeningWrapper = async (): Promise<boolean> => {
  return listenersState.isListening;
};

export const getListenersErrorWrapper = async (): Promise<string | null> => {
  return listenersState.error;
};

export const clearListenersErrorWrapper = async (): Promise<void> => {
  listenersState.error = null;
};

