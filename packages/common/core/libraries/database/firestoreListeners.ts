// packages/common/core/libraries/database/firestoreListeners.ts
import {
  collection,
  doc,
  onSnapshot,
  query,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import { User } from '../../types/auth.types';

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

export class FirestoreListenersService {
  private state: FirestoreListenersState = {
    isListening: false,
    userListener: null,
    itemsListener: null,
    error: null,
  };

  private callbacks: FirestoreListenersCallbacks = {};

  constructor(private firestore: Firestore) {}

  public setCallbacks(callbacks: FirestoreListenersCallbacks): void {
    this.callbacks = callbacks;
  }

  private startUserListener(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const userDocRef = doc(this.firestore, `users/${userId}`);
        this.state.userListener = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.data();
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
            this.state.error = error.message;
          }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private startItemsListener(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const itemsQuery = query(collection(this.firestore, `users/${userId}/my_items`));
        this.state.itemsListener = onSnapshot(
          itemsQuery,
          async (_snapshot) => {
            try {
              if (this.callbacks.onItemsUpdate) {
                await this.callbacks.onItemsUpdate();
              }
            } catch (error) {
              this.state.error = error instanceof Error ? error.message : 'Failed to process items';
            }
          },
          (error) => {
            this.state.error = error.message;
          }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async startListeners(userId: string): Promise<void> {
    try {
      await this.startUserListener(userId);
      await this.startItemsListener(userId);
      this.state.isListening = true;
      this.state.error = null;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to start listeners';
      throw error;
    }
  }

  public stopListeners(): void {
    if (this.state.userListener) {
      this.state.userListener();
      this.state.userListener = null;
    }
    if (this.state.itemsListener) {
      this.state.itemsListener();
      this.state.itemsListener = null;
    }
    this.state.isListening = false;
  }

  public getState(): FirestoreListenersState {
    return { ...this.state };
  }

  public isListening(): boolean {
    return this.state.isListening;
  }

  public getError(): string | null {
    return this.state.error;
  }

  public clearError(): void {
    this.state.error = null;
  }
}
