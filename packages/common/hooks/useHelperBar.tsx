import { useCallback } from 'react';

type CurrentPage = 'home' | 'generator' | 'settings' | 'add-credential-1' | 'add-credential-2' | 'add-card-1' | 'add-card-2' | 'add-securenote';

/**
 * Hook for HelperBar component UI state management
 * Handles button text based on current page only
 * User interactions should be handled in the component
 */
export const useHelperBar = (currentPage: CurrentPage = 'home') => {
  // Step 1: Get add button text based on current page
  const getAddButtonText = useCallback(() => {
    switch (currentPage) {
      case 'add-card-1':
      case 'add-card-2':
        return 'Ajouter une carte';
      case 'add-securenote':
        return 'Ajouter une note';
      case 'add-credential-1':
      case 'add-credential-2':
      case 'home':
      case 'generator':
      case 'settings':
      default:
        return 'Ajouter un identifiant';
    }
  }, [currentPage]);

  const addButtonText = getAddButtonText();

  return {
    addButtonText,
  };
}; 