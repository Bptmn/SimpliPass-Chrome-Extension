/**
 * useAutofill Hook - Layer 1: UI Layer
 * 
 * Provides comprehensive autofill functionality for Chrome extension.
 * Handles autofill suggestions, credential injection, and form interactions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useItems } from './useItems';
import { useCurrentTabDomain } from './useCurrentTabDomain';
import { CredentialDecrypted } from '@common/core/types/items.types';

export interface AutofillData {
  username?: string;
  password?: string;
  url?: string;
}

export interface AutofillSuggestion {
  id: string;
  title: string;
  username?: string;
  url?: string;
  itemType: string;
  matchType: 'exact' | 'partial' | 'domain';
}

export interface UseAutofillReturn {
  // State
  isAutofilling: boolean;
  suggestions: AutofillSuggestion[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  autofillCredential: (credential: CredentialDecrypted) => Promise<void>;
  refreshSuggestions: () => void;
  clearError: () => void;
}

export const useAutofill = (): UseAutofillReturn => {
  // Step 1: Get dependencies
  const { items, loading: itemsLoading, error: itemsError } = useItems();
  const { currentDomain, isLoading: domainLoading, error: domainError } = useCurrentTabDomain();
  
  // Step 2: Initialize state
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [suggestions, setSuggestions] = useState<AutofillSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Step 3: Generate suggestions based on current domain
  const generateSuggestions = useCallback((domain: string | null, vaultItems: CredentialDecrypted[]): AutofillSuggestion[] => {
    if (!domain || !vaultItems.length) {
      return [];
    }

    const domainLower = domain.toLowerCase();
    const suggestionsList: AutofillSuggestion[] = [];

    vaultItems.forEach(item => {
      let matchType: 'exact' | 'partial' | 'domain' | null = null;

      // Check for exact domain match
      if (item.url) {
        try {
          const itemUrl = new URL(item.url);
          const itemDomain = itemUrl.hostname.toLowerCase();
          
          if (itemDomain === domainLower) {
            matchType = 'exact';
          } else if (itemDomain.includes(domainLower) || domainLower.includes(itemDomain)) {
            matchType = 'partial';
          }
        } catch {
          // Invalid URL, skip
        }
      }

      // If no URL match, check if domain is mentioned in title or note
      if (!matchType) {
        const searchText = `${item.title} ${item.note || ''}`.toLowerCase();
        if (searchText.includes(domainLower)) {
          matchType = 'domain';
        }
      }

      if (matchType) {
        suggestionsList.push({
          id: item.id,
          title: item.title,
          username: item.username,
          url: item.url,
          itemType: item.itemType,
          matchType,
        });
      }
    });

    // Sort by match type priority: exact > partial > domain
    return suggestionsList.sort((a, b) => {
      const priority = { exact: 3, partial: 2, domain: 1 };
      return priority[b.matchType] - priority[a.matchType];
    });
  }, []);

  // Step 4: Update suggestions when domain or items change
  useEffect(() => {
    const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
    const newSuggestions = generateSuggestions(currentDomain, credentials);
    setSuggestions(newSuggestions);
  }, [currentDomain, items, generateSuggestions]);

  // Step 5: Autofill credential function
  const autofillCredential = useCallback(async (credential: CredentialDecrypted) => {
    try {
      setIsAutofilling(true);
      setError(null);

      // Check if we're in a Chrome extension environment
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Not in Chrome extension environment');
      }

      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Prepare autofill data
      const autofillData: AutofillData = {
        username: credential.username,
        password: credential.password,
        url: credential.url,
      };

      // Send message to content script to perform autofill
      await chrome.tabs.sendMessage(tab.id, {
        type: 'AUTOFILL_CREDENTIAL',
        data: autofillData,
      });

      console.log('[useAutofill] Autofill successful for credential:', credential.title);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to autofill credential';
      setError(errorMessage);
      console.error('[useAutofill] Failed to autofill credential:', err);
    } finally {
      setIsAutofilling(false);
    }
  }, []);

  // Step 6: Refresh suggestions function
  const refreshSuggestions = useCallback(() => {
    const credentials = items.filter(item => item.itemType === 'credential') as CredentialDecrypted[];
    const newSuggestions = generateSuggestions(currentDomain, credentials);
    setSuggestions(newSuggestions);
  }, [currentDomain, items, generateSuggestions]);

  // Step 7: Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Step 8: Handle loading and error states
  const isLoading = itemsLoading || domainLoading;
  const currentError = error || itemsError || domainError;

  return {
    // State
    isAutofilling,
    suggestions,
    isLoading,
    error: currentError,
    
    // Actions
    autofillCredential,
    refreshSuggestions,
    clearError,
  };
}; 