// ===== Session Memory Management for Extension =====
// In-memory storage for extension session data

import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/items.types';

// ===== In-Memory Storage =====

let credentialsInMemory: CredentialDecrypted[] = [];
let bankCardsInMemory: BankCardDecrypted[] = [];
let secureNotesInMemory: SecureNoteDecrypted[] = [];

// ===== Credentials Management =====

export function setCredentialsInMemory(credentials: CredentialDecrypted[]): void {
  credentialsInMemory = [...credentials];
  console.log('[Extension Memory] Credentials set in memory:', credentials.length);
}

export function getCredentialsInMemory(): CredentialDecrypted[] {
  return [...credentialsInMemory];
}

export function addCredentialInMemory(credential: CredentialDecrypted): void {
  credentialsInMemory.push(credential);
  console.log('[Extension Memory] Credential added to memory:', credential.id);
}

export function updateCredentialInMemory(id: string, updates: Partial<CredentialDecrypted>): void {
  const index = credentialsInMemory.findIndex(c => c.id === id);
  if (index !== -1) {
    credentialsInMemory[index] = { ...credentialsInMemory[index], ...updates };
    console.log('[Extension Memory] Credential updated in memory:', id);
  }
}

export function deleteCredentialInMemory(id: string): void {
  credentialsInMemory = credentialsInMemory.filter(c => c.id !== id);
  console.log('[Extension Memory] Credential deleted from memory:', id);
}

// ===== Bank Cards Management =====

export function setBankCardsInMemory(bankCards: BankCardDecrypted[]): void {
  bankCardsInMemory = [...bankCards];
  console.log('[Extension Memory] Bank cards set in memory:', bankCards.length);
}

export function getBankCardsInMemory(): BankCardDecrypted[] {
  return [...bankCardsInMemory];
}

export function addBankCardInMemory(bankCard: BankCardDecrypted): void {
  bankCardsInMemory.push(bankCard);
  console.log('[Extension Memory] Bank card added to memory:', bankCard.id);
}

export function updateBankCardInMemory(id: string, updates: Partial<BankCardDecrypted>): void {
  const index = bankCardsInMemory.findIndex(c => c.id === id);
  if (index !== -1) {
    bankCardsInMemory[index] = { ...bankCardsInMemory[index], ...updates };
    console.log('[Extension Memory] Bank card updated in memory:', id);
  }
}

export function deleteBankCardInMemory(id: string): void {
  bankCardsInMemory = bankCardsInMemory.filter(c => c.id !== id);
  console.log('[Extension Memory] Bank card deleted from memory:', id);
}

// ===== Secure Notes Management =====

export function setSecureNotesInMemory(secureNotes: SecureNoteDecrypted[]): void {
  secureNotesInMemory = [...secureNotes];
  console.log('[Extension Memory] Secure notes set in memory:', secureNotes.length);
}

export function getSecureNotesInMemory(): SecureNoteDecrypted[] {
  return [...secureNotesInMemory];
}

export function addSecureNoteInMemory(secureNote: SecureNoteDecrypted): void {
  secureNotesInMemory.push(secureNote);
  console.log('[Extension Memory] Secure note added to memory:', secureNote.id);
}

export function updateSecureNoteInMemory(id: string, updates: Partial<SecureNoteDecrypted>): void {
  const index = secureNotesInMemory.findIndex(n => n.id === id);
  if (index !== -1) {
    secureNotesInMemory[index] = { ...secureNotesInMemory[index], ...updates };
    console.log('[Extension Memory] Secure note updated in memory:', id);
  }
}

export function deleteSecureNoteInMemory(id: string): void {
  secureNotesInMemory = secureNotesInMemory.filter(n => n.id !== id);
  console.log('[Extension Memory] Secure note deleted from memory:', id);
}

// ===== Memory Clearing =====

export function clearAllMemory(): void {
  credentialsInMemory = [];
  bankCardsInMemory = [];
  secureNotesInMemory = [];
  console.log('[Extension Memory] All memory cleared');
}

// ===== Memory Status =====

export function getMemoryStatus(): {
  credentialsCount: number;
  bankCardsCount: number;
  secureNotesCount: number;
} {
  return {
    credentialsCount: credentialsInMemory.length,
    bankCardsCount: bankCardsInMemory.length,
    secureNotesCount: secureNotesInMemory.length,
  };
} 