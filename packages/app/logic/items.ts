import { Auth } from 'firebase/auth';
import { auth } from '@logic/firebase';
import { getAllCredentialsInFirestore } from '@logic/firestore';
import { encryptData } from '@utils/crypto';
import { getUserSecretKey } from '@logic/user';
import { CredentialDecrypted, CredentialFromVaultDb } from '@shared/types';
import { openDB, putItem, getAllItems, getItem, deleteItem } from '@logic/indexdb';
import { decryptAllCredentials } from '@logic/cryptography';
import { encryptCredential } from '@logic/cryptography';
import { createCredentialInFirestore, updateCredentialInFirestore, deleteCredentialInFirestore } from '@logic/firestore';
import { getRegisteredDomain } from '@utils/domain';

const DB_NAME = 'SimpliPassCache';
const STORE_NAME = 'credentials';
const DB_VERSION = 1;

/* Fetches all encrypted credentials from Firestore, decrypts, re-encrypts, stores, and returns them */
export async function refreshCredentialsInVaultDb(
  user: Auth['currentUser'],
): Promise<CredentialFromVaultDb[]> {
  console.log('[Items] Refreshing credentials in vault DB for user:', user?.uid);
  if (!user) throw new Error('No user logged in');
  const userSecretKey = await getUserSecretKey();
  if (!userSecretKey) throw new Error('User secret key not found');

  // 1. Fetch encrypted credentials from Firestore
  const encrypted = await getAllCredentialsInFirestore(user.uid);

  // 2. Decrypt all credentials (get plain itemKey and password)
  const decrypted = await decryptAllCredentials(userSecretKey, encrypted);

  // 3. For each, re-encrypt as CredentialFromVaultDb and store in array
  const itemsToStoreInIndexDb: CredentialFromVaultDb[] = decrypted.map((cred) => {
    const itemKeyCipher = encryptData(userSecretKey, cred.itemKey);
    const passwordCipher = encryptData(cred.itemKey, cred.password);
    return {
      id: cred.document_reference?.id || '',
      url: cred.url,
      title: cred.title,
      username: cred.username,
      itemKeyCipher,
      passwordCipher,
      note: cred.note || '',
    };
  });

  // 4. Store in IndexedDB
  await saveCredentialsInVaultDb(itemsToStoreInIndexDb);
  console.log('[Items] refreshCredentialsInVaultDb success:', itemsToStoreInIndexDb.length, 'credentials processed');
  return itemsToStoreInIndexDb;
}

/* Always returns the cached credentials. If cache is empty, refreshes it first. */
export async function getAllCredentialsFromVaultDbWithFallback(
  user: Auth['currentUser'],
): Promise<CredentialFromVaultDb[]> {
  console.log('[Items] Getting all credentials from vault DB with fallback for user:', user?.uid);
  
  // First try to get credentials from cache
  let creds = await getAllCredentialsFromVaultDb();
  
  // If cache is empty and user is logged in, refresh from Firestore
  if (!creds || creds.length === 0) {
    if (auth.currentUser) {
      try {
        creds = await refreshCredentialsInVaultDb(auth.currentUser);
      } catch {
        console.error('[Items] Error refreshing credentials');
        creds = [];
      }
    } else {
      creds = [];
    }
  }

  // Log every credential's URL when retrieved from cache
  console.log('[Cache] Retrieved credentials from cache:');
  creds.forEach((cred) => {
    console.log(`[Cache] Credential ID: ${cred.id}, URL: ${cred.url}, Title: ${cred.title}`);
  });

  console.log('[Items] getAllCredentialsFromVaultDbWithFallback success:', creds.length, 'credentials');
  return creds;
}


/* Saves an array of half decrypted credentials to IndexedDB */
export async function saveCredentialsInVaultDb(cached: CredentialFromVaultDb[]): Promise<void> {
  console.log('[Items] Saving credentials to vault DB:', cached.length, 'credentials');
  const db = await openDB(DB_NAME, DB_VERSION);
  for (const cred of cached) {
    await putItem(db, STORE_NAME, cred.id, cred);
  }
  console.log('[Items] saveCredentialsInVaultDb success');
}

/* Retrieves all cached credentials from IndexedDB */
export async function getAllCredentialsFromVaultDb(): Promise<CredentialFromVaultDb[]> {
  console.log('[Items] Getting all credentials from vault DB');
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await getAllItems(db, STORE_NAME);
  console.log('[Items] getAllCredentialsFromVaultDb success:', result.length, 'credentials');
  return result;
}

