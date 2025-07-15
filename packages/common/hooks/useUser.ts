/**
 * useUser Hook - Layer 1: UI Layer
 * 
 * Provides simple access to user data from auth state.
 * Re-exports the user selector from auth state for convenience.
 */

import { useUserStore } from '../core/states/user';
import { User } from '../core/types/auth.types';
import { getDocument } from '../core/libraries/database/firestore';

export const useUser = useUserStore;

export async function getFirestoreUserDocument(userId: string) {
  // Assumes users are stored in a 'users' collection
  return await getDocument(`users/${userId}`);
}

export async function refreshUserInfo(userId: string) {

  // 1. Fetch user document from Firestore
  const userDoc = await getFirestoreUserDocument(userId);
  if (!userDoc) {
    throw new Error('User document not found in Firestore');
  }

  // 2. Create User object
  const user: User = {
    id: userDoc.id,
    email: userDoc.email,
    username: userDoc.username || userDoc.email,
    createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
    updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt) : new Date(),
  };

  // 3. Store user object in state
  useUserStore.getState().setUser(user);
} 

