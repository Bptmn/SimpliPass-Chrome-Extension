import * as authLib from '../libraries/auth/auth';
import { fetchUserSaltCognito, initCognito } from '../libraries/auth/cognito';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from '../libraries/auth/firebase';
import { initFirebase } from '../libraries/auth/firebase';

export interface AuthStateChangeCallback {
  onAuthStateChanged: (user: FirebaseUser | null) => Promise<void>;
}

export interface AuthAdapter {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  
  // Listeners functionality - consistent with database adapter
  startAuthListeners(callback: AuthStateChangeCallback): Promise<void>;
  stopAuthListeners(): void;
  
  // Legacy methods for backward compatibility
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void;
  getCurrentUser(): FirebaseUser | null;
  getCurrentUserAsync(): Promise<FirebaseUser | null>;
}

export const auth: AuthAdapter = {
  initialize: async () => {
    // Initialize Firebase
    await initFirebase();
    
    // Initialize Cognito
    await initCognito();
  },
  login: authLib.loginUser,
  isAuthenticated: authLib.isUserAuthenticated,
  signOut: authLib.signOutUser,
  fetchUserSalt: fetchUserSaltCognito,
  
  // Listeners functionality - consistent with database adapter
  startAuthListeners: async (callback: AuthStateChangeCallback) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth!, async (user) => {
      await callback.onAuthStateChanged(user);
    });
    // Store unsubscribe function for later use
    (auth as any)._unsubscribe = unsubscribe;
  },
  
  stopAuthListeners: () => {
    if ((auth as any)._unsubscribe) {
      (auth as any)._unsubscribe();
      (auth as any)._unsubscribe = null;
    }
  },
  
  // Legacy methods for backward compatibility
  onAuthStateChanged: (callback) => onAuthStateChanged(firebaseAuth!, callback),
  getCurrentUser: () => firebaseAuth?.currentUser || null,
  getCurrentUserAsync: async () => {
    // Wait for auth to be ready
    if (!firebaseAuth) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return firebaseAuth?.currentUser || null;
  },
}; 