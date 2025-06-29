/**
 * services/firebase.ts
 * Low-level Firebase service functions for authentication and user management.
 * No business logic, just direct API calls.
 */
import { config } from '../../config/config';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, User, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = getApps().length ? getApps()[0] : initializeApp(config.firebase);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Get the current user from Firebase Auth (low-level)
export function getCurrentUser(): User | null {
  console.log('[Firebase] Getting current user');
  const user = auth.currentUser;
  console.log('[Firebase] getCurrentUser success:', user ? 'User found' : 'No user');
  return user;
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