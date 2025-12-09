import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/types/items.types';

type ItemType = CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted;

export function getFilteredItems(items: ItemType[], filter: string) {
  return items.filter((item) =>
    item.title?.toLowerCase().includes(filter.toLowerCase()),
  );
}

export function handleCardClick(
  cred: CredentialDecrypted,
  setSelected: (cred: CredentialDecrypted | null) => void
) {
  setSelected(cred);
}

export function handleOtherItemClick(
  item: unknown,
  setSelected: (cred: CredentialDecrypted | null) => void
) {
  if (item && typeof item === 'object' && 'id' in item) {
    // Type guard for CredentialDecrypted
    if ('username' in item && 'password' in item) {
      setSelected(item as CredentialDecrypted);
      return;
    }
    
    // Type guard for BankCardDecrypted
    if ('cardNumber' in item && 'owner' in item) {
      console.log('Bank card clicked - navigation to bank card details not implemented yet');
      return;
    }
    
    // Type guard for SecureNoteDecrypted
    if ('note' in item && !('username' in item)) {
      console.log('Secure note clicked - navigation to secure note details not implemented yet');
      return;
    }
    
    // Unknown item type
    console.warn('handleOtherItemClick: unknown item type', item);
  } else {
    console.warn('handleOtherItemClick: invalid item object', item);
  }
}

export function getSuggestions(credentials: CredentialDecrypted[], url: string) {
  if (!url || credentials.length === 0) return [];
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
  return credentials.filter(
    (cred) => cred.url && cred.url.toLowerCase().includes(domain)
  ).slice(0, 3);
}

export function shouldShowLoading(itemsLoading: boolean, itemsLength: number, user: any): boolean {
  return itemsLoading || (itemsLength === 0 && user !== null);
}

export function getItemCounts(items: ItemType[], credentials: CredentialDecrypted[], bankCards: BankCardDecrypted[], secureNotes: SecureNoteDecrypted[]) {
  return {
    total: items.length,
    credentials: credentials.length,
    bankCards: bankCards.length,
    secureNotes: secureNotes.length
  };
} 