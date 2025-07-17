/**
 * Unified Items State Management
 * 
 * Single state store for all item types with type-agnostic operations.
 * Simplified architecture for better maintainability.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ItemDecrypted } from '../types/items.types';

interface ItemStates {
  // Data - single array of all items
  items: ItemDecrypted[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Generic Actions
  setItemsInState: (items: ItemDecrypted[]) => void;
  addItemToState: (item: ItemDecrypted) => void;
  updateItemInState: (id: string, updates: Partial<ItemDecrypted>) => void;
  deleteItemFromState: (id: string) => void;
  
  // UI State Actions
  setLoadingState: (loading: boolean) => void;
  setErrorState: (error: string | null) => void;
  clearErrorState: () => void;
  
  // Computed
  getAllItemsFromState: () => ItemDecrypted[];
  getItemByIdFromState: (id: string) => ItemDecrypted | null;
  getItemsByTypeFromState: (type: 'credential' | 'bankCard' | 'secureNote') => ItemDecrypted[];
}

export const useItemStates = create<ItemStates>()(
  devtools(
    (set, get) => ({
      // ===== Data =====
      items: [] as ItemDecrypted[],
      
      // ===== UI State =====
      isLoading: false,
      error: null,

      // ===== Generic Actions =====

      setItemsInState: (items: ItemDecrypted[]) => set({ items }),

      addItemToState: (item: ItemDecrypted) => 
        set((state) => {
          const newItems = [...state.items, item] as ItemDecrypted[];
          return { items: newItems };
        }),

      updateItemInState: (id: string, updates: Partial<ItemDecrypted>) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } as ItemDecrypted : item
          ),
        })),

      deleteItemFromState: (id: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // ===== UI State Actions =====
      setLoadingState: (loading: boolean) => set({ isLoading: loading }),
      setErrorState: (error: string | null) => set({ error }),
      clearErrorState: () => set({ error: null }),

      // ===== Computed =====

      getAllItemsFromState: () => {
        const { items } = get();
        return items;
      },

      getItemByIdFromState: (id: string) => {
        const { items } = get();
        return items.find(item => item.id === id) || null;
      },

      getItemsByTypeFromState: (type: 'credential' | 'bankCard' | 'secureNote') => {
        const { items } = get();
        return items.filter(item => item.itemType === type);
      },
    }),
    {
      name: 'item-states',
    }
  )
); 