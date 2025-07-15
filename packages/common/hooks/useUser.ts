/**
 * useUser Hook - Layer 1: UI Layer
 * 
 * Provides simple access to user data from auth state.
 * Re-exports the user selector from auth state for convenience.
 */

import { useUser as useUserFromAuth } from '../core/states/auth.state';
import { useAuthStore } from '../core/states/auth.state';
import { User } from '../core/types/auth.types';
import { getDocument } from '../core/libraries/database/firestore';

export const useUser = useUserFromAuth;

export async function getFirestoreUserDocument(userId: string) {
  // Assumes users are stored in a 'users' collection
  return await getDocument(`users/${userId}`);
}

export async function storeUserLocally(user: User) {
  // Placeholder: store in localStorage as JSON
  localStorage.setItem('simplipass_user', JSON.stringify(user));
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

  // 3. Store user object locally
  await storeUserLocally(user);

  // 4. Store user object in state
  useAuthStore.getState().setUser(user);
} 

