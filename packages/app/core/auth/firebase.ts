import { firebaseConfig } from '@extension/config/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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

// Sign in to Firebase with a custom token (low-level)
export async function signInWithFirebaseToken(token: string): Promise<void> {
    console.log('[Firebase] Signing in with Firebase token');
    await signInWithCustomToken(auth, token);
    console.log('[Firebase] signInWithFirebaseToken success');
  }

// Sign out from Firebase (low-level)
export async function signOutFromFirebase(): Promise<void> {
  console.log('[Firebase] Signing out from Firebase');
  await signOut(auth);
  console.log('[Firebase] signOutFromFirebase success');
}
  