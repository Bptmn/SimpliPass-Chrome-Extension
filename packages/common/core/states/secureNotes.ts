import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SecureNoteDecrypted } from '@common/core/types/items.types';

interface SecureNotesStore {
  secureNotes: SecureNoteDecrypted[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSecureNotes: (secureNotes: SecureNoteDecrypted[]) => void;
  addSecureNote: (secureNote: SecureNoteDecrypted) => void;
  updateSecureNote: (id: string, updates: Partial<SecureNoteDecrypted>) => void;
  deleteSecureNote: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getSecureNoteById: (id: string) => SecureNoteDecrypted | null;
}

export const useSecureNotesStore = create<SecureNotesStore>()(
  devtools(
    (set, get) => ({
      secureNotes: [],
      isLoading: false,
      error: null,

      // ===== Actions =====

      setSecureNotes: (secureNotes) => {
        set({ secureNotes });
      },

      addSecureNote: (secureNote) => {
        set((state) => ({
          secureNotes: [...state.secureNotes, secureNote],
        }));
      },

      updateSecureNote: (id, updates) => {
        set((state) => ({
          secureNotes: state.secureNotes.map((secureNote) =>
            secureNote.id === id ? { ...secureNote, ...updates } : secureNote
          ),
        }));
      },

      deleteSecureNote: (id) => {
        set((state) => ({
          secureNotes: state.secureNotes.filter((secureNote) => secureNote.id !== id),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // ===== Computed =====

      getSecureNoteById: (id) => {
        const { secureNotes } = get();
        return secureNotes.find((secureNote) => secureNote.id === id) || null;
      },
    }),
    {
      name: 'secure-notes-store',
    }
  )
); 