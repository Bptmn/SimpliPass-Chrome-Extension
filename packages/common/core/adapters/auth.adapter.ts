// packages/common/core/adapters/auth.adapter.ts
import { User as FirebaseUser } from 'firebase/auth';
import * as firebaseAuth from '../libraries/auth/firebase';

export interface AuthStateChangeCallback {
  onAuthStateChanged: (user: FirebaseUser | null) => Promise<void>;
}

export interface IAuthAdapter {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  
  // Listeners functionality - consistent with database adapter
  startAuthListeners(callback: AuthStateChangeCallback): Promise<void>;
  stopAuthListeners(): void;
  
  // Simple current user access - no business logic
  getCurrentUser(): Promise<FirebaseUser | null>;
  
  // Simple auth state listener - no business logic
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Promise<() => void>;
}

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., Cognito, Auth0, etc.)
export const auth: IAuthAdapter = {
  initialize: firebaseAuth.initialize,
  login: firebaseAuth.login,
  isAuthenticated: firebaseAuth.isAuthenticated,
  signOut: firebaseAuth.signOutUser,
  fetchUserSalt: firebaseAuth.fetchUserSalt,
  
  // Listeners functionality
  startAuthListeners: async (callback: AuthStateChangeCallback) => {
    const auth = await firebaseAuth.getAuthInstance();
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    auth.onAuthStateChanged((user) => {
      callback.onAuthStateChanged(user);
    });
  },
  stopAuthListeners: () => {
    // Firebase auth listeners are automatically cleaned up
    // No explicit cleanup needed for Firebase auth state listeners
  },
  getCurrentUser: firebaseAuth.getCurrentUser,
  onAuthStateChanged: firebaseAuth.onAuthStateChanged,
};
