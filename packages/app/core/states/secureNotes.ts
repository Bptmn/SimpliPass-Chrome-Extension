import { create } from 'zustand';
import { SecureNoteDecrypted } from '@app/core/types/types';

interface SecureNotesStore {
  secureNotes: SecureNoteDecrypted[];
  setSecureNotes: (data: SecureNoteDecrypted[]) => void;
  addSecureNote: (item: SecureNoteDecrypted) => void;
  updateSecureNote: (item: SecureNoteDecrypted) => void;
  removeSecureNote: (id: string) => void;
}

export const useSecureNotesStore = create<SecureNotesStore>((set) => ({
  secureNotes: [],

  setSecureNotes: (data) => set({ secureNotes: data }),

  addSecureNote: (item) =>
    set((state) => ({
      secureNotes: [...state.secureNotes, item],
    })),

  updateSecureNote: (updated) =>
    set((state) => ({
      secureNotes: state.secureNotes.map((c) =>
        c.id === updated.id ? updated : c
      ),
    })),

  removeSecureNote: (id) =>
    set((state) => ({
      secureNotes: state.secureNotes.filter((c) => c.id !== id),
    })),
})); 