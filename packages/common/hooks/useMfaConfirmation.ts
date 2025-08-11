/**
 * useMfaConfirmation Hook - Layer 1: UI Layer
 * 
 * Provides UI state management for MFA confirmation:
 * - Loading states
 * - Error handling
 * - MFA confirmation logic
 * 
 * Business logic is delegated to authService.
 * Code input state is managed by CodeConfirmationPage.
 */

import { useState, useCallback } from 'react';
import { authService } from '../core/services/authService';
import { useAppRouterContext } from '../ui/router/AppRouterProvider';
import { ROUTES } from '../ui/router/ROUTES';

export interface UseMfaConfirmationReturn {
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  handleConfirmMfa: (code: string) => Promise<void>;
  clearError: () => void;
}

export const useMfaConfirmation = (): UseMfaConfirmationReturn => {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation
  const router = useAppRouterContext();

  // MFA confirmation handler
  const handleConfirmMfa = useCallback(async (code: string) => {
    // Clear previous errors
    setError(null);
    
    // Validate code
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    if (code.trim().length < 4) {
      setError('Please enter a valid verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Confirm MFA with Cognito
      console.log('[useMfaConfirmation] Step 1: Confirming MFA code');
      await authService.confirmMfa(code.trim());
      
      // Step 2: Complete the login flow (secret key + Firebase login)
      console.log('[useMfaConfirmation] Step 2: Completing login flow after MFA');
      await authService.completeLoginAfterMfa();
      
      // ✅ Hook handles UI-specific logic
      console.log('[useMfaConfirmation] MFA confirmation and login completion successful, navigating to home');
      router.navigateTo(ROUTES.HOME);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MFA confirmation failed';
      setError(errorMessage);
      console.error('[useMfaConfirmation] MFA confirmation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // UI state
    isLoading,
    error,
    
    // Actions
    handleConfirmMfa,
    clearError,
  };
};
