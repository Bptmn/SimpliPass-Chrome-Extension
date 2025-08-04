// packages/common/core/adapters/database.adapter.ts
import * as firebaseDb from '../libraries/database/firestore';
import { FirestoreListenersService } from '../libraries/database/firestoreListeners';
import { DocumentData, Firestore } from 'firebase/firestore';
import { User } from '../types/auth.types';
import { initFirebase } from '../libraries/auth/firebase';

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
  stopListeners(): void;
  getListenersState(): DatabaseListenersState;
  isListening(): boolean;
  getListenersError(): string | null;
  clearListenersError(): void;
}

class DatabaseAdapter implements IDatabaseAdapter {
  private firestore: Firestore | null = null;
  private listeners: FirestoreListenersService | null = null;

  constructor() {
    // Initialize Firebase asynchronously
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      const { db } = await initFirebase();
      this.firestore = db;
      this.listeners = new FirestoreListenersService(this.firestore);
    } catch (error) {
      console.error('[DatabaseAdapter] Failed to initialize Firebase:', error);
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.firestore || !this.listeners) {
      await this.initFirebase();
    }
  }

  public async getCollection<T extends DocumentData = DocumentData>(collectionPath: string): Promise<T[]> {
    await this.ensureInitialized();
    return firebaseDb.getCollection<T>(this.firestore!, collectionPath);
  }

  public async getDocument<T extends DocumentData = DocumentData>(docPath: string): Promise<T | null> {
    await this.ensureInitialized();
    return firebaseDb.getDocument<T>(this.firestore!, docPath);
  }

  public async addDocument<T extends DocumentData = DocumentData>(collectionPath: string, data: T): Promise<DocumentId> {
    await this.ensureInitialized();
    return firebaseDb.addDocument<T>(this.firestore!, collectionPath, data);
  }

  public async updateDocument<T extends DocumentData = DocumentData>(docPath: string, data: Partial<T>): Promise<void> {
    await this.ensureInitialized();
    return firebaseDb.updateDocument<T>(this.firestore!, docPath, data);
  }

  public async deleteDocument(docPath: string): Promise<void> {
    await this.ensureInitialized();
    return firebaseDb.deleteDocument(this.firestore!, docPath);
  }

  public generateItemDatabaseId(): string {
    return firebaseDb.generateItemDatabaseId();
  }

  public async startListeners(userId: string, callbacks: DatabaseListenersCallbacks): Promise<void> {
    await this.ensureInitialized();
    this.listeners!.setCallbacks(callbacks);
    return this.listeners!.startListeners(userId);
  }

  public stopListeners(): void {
    this.listeners?.stopListeners();
  }

  public getListenersState(): DatabaseListenersState {
    return this.listeners?.getState() || { isListening: false, error: null };
  }

  public isListening(): boolean {
    return this.listeners?.isListening() || false;
  }

  public getListenersError(): string | null {
    return this.listeners?.getError() || null;
  }

  public clearListenersError(): void {
    this.listeners?.clearError();
  }
}

export const db: IDatabaseAdapter = new DatabaseAdapter();
