import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BankCardDecrypted } from '@common/core/types/items.types';

interface BankCardsStore {
  bankCards: BankCardDecrypted[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBankCards: (bankCards: BankCardDecrypted[]) => void;
  addBankCard: (bankCard: BankCardDecrypted) => void;
  updateBankCard: (id: string, updates: Partial<BankCardDecrypted>) => void;
  deleteBankCard: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getBankCardById: (id: string) => BankCardDecrypted | null;
}

export const useBankCardsStore = create<BankCardsStore>()(
  devtools(
    (set, get) => ({
      bankCards: [],
      isLoading: false,
      error: null,

      // ===== Actions =====

      setBankCards: (bankCards) => {
        set({ bankCards });
      },

      addBankCard: (bankCard) => {
        set((state) => ({
          bankCards: [...state.bankCards, bankCard],
        }));
      },

      updateBankCard: (id, updates) => {
        set((state) => ({
          bankCards: state.bankCards.map((bankCard) =>
            bankCard.id === id ? { ...bankCard, ...updates } : bankCard
          ),
        }));
      },

      deleteBankCard: (id) => {
        set((state) => ({
          bankCards: state.bankCards.filter((bankCard) => bankCard.id !== id),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // ===== Computed =====

      getBankCardById: (id) => {
        const { bankCards } = get();
        return bankCards.find((bankCard) => bankCard.id === id) || null;
      },
    }),
    {
      name: 'bank-cards-store',
    }
  )
); 