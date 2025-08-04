// packages/common/core/adapters/auth.adapter.ts
import { User as FirebaseUser } from 'firebase/auth';
import * as firebaseAuth from '../libraries/auth/firebase';
import * as cognitoAuth from '../libraries/auth/cognito';

export interface IAuthAdapter {
  initialize(): Promise<void>;
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  startAuthListeners(callback: (user: FirebaseUser | null) => Promise<void>): Promise<void>;
  stopAuthListeners(): void;
  getCurrentUser(): Promise<FirebaseUser | null>;
}

// 🔌 Current implementation using Firebase
// This can be easily swapped for other providers (e.g., Cognito, Auth0, etc.)
export const auth: IAuthAdapter = {
  initialize: firebaseAuth.initialize,
  
  // Pure provider functions - no business logic
  login: cognitoAuth.loginWithCognitoAndGetUserId,
  isAuthenticated: firebaseAuth.isAuthenticated,
  signOut: cognitoAuth.signOutFromAllProviders,
  fetchUserSalt: cognitoAuth.fetchUserSaltCognito,
  
  // Pure provider functions for listeners
  startAuthListeners: firebaseAuth.startAuthListeners,
  stopAuthListeners: firebaseAuth.stopAuthListeners,
  getCurrentUser: firebaseAuth.getCurrentUser,
};
