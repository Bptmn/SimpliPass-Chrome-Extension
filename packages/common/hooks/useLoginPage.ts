/**
 * useLoginPage Hook - Layer 1: UI Layer
 * 
 * Handles login page UI state and user interactions.
 * Provides simple, readable interface for login components.
 */

import { useState } from 'react';
import { auth } from '../core/adapters/auth.adapter';

export const useLoginPage = () => {
  // Step 1: Initialize UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Handle login process
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 2.1: Authenticate user (includes secret key initialization)
      await auth.login(email, password);

      console.log('[useLoginPage] Login flow completed successfully');
      
      // Step 2.2: Login complete - PopupApp will detect auth state change and render home page

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[useLoginPage] Login flow failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Clear error state
  const clearError = () => {
    setError(null);
  };

  return { login, isLoading, error, clearError };
}; 