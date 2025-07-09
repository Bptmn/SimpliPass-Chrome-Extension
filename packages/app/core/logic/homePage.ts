import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@app/core/types/types';

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

export function handleOtherItemClick(item: ItemType) {
  console.log('Item clicked:', item);
  // TODO: Implement detail pages for bank cards and secure notes
}

export function getSuggestions(credentials: CredentialDecrypted[], url: string) {
  if (!url || credentials.length === 0) return [];
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
  return credentials.filter(
    (cred) => cred.url && cred.url.toLowerCase().includes(domain)
  ).slice(0, 3);
} 