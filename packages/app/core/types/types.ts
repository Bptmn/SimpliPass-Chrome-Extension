// src/types.ts

import { Timestamp } from 'firebase/firestore';

export interface HomePageProps {
  user: unknown;
  pageState: PageState | null;
  onInjectCredential: (credentialId: string) => void;
}

export interface PageState {
  url: string;
  domain: string;
  hasLoginForm: boolean;
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
  id: string;
}

export interface BankCardDecrypted {
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  owner: string;
  note: string;
  color: string;
  itemKey: string;
  cardNumber: string;
  expirationDate: import('@app/utils').ExpirationDate;
  verificationNumber: string;
  bankName: string;
  bankDomain: string;
  id: string;
}

export interface SecureNoteDecrypted {
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  note: string;
  color: string;
  itemKey: string;
  id: string;
}

// Encrypted interfaces for Firestore storage
export interface CredentialEncrypted extends ItemEncrypted {
  item_type: 'credential';
}

export interface BankCardEncrypted extends ItemEncrypted {
  item_type: 'bank_card';
}

export interface SecureNoteEncrypted extends ItemEncrypted {
  item_type: 'secure_note';
}

/** Top‐level Firestore "users" document */
export interface User {
  email: string;
  uid: string;
  created_time: Timestamp;
  salt: string;
}

/** Subcollection "my_items" under each user */
export interface ItemEncrypted {
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
  item_type: string;
  id?: string;
}

/** Subcollection "my_trusted_devices" under each user */
export interface TrustedDevice {
  device_key: string;
  device_information: string;
  id: string;
}

export interface deviceInformation {
  id: string;
  name: string;
  brand: string;
  systemName: string;
  model: string;
  status_id_valid: boolean;
  device_type: string;
  created_at: Date;
  last_authenticated_at: Date;
}

export type ItemType = 'credential' | 'bank_card' | 'secure_note';
