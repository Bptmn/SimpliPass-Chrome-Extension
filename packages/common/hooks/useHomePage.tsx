import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItemsFromDatabase } from '../core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useItemStates } from '@common/core/states/itemStates';
import { useCategoryStore } from '@common/core/states/category';
import { useUserStore } from '@common/core/states/user';
import { useToast } from '@common/hooks/useToast';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@common/core/types/types';

/**
 * Hook for HomePage component business logic
 * Handles data loading, filtering, search, and navigation
 */
export const useHomePage = (pageState?: { url?: string }) => {
  const user = useUserStore((state) => state.user);
  const itemStates = useItemStates();
  const { currentCategory: category, setCurrentCategory: setCategory } = useCategoryStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Get items from unified store
  const credentials = itemStates.getItemsByTypeFromState('credential') as CredentialDecrypted[];
  const bankCards = itemStates.getItemsByTypeFromState('bankCard') as BankCardDecrypted[];
  const secureNotes = itemStates.getItemsByTypeFromState('secureNote') as SecureNoteDecrypted[];

  // State management
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<SecureNoteDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load items when user changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (userSecretKey) {
          await getAllItemsFromDatabase();
        }
      } catch {
        setError('Erreur lors du chargement des identifiants.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Filter items by search input based on category
  const getFilteredItems = useCallback(() => {
    const items = category === 'credentials' ? credentials : 
                  category === 'bankCards' ? bankCards : 
                  secureNotes;
    
    return items.filter((item) =>
      item.title?.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [category, credentials, bankCards, secureNotes, filter]);

  // Handle card click for credentials
  const handleCardClick = useCallback((cred: CredentialDecrypted) => {
    setSelected(cred);
  }, []);

  // Handle click on other item types
  const handleOtherItemClick = useCallback((item: unknown) => {
    if (item && typeof item === 'object' && 'id' in item && 'username' in item && 'password' in item) {
      setSelected(item as CredentialDecrypted);
    } else {
      // TODO: handle other item types or log a warning
      console.warn('handleOtherItemClick: item is not a CredentialDecrypted', item);
    }
  }, [setSelected]);

  // Generate suggestions based on current URL
  const getSuggestions = useCallback(() => {
    if (category === 'credentials' && pageState?.url && credentials.length > 0) {
      const domain = pageState.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
      return credentials.filter(
        (cred) => cred.url && cred.url.toLowerCase().includes(domain)
      ).slice(0, 3);
    }
    return [];
  }, [category, credentials, pageState?.url]);

  // Handle copy actions
  const handleCopyCredential = useCallback(() => {
    showToast('Mot de passe copié !');
  }, [showToast]);

  const handleCopyOther = useCallback(() => {
    showToast('Contenu copié !');
  }, [showToast]);

  // Handle add suggestion navigation
  const handleAddSuggestion = useCallback(() => {
    navigate('/add-credential-2', { state: { link: pageState?.url } });
  }, [navigate, pageState?.url]);

  return {
    // State
    user,
    category,
    filter,
    selected,
    selectedBankCard,
    selectedSecureNote,
    error,
    loading,
    
    // Actions
    setFilter,
    setCategory,
    setSelected,
    setSelectedBankCard,
    setSelectedSecureNote,
    
    // Computed values
    getFilteredItems,
    getSuggestions,
    
    // Event handlers
    handleCardClick,
    handleOtherItemClick,
    handleCopyCredential,
    handleCopyOther,
    handleAddSuggestion,
  };
}; 