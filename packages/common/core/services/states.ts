/**
 * States Service - Layer 2: Business Logic
 * 
 * Handles state synchronization and data flow between services and UI.
 * Manages the conversion between unified types and state types.
 */

import { useAuthStore } from '../states/auth';
import { useItemStates } from '../states/itemStates';
import { useUserStore } from '../states/user';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted, ItemDecrypted } from '../types/items.types';

// ===== State Management Functions =====

export async function setDataInStates(data: {
  credentials?: CredentialDecrypted[];
  bankCards?: BankCardDecrypted[];
  secureNotes?: SecureNoteDecrypted[];
  user?: any;
  auth?: any;
}): Promise<void> {
  try {
    // Combine all items into unified state
    const allItems: ItemDecrypted[] = [
      ...(data.credentials || []),
      ...(data.bankCards || []),
      ...(data.secureNotes || [])
    ];
    
    // Set items in unified state
    useItemStates.getState().setItemsInState(allItems);

    // Set user data
    if (data.user) {
      useUserStore.getState().setUser(data.user);
    }

    // Set auth data
    if (data.auth) {
      useUserStore.getState().setUser(data.user);
      useAuthStore.getState().setSession(data.auth.session);
    }

    console.log('[States] Data synchronized successfully');
  } catch (error) {
    console.error('[States] Failed to synchronize data:', error);
    throw error;
  }
}

export async function clearAllStates(): Promise<void> {
  try {
    useAuthStore.getState().clearAuth();
    useItemStates.getState().setItemsInState([]);
    useUserStore.getState().setUser(null);
    
    console.log('[States] All states cleared successfully');
  } catch (error) {
    console.error('[States] Failed to clear states:', error);
    throw error;
  }
}

export async function updateItemInStates(
  itemId: string,
  itemType: 'credential' | 'bankCard' | 'secureNote',
  updates: Partial<CredentialDecrypted | BankCardDecrypted | SecureNoteDecrypted>
): Promise<void> {
  try {
    // Update item in unified state
    useItemStates.getState().updateItemInState(itemId, updates as Partial<ItemDecrypted>);
    
    console.log(`[States] Updated ${itemType} ${itemId} successfully`);
  } catch (error) {
    console.error(`[States] Failed to update ${itemType} ${itemId}:`, error);
    throw error;
  }
}

/**
 * Delete an item from the appropriate state
 */
export async function deleteItemFromStates(
  itemId: string,
  itemType: 'credential' | 'bankCard' | 'secureNote'
): Promise<void> {
  try {
    // Delete item from unified state
    useItemStates.getState().deleteItemFromState(itemId);
    
    console.log('[States] Deleted item from states:', itemId, itemType);
  } catch (error) {
    console.error('[States] Failed to delete item from states:', error);
    throw error;
  }
}

/**
 * Set authentication state
 */
export async function setAuthState(user: any): Promise<void> {
  try {
    useUserStore.getState().setUser(user);
    console.log('[States] Auth state set successfully');
  } catch (error) {
    console.error('[States] Failed to set auth state:', error);
    throw error;
  }
}

/**
 * Clear authentication state
 */
export async function clearAuthState(): Promise<void> {
  try {
    useAuthStore.getState().clearAuth();
    console.log('[States] Cleared authentication state');
  } catch (error) {
    console.error('[States] Failed to clear auth state:', error);
    throw error;
  }
}
