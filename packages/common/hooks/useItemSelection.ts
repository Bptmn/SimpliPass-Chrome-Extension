import { useState } from 'react';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/types/items.types';

export const useItemSelection = () => {
  const [selectedCredential, setSelectedCredential] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);

  return {
    selectedCredential,
    setSelectedCredential,
    selectedBankCard,
    setSelectedBankCard,
    selectedSecureNote,
    setSelectedSecureNote,
  };
};