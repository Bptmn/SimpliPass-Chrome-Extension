/**
 * States Service - Layer 2: Business Logic
 * 
 * Handles state synchronization and data flow between services and UI.
 * Manages the conversion between unified types and state types.
 */

import { useAuthStore } from '../states/auth.state';
import { useCredentialsStore } from '../states/credentials.state';
import { useBankCardsStore } from '../states/bankCards';
import { useSecureNotesStore } from '../states/secureNotes';
import { useUserStore } from '../states/user';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '../types/items.types';

// ===== State Management Functions =====

export async function setDataInStates(data: {
  credentials?: CredentialDecrypted[];
  bankCards?: BankCardDecrypted[];
  secureNotes?: SecureNoteDecrypted[];
  user?: any;
  auth?: any;
}): Promise<void> {
  try {
    // Set credentials
    if (data.credentials) {
      useCredentialsStore.getState().setCredentials(data.credentials);
    }

    // Set bank cards
    if (data.bankCards) {
      useBankCardsStore.getState().setBankCards(data.bankCards);
    }

    // Set secure notes
    if (data.secureNotes) {
      useSecureNotesStore.getState().setSecureNotes(data.secureNotes);
    }

    // Set user data
    if (data.user) {
      useUserStore.getState().setUser(data.user);
    }

    // Set auth data
    if (data.auth) {
      useUserStore.getState().setUser(data.user);
      useAuthStore.getState().setSession(data.auth.session);
      useAuthStore.getState().setAuthenticated(data.auth.isAuthenticated);
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
    useCredentialsStore.getState().setCredentials([]);
    useBankCardsStore.getState().setBankCards([]);
    useSecureNotesStore.getState().setSecureNotes([]);
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
    switch (itemType) {
      case 'credential': {
        const credentialUpdates = updates as Partial<CredentialDecrypted>;
        useCredentialsStore.getState().updateCredential(itemId, credentialUpdates);
        break;
      }
        
      case 'bankCard': {
        const bankCardUpdates = updates as Partial<BankCardDecrypted>;
        useBankCardsStore.getState().updateBankCard(itemId, bankCardUpdates);
        break;
      }
        
      case 'secureNote': {
        const secureNoteUpdates = updates as Partial<SecureNoteDecrypted>;
        useSecureNotesStore.getState().updateSecureNote(itemId, secureNoteUpdates);
        break;
      }
        
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
    
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
    if (itemType === 'credential') {
      useCredentialsStore.getState().deleteCredential(itemId);
    } else if (itemType === 'bankCard') {
      useBankCardsStore.getState().deleteBankCard(itemId);
    } else if (itemType === 'secureNote') {
      useSecureNotesStore.getState().deleteSecureNote(itemId);
    }
    
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
    useAuthStore.getState().setAuthenticated(true);
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
