import { create } from 'zustand';
import { User } from '@app/core/types/types';

interface UserStore {
  user: User | null;
  setUser: (data: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (data) => set({ user: data }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () => set({ user: null }),
})); 