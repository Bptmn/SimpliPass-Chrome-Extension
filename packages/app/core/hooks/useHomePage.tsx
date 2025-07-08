import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore, useCategoryStore } from '@app/core/states';
import { useUserStore } from '@app/core/states/user';
import { useToast } from '@app/core/hooks';
import { CredentialDecrypted } from '@app/core/types/types';

/**
 * Hook for HomePage component business logic
 * Handles data loading, filtering, search, and navigation
 */
export const useHomePage = (pageState?: { url?: string }) => {
  const user = useUserStore((state) => state.user);
  const { credentials } = useCredentialsStore();
  const { bankCards } = useBankCardsStore();
  const { secureNotes } = useSecureNotesStore();
  const { currentCategory: category, setCurrentCategory: setCategory } = useCategoryStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State management
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<any | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = useState<any | null>(null);
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
          await getAllItems(user.uid, userSecretKey);
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
  const handleOtherItemClick = useCallback((item: any) => {
    console.log('Item clicked:', item);
    // TODO: Implement detail pages for bank cards and secure notes
  }, []);

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
    credentials,
    bankCards,
    secureNotes,
    
    // Actions
    setFilter,
    setCategory,
    setSelected,
    setSelectedBankCard,
    setSelectedSecureNote,
    setError,
    
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