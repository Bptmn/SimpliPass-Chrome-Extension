/**
 * useReEnterPassword Hook - Layer 1: UI Layer
 * 
 * Handles the re-enter password flow when userSecretKey is missing from secure storage.
 * Derives userSecretKey from master password and stores it.
 */

import { useState } from 'react';
import { deriveKey } from '../utils/crypto';
import { storeUserSecretKey } from '../core/services/secretsService';
import { auth } from '../core/adapters/auth.adapter';
import { db } from '../core/adapters/database.adapter';
import { decryptItem } from '../core/services/cryptoService';
import { ItemEncrypted } from '../core/types/items.types';
import { useAppStateStore } from './useAppState';

export const useReEnterPassword = () => {
  // Initialize UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get app state management
  const { setSecretKey } = useAppStateStore();

  // Step 1: Validate secret key by attempting to decrypt existing items
  const validateSecretKey = async (userSecretKey: string): Promise<boolean> => {
    try {
      // Step 1.1: Get current user through auth adapter
      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Step 1.2: Get encrypted items from Firestore via database adapter
      const encryptedItems = await db.getCollection<ItemEncrypted>(`users/${currentUser.uid}/my_items`);
      
      if (encryptedItems.length === 0) {
        // If no items exist, we can't validate - assume key is correct
        console.log('[useReEnterPassword] No existing items to validate against, assuming key is correct');
        return true;
      }

      // Step 1.3: Try to decrypt the first item to validate the key
      const firstItem = encryptedItems[0];
      try {
        await decryptItem(userSecretKey, firstItem);
        console.log('[useReEnterPassword] Secret key validation successful');
        return true;
      } catch (decryptError) {
        console.error('[useReEnterPassword] Secret key validation failed:', decryptError);
        return false;
      }
    } catch (validationError) {
      console.error('[useReEnterPassword] Error during secret key validation:', validationError);
      return false;
    }
  };

  // Step 2: Handle password re-entry process
  const reEnterPassword = async (masterPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useReEnterPassword] Starting password re-entry process...');
      
      // Step 2.1: Get user salt from Cognito via auth adapter
      const salt = await auth.fetchUserSalt();
      if (!salt) {
        throw new Error('Unable to retrieve user salt');
      }

      console.log('[useReEnterPassword] Salt retrieved, deriving key...');

      // Step 2.2: Derive userSecretKey from master password
      const userSecretKey = await deriveKey(masterPassword, salt);
      
      console.log('[useReEnterPassword] Key derived, validating...');

      // Step 2.3: Validate the derived key by attempting to decrypt existing data
      const isValidKey = await validateSecretKey(userSecretKey);
      if (!isValidKey) {
        throw new Error('Incorrect master password. Please try again.');
      }

      console.log('[useReEnterPassword] Key validated, storing in secure storage...');

      // Step 2.4: Store userSecretKey in secure storage
      await storeUserSecretKey(userSecretKey);
      
      console.log('[useReEnterPassword] Re-enter password flow completed successfully');

      // Step 2.5: Update secret key state to trigger router transition
      // This will cause the router to automatically transition from LOCK to HOME
      setSecretKey(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password re-entry failed';
      setError(errorMessage);
      console.error('[useReEnterPassword] Re-enter password flow failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Clear error state
  const clearError = () => {
    setError(null);
  };

  return { 
    reEnterPassword, 
    isLoading, 
    error, 
    clearError 
  };
}; 