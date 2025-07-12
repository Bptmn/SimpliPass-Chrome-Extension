/**
 * Memory management for session data
 * Stores session key and decrypted data only in RAM
 */

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@app/core/types/types';

// In-memory storage for decrypted data (RAM only)
let decryptedCredentials: CredentialDecrypted[] = [];
let decryptedBankCards: BankCardDecrypted[] = [];
let decryptedSecureNotes: SecureNoteDecrypted[] = [];

/**
 * Store decrypted credentials in memory
 * @param credentials Array of decrypted credentials
 */
export function setCredentialsInMemory(credentials: CredentialDecrypted[]): void {
  decryptedCredentials = [...credentials];
}

/**
 * Store decrypted bank cards in memory
 * @param bankCards Array of decrypted bank cards
 */
export function setBankCardsInMemory(bankCards: BankCardDecrypted[]): void {
  decryptedBankCards = [...bankCards];
}

/**
 * Store decrypted secure notes in memory
 * @param secureNotes Array of decrypted secure notes
 */
export function setSecureNotesInMemory(secureNotes: SecureNoteDecrypted[]): void {
  decryptedSecureNotes = [...secureNotes];
}

/**
 * Get decrypted credentials from memory
 * @returns Array of decrypted credentials
 */
export function getCredentialsFromMemory(): CredentialDecrypted[] {
  return [...decryptedCredentials];
}

/**
 * Get decrypted bank cards from memory
 * @returns Array of decrypted bank cards
 */
export function getBankCardsFromMemory(): BankCardDecrypted[] {
  return [...decryptedBankCards];
}

/**
 * Get decrypted secure notes from memory
 * @returns Array of decrypted secure notes
 */
export function getSecureNotesFromMemory(): SecureNoteDecrypted[] {
  return [...decryptedSecureNotes];
}

/**
 * Clear all decrypted data from memory
 */
export function clearMemory(): void {
  decryptedCredentials = [];
  decryptedBankCards = [];
  decryptedSecureNotes = [];
}

/**
 * Get all decrypted items from memory
 * @returns Object with all decrypted items
 */
export function getAllItemsFromMemory(): {
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
} {
  return {
    credentials: getCredentialsFromMemory(),
    bankCards: getBankCardsFromMemory(),
    secureNotes: getSecureNotesFromMemory()
  };
} 