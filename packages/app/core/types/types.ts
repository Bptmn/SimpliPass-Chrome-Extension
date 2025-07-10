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

/**
 * Represents an encrypted item stored in Firestore.
 * All fields are required for proper encryption/decryption operations.
 * 
 * @property id - Unique identifier for the item (required)
 * @property content_encrypted - Base64 encoded encrypted content (required)
 * @property item_key_encrypted - Base64url encoded encrypted item key (required)
 * @property created_at - Creation timestamp (required)
 * @property last_used_at - Last used timestamp (required)
 * @property item_type - Type of the item (required)
 */
export interface ItemEncrypted {
  /** Unique identifier for the item */
  id: string;
  /** Base64 encoded encrypted content - must not be empty */
  content_encrypted: string;
  /** Base64url encoded encrypted item key - must not be empty */
  item_key_encrypted: string;
  /** Creation timestamp */
  created_at: Date;
  /** Last used timestamp */
  last_used_at: Date;
  /** Type of the item (credential, bank_card, secure_note) */
  item_type: string;
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

/**
 * Validates that an encrypted item has all required fields with non-empty values.
 * Throws an error if validation fails.
 * 
 * @param item - The encrypted item to validate
 * @returns The validated item
 * @throws Error if validation fails
 */
export function validateEncryptedItem(item: ItemEncrypted): ItemEncrypted {
  if (!item.id || item.id.trim() === '') {
    throw new Error('ItemEncrypted.id is required and cannot be empty');
  }
  
  if (!item.content_encrypted || item.content_encrypted.trim() === '') {
    throw new Error('ItemEncrypted.content_encrypted is required and cannot be empty');
  }
  
  if (!item.item_key_encrypted || item.item_key_encrypted.trim() === '') {
    throw new Error('ItemEncrypted.item_key_encrypted is required and cannot be empty');
  }
  
  if (!item.created_at) {
    throw new Error('ItemEncrypted.created_at is required');
  }
  
  if (!item.last_used_at) {
    throw new Error('ItemEncrypted.last_used_at is required');
  }
  
  if (!item.item_type || item.item_type.trim() === '') {
    throw new Error('ItemEncrypted.item_type is required and cannot be empty');
  }
  
  return item;
}
