/**
 * useItemSearch Hook - Layer 1: UI Layer
 * 
 * Item search functionality with error handling:
 * - Search value state management
 * - Search validation
 * - Error handling and propagation
 * 
 * Pure UI state management only.
 */

import { useState, useCallback } from 'react';

export interface UseItemSearchReturn {
  // State
  searchValue: string;
  isSearching: boolean;
  error: string | null;
  
  // Actions
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
  validateSearch: (value: string) => boolean;
  clearError: () => void;
}

export interface UseItemSearchProps {
  initialValue?: string;
  maxLength?: number;
}

export const useItemSearch = ({ 
  initialValue = '', 
  maxLength = 100 
}: UseItemSearchProps = {}): UseItemSearchReturn => {
  const [searchValue, setSearchValueState] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Set search value with validation
  const setSearchValue = useCallback((value: string) => {
    try {
      // Validate search input
      if (value.length > maxLength) {
        throw new Error(`Search term too long (max ${maxLength} characters)`);
      }

      // Check for invalid characters
      if (/[<>{}]/.test(value)) {
        throw new Error('Search term contains invalid characters');
      }

      setSearchValueState(value);
      setError(null);
      setIsSearching(value.length > 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid search term';
      setError(errorMessage);
      console.error('[useItemSearch] Search validation failed:', err);
      // ✅ Propagate error to ErrorBoundary
      throw new Error(errorMessage);
    }
  }, [maxLength]);

  // ✅ Clear search
  const clearSearch = useCallback(() => {
    setSearchValueState('');
    setError(null);
    setIsSearching(false);
  }, []);

  // ✅ Validate search input
  const validateSearch = useCallback((value: string): boolean => {
    try {
      if (value.length > maxLength) {
        return false;
      }

      if (/[<>{}]/.test(value)) {
        return false;
      }

      return true;
    } catch (err) {
      console.error('[useItemSearch] Search validation failed:', err);
      return false;
    }
  }, [maxLength]);

  // ✅ Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchValue,
    isSearching,
    error,
    setSearchValue,
    clearSearch,
    validateSearch,
    clearError,
  };
}; 