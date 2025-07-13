/**
 * Credentials State Management
 * 
 * Centralized state management for credentials using Zustand.
 * Follows the single source of truth principle - all UI data comes from this state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CredentialDecrypted, SearchState, SortOptions } from '../types/shared.types';

interface CredentialsState {
  // Data
  credentials: CredentialDecrypted[];
  searchState: SearchState;
  sortOptions: SortOptions;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  setCredentials: (credentials: CredentialDecrypted[]) => void;
  addCredential: (credential: CredentialDecrypted) => void;
  updateCredential: (id: string, updates: Partial<CredentialDecrypted>) => void;
  deleteCredential: (id: string) => void;
  clearCredentials: () => void;
  
  // Search & Filter Actions
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchState['filters']) => void;
  setSortOptions: (sort: SortOptions) => void;
  clearSearch: () => void;
  
  // Loading & Error Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Complex Actions
  loadCredentials: () => Promise<void>;
  saveCredential: (credential: Omit<CredentialDecrypted, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCredentialById: (id: string) => Promise<void>;
  searchCredentials: (query: string) => Promise<void>;
  
  // Computed State
  getFilteredCredentials: () => CredentialDecrypted[];
  getCredentialById: (id: string) => CredentialDecrypted | null;
  getCredentialsByCategory: (category: string) => CredentialDecrypted[];
  getFavoriteCredentials: () => CredentialDecrypted[];
  getTotalCount: () => number;
  getFilteredCount: () => number;
}

export const useCredentialsStore = create<CredentialsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      credentials: [],
      searchState: {
        query: '',
        filters: {
          category: null,
          tags: [],
          favorites: false,
          type: 'all',
        },
        results: {
          credentials: [],
          bankCards: [],
          secureNotes: [],
        },
      },
      sortOptions: {
        field: 'title',
        direction: 'asc',
      },
      isLoading: false,
      error: null,
      lastUpdated: null,

      // ===== Basic Actions =====

      setCredentials: (credentials: CredentialDecrypted[]) => {
        set({ credentials, lastUpdated: new Date() });
      },

      addCredential: (credential: CredentialDecrypted) => {
        set((state) => ({
          credentials: [...state.credentials, credential],
          lastUpdated: new Date(),
        }));
      },

      updateCredential: (id: string, updates: Partial<CredentialDecrypted>) => {
        set((state) => ({
          credentials: state.credentials.map((credential) =>
            credential.id === id
              ? { ...credential, ...updates, updatedAt: new Date() }
              : credential
          ),
          lastUpdated: new Date(),
        }));
      },

      deleteCredential: (id: string) => {
        set((state) => ({
          credentials: state.credentials.filter((credential) => credential.id !== id),
          lastUpdated: new Date(),
        }));
      },

      clearCredentials: () => {
        set({ credentials: [], lastUpdated: new Date() });
      },

      // ===== Search & Filter Actions =====

      setSearchQuery: (query: string) => {
        set((state) => ({
          searchState: {
            ...state.searchState,
            query,
          },
        }));
      },

      setSearchFilters: (filters: SearchState['filters']) => {
        set((state) => ({
          searchState: {
            ...state.searchState,
            filters,
          },
        }));
      },

      setSortOptions: (sort: SortOptions) => {
        set({ sortOptions: sort });
      },

      clearSearch: () => {
        set((state) => ({
          searchState: {
            query: '',
            filters: {
              category: null,
              tags: [],
              favorites: false,
              type: 'all',
            },
            results: {
              credentials: [],
              bankCards: [],
              secureNotes: [],
            },
          },
        }));
      },

      // ===== Loading & Error Actions =====

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // ===== Complex Actions =====

      loadCredentials: async () => {
        const { setLoading, setError, setCredentials } = get();
        
        try {
          setLoading(true);
          setError(null);

          // TODO: Implement credentials loading logic
          // For now, just clear any existing error
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to load credentials');
        } finally {
          setLoading(false);
        }
      },

      saveCredential: async (credentialData) => {
        const { setLoading, setError, addCredential } = get();
        
        try {
          setLoading(true);
          setError(null);

          // TODO: Implement credential creation logic
          // For now, just clear any existing error
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to save credential');
        } finally {
          setLoading(false);
        }
      },

      deleteCredentialById: async (id: string) => {
        const { setLoading, setError, deleteCredential } = get();
        
        try {
          setLoading(true);
          setError(null);

          // TODO: Implement credential deletion logic
          // For now, just clear any existing error
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to delete credential');
        } finally {
          setLoading(false);
        }
      },

      searchCredentials: async (query: string) => {
        const { setLoading, setError, setSearchQuery } = get();
        
        try {
          setLoading(true);
          setError(null);

          setSearchQuery(query);

          // TODO: Implement credential search logic
          // For now, just clear any existing error
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Search failed');
        } finally {
          setLoading(false);
        }
      },

      // ===== Computed State =====

      getFilteredCredentials: () => {
        const { credentials, searchState, sortOptions } = get();
        
        let filtered = credentials;

        // Apply search query
        if (searchState.query) {
          const query = searchState.query.toLowerCase();
          filtered = filtered.filter((credential) =>
            credential.title.toLowerCase().includes(query) ||
            credential.username.toLowerCase().includes(query) ||
            credential.url.toLowerCase().includes(query) ||
            credential.notes?.toLowerCase().includes(query)
          );
        }

        // Apply category filter
        if (searchState.filters.category) {
          filtered = filtered.filter((credential) =>
            credential.category === searchState.filters.category
          );
        }

        // Apply tags filter
        if (searchState.filters.tags.length > 0) {
          filtered = filtered.filter((credential) =>
            searchState.filters.tags.some((tag) => credential.tags.includes(tag))
          );
        }

        // Apply favorites filter
        if (searchState.filters.favorites) {
          filtered = filtered.filter((credential) => credential.isFavorite);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[sortOptions.field as keyof CredentialDecrypted];
          const bValue = b[sortOptions.field as keyof CredentialDecrypted];
          
          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return 1;
          if (bValue === undefined) return -1;
          
          if (sortOptions.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });

        return filtered;
      },

      getCredentialById: (id: string) => {
        const { credentials } = get();
        return credentials.find((credential) => credential.id === id) || null;
      },

      getCredentialsByCategory: (category: string) => {
        const { credentials } = get();
        return credentials.filter((credential) => credential.category === category);
      },

      getFavoriteCredentials: () => {
        const { credentials } = get();
        return credentials.filter((credential) => credential.isFavorite);
      },

      getTotalCount: () => {
        const { credentials } = get();
        return credentials.length;
      },

      getFilteredCount: () => {
        const { getFilteredCredentials } = get();
        return getFilteredCredentials().length;
      },
    }),
    {
      name: 'credentials-store',
    }
  )
);

// ===== Selectors =====

export const useCredentials = () => useCredentialsStore((state) => state.credentials);
export const useFilteredCredentials = () => useCredentialsStore((state) => state.getFilteredCredentials());
export const useSearchState = () => useCredentialsStore((state) => state.searchState);
export const useSortOptions = () => useCredentialsStore((state) => state.sortOptions);
export const useIsLoading = () => useCredentialsStore((state) => state.isLoading);
export const useError = () => useCredentialsStore((state) => state.error);
export const useLastUpdated = () => useCredentialsStore((state) => state.lastUpdated);

export const useTotalCount = () => useCredentialsStore((state) => state.getTotalCount());
export const useFilteredCount = () => useCredentialsStore((state) => state.getFilteredCount());

// ===== Actions =====

export const useCredentialsActions = () => useCredentialsStore((state) => ({
  setCredentials: state.setCredentials,
  addCredential: state.addCredential,
  updateCredential: state.updateCredential,
  deleteCredential: state.deleteCredential,
  clearCredentials: state.clearCredentials,
  loadCredentials: state.loadCredentials,
  saveCredential: state.saveCredential,
  deleteCredentialById: state.deleteCredentialById,
  searchCredentials: state.searchCredentials,
}));

export const useSearchActions = () => useCredentialsStore((state) => ({
  setSearchQuery: state.setSearchQuery,
  setSearchFilters: state.setSearchFilters,
  setSortOptions: state.setSortOptions,
  clearSearch: state.clearSearch,
}));

export const useUIActions = () => useCredentialsStore((state) => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
})); 