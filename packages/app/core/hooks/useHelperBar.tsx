import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshItems } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUserStore } from '@app/core/states/user';
import { useCategoryStore } from '@app/core/states';

/**
 * Hook for HelperBar component business logic
 * Handles navigation, refresh functionality, and dynamic button text
 */
export const useHelperBar = () => {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.user);
  const { currentCategory } = useCategoryStore();

  // Handler for the add button, dynamic by category
  const handleAdd = useCallback(() => {
    if (currentCategory === 'credentials') {
      navigate('/add-credential-1');
    } else if (currentCategory === 'bankCards') {
      navigate('/add-card-1');
    } else if (currentCategory === 'secureNotes') {
      navigate('/add-securenote');
    }
  }, [navigate, currentCategory]);

  // Dynamic button text based on category
  const addButtonText = useCallback(() => {
    switch (currentCategory) {
      case 'credentials':
        return 'Ajouter un identifiant';
      case 'bankCards':
        return 'Ajouter une carte';
      case 'secureNotes':
        return 'Ajouter une note';
      default:
        return 'Ajouter';
    }
  }, [currentCategory]);

  // Handler for the FAQ button
  const handleFAQ = useCallback(() => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  }, []);

  // Handler for the refresh button (uses business logic)
  const handleRefresh = useCallback(async () => {
    if (currentUser) {
      const userSecretKey = await getUserSecretKey();
      if (userSecretKey) {
        await refreshItems(currentUser.uid, userSecretKey);
        await reloadBrowserPlatform();
      }
    } else {
      console.log('No user logged in, cannot refresh cache');
    }
  }, [currentUser]);

  return {
    currentCategory,
    addButtonText: addButtonText(),
    handleAdd,
    handleFAQ,
    handleRefresh,
  };
};

// Platform-specific reloadBrowser
async function reloadBrowserPlatform(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Mobile: no-op or implement as needed
    return;
  } else if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Extension: reload current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.reload(tab.id);
    }
  } else {
    throw new Error('Unsupported platform');
  }
} 