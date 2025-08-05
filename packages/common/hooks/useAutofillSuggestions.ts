import { useMemo } from 'react';
import { CredentialDecrypted } from '../core/types/items.types';

export interface AutofillSuggestion {
  id: string;
  title: string;
  username?: string;
  url?: string;
  itemType: string;
  matchType: 'exact' | 'partial' | 'domain';
}

export const useAutofillSuggestions = (domain: string | null, vaultItems: CredentialDecrypted[]) => {
  const suggestions = useMemo(() => {
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
  }, [domain, vaultItems]);

  return suggestions;
}; 