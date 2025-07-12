/**
 * business/user.ts
 * High-level business logic for user authentication and user management.
 * Uses the auth adapter for authentication operations.
 */
import { auth } from '../auth/auth.adapter';
import { deriveKey } from '@app/utils/crypto';
import { useUserStore } from '@app/core/states';
import { initFirebase } from '@app/core/auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@app/core/types/types';
import { getAllItems } from './items';
import { 
  storeUserSecretKeyPlatform,
  getUserSecretKeyPlatform,
  deleteUserSecretKeyPlatform,
  storeUserSecretKeyPersistentPlatform,
  deleteUserSecretKeyPersistentPlatform,
  clearAllPlatform,
  loadVaultIntoMemoryPlatform,
  setRememberedEmailPlatform,
  getRememberedEmailPlatform
} from '@app/core/platform/platformAdapter';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';
// User secret key storage is now handled by platform-specific adapters

// High-level login function
// Handles email remembering, authentication, MFA, secret key derivation, and credential refresh.
export async function loginUser({ 
  email, 
  password, 
  rememberEmail,
  rememberMe = false
}: { 
  email: string; 
  password: string; 
  rememberEmail: boolean;
  rememberMe?: boolean;
}) {
  // Remember email logic
  if (rememberEmail && email) {
    await setRememberedEmailPlatform(email);
  } else if (!rememberEmail) {
    await setRememberedEmailPlatform(null);
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
      console.error('[User] Error in auth.login():', err);
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
    return { mfaRequired: true, mfaUser: result };
  }
  
  // Derive and store user secret key
  let userSecretKey: string | null = null;
  if (result.userAttributes?.['custom:salt']) {
    userSecretKey = await deriveKey(password, result.userAttributes['custom:salt']);
    await storeUserSecretKey(userSecretKey);
    
    // Store user secret key persistently if "Remember me" is enabled
    if (rememberMe) {
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      await storeUserSecretKeyPersistentPlatform(userSecretKey, expiresAt);
    }
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
  
  // Load vault data into memory
  if (userSecretKey && currentUser) {
    await loadVaultIntoMemory(currentUser.uid, userSecretKey);
  }
  
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
  let userSecretKey: string | null = null;
  if (result.userAttributes?.['custom:salt']) {
    userSecretKey = await deriveKey(password, result.userAttributes['custom:salt']);
    await storeUserSecretKey(userSecretKey);
  }
  
  // Load vault data into memory
  if (userSecretKey && result.userAttributes?.sub) {
    await loadVaultIntoMemory(result.userAttributes.sub, userSecretKey);
  }
  
  console.log('[User] confirmMfa success');
  return result;
}

// High-level logout function
export async function logoutUser(): Promise<void> {
  console.log('[User] Starting logout process');
  
  // Clear memory
  const { clearSessionMemory } = await import('@app/core/platform/session');
  await clearSessionMemory();
  
  // Clear persistent session data
  try {
    await deleteUserSecretKeyPersistentPlatform();
    console.log('[User] Persistent session data cleared');
  } catch (error) {
    console.warn('[User] Failed to clear persistent session data:', error);
    // Don't fail logout if persistent cleanup fails
  }
  
  // Clear local storage
  await deleteUserSecretKey();
  await clearAllPlatform();
  
  // Clear vault
  // await storeVaultPlatform(null); // This line is removed as per the edit hint
  
  // Clear auth session
  await auth.signOut();
  
  console.log('[User] logoutUser success');
}

// Get remembered email
export async function getRememberedEmail(): Promise<string | null> {
  return await getRememberedEmailPlatform();
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

// Store user secret key using platform-specific storage
export async function storeUserSecretKey(key: string): Promise<void> {
  await storeUserSecretKeyPlatform(key);
}

// Get user secret key using platform-specific storage
export async function getUserSecretKey(): Promise<string | null> {
  return await getUserSecretKeyPlatform();
}

// Clear user secret key using platform-specific storage
export async function deleteUserSecretKey(): Promise<void> {
  await deleteUserSecretKeyPlatform();
}

// Fetch the full user profile from Firestore
export async function fetchUserProfile(uid: string): Promise<User | null> {
  try {
    const { db } = await initFirebase();
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('[User] Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Load vault data into memory after successful login
 * @param userId User ID
 * @param userSecretKey User's secret key
 */
async function loadVaultIntoMemory(
  userId: string, 
  userSecretKey: string
): Promise<void> {
  try {
    // 1. Get all decrypted items
    const allItems = await getAllItems(userId, userSecretKey);
    
    // 2. Load vault into memory using platform adapter
    await loadVaultIntoMemoryPlatform(userId, userSecretKey, allItems);
    
    // 3. Create encrypted vault for extension (not for mobile)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      const { createEncryptedVault } = await import('@extension/utils/vault');
      await createEncryptedVault(userSecretKey);
    }
    
    console.log('[User] Vault loaded into memory successfully:', {
      credentials: allItems.filter(item => 'username' in item).length,
      bankCards: allItems.filter(item => 'cardNumber' in item).length,
      secureNotes: allItems.filter(item => !('username' in item) && !('cardNumber' in item)).length
    });
  } catch (error) {
    console.error('[User] Failed to load vault into memory:', error);
    throw error;
  }
}


