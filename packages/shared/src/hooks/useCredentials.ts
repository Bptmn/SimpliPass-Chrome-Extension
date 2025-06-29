import { useContext } from 'react';
import { CredentialsContext } from '../contexts/CredentialsContext';

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error('useCredentials must be used within a CredentialsProvider');
  }
  return context;
}