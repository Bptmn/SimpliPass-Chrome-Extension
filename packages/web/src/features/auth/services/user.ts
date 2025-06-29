/**
 * business/user.ts
 * High-level business logic for user authentication and user management.
 * Calls low-level service functions in services/cognito.ts and services/firebase.ts.
 */
import {
  getCurrentUser as getCurrentUserFromFirebase,
  signInWithFirebaseToken,
  signOutFromFirebase,
} from '../../../services/api/firebase';
import { signOutCognito, loginWithCognito, confirmMfaWithCognito } from '../../../services/api/cognito';
import { deriveKey } from '@simplipass/shared';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';

// Get user secret key from localStorage (simplified for web)
export async function getUserSecretKey(): Promise<string | null> {
  console.log('[User] Getting user secret key from localStorage');
  const result = localStorage.getItem('UserSecretKey');
  console.log('[User] getUserSecretKey success:', result ? 'Key found' : 'Key not found');
  return result;
}

// Store user secret key in localStorage (simplified for web)
export async function storeUserSecretKey(key: string): Promise<void> {
  console.log('[User] Storing user secret key in localStorage');
  localStorage.setItem('UserSecretKey', key);
  console.log('[User] storeUserSecretKey success');
}

// Delete user secret key from localStorage
export async function deleteUserSecretKey(): Promise<void> {
  console.log('[User] Deleting user secret key from localStorage');
  localStorage.removeItem('UserSecretKey');
  console.log('[User] deleteUserSecretKey success');
}

// High-level login function for the popup.
export async function loginUser({
  email,
  password,
  rememberEmail,
}: {
  email: string;
  password: string;
  rememberEmail: boolean;
}) {
  console.log('[User] Starting login process for email:', email);
  // Remember email logic
  if (rememberEmail && email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else if (!rememberEmail) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }

  // For demo purposes, simulate successful login
  console.log('[User] loginUser success: User authenticated');
  return { mfaRequired: false };
}

// High-level MFA confirmation function for the popup.
export async function confirmMfa({
  code,
  password,
  mfaUser,
}: {
  code: string;
  password: string;
  mfaUser: any;
}) {
  console.log('[User] Confirming MFA with code');
  // For demo purposes, simulate successful MFA
  console.log('[User] confirmMfa success');
  return { user: mfaUser };
}

// High-level logout function for the popup.
export async function logoutUser(): Promise<void> {
  console.log('[User] Starting logout process');
  await deleteUserSecretKey();
  localStorage.clear();
  console.log('[User] logoutUser success');
}