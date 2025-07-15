/**
 * Credentials State Management
 * 
 * Centralized state management for credentials using Zustand.
 * Follows the single source of truth principle - all UI data comes from this state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CredentialDecrypted, SearchState } from '@common/core/types/types';

interface CredentialsStore {
  credentials: CredentialDecrypted[];
  searchState: SearchState;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCredentials: (credentials: CredentialDecrypted[]) => void;
  addCredential: (credential: CredentialDecrypted) => void;
  updateCredential: (id: string, updates: Partial<CredentialDecrypted>) => void;
  deleteCredential: (id: string) => void;
  setSearchState: (searchState: SearchState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getFilteredCredentials: () => CredentialDecrypted[];
  getCredentialById: (id: string) => CredentialDecrypted | null;
  getCredentialsByCategory: (category: string) => CredentialDecrypted[];
  getFavoriteCredentials: () => CredentialDecrypted[];
}

export const useCredentialsStore = create<CredentialsStore>()(
  devtools(
    (set, get) => ({
      credentials: [],
      searchState: {
        query: '',
        filters: {},
        sortBy: 'title',
      },
      isLoading: false,
      error: null,

      // ===== Actions =====

      setCredentials: (credentials) => {
        set({ credentials });
      },

      addCredential: (credential) => {
        set((state) => ({
          credentials: [...state.credentials, credential],
        }));
      },

      updateCredential: (id, updates) => {
        set((state) => ({
          credentials: state.credentials.map((credential) =>
            credential.id === id ? { ...credential, ...updates } : credential
          ),
        }));
      },

      deleteCredential: (id) => {
        set((state) => ({
          credentials: state.credentials.filter((credential) => credential.id !== id),
        }));
      },

      setSearchState: (searchState) => {
        set({ searchState });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // ===== Computed =====

      getFilteredCredentials: () => {
        const { credentials, searchState } = get();
        let filtered = credentials;

        // Filter by search query
        if (searchState.query) {
          const query = searchState.query.toLowerCase();
          filtered = filtered.filter((credential) =>
            credential.title.toLowerCase().includes(query) ||
            credential.username.toLowerCase().includes(query) ||
            credential.url.toLowerCase().includes(query) ||
            (credential.note && credential.note.toLowerCase().includes(query))
          );
        }

        // Filter by type
        if (searchState.filters.type) {
          filtered = filtered.filter((credential) => credential.itemType === searchState.filters.type);
        }

        // Filter by tags (if tags exist in the future)
        if (searchState.filters.tags && searchState.filters.tags.length > 0) {
          // For now, skip tag filtering since tags don't exist in the current type
          // filtered = filtered.filter((credential) =>
          //   searchState.filters.tags.some((tag) => credential.tags.includes(tag))
          // );
        }

        // Filter by date range
        if (searchState.filters.dateRange) {
          const { start, end } = searchState.filters.dateRange;
          filtered = filtered.filter((credential) => {
            const createdAt = credential.createdDateTime;
            return createdAt >= start && createdAt <= end;
          });
        }

        // Filter by favorites (if isFavorite exists in the future)
        if (searchState.filters.isFavorite) {
          // For now, skip favorite filtering since isFavorite doesn't exist in the current type
          // filtered = filtered.filter((credential) => credential.isFavorite);
        }

        // Sort results
        switch (searchState.sortBy) {
          case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'createdAt':
            filtered.sort((a, b) => b.createdDateTime.getTime() - a.createdDateTime.getTime());
            break;
          case 'updatedAt':
            filtered.sort((a, b) => b.lastUseDateTime.getTime() - a.lastUseDateTime.getTime());
            break;
          case 'lastUsed':
            // For now, use updatedAt as lastUsed since lastUsed doesn't exist
            filtered.sort((a, b) => b.lastUseDateTime.getTime() - a.lastUseDateTime.getTime());
            break;
          default:
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
      },

      getCredentialById: (id) => {
        const { credentials } = get();
        return credentials.find((credential) => credential.id === id) || null;
      },

      getCredentialsByCategory: (_category) => {
        const { credentials } = get();
        // For now, return all credentials since category doesn't exist in the current type
        return credentials;
      },

      getFavoriteCredentials: () => {
        // For now, return empty array since isFavorite doesn't exist in the current type
        return [];
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
export const useIsLoading = () => useCredentialsStore((state) => state.isLoading);
export const useError = () => useCredentialsStore((state) => state.error);

// ===== Actions =====

export const useCredentialsActions = () => useCredentialsStore((state) => ({
  setCredentials: state.setCredentials,
  addCredential: state.addCredential,
  updateCredential: state.updateCredential,
  deleteCredential: state.deleteCredential,
}));

export const useSearchActions = () => useCredentialsStore((state) => ({
  setSearchState: state.setSearchState,
}));

export const useUIActions = () => useCredentialsStore((state) => ({
  setLoading: state.setLoading,
  setError: state.setError,
})); 