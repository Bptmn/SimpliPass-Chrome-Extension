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
import { db, auth } from './firebase';

const DB_NAME = 'SimpliPassCache';
const STORE_NAME = 'credentials';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB cache database.
 * @returns Promise resolving to the IDBDatabase instance.
 */
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

/**
 * Saves an array of cached credentials to IndexedDB.
 * @param cached Array of CachedCredential objects.
 * @returns Promise<void>
 */
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

/**
 * Retrieves all cached credentials from IndexedDB.
 * @returns Promise resolving to an array of CachedCredential objects.
 */
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

/**
 * Retrieves a single cached credential by its ID.
 * @param id Credential ID
 * @returns Promise resolving to the CachedCredential or null if not found.
 */
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
 * @param user The current authenticated user.
 * @returns Promise resolving to an array of CachedCredential objects.
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
 * @param user The current authenticated user.
 * @returns Promise resolving to an array of CachedCredential objects.
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
      
      // Log every credential's URL when retrieved from cache
      console.log('[Cache] Retrieved credentials from cache:');
      creds.forEach(cred => {
        console.log(`[Cache] Credential ID: ${cred.id}, URL: ${cred.url}, Title: ${cred.title}`);
      });
      
      resolve(creds);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Helper function to extract registered domain from hostname (handles subdomains)
 */
function getRegisteredDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

/**
 * Get cached credentials filtered by domain (robust, matches registered domain)
 * @param domain The root domain to filter by
 * @returns Promise resolving to an array of CachedCredential objects matching the domain
 */
export async function getCachedCredentialsByDomain(domain: string): Promise<CachedCredential[]> {
  let allCreds = await getAllCachedCredentials();
  if (!allCreds || allCreds.length === 0 && auth.currentUser) {
    try {
      allCreds = await refreshCredentialCache(auth.currentUser);
    } catch (e) {
      allCreds = [];
    }
  }
  const pageDomain = getRegisteredDomain(domain).toLowerCase();
  return allCreds.filter(cred => {
    // 1. Try URL match if url is non-empty
    if (cred.url && cred.url.trim() !== '') {
      try {
        const credUrl = new URL(cred.url.startsWith('http') ? cred.url : 'https://' + cred.url);
        const credDomain = getRegisteredDomain(credUrl.hostname).toLowerCase();
        if (pageDomain.endsWith(credDomain) || credDomain.endsWith(pageDomain)) {
          return true;
        }
      } catch {
        if (cred.url.toLowerCase().includes(pageDomain) || pageDomain.includes(cred.url.toLowerCase())) {
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
}

/**
 * Helper function to extract root domain from hostname (same as content script)
 */
function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
} 