/**
 * useCredentials Hook - Layer 1: UI Layer
 * 
 * Provides simple interface for credential management operations.
 * Handles UI state and abstracts complexity from components.
 */

import { useState } from 'react';
import { useCredentialsStore } from '../core/states/credentials.state';
import { addCredentialToDatabase, updateItemInDatabase, deleteItemFromDatabase } from '../core/services/items';
import { CredentialDecrypted } from '../core/types/items.types';
import { platform } from '../core/platform';

export const useCredentials = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credentials = useCredentialsStore(state => state.credentials);
  const setCredentials = useCredentialsStore(state => state.setCredentials);
  const addCredentialToStore = useCredentialsStore(state => state.addCredential);
  const updateCredentialInStore = useCredentialsStore(state => state.updateCredential);
  const deleteCredentialFromStore = useCredentialsStore(state => state.deleteCredential);

  const addCredentialHandler = async (credential: Omit<CredentialDecrypted, 'id' | 'createdDateTime' | 'lastUseDateTime'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const credentialWithDates: CredentialDecrypted = {
        id: `cred_${Date.now()}`,
        ...credential,
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemType: 'credential',
        itemKey: '', // This will be set by the encryption process
      };
      
      await addCredentialToDatabase(credentialWithDates);
      
      // Add to store with generated ID
      addCredentialToStore(credentialWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credential');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredentialHandler = async (id: string, updates: Partial<CredentialDecrypted>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user secret key for the service call
      const { getUserSecretKey } = await import('../core/services/secret');
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }
      
      await updateItemInDatabase('user-id', id, userSecretKey, updates as any);
      
      // Update in store
      updateCredentialInStore(id, updates);
    } catch {
      console.error('Failed to update credential');
      throw new Error('Failed to update credential');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCredentialHandler = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user secret key for the service call
      const { getUserSecretKey } = await import('../core/services/secret');
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }
      
      await deleteItemFromDatabase('user-id', id);
      
      // Remove from store
      deleteCredentialFromStore(id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete credential');
      throw deleteError;
    } finally {
      setIsLoading(false);
    }
  };

  const copyPassword = async (credentialId: string) => {
    try {
      const credential = credentials.find(c => c.id === credentialId);
      if (!credential) {
        throw new Error('Credential not found');
      }
      await platform.copyToClipboard(credential.password);
    } catch {
      throw new Error('Failed to copy password');
    }
  };

  return {
    credentials,
    isLoading,
    error,
    addCredential: addCredentialHandler,
    updateCredential: updateCredentialHandler,
    deleteCredential: deleteCredentialHandler,
    copyPassword,
    setCredentials,
  };
}; 