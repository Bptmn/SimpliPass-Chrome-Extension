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
    getAuth(): Auth | null;
    getFirestore(): Firestore | null;
}

// Global Firebase instances
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

export const initFirebase = async () => {
  if (!firebaseApp || !firebaseAuth || !firebaseDb) {
    const firebaseConfig = await getFirebaseConfig();
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
  }
  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
};

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
                throw error;
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
            const { fetchAuthSession } = await import('aws-amplify/auth');
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();
            if (!idToken) throw new Error('No idToken found in Cognito session');

            const parts = idToken.split('.');
            if (parts.length !== 3) throw new Error('Invalid JWT structure');
            
            const payload = JSON.parse(atob(parts[1]));
            
            let firebaseToken = payload.firebaseToken || payload['custom:firebaseToken'] || payload.firebase_token;
            
            if (!firebaseToken && session.tokens?.accessToken) {
                firebaseToken = session.tokens.accessToken.toString();
            }
            
            if (!firebaseToken) {
                console.error('[Firebase] No firebaseToken found in payload. Available keys:', Object.keys(payload));
                console.error('[Firebase] Available tokens:', Object.keys(session.tokens || {}));
                throw new Error('No firebaseToken found in idToken payload or session tokens');
            }

            const result = await signInWithCustomToken(this.auth!, firebaseToken);
            return result.user;
        } catch (error) {
            console.error('[Firebase] Sign in failed:', error);
            throw new AuthenticationError('Firebase authentication failed', error as Error);
        }
    }

    public async signOutFromFirebase(): Promise<void> {
        try {
            await signOut(this.auth!);
        } catch (error) {
            console.error('[Firebase] Sign out failed:', error);
            throw new AuthenticationError('Firebase sign out failed', error as Error);
        }
    }

    public getCurrentUserId(): string | null {
        return this.auth?.currentUser?.uid || null;
    }
}
