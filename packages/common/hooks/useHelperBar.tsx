import { useCallback } from 'react';
import { ROUTES, type AppRoute } from '@common/ui/router/ROUTES';

/**
 * Hook for HelperBar component UI state management
 * Handles button text based on current page only
 * User interactions should be handled in the component
 */
export const useHelperBar = (currentPage: AppRoute = ROUTES.HOME) => {
  // Step 1: Get add button text based on current page
  const getAddButtonText = useCallback(() => {
    switch (currentPage) {
      case ROUTES.ADD_CARD_1:
      case ROUTES.ADD_CARD_2:
        return 'Ajouter une carte';
      case ROUTES.ADD_SECURENOTE:
        return 'Ajouter une note';
      case ROUTES.ADD_CREDENTIAL_1:
      case ROUTES.ADD_CREDENTIAL_2:
      case ROUTES.HOME:
      case ROUTES.GENERATOR:
      case ROUTES.SETTINGS:
      default:
        return 'Ajouter un identifiant';
    }
  }, [currentPage]);

  const addButtonText = getAddButtonText();

  return {
    addButtonText,
  };
}; 