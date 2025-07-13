import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig, validateFirebaseConfig } from '@app/core/config/platform';

let app: any;
let auth: any;
let db: any;

export async function initFirebase() {
  // Only real Firebase initialization
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
  return { auth, db };
}

// Sign in to Firebase with a custom token (low-level)
export async function signInWithFirebaseToken(token: string): Promise<void> {
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
  if (!auth) {
    const f = await initFirebase();
    auth = f.auth;
  }
  console.log('[Firebase] Signing out from Firebase');
  await signOut(auth);
  console.log('[Firebase] signOutFromFirebase success');
} 