/* Retrieves a single cached credential by its ID from IndexedDB */
export async function getCredentialFromVaultDb(id: string): Promise<CredentialFromVaultDb | null> {
  console.log('[Items] Getting credential from vault DB with ID:', id);
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await getItem(db, STORE_NAME, id);
  console.log('[Items] getCredentialFromVaultDb success:', result ? 'Credential found' : 'Credential not found');
  return result;
}

/* Get cached credentials filtered by domain (robust, matches registered domain) */
export async function getCredentialsByDomainFromVaultDb(
  domain: string,
): Promise<CredentialFromVaultDb[]> {
  console.log('[Items] Getting credentials by domain from vault DB:', domain);
  let allCreds = await getAllCredentialsFromVaultDb();
  if (!allCreds || (allCreds.length === 0 && auth.currentUser)) {
    try {
      allCreds = await refreshCredentialsInVaultDb(auth.currentUser);
    } catch {
      allCreds = [];
    }
  }
  const pageDomain = getRegisteredDomain(domain).toLowerCase();
  const filtered = allCreds.filter((cred) => {
    // 1. Try URL match if url is non-empty
    if (cred.url && cred.url.trim() !== '') {
      try {
        const credUrl = new URL(cred.url.startsWith('http') ? cred.url : 'https://' + cred.url);
        const credDomain = getRegisteredDomain(credUrl.hostname).toLowerCase();
        if (pageDomain.endsWith(credDomain) || credDomain.endsWith(pageDomain)) {
          return true;
        }
      } catch {
        if (
          cred.url.toLowerCase().includes(pageDomain) ||
          pageDomain.includes(cred.url.toLowerCase())
        ) {
          return true;
        }
      }
      // If url is present but does not match, fall back to title match
      if (cred.title) {
        const title = cred.title.toLowerCase();
        if (title.includes(pageDomain) || pageDomain.includes(title)) {
          return true;
        }
      }
      return false;
    }
    // 2. If url is empty, match by title (case-insensitive, substring or reverse)
    if (cred.title) {
      const title = cred.title.toLowerCase();
      if (title.includes(pageDomain) || pageDomain.includes(title)) {
        return true;
      }
    }
    return false;
  });
  console.log('[Items] getCredentialsByDomainFromVaultDb success:', filtered.length, 'credentials found for domain:', domain);
  return filtered;
}

// Create a credential: encrypt, store in Firestore, then add to IndexedDB if successful.
export async function createCredential(cred: CredentialDecrypted): Promise<void> {
  const userSecretKey = await getUserSecretKey();
  const user = auth.currentUser;
  if (!userSecretKey || !user) throw new Error('User not authenticated');
  // 1. Encrypt the credential
  const encrypted = await encryptCredential(userSecretKey, cred);
  // 2. Store in Firestore
  const docRef = await createCredentialInFirestore(user.uid, encrypted);
  // 3. Add to IndexedDB
  const db = await openDB(DB_NAME, DB_VERSION);
  // Use the docRef.id as the key
  const credForIndexDb: CredentialFromVaultDb = {
    id: docRef.id,
    url: cred.url,
    title: cred.title,
    username: cred.username,
    itemKeyCipher: encryptData(userSecretKey, cred.itemKey),
    passwordCipher: encryptData(cred.itemKey, cred.password),
    note: cred.note || '',
  };
  await putItem(db, STORE_NAME, credForIndexDb.id, credForIndexDb);
}

// Update a credential: encrypt, update in Firestore, then update in IndexedDB if successful.
export async function updateCredential(credentialId: string, cred: CredentialDecrypted): Promise<void> {
  const userSecretKey = await getUserSecretKey();
  const user = auth.currentUser;
  if (!userSecretKey || !user) throw new Error('User not authenticated');
  // 1. Encrypt the credential
  const encrypted = await encryptCredential(userSecretKey, cred);
  // 2. Update in Firestore
  await updateCredentialInFirestore(user.uid, credentialId, encrypted);
  // 3. Update in IndexedDB
  const db = await openDB(DB_NAME, DB_VERSION);
  const credForIndexDb: CredentialFromVaultDb = {
    id: credentialId,
    url: cred.url,
    title: cred.title,
    username: cred.username,
    itemKeyCipher: encryptData(userSecretKey, cred.itemKey),
    passwordCipher: encryptData(cred.itemKey, cred.password),
    note: cred.note || '',
  };
  await putItem(db, STORE_NAME, credForIndexDb.id, credForIndexDb);
}

// Delete a credential: remove from Firestore, then from IndexedDB if successful.
export async function deleteCredential(credentialId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  // 1. Delete from Firestore
  await deleteCredentialInFirestore(user.uid, credentialId);
  // 2. Delete from IndexedDB
  const db = await openDB(DB_NAME, DB_VERSION);
  await deleteItem(db, STORE_NAME, credentialId);
}
