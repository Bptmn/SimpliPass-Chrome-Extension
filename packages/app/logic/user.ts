/**
 * business/user.ts
 * High-level business logic for user authentication and user management.
 * Calls low-level service functions in services/cognito.ts and services/firebase.ts.
 */
import { getCurrentUser as getCurrentUserFromFirebase, signInWithFirebaseToken, signOutFromFirebase } from '@logic/firebase';
import { signOutCognito, loginWithCognito, confirmMfaWithCognito } from '@logic/cognito';
import { openDB, putItem, getItem, deleteItem, clearStore } from '@logic/indexdb';
import { deriveKey } from '@utils/crypto';
import { refreshCredentialsInVaultDb } from '@logic/items';

const DB_NAME = 'SimpliPassCache';
const STORE_NAME = 'user';
const DB_VERSION = 1;
const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';


// Get user secret key from IndexedDB
export async function getUserSecretKey(): Promise<string | null> {
  console.log('[User] Getting user secret key from IndexedDB');
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await getItem(db, STORE_NAME, 'UserSecretKey');
  console.log('[User] getUserSecretKey success:', result ? 'Key found: ' + result : 'Key not found');
  return result;
}

// Store user secret key in IndexedDB
export async function storeUserSecretKey(key: string): Promise<void> {
  console.log('[User] Storing user secret key in IndexedDB');
  const db = await openDB(DB_NAME, DB_VERSION);
  await putItem(db, STORE_NAME, 'UserSecretKey', key);
  console.log('[User] storeUserSecretKey success');
}

// Delete user secret key from IndexedDB
export async function deleteUserSecretKey(): Promise<void> {
  console.log('[User] Deleting user secret key from IndexedDB');
  const db = await openDB(DB_NAME, DB_VERSION);
  await deleteItem(db, STORE_NAME, 'UserSecretKey');
  console.log('[User] deleteUserSecretKey success');
}

// High-level login function for the popup.
// Handles email remembering, Cognito sign-in, MFA, secret key derivation, Firebase sign-in, and credential refresh.
export async function loginUser({ email, password, rememberEmail }: { email: string; password: string; rememberEmail: boolean; }) {
  console.log('[User] Starting login process for email:', email);
  // Remember email logic
  if (rememberEmail && email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else if (!rememberEmail) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }

  // Call low-level Cognito login
  const result = await loginWithCognito(email, password);
  if (result.mfaRequired) {
    console.log('[User] loginUser success: MFA required');
    return { mfaRequired: true, mfaUser: result.mfaUser };
  }
  // Derive and store user secret key
  const userSalt = result.userAttributes['custom:salt'];
  if (userSalt) {
    const userSecretKey = await deriveKey(password, userSalt);
    await storeUserSecretKey(userSecretKey);
  }
  // Sign in with Firebase (low-level)
  await signInWithFirebaseToken(result.firebaseToken);
  await refreshCredentialsInVaultDb(getCurrentUserFromFirebase());
  console.log('[User] loginUser success: User fully authenticated');
  return { mfaRequired: false };
}

// High-level MFA confirmation function for the popup.
export async function confirmMfa({ code, password, _mfaUser }: { code: string; password: string; _mfaUser: unknown; }) {
  console.log('[User] Confirming MFA with code');
  const result = await confirmMfaWithCognito(code);
  const userSalt = result.userAttributes['custom:salt'];
  if (userSalt) {
    const userSecretKey = await deriveKey(password, userSalt);
    await storeUserSecretKey(userSecretKey);
  }
  await signInWithFirebaseToken(result.firebaseToken);
  console.log('[User] confirmMfa success');
  return result.user;
}

// High-level logout function for the popup.
export async function logoutUser(): Promise<void> {
  console.log('[User] Starting logout process');
  await deleteUserSecretKey();
  await clearStore(await openDB(DB_NAME, DB_VERSION), STORE_NAME);
  await signOutFromFirebase();
  await signOutCognito();
  console.log('[User] logoutUser success');
}