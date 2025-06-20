import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, Firestore, DocumentReference } from "firebase/firestore";
import { CredentialEncrypted } from "./types";
import { db } from "./firebase";

/**
 * Get a single credential by userId and credentialId
 */
export async function getCredential(userId: string, credentialId: string): Promise<CredentialEncrypted | null> {
  const credRef = doc(db, "users", userId, "my_credentials", credentialId);
  const credSnap = await getDoc(credRef);
  if (!credSnap.exists()) return null;
  const data = credSnap.data();
  // Explicitly map fields and add document_reference
  return {
    content_encrypted: data.content_encrypted,
    item_key_encrypted: data.item_key_encrypted,
    created_at: data.created_at,
    last_used_at: data.last_used_at,
    document_reference: credRef as DocumentReference,
  };
}

/**
 * Get all credentials for a user
 */
export async function getAllCredentials(userId: string): Promise<(CredentialEncrypted & { id: string })[]> {
  const credsCol = collection(db, "users", userId, "my_credentials");
  const credsSnap = await getDocs(credsCol);
  return credsSnap.docs.map(docSnap => {
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
}

/**
 * Create a new credential for a user
 */
export async function createCredential(userId: string, data: CredentialEncrypted): Promise<DocumentReference> {
  const credsCol = collection(db, "users", userId, "my_credentials");
  // Remove document_reference before storing
  const { document_reference, ...dataToStore } = data;
  const docRef = await addDoc(credsCol, dataToStore);
  return docRef;
}

/**
 * Update an existing credential
 */
export async function updateCredential(userId: string, credentialId: string, data: Partial<CredentialEncrypted>): Promise<void> {
  const credRef = doc(db, "users", userId, "my_credentials", credentialId);
  // Remove document_reference before updating
  const { document_reference, ...dataToUpdate } = data;
  await updateDoc(credRef, dataToUpdate);
}

/**
 * Delete a credential
 */
export async function deleteCredential(userId: string, credentialId: string): Promise<void> {
  const credRef = doc(db, "users", userId, "my_credentials", credentialId);
  await deleteDoc(credRef);
} 