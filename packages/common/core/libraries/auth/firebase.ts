// packages/common/core/libraries/auth/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, User as FirebaseUser, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from '@common/config/platform';
import { AuthenticationError } from '@common/core/types/errors.types';

// Global Firebase instances
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

// Pure provider function: Initialize Firebase
export const initFirebase = async (): Promise<void> => {
  if (!firebaseApp || !firebaseAuth || !firebaseDb) {
    const firebaseConfig = await getFirebaseConfig();
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
  }
};

// Pure provider function: Initialize Firebase (alias for backward compatibility)
export const initialize = async (): Promise<void> => {
  await initFirebase();
};

// Pure provider function: Get Firebase Auth instance
export const getAuthInstance = async (): Promise<Auth | null> => {
  await initFirebase();
  return firebaseAuth;
};

// Pure provider function: Get Firebase Firestore instance
export const getFirestoreInstance = (): Firestore | null => {
  return firebaseDb;
};

// Pure provider function: Sign in with custom token
export const signInWithFirebaseToken = async (token: string): Promise<FirebaseUser> => {
  await initFirebase();
  if (!firebaseAuth) {
    throw new AuthenticationError('Firebase auth not initialized');
  }
  
  try {
    const userCredential = await signInWithCustomToken(firebaseAuth, token);
    return userCredential.user;
  } catch (error) {
    throw new AuthenticationError('Failed to sign in with Firebase token', error as Error);
  }
};

// Pure provider function: Sign out from Firebase
export const signOutFromFirebase = async (): Promise<void> => {
  await initFirebase();
  if (!firebaseAuth) {
    throw new AuthenticationError('Firebase auth not initialized');
  }
  
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    throw new AuthenticationError('Firebase sign out failed', error as Error);
  }
};

// Pure provider function: Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  await initFirebase();
  return firebaseAuth?.currentUser !== null;
};

// Pure provider function: Get current user
export const getCurrentUser = async (): Promise<FirebaseUser | null> => {
  await initFirebase();
  return firebaseAuth?.currentUser || null;
};

// Pure provider function: Get current user ID
export const getCurrentUserId = (): string | null => {
  return firebaseAuth?.currentUser?.uid || null;
};

// Pure provider function: Start auth state listeners
export const startAuthListeners = async (callback: (user: FirebaseUser | null) => Promise<void>): Promise<void> => {
  await initFirebase();
  if (!firebaseAuth) {
    throw new AuthenticationError('Firebase auth not initialized');
  }
  
  const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
    await callback(user);
  });
  
  // Store unsubscribe function for later use
  (startAuthListeners as any)._unsubscribe = unsubscribe;
};

// Pure provider function: Stop auth state listeners
export const stopAuthListeners = (): void => {
  if ((startAuthListeners as any)._unsubscribe) {
    (startAuthListeners as any)._unsubscribe();
    (startAuthListeners as any)._unsubscribe = null;
  }
};

// Export Firebase instances for other libraries
export { firebaseAuth as auth, firebaseDb as firestore };
