import { create } from 'zustand';
import { BankCardDecrypted } from '@app/core/types/types';

interface BankCardsStore {
  bankCards: BankCardDecrypted[];
  setBankCards: (data: BankCardDecrypted[]) => void;
  addBankCard: (item: BankCardDecrypted) => void;
  updateBankCard: (item: BankCardDecrypted) => void;
  removeBankCard: (id: string) => void;
}

export const useBankCardsStore = create<BankCardsStore>((set) => ({
  bankCards: [],

  setBankCards: (data) => set({ bankCards: data }),

  addBankCard: (item) =>
    set((state) => ({
      bankCards: [...state.bankCards, item],
    })),

  updateBankCard: (updated) =>
    set((state) => ({
      bankCards: state.bankCards.map((c) =>
        c.id === updated.id ? updated : c
      ),
    })),

  removeBankCard: (id) =>
    set((state) => ({
      bankCards: state.bankCards.filter((c) => c.id !== id),
    })),
})); 