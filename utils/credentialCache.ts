/**
 * Fetches all encrypted credentials from Firestore, decrypts them, and stores as CachedCredential in IndexedDB.
 * - Decrypts itemKey with userSecretKey
 * - Decrypts password with itemKey
 * - Re-encrypts itemKey with userSecretKey (AES-GCM)
 * - Re-encrypts password with itemKey (AES-GCM)
 * - Stores { id, url, title, username, itemKeyCipher, passwordCipher } in cache
 */
import { getAllCredentials } from '../src/firestoreCredentialService';
import { decryptAllCredentials } from '../src/decryptCredentials';
import { getAllCachedCredentials, saveCachedCredentials, openCacheDB } from '../src/cache';
import { CachedCredential } from '../src/types';
import { encryptData } from '../utils/crypto'; // AES-GCM encryption
import { getUserSecretKey } from './indexdb';
import { Auth } from 'firebase/auth';

export async function refreshCredentialCache(user: Auth['currentUser']) {
  if (!user) throw new Error('No user logged in');
  const userSecretKey = await getUserSecretKey();
  if (!userSecretKey) throw new Error('User secret key not found');

  // 1. Fetch encrypted credentials from Firestore
  const encrypted = await getAllCredentials(user.uid);

  // 2. Decrypt all credentials (get plain itemKey and password)
  const decrypted = await decryptAllCredentials(encrypted);

  // 3. For each, re-encrypt as CachedCredential
  const cached: CachedCredential[] = [];
  for (const cred of decrypted) {
    // Encrypt itemKey with userSecretKey
    const itemKeyCipher = await encryptData(userSecretKey, cred.itemKey);
    // Encrypt password with itemKey
    const passwordCipher = await encryptData(cred.itemKey, cred.password);
    cached.push({
      id: cred.document_reference.id,
      url: cred.url,
      title: cred.title,
      username: cred.username,
      itemKeyCipher,
      passwordCipher,
    });
  }

  // 4. Store in IndexedDB
  await saveCachedCredentials(cached);
}

export async function ensureCredentialCache(user: Auth['currentUser']) {
    const cached = await getAllCachedCredentials();
    if (!cached || cached.length === 0) {
        console.debug("I will refresh the credential cache");
      await refreshCredentialCache(user);
    }
  }

export async function clearCredentialCache(): Promise<void> {
  const db = await openCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('credentials', 'readwrite');
    const store = tx.objectStore('credentials');
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });
}
