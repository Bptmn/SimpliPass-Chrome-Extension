/**
 * Firebase Auth - Re-export from libraries
 * 
 * This file re-exports the Firebase authentication functions from the libraries directory
 * to maintain compatibility with existing imports.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from '@common/config/platform';
import { AuthenticationError } from '@common/core/types/errors.types';

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let firestore: ReturnType<typeof getFirestore> | null = null;

(async () => {
  const firebaseConfig = await getFirebaseConfig();
  console.log('[Firebase.ts] Final Firebase config:', firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
})();

export async function signInWithFirebaseToken(): Promise<FirebaseUser> {
  try {
    // Use Amplify v6+ fetchAuthSession to get the idToken
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (!idToken) throw new Error('No idToken found in Cognito session');

    // Extract the firebaseToken from the idToken payload
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT structure');
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Try different approaches to get the Firebase token
    let firebaseToken = payload.firebaseToken;
    
    // Fallback 1: Try different custom claim names
    if (!firebaseToken) {
      firebaseToken = payload['custom:firebaseToken'] || payload.firebase_token || payload.firebaseToken;
    }
    
    // Fallback 2: Try using access token as Firebase token
    if (!firebaseToken && session.tokens?.accessToken) {
      firebaseToken = session.tokens.accessToken.toString();
    }
    
    if (!firebaseToken) {
      console.error('[Firebase] No firebaseToken found in payload. Available keys:', Object.keys(payload));
      console.error('[Firebase] Available tokens:', Object.keys(session.tokens || {}));
      throw new Error('No firebaseToken found in idToken payload or session tokens');
    }

    // Sign in to Firebase with the extracted firebaseToken
    const result = await signInWithCustomToken(auth!, firebaseToken);
    console.log('[Firebase] Sign in successful');
    return result.user;
  } catch (error) {
    console.error('[Firebase] Sign in failed:', error);
    throw new AuthenticationError('Firebase authentication failed', error as Error);
  }
}

export async function signOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth!);
    console.log('[Firebase] Sign out successful');
  } catch (error) {
    console.error('[Firebase] Sign out failed:', error);
    throw new AuthenticationError('Firebase sign out failed', error as Error);
  }
}

// get current userID from firebase auth
export function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid || null;
}

export { auth, firestore };

// Initialize Firebase and return auth and db instances
export async function initFirebase() {
  if (!app || !auth || !firestore) {
    const firebaseConfig = await getFirebaseConfig();
    console.log('[Firebase.ts] Initializing Firebase with config:', firebaseConfig);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
  return { auth, db: firestore };
} 
  