import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  Firestore,
  DocumentReference,
  query,
} from 'firebase/firestore';
import {collection as fsCollection, doc as fsDoc, addDoc as fsAddDoc, QueryConstraint } from 'firebase/firestore';


import { db } from './firebase';
import { User, CredentialEncrypted } from '../types/types';

/* Get a single user by uid */
export async function getUser(uid: string): Promise<User | null> {
  console.log('[Firestore] Getting user with uid:', uid);
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const result = userSnap.exists() ? (userSnap.data() as User) : null;
  console.log('[Firestore] getUser success:', result ? 'User found' : 'User not found');
  return result;
}

/* Update an existing user */
export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  console.log('[Firestore] Updating user with uid:', uid, 'data:', data);
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
  console.log('[Firestore] updateUser success');
}

/* Delete a user */
export async function deleteUser(uid: string): Promise<void> {
  console.log('[Firestore] Deleting user with uid:', uid);
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
  console.log('[Firestore] deleteUser success');
}

/* Get a single credential by userId and credentialId */
export async function getCredentialInFirestore(
  userId: string,
  credentialId: string,
): Promise<CredentialEncrypted | null> {
  console.log('[Firestore] Getting credential with userId:', userId, 'credentialId:', credentialId);
  const credRef = doc(db, 'users', userId, 'my_credentials', credentialId);
  const credSnap = await getDoc(credRef);
  if (!credSnap.exists()) {
    console.log('[Firestore] getCredential success: Credential not found');
    return null;
  }
  const data = credSnap.data();
  // Explicitly map fields and add document_reference
  const result = {
    content_encrypted: data.content_encrypted,
    item_key_encrypted: data.item_key_encrypted,
    created_at: data.created_at,
    last_used_at: data.last_used_at,
    document_reference: credRef as DocumentReference,
  };
  console.log('[Firestore] getCredential success: Credential found');
  return result;
}

/* Get all credentials for a user */
export async function getAllCredentialsInFirestore(
  userId: string,
): Promise<(CredentialEncrypted & { id: string })[]> {
  console.log('[Firestore] Getting all credentials for userId:', userId);
  const credsCol = collection(db, 'users', userId, 'my_credentials');
  const credsSnap = await getDocs(credsCol);
  const result = credsSnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      content_encrypted: data.content_encrypted,
      item_key_encrypted: data.item_key_encrypted,
      created_at: data.created_at,
      last_used_at: data.last_used_at,
      document_reference: docSnap.ref as DocumentReference,
    };
  });
  console.log('[Firestore] getAllCredentials success:', result.length, 'credentials found');
  return result;
}

/* Create a new credential for a user */
export async function createCredentialInFirestore(
  userId: string,
  data: CredentialEncrypted,
): Promise<DocumentReference> {
  console.log('[Firestore] Creating credential for userId:', userId);
  const credsCol = collection(db, 'users', userId, 'my_credentials');
  // Remove document_reference before storing
  const { document_reference, ...dataToStore } = data;
  const docRef = await addDoc(credsCol, dataToStore);
  console.log('[Firestore] createCredential success, docId:', docRef.id);
  return docRef;
}

/* Update an existing credential */
export async function updateCredentialInFirestore(
  userId: string,
  credentialId: string,
  data: Partial<CredentialEncrypted>,
): Promise<void> {
  console.log('[Firestore] Updating credential with userId:', userId, 'credentialId:', credentialId);
  const credRef = doc(db, 'users', userId, 'my_credentials', credentialId);
  // Remove document_reference before updating
  const { document_reference, ...dataToUpdate } = data;
  await updateDoc(credRef, dataToUpdate);
  console.log('[Firestore] updateCredential success');
}

/* Delete a credential */
export async function deleteCredentialInFirestore(userId: string, credentialId: string): Promise<void> {
  console.log('[Firestore] Deleting credential with userId:', userId, 'credentialId:', credentialId);
  const credRef = doc(db, 'users', userId, 'my_credentials', credentialId);
  await deleteDoc(credRef);
  console.log('[Firestore] deleteCredential success');
}


/**
 * Add a document to a collection (auto-ID)
 */
export async function addDocument<T extends Record<string, any>>(collectionPath: string, data: T) {
  const colRef = fsCollection(db, collectionPath);
  return await fsAddDoc(colRef, data);
}

/**
 * Set (overwrite) a document at a specific path
 */
export async function setDocument<T extends Record<string, any>>(docPath: string, data: T) {
  const docRef = fsDoc(db, docPath);
  return await setDoc(docRef, data);
}

/**
 * Update a document at a specific path
 */
export async function updateDocument<T = any>(docPath: string, data: Partial<T>) {
  const docRef = fsDoc(db, docPath);
  return await updateDoc(docRef, data);
}

/**
 * Delete a document at a specific path
 */
export async function deleteDocument(docPath: string) {
  const docRef = fsDoc(db, docPath);
  return await deleteDoc(docRef);
}

/**
 * Get a document at a specific path
 */
export async function getDocument<T = any>(docPath: string): Promise<T | null> {
  const docRef = fsDoc(db, docPath);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as T) : null;
}

/**
 * Get all documents in a collection (optionally with query constraints)
 */
export async function getCollection<T = any>(collectionPath: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
  const colRef = fsCollection(db, collectionPath);
  const q = queryConstraints.length ? query(colRef, ...queryConstraints) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}
