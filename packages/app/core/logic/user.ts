/**
 * business/user.ts
 * High-level business logic for user authentication and user management.
 * Uses the auth adapter for authentication operations.
 */
import { auth } from '../auth/auth.adapter';
import { setItem, getItem, removeItem, clearAll } from '@app/core/database/localDB';
import { deriveKey } from '@app/utils/crypto';
import { useUserStore } from '@app/core/states';
import { db } from '@app/core/auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@app/core/types/types';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';
const USER_SECRET_KEY = 'UserSecretKey';

// High-level login function
// Handles email remembering, authentication, MFA, secret key derivation, and credential refresh.
export async function loginUser({ 
  email, 
  password, 
  rememberEmail 
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

  // Always sign out before attempting login to avoid stuck session errors (Cognito/Amplify issue)
  await logoutUser();

  let result;
  let triedLogout = false;
  const maxRetries = 2;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Call auth adapter login
      result = await auth.login(email, password);
      break; // Success, exit loop
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes('already a signed in user') &&
        !triedLogout
      ) {
        console.warn('[User] Detected stuck session, logging out and retrying login...');
        await logoutUser();
        triedLogout = true;
        continue; // Retry login
      } else {
        throw new Error(err instanceof Error ? err.message : 'Erreur inconnue lors de la récupération de l\'utilisateur.');
      }
    }
  }
  
  if (!result) {
    throw new Error('Failed to login after maximum retries');
  }
  
  if (result.mfaRequired) {
    console.log('[User] loginUser success: MFA required');
    return { mfaRequired: true, mfaUser: result };
  }
  
  // Derive and store user secret key
  if (result.userAttributes?.['custom:salt']) {
    const userSecretKey = await deriveKey(password, result.userAttributes['custom:salt']);
    await storeUserSecretKey(userSecretKey);
  }
  
  // Refresh credentials in vault
  const userStore = useUserStore.getState();
  let currentUser = null;
  if (result.userAttributes?.sub) {
    currentUser = await fetchUserProfile(result.userAttributes.sub);
    if (currentUser) {
      userStore.setUser(currentUser);
    }
  }
  
  console.log('[User] loginUser success: User fully authenticated');
  return { mfaRequired: false };
}

// High-level MFA confirmation function
export async function confirmMfa({ 
  code, 
  password 
}: { 
  code: string; 
  password: string; 
}) {
  console.log('[User] Confirming MFA with code');
  
  const result = await auth.confirmMfa(code);
  
  // Derive and store user secret key
  if (result.userAttributes?.['custom:salt']) {
    const userSecretKey = await deriveKey(password, result.userAttributes['custom:salt']);
    await storeUserSecretKey(userSecretKey);
  }
  
  console.log('[User] confirmMfa success');
  return result;
}

// High-level logout function
export async function logoutUser(): Promise<void> {
  console.log('[User] Starting logout process');
  
  // Clear local storage
  await deleteUserSecretKey();
  await clearAll();
  
  // Clear auth session
  await auth.signOut();
  
  console.log('[User] logoutUser success');
}

// Get remembered email
export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBER_EMAIL_KEY);
}

// Check if user is authenticated
export async function isUserAuthenticated(): Promise<boolean> {
  const userStore = useUserStore.getState();
  const user = userStore.user;
  return user !== null;
}

// Get user salt
export async function getUserSalt(): Promise<string> {
  return await auth.getUserSalt();
}

// Store user secret key in local storage
export async function storeUserSecretKey(key: string): Promise<void> {
  await setItem(USER_SECRET_KEY, key);
}

// Get user secret key from local storage
export async function getUserSecretKey(): Promise<string | null> {
  return await getItem<string>(USER_SECRET_KEY);
}

// Delete user secret key from local storage
export async function deleteUserSecretKey(): Promise<void> {
  await removeItem(USER_SECRET_KEY);
}

// Fetch the full user profile from Firestore
export async function fetchUserProfile(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
}
