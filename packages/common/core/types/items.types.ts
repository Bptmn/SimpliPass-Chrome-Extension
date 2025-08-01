/**
 * items.types.ts - Item-related type definitions
 * 
 * Core types for credentials, bank cards, secure notes, and vault management.
 */

import { Timestamp } from 'firebase/firestore';

// ===== Decrypted Item Types =====

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

export type ItemDecrypted = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

// ===== Encrypted Item Types =====

export interface ItemEncrypted {
  id: string;
  content_encrypted: string;
  item_key_encrypted: string;
  created_at: Date;
  last_used_at: Date;
  item_type: string;
}

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

// ===== Firestore Types =====

export interface UserDocument {
  email: string;
  uid: string;
  created_time: Timestamp;
  salt: string;
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
  query: string;
  category?: 'credentials' | 'bankCards' | 'secureNotes' | 'all';
}

export interface LocalVault {
  userId: string;
  items: ItemDecrypted[];
  lastModified: Date;
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