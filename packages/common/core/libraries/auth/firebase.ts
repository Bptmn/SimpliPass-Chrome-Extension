// packages/common/core/libraries/auth/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, User as FirebaseUser, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from '@common/config/platform';
import { AuthenticationError } from '@common/core/types/errors.types';

export interface IAuthService {
    signInWithFirebaseToken(): Promise<FirebaseUser>;
    signOutFromFirebase(): Promise<void>;
    getCurrentUserId(): string | null;
    getAuth(): Promise<Auth | null>;
    getFirestore(): Firestore | null;
}

export class AuthService implements IAuthService {
    private app: FirebaseApp | null = null;
    private auth: Auth | null = null;
    private firestore: Firestore | null = null;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.initFirebase();
    }

    private async initFirebase() {
        if (!this.app || !this.auth || !this.firestore) {
            try {
                const firebaseConfig = await getFirebaseConfig();
                this.app = initializeApp(firebaseConfig);
                this.auth = getAuth(this.app);
                this.firestore = getFirestore(this.app);
                console.log('[AuthService] Firebase initialized successfully');
            } catch (error) {
                console.error('[AuthService] Failed to initialize Firebase:', error);
                throw new AuthenticationError('Failed to initialize Firebase', error as Error);
            }
        }
    }

    public async getAuth(): Promise<Auth | null> {
        if (this.initPromise) {
            await this.initPromise;
        }
        return this.auth;
    }

    public getFirestore(): Firestore | null {
        return this.firestore;
    }

    public async signInWithFirebaseToken(): Promise<FirebaseUser> {
        try {
            const auth = await this.getAuth();
            if (!auth) {
                throw new AuthenticationError('Auth not initialized');
            }

            // For now, we'll use a mock token for testing
            // In production, this would be a real Firebase custom token
            const mockToken = 'mock-firebase-token-for-testing';
            
            const userCredential = await signInWithCustomToken(auth, mockToken);
            return userCredential.user;
        } catch (error) {
            console.error('[AuthService] Failed to sign in with Firebase token:', error);
            throw new AuthenticationError('Failed to sign in with Firebase token', error as Error);
        }
    }

    public async signOutFromFirebase(): Promise<void> {
        try {
            const auth = await this.getAuth();
            if (!auth) {
                throw new AuthenticationError('Auth not initialized');
            }
            
            await signOut(auth);
            console.log('[AuthService] User signed out successfully');
        } catch (error) {
            console.error('[AuthService] Failed to sign out:', error);
            throw new AuthenticationError('Failed to sign out', error as Error);
        }
    }

    public getCurrentUserId(): string | null {
        return this.auth?.currentUser?.uid || null;
    }
}

// Global Firebase instances
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

export { firebaseDb };

export const initFirebase = async () => {
  if (!firebaseApp || !firebaseAuth || !firebaseDb) {
    const firebaseConfig = await getFirebaseConfig();
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
  }
};

export const initialize = async (): Promise<void> => {
  await initFirebase();
};

export const login = async (email: string, password: string): Promise<string> => {
  await initFirebase();
  // Mock implementation for now
  return 'mock-user-id';
};

export const isAuthenticated = async (): Promise<boolean> => {
  await initFirebase();
  return firebaseAuth?.currentUser !== null;
};

export const signOutUser = async (): Promise<void> => {
  await initFirebase();
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
};

export const fetchUserSalt = async (): Promise<string> => {
  await initFirebase();
  // Mock implementation for now
  return 'mock-salt';
};

export const getAuthInstance = async (): Promise<Auth | null> => {
  await initFirebase();
  return firebaseAuth;
};

export const getCurrentUser = async (): Promise<FirebaseUser | null> => {
  await initFirebase();
  return firebaseAuth?.currentUser || null;
};

export const onAuthStateChanged = async (callback: (user: FirebaseUser | null) => void): Promise<() => void> => {
  await initFirebase();
  if (!firebaseAuth) {
    throw new Error('Auth not initialized');
  }
  return firebaseAuth.onAuthStateChanged(callback);
};
