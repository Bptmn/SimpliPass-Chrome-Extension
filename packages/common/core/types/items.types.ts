import { Timestamp } from 'firebase/firestore';

// ===== Encrypted Item Type =====
export interface ItemEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
}

// ===== Decrypted Types =====
export interface CredentialDecrypted {
  itemType: 'credential';
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
  itemType: 'bankCard';
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  owner: string;
  note: string;
  color: string;
  itemKey: string;
  cardNumber: string;
  expirationDate: import('@common/utils/expirationDate').ExpirationDate;
  verificationNumber: string;
  bankName: string;
  bankDomain: string;
  id: string;
}

export interface SecureNoteDecrypted {
  itemType: 'secureNote';
  createdDateTime: Date;
  lastUseDateTime: Date;
  title: string;
  note: string;
  color: string;
  itemKey: string;
  id: string;
}

// Encrypted interfaces for Firestore storage
export interface CredentialEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
  item_type: 'credential';
}

export interface BankCardEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
  item_type: 'bank_card';
}

export interface SecureNoteEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
  item_type: 'secure_note';
}

/** Top‐level Firestore "users" document */
export interface UserDocument {
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

// ===== State Management Types =====

export interface ItemsState {
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
  isLoading: boolean;
  error: string | null;
}

export interface SearchFilters {
  type?: 'credential' | 'bankCard' | 'secureNote';
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ===== Form Types =====

export interface CredentialForm {
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  category: string;
  tags: string[];
}

export interface BankCardForm {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: string;
  bankName?: string;
  notes?: string;
  category: string;
  tags: string[];
}

export interface SecureNoteForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export type ItemDecrypted = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted; 