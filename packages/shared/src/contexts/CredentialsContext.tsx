import React, { createContext, useReducer, ReactNode } from 'react';
import type { CredentialDecrypted, CredentialVaultDb } from '../types';

interface CredentialsState {
  credentials: CredentialVaultDb[];
  isLoading: boolean;
  error: string | null;
}

interface CredentialsContextType extends CredentialsState {
  refreshCredentials: () => Promise<void>;
  createCredential: (credential: CredentialDecrypted) => Promise<void>;
  updateCredential: (credential: CredentialDecrypted) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  getCredentialsByDomain: (domain: string) => CredentialVaultDb[];
}

export const CredentialsContext = createContext<CredentialsContextType | null>(null);

type CredentialsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CREDENTIALS'; payload: CredentialVaultDb[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CREDENTIAL'; payload: CredentialVaultDb }
  | { type: 'UPDATE_CREDENTIAL'; payload: CredentialVaultDb }
  | { type: 'DELETE_CREDENTIAL'; payload: string };

function credentialsReducer(state: CredentialsState, action: CredentialsAction): CredentialsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CREDENTIALS':
      return { ...state, credentials: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_CREDENTIAL':
      return { ...state, credentials: [...state.credentials, action.payload] };
    case 'UPDATE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.map(cred =>
          cred.id === action.payload.id ? action.payload : cred
        ),
      };
    case 'DELETE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.filter(cred => cred.id !== action.payload),
      };
    default:
      return state;
  }
}

interface CredentialsProviderProps {
  children: ReactNode;
  credentialsService: {
    getAllCredentials: () => Promise<CredentialVaultDb[]>;
    createCredential: (credential: CredentialDecrypted) => Promise<CredentialVaultDb>;
    updateCredential: (credential: CredentialDecrypted) => Promise<CredentialVaultDb>;
    deleteCredential: (id: string) => Promise<void>;
    getCredentialsByDomain: (domain: string) => Promise<CredentialVaultDb[]>;
  };
}

export function CredentialsProvider({ children, credentialsService }: CredentialsProviderProps) {
  const [state, dispatch] = useReducer(credentialsReducer, {
    credentials: [],
    isLoading: false,
    error: null,
  });

  const refreshCredentials = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const credentials = await credentialsService.getAllCredentials();
      dispatch({ type: 'SET_CREDENTIALS', payload: credentials });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load credentials' });
      throw error;
    }
  };

  const createCredential = async (credential: CredentialDecrypted) => {
    try {
      const newCredential = await credentialsService.createCredential(credential);
      dispatch({ type: 'ADD_CREDENTIAL', payload: newCredential });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create credential' });
      throw error;
    }
  };

  const updateCredential = async (credential: CredentialDecrypted) => {
    try {
      const updatedCredential = await credentialsService.updateCredential(credential);
      dispatch({ type: 'UPDATE_CREDENTIAL', payload: updatedCredential });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update credential' });
      throw error;
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      await credentialsService.deleteCredential(id);
      dispatch({ type: 'DELETE_CREDENTIAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete credential' });
      throw error;
    }
  };

  const getCredentialsByDomain = (domain: string): CredentialVaultDb[] => {
    return state.credentials.filter(cred => {
      if (cred.url && cred.url.trim() !== '') {
        try {
          const credUrl = new URL(cred.url.startsWith('http') ? cred.url : 'https://' + cred.url);
          const credDomain = credUrl.hostname.toLowerCase();
          return domain.toLowerCase().includes(credDomain) || credDomain.includes(domain.toLowerCase());
        } catch {
          return cred.url.toLowerCase().includes(domain.toLowerCase());
        }
      }
      
      if (cred.title) {
        return cred.title.toLowerCase().includes(domain.toLowerCase());
      }
      
      return false;
    });
  };

  const value: CredentialsContextType = {
    ...state,
    refreshCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
    getCredentialsByDomain,
  };

  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>;
}