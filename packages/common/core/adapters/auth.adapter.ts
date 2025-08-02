import * as authLib from '../libraries/auth/auth';
import { fetchUserSaltCognito, initCognito } from '../libraries/auth/cognito';
import { User as FirebaseUser } from 'firebase/auth';
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
  
  // Simple current user access - no business logic
  getCurrentUser(): FirebaseUser | null;
  
  // Simple auth state listener - no business logic
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Promise<() => void>;
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
    const { onAuthStateChanged } = await import('firebase/auth');
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
  
  // Simple current user access - no business logic
  getCurrentUser: () => {
    return firebaseAuth?.currentUser || null;
  },
  
  // Simple auth state listener - no business logic
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return new Promise<() => void>((resolve) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(firebaseAuth!, callback);
        resolve(unsubscribe);
      });
    });
  },
}; 