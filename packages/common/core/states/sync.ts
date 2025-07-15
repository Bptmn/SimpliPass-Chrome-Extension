/**
 * State Synchronization Utility
 * 
 * Handles cross-state updates and ensures consistency between different state stores.
 * This is essential for maintaining data integrity across the application.
 */

import { useAuthStore } from './auth.state';
import { useCredentialsStore } from './credentials.state';
import { useBankCardsStore } from './bankCards';
import { useSecureNotesStore } from './secureNotes';
import { useUserStore } from './user';
import { platform } from '../platform';

// ===== Types =====

export interface StateSyncOptions {
  updateCredentials?: boolean;
  updateBankCards?: boolean;
  updateSecureNotes?: boolean;
  updateUser?: boolean;
  updateAuth?: boolean;
}

export interface SyncResult {
  success: boolean;
  errors: string[];
  updatedStates: string[];
}

// ===== State Synchronization =====

/**
 * Synchronizes all state stores with the latest data
 * This ensures consistency across the entire application
 */
export const syncAllStates = async (
  data: {
    credentials?: any[];
    bankCards?: any[];
    secureNotes?: any[];
    user?: any;
    auth?: any;
  },
  options: StateSyncOptions = {}
): Promise<SyncResult> => {
  const errors: string[] = [];
  const updatedStates: string[] = [];

  try {
    // Sync credentials
    if (data.credentials && options.updateCredentials !== false) {
      try {
        useCredentialsStore.getState().setCredentials(data.credentials);
        updatedStates.push('credentials');
      } catch (error) {
        errors.push(`Failed to sync credentials: ${error}`);
      }
    }

    // Sync bank cards
    if (data.bankCards && options.updateBankCards !== false) {
      try {
        useBankCardsStore.getState().setBankCards(data.bankCards);
        updatedStates.push('bankCards');
      } catch (error) {
        errors.push(`Failed to sync bank cards: ${error}`);
      }
    }

    // Sync secure notes
    if (data.secureNotes && options.updateSecureNotes !== false) {
      try {
        useSecureNotesStore.getState().setSecureNotes(data.secureNotes);
        updatedStates.push('secureNotes');
      } catch (error) {
        errors.push(`Failed to sync secure notes: ${error}`);
      }
    }

    // Sync user data
    if (data.user && options.updateUser !== false) {
      try {
        useUserStore.getState().setUser(data.user);
        updatedStates.push('user');
      } catch (error) {
        errors.push(`Failed to sync user: ${error}`);
      }
    }

    // Sync auth state
    if (data.auth && options.updateAuth !== false) {
      try {
        const authStore = useAuthStore.getState();
        if (data.auth.user) useUserStore.getState().setUser(data.auth.user);
        if (data.auth.session) authStore.setSession(data.auth.session);
        if (data.auth.isAuthenticated !== undefined) authStore.setAuthenticated(data.auth.isAuthenticated);
        updatedStates.push('auth');
      } catch (error) {
        errors.push(`Failed to sync auth: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      updatedStates,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`General sync error: ${error}`],
      updatedStates,
    };
  }
};

/**
 * Clears all state stores
 * Used during logout or when switching users
 */
export const clearAllStates = async () => {
  try {
    // Clear all Zustand stores
    useAuthStore.getState().clearAuth();
    useCredentialsStore.getState().setCredentials([]);
    useBankCardsStore.getState().setBankCards([]);
    useSecureNotesStore.getState().setSecureNotes([]);
    
    // Clear platform-specific storage
    await platform.clearSession();
    
    console.log('[Sync] All states cleared successfully');
  } catch (error) {
    console.error('[Sync] Failed to clear states:', error);
    throw new Error('Failed to clear application state');
  }
};

/**
 * Gets the current state of all stores
 * Useful for debugging or state inspection
 */
export const getAllStates = () => {
  return {
    credentials: useCredentialsStore.getState(),
    bankCards: useBankCardsStore.getState(),
    secureNotes: useSecureNotesStore.getState(),
    user: useUserStore.getState(),
    auth: useAuthStore.getState(),
  };
};

/**
 * Validates state consistency
 * Checks for common data integrity issues
 */
export const validateStateConsistency = (): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  const states = getAllStates();

  // Check for duplicate IDs across different stores
  const allIds = new Set<string>();
  
  // Check credentials
  states.credentials.credentials.forEach(cred => {
    if (allIds.has(cred.id)) {
      issues.push(`Duplicate ID found in credentials: ${cred.id}`);
    }
    allIds.add(cred.id);
  });

  // Check bank cards
  states.bankCards.bankCards.forEach(card => {
    if (allIds.has(card.id)) {
      issues.push(`Duplicate ID found in bank cards: ${card.id}`);
    }
    allIds.add(card.id);
  });

  // Check secure notes
  states.secureNotes.secureNotes.forEach(note => {
    if (allIds.has(note.id)) {
      issues.push(`Duplicate ID found in secure notes: ${note.id}`);
    }
    allIds.add(note.id);
  });

  // Check auth state consistency
  if (states.auth.isAuthenticated && !states.user.user) {
    issues.push('User is authenticated but no user data found');
  }

  if (!states.auth.isAuthenticated && states.user.user) {
    issues.push('User data exists but user is not authenticated');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

// ===== Export =====

// All functions are already exported above 