import { useCallback } from 'react';
import { useAutofillSuggestions } from './useAutofillSuggestions';
import { useAutofillInjection } from './useAutofillInjection';
import { useItemsList } from './useItemsList';
import { useCurrentTabDomain } from './useCurrentTabDomain';
import { useAppStateStore } from './useAppState';
// Removed unused import

export const useAutofillState = () => {
  const user = useAppStateStore(state => state.user);
  const { credentials } = useItemsList({ user });
  const { currentDomain } = useCurrentTabDomain();
  const suggestions = useAutofillSuggestions(currentDomain, credentials);
  const { isAutofilling, error, autofillCredential } = useAutofillInjection();

  const refreshSuggestions = useCallback(() => {
    // Suggestions are automatically refreshed when domain or credentials change
    console.log('[useAutofillState] Refreshing suggestions');
  }, []);

  const clearError = useCallback(() => {
    // Error is managed by useAutofillInjection
    console.log('[useAutofillState] Clearing error');
  }, []);

  return {
    suggestions,
    isAutofilling,
    error,
    autofillCredential,
    refreshSuggestions,
    clearError,
  };
}; 