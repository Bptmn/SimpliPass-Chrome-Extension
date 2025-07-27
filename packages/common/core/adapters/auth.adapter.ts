import * as authLib from '../libraries/auth/auth';
import { fetchUserSaltCognito } from '../libraries/auth/cognito';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from '../libraries/auth/firebase';

export interface AuthAdapter {
  login(email: string, password: string): Promise<string>;
  isAuthenticated(): Promise<boolean>;
  signOut(): Promise<void>;
  fetchUserSalt(): Promise<string>;
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void;
  getCurrentUser(): FirebaseUser | null;
}

export const auth: AuthAdapter = {
  login: authLib.loginUser,
  isAuthenticated: authLib.isUserAuthenticated,
  signOut: authLib.signOutUser,
  fetchUserSalt: fetchUserSaltCognito,
  onAuthStateChanged: (callback) => onAuthStateChanged(firebaseAuth!, callback),
  getCurrentUser: () => firebaseAuth?.currentUser || null,
}; 