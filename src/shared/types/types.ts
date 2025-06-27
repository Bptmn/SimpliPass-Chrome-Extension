// src/types.ts

import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface HomePageProps {
  user: any;
  pageState: PageState | null;
  suggestions: CredentialMeta[];
  onInjectCredential: (credentialId: string) => void;
}

export interface PageState {
  url: string;
  domain: string;
  hasLoginForm: boolean;
}

export interface CredentialMeta {
  title: string;
  username: string;
  domain: string;
  document_reference: DocumentReference;
}

// Represents a decrypted credential item
export interface CredentialDecrypted {
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  username: string;
  password: string;
  note: string;
  url: string;
  itemKey: string;
  document_reference: DocumentReference;
}

/** Top‐level Firestore "users" document */
export interface User {
  email: string;
  uid: string;
  created_time: Timestamp;
  phone_number: string;
  salt: string;
  display_name: string;
  photo_url: string;
}

/** Subcollection "my_credentials" under each user */
export interface CredentialEncrypted {
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Timestamp;
  last_used_at: Timestamp;
  document_reference: DocumentReference;
}

export interface CredentialVaultDb {
  url: string;
  title: string;
  username: string;
  itemKeyCipher: string;
  passwordCipher: string;
  note?: string;
  document_reference_id: string;
}
