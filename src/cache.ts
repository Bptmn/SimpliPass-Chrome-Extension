/*
Double-envelope cache principle:
- On unlock: fetch all encrypted credentials, decrypt each with userSecretKey, then re-encrypt:
    itemKeyCipher = AESGCM.encrypt(itemKey, userSecretKey)
    passwordCipher = AESGCM.encrypt(passwordPlain, itemKey)
- Persist { id, url, title, username, itemKeyCipher, passwordCipher } in IndexedDB.
- Discard raw itemKey and passwordPlain.
- On injection: read one cached record, decrypt itemKey with userSecretKey, then decrypt passwordPlain with that itemKey.
*/

import { CachedCredential } from './types';
import { Auth } from 'firebase/auth';
import { getUserSecretKey } from '../utils/indexdb';
import { getAllCredentials } from './firestoreCredentialService';
import { decryptAllCredentials } from './decryptCredentials';
import { encryptData } from '../utils/crypto';

const DB_NAME = 'SimpliPassCache';
const STORE_NAME = 'credentials';
const DB_VERSION = 1;

export function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCachedCredentials(cached: CachedCredential[]): Promise<void> {
  const db = await openCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    cached.forEach(cred => {
      if (!cred.id) {
        console.error('Missing id for credential:', cred);
      }
      store.put(cred);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllCachedCredentials(): Promise<CachedCredential[]> {
  const db = await openCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
        console.debug("Cache request result:", request.result);
      resolve(request.result as CachedCredential[]);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedCredential(id: string): Promise<CachedCredential | null> {
  const db = await openCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fetches all encrypted credentials from Firestore, decrypts, re-encrypts, stores, and returns them.
 */
export async function refreshCredentialCache(user: Auth['currentUser']): Promise<CachedCredential[]> {
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
    const itemKeyCipher = await encryptData(userSecretKey, cred.itemKey);
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
  return cached;
}

/**
 * Always returns the cached credentials. If cache is empty, refreshes it first.
 */
export async function getAllCachedCredentialsWithFallback(user: Auth['currentUser']): Promise<CachedCredential[]> {
  const db = await openCacheDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction('credentials', 'readonly');
    const store = tx.objectStore('credentials');
    const request = store.getAll();
    request.onsuccess = async () => {
      let creds: CachedCredential[] = request.result;
      if (!creds || creds.length === 0) {
        try {
          creds = await refreshCredentialCache(user);
        } catch (e) {
          reject(e);
          return;
        }
      }
      resolve(creds);
    };
    request.onerror = () => reject(request.error);
  });
} 