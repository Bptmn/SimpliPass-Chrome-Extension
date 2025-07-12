import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig, validateFirebaseConfig } from '../config/platform';

// Check if we're in a Storybook environment or have Firebase mocks
const isStorybook = typeof window !== 'undefined' && window.location.hostname === 'localhost' && (window.location.port === '6006' || window.location.port === '6007' || window.location.port === '6008');
const hasFirebaseMocks = typeof window !== 'undefined' && (window as any).__FIREBASE_MOCKS__;

let app: any;
let auth: any;
let db: any;

export async function initFirebase() {
  if (isStorybook || hasFirebaseMocks) {
    // Mock Firebase for Storybook
    console.log('[Firebase] Running in Storybook - using mock Firebase');
    app = null;
    if (hasFirebaseMocks) {
      // Use global mocks if available
      auth = (window as any).__FIREBASE_MOCKS__.auth;
      db = (window as any).__FIREBASE_MOCKS__.db;
    } else {
      // Fallback mocks
      auth = {
        currentUser: null,
        onAuthStateChanged: (callback: any) => {
          callback(null);
          return () => {};
        },
        signInWithCustomToken: async () => Promise.resolve(),
        signOut: async () => Promise.resolve(),
      };
      db = {
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            set: async () => Promise.resolve(),
            update: async () => Promise.resolve(),
            delete: async () => Promise.resolve(),
          }),
          add: async () => Promise.resolve({ id: 'mock-id' }),
          where: () => ({
            get: async () => ({ docs: [] }),
          }),
        }),
      };
    }
  } else {
    // Real Firebase initialization
    const firebaseConfig = await getFirebaseConfig();
    validateFirebaseConfig();
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Set persistence to local (so user stays logged in across popup closes)
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('[Firebase] Auth persistence set to local');
        })
        .catch((error) => {
          console.error('[Firebase] Failed to set auth persistence:', error);
        });
    }
  }
  return { auth, db };
}

// Sign in to Firebase with a custom token (low-level)
export async function signInWithFirebaseToken(token: string): Promise<void> {
  if (isStorybook || hasFirebaseMocks) {
    console.log('[Firebase] Mock sign in with Firebase token');
    return Promise.resolve();
  }
  if (!auth) {
    const f = await initFirebase();
    auth = f.auth;
  }
  console.log('[Firebase] Signing in with Firebase token');
  
  try {
    await signInWithCustomToken(auth, token);
    
    console.log('[Firebase] signInWithFirebaseToken success');
  } catch (error) {
    console.error('[Firebase] Error signing in with custom token:', error);
    throw error;
  }
}

// Sign out from Firebase (low-level)
export async function signOutFromFirebase(): Promise<void> {
  if (isStorybook || hasFirebaseMocks) {
    console.log('[Firebase] Mock sign out from Firebase');
    return Promise.resolve();
  }
  if (!auth) {
    const f = await initFirebase();
    auth = f.auth;
  }
  console.log('[Firebase] Signing out from Firebase');
  await signOut(auth);
  console.log('[Firebase] signOutFromFirebase success');
}
  