import { create } from 'zustand';
import { CredentialDecrypted } from '@common/core/types/types';

interface CredentialsStore {
  credentials: CredentialDecrypted[];
  setCredentials: (data: CredentialDecrypted[]) => void;
  addCredential: (item: CredentialDecrypted) => void;
  updateCredential: (item: CredentialDecrypted) => void;
  removeCredential: (id: string) => void;
}

export const useCredentialsStore = create<CredentialsStore>((set) => ({
  credentials: [],

  setCredentials: (data) => set({ credentials: data }),

  addCredential: (item) =>
    set((state) => ({
      credentials: [...state.credentials, item],
    })),

  updateCredential: (updated) =>
    set((state) => ({
      credentials: state.credentials.map((c) =>
        c.id === updated.id ? updated : c
      ),
    })),

  removeCredential: (id) =>
    set((state) => ({
      credentials: state.credentials.filter((c) => c.id !== id),
    })),
})); 