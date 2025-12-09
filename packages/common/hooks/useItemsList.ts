import { useState, useEffect, useMemo } from 'react';
import { itemsStateManager } from '../core/services/itemsService';
import { User } from '@common/types/auth.types';
import { ItemDecrypted, CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/types/items.types';

export interface UseItemsListReturn {
  items: ItemDecrypted[];
  credentials: CredentialDecrypted[];
  bankCards: BankCardDecrypted[];
  secureNotes: SecureNoteDecrypted[];
  loading: boolean;
  error: string | null;
  filteredItems: ItemDecrypted[];
  setFilter: (value: string) => void;
  filter: string;
}

export interface UseItemsListProps {
  user: User | null;
}

export const useItemsList = ({ user }: UseItemsListProps): UseItemsListReturn => {
  const [items, setItems] = useState<ItemDecrypted[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const handleItemsChanged = (newItems: ItemDecrypted[]) => {
      setItems(newItems);
      setLoading(false);
      setError(null);
    };
    itemsStateManager.on('itemsChanged', handleItemsChanged);
    const initialItems = itemsStateManager.getItems();
    setItems(initialItems);
    setLoading(false);
    return () => {
      itemsStateManager.off('itemsChanged', handleItemsChanged);
    };
  }, [user]);

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;
    const searchLower = filter.toLowerCase();
    return items.filter(item => {
      if (item.title.toLowerCase().includes(searchLower)) return true;
      if (item.note && item.note.toLowerCase().includes(searchLower)) return true;
      if (item.itemType === 'credential' && 'url' in item) {
        const credential = item as CredentialDecrypted;
        if (credential.url && credential.url.toLowerCase().includes(searchLower)) return true;
        if (credential.username && credential.username.toLowerCase().includes(searchLower)) return true;
      }
      if (item.itemType === 'bank_card' && 'bankName' in item) {
        const bankCard = item as BankCardDecrypted;
        if (bankCard.bankName && bankCard.bankName.toLowerCase().includes(searchLower)) return true;
      }
      return false;
    });
  }, [items, filter]);

  const credentials = useMemo(() => items.filter(i => i.itemType === 'credential') as CredentialDecrypted[], [items]);
  const bankCards = useMemo(() => items.filter(i => i.itemType === 'bank_card') as BankCardDecrypted[], [items]);
  const secureNotes = useMemo(() => items.filter(i => i.itemType === 'secure_note') as SecureNoteDecrypted[], [items]);

  return {
    items,
    credentials,
    bankCards,
    secureNotes,
    loading,
    error,
    filteredItems,
    setFilter,
    filter,
  };
};