// useItems.ts
// This hook provides access to items state and operations.
// Responsibilities:
// - Get all items from state
// - Add, update, delete items
// - Filter and search items

import { useMemo } from 'react';
import { itemsStateManager } from '@common/core/services/itemsService';
import type { ItemDecrypted } from '@common/core/types/items.types';

export interface UseItemsReturn {
  items: ItemDecrypted[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: ItemDecrypted) => void;
  updateItem: (itemId: string, item: ItemDecrypted) => void;
  deleteItem: (itemId: string) => void;
  refreshItems: () => Promise<void>;
}

export const useItems = (): UseItemsReturn => {
  const items = useMemo(() => {
    return itemsStateManager.getItems();
  }, []);

  const isLoading = useMemo(() => {
    return itemsStateManager.isLoading();
  }, []);

  const error = useMemo(() => {
    return itemsStateManager.getError();
  }, []);

  const addItem = (item: ItemDecrypted): void => {
    itemsStateManager.addItem(item);
  };

  const updateItem = (itemId: string, item: ItemDecrypted): void => {
    itemsStateManager.updateItem(itemId, item);
  };

  const deleteItem = (itemId: string): void => {
    itemsStateManager.removeItem(itemId);
  };

  const refreshItems = async (): Promise<void> => {
    // TODO: Implement proper refresh logic that triggers listener re-sync
    // For now, just log that refresh was called
    console.log('Refresh items called - implementation pending');
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}; 