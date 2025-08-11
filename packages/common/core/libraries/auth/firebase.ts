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
let authListenerUnsubscribe: (() => void) | null = null;

// ✅ NEW: Check if Firebase is actually initialized
export const isFirebaseInitialized = (): boolean => {
  return firebaseApp !== null && firebaseAuth !== null && firebaseDb !== null;
};

// ✅ NEW: Check if auth listeners are actually active
export const areAuthListenersActive = (): boolean => {
  return authListenerUnsubscribe !== null;
};

// Pure provider function: Initialize Firebase
export const initFirebase = async (platform: 'extension' | 'mobile'): Promise<void> => {
  // ✅ NATIVE CHECK: Use actual Firebase state
  if (isFirebaseInitialized()) {
    console.log('[Firebase] Already initialized, skipping');
    return;
  }

  console.log('[Firebase] Initializing Firebase...');
  const firebaseConfig = await getFirebaseConfig(platform);
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
  console.log('[Firebase] Initialization complete');
};

// Pure provider function: Initialize Firebase
export const initialize = async (platform: 'extension' | 'mobile'): Promise<void> => {
  await initFirebase(platform);
};

// Pure provider function: Get Firebase Auth instance
export const getAuthInstance = async (platform: 'extension' | 'mobile' = 'extension'): Promise<Auth | null> => {
  await initFirebase(platform);
  return firebaseAuth;
};

// Pure provider function: Get Firebase Firestore instance
export const getFirestoreInstance = (): Firestore | null => {
  return firebaseDb;
};

// Pure provider function: Sign in with custom token
export const signInWithFirebaseToken = async (token: string, platform: 'extension' | 'mobile' = 'extension'): Promise<FirebaseUser> => {
  await initFirebase(platform);
  if (!firebaseAuth) {
    throw new AuthenticationError('Firebase auth not initialized');
  }
  
  try {
    console.log('[Firebase] Attempting to sign in with custom token...');
    console.log('[Firebase] Token length:', token.length);
    console.log('[Firebase] Token starts with:', token.substring(0, 20) + '...');
    
    const userCredential = await signInWithCustomToken(firebaseAuth, token);
    console.log('[Firebase] Sign in successful, user ID:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('[Firebase] Sign in with custom token failed:', error);
    console.error('[Firebase] Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    throw new AuthenticationError('Failed to sign in with Firebase token', error as Error);
  }
};

// Pure provider function: Sign out from Firebase
export const signOutFromFirebase = async (platform: 'extension' | 'mobile' = 'extension'): Promise<void> => {
  await initFirebase(platform);
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
export const isAuthenticated = async (platform: 'extension' | 'mobile' = 'extension'): Promise<boolean> => {
  await initFirebase(platform);
  return firebaseAuth?.currentUser !== null;
};

// Pure provider function: Get current user
export const getCurrentUser = async (platform: 'extension' | 'mobile' = 'extension'): Promise<FirebaseUser | null> => {
  await initFirebase(platform);
  return firebaseAuth?.currentUser || null;
};

// ✅ NEW: Get current auth state from Firebase
export const getCurrentAuthState = async (platform: 'extension' | 'mobile' = 'extension'): Promise<FirebaseUser | null> => {
  await initFirebase(platform);
  return firebaseAuth?.currentUser || null;
};

// Pure provider function: Get current user ID
export const getCurrentUserId = (): string | null => {
  return firebaseAuth?.currentUser?.uid || null;
};

// Pure provider function: Start auth state listeners
export const startAuthListeners = async (callback: (user: FirebaseUser | null) => Promise<void>, platform: 'extension' | 'mobile' = 'extension'): Promise<void> => {
  await initFirebase(platform);
  
  // ✅ NATIVE CHECK: Use actual listener state
  if (areAuthListenersActive()) {
    console.log('[Firebase] Auth listeners already active, skipping');
    return;
  }

  if (!firebaseAuth) {
    throw new AuthenticationError('Firebase auth not initialized');
  }
  
  console.log('[Firebase] Starting auth listeners...');
  const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
    await callback(user);
  });
  
  authListenerUnsubscribe = unsubscribe;
  console.log('[Firebase] Auth listeners started');
};

// Pure provider function: Stop auth state listeners
export const stopAuthListeners = (): void => {
  // ✅ NATIVE CHECK: Use actual listener state
  if (!areAuthListenersActive()) {
    console.log('[Firebase] Auth listeners not active, skipping stop');
    return;
  }

  if (authListenerUnsubscribe) {
    console.log('[Firebase] Stopping auth listeners...');
    authListenerUnsubscribe();
    authListenerUnsubscribe = null;
    console.log('[Firebase] Auth listeners stopped');
  }
};

// Export Firebase instances for other libraries
export { firebaseAuth as auth, firebaseDb as firestore };
