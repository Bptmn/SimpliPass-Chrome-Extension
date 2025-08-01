// Firestore CRUD functions using Firebase JS SDK
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
  onSnapshot,
  query,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '@common/core/libraries/auth/firebase';
import { User } from '../../types/auth.types';

const getSafeFirestore = () => {
  if (!firestore) throw new Error('Firestore is not initialized');
  return firestore;
};

/**
 * Get all documents from a collection
 */
export const getCollection = async <T extends DocumentData = DocumentData>(
  collectionPath: string
): Promise<T[]> => {
  const colRef = collection(getSafeFirestore(), collectionPath);
  const snapshot: QuerySnapshot = await getDocs(colRef);
  return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() } as unknown as T));
};

/**
 * Get a specific document by path
 */
export const getDocument = async <T extends DocumentData = DocumentData>(
  docPath: string
): Promise<T | null> => {
  const docRef = doc(getSafeFirestore(), docPath);
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
  const colRef = collection(getSafeFirestore(), collectionPath);
  const docRef = doc(colRef); // generates a new doc ref with an ID
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef.id;
};

/**
 * Update a document (merge: true for partial update)
 */
export const updateDocument = async <T extends DocumentData = DocumentData>(
  docPath: string,
  data: Partial<T>
): Promise<void> => {
  const docRef: DocumentReference<DocumentData> = doc(getSafeFirestore(), docPath);
  await updateDoc(docRef, data as DocumentData);
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  docPath: string
): Promise<void> => {
  const docRef = doc(getSafeFirestore(), docPath);
  await deleteDoc(docRef);
};

export function generateItemDatabaseId(): string {
  // Firestore-compatible: 20 chars, base64url alphabet
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let autoId = '';
  const bytes = new Uint8Array(20);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 20; ++i) {
      autoId += chars[bytes[i] & 0x3f];
    }
  } else {
    // Fallback: Math.random (not cryptographically secure)
    for (let i = 0; i < 20; ++i) {
      autoId += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return autoId;
}

// ===== Firestore Listeners =====

export interface FirestoreListenersState {
  isListening: boolean;
  userListener: Unsubscribe | null;
  itemsListener: Unsubscribe | null;
  error: string | null;
}

export interface FirestoreListenersCallbacks {
  onUserUpdate?: (userData: User) => Promise<void>;
  onItemsUpdate?: () => Promise<void>;
}

class FirestoreListenersService {
  private state: FirestoreListenersState = {
    isListening: false,
    userListener: null,
    itemsListener: null,
    error: null,
  };

  private callbacks: FirestoreListenersCallbacks = {};

  /**
   * Set callbacks for listener events
   */
  setCallbacks(callbacks: FirestoreListenersCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Start listening to user collection changes
   */
  private startUserListener(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const userDocRef = doc(getSafeFirestore(), `users/${userId}`);
        
        this.state.userListener = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.data();
              console.log('[FirestoreListeners] User data updated:', userData);
              
              // Call the callback if provided
              if (this.callbacks.onUserUpdate) {
                const user: User = {
                  id: snapshot.id,
                  email: userData.email || '',
                  username: userData.username || '',
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  updatedAt: userData.updatedAt?.toDate() || new Date(),
                };
                await this.callbacks.onUserUpdate(user);
              }
            }
          },
          (error) => {
            console.error('[FirestoreListeners] User listener error:', error);
            this.state.error = error.message;
          }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start listening to items collection changes
   */
  private startItemsListener(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Query the user's items subcollection
        const itemsQuery = query(
          collection(getSafeFirestore(), `users/${userId}/my_items`)
        );
        
        this.state.itemsListener = onSnapshot(
          itemsQuery,
          async (_snapshot) => {
            try {
              console.log('[FirestoreListeners] Items collection changed');
              
              // Call the callback if provided
              if (this.callbacks.onItemsUpdate) {
                await this.callbacks.onItemsUpdate();
              }
            } catch (error) {
              console.error('[FirestoreListeners] Error processing items update:', error);
              this.state.error = error instanceof Error ? error.message : 'Failed to process items';
            }
          },
          (error) => {
            console.error('[FirestoreListeners] Items listener error:', error);
            this.state.error = error.message;
          }
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start all listeners
   */
  async startListeners(userId: string): Promise<void> {
    try {
  
      
      // Start user listener
      await this.startUserListener(userId);
      
      // Start items listener
      await this.startItemsListener(userId);
      
      this.state.isListening = true;
      this.state.error = null;
      
      
    } catch (error) {
      console.error('[FirestoreListeners] Failed to start listeners:', error);
      this.state.error = error instanceof Error ? error.message : 'Failed to start listeners';
      throw error;
    }
  }

  /**
   * Stop all listeners
   */
  stopListeners(): void {
    console.log('[FirestoreListeners] Stopping listeners...');
    
    if (this.state.userListener) {
      this.state.userListener();
      this.state.userListener = null;
    }
    
    if (this.state.itemsListener) {
      this.state.itemsListener();
      this.state.itemsListener = null;
    }
    
    this.state.isListening = false;
    console.log('[FirestoreListeners] All listeners stopped');
  }

  /**
   * Get current listener state
   */
  getState(): FirestoreListenersState {
    return { ...this.state };
  }

  /**
   * Check if listeners are active
   */
  isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Get current error
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.error = null;
  }
}

// Export singleton instance
export const firestoreListeners = new FirestoreListenersService();