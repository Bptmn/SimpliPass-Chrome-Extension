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
import { AuthenticationError, NetworkError } from '@common/types/errors.types';

export interface UseMfaConfirmationReturn {
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  handleConfirmMfa: (code: string) => Promise<void>;
  handleResendCode: () => Promise<void>;
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
    
    // Validate code format: exactly 6 digits
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Please enter the verification code');
      return;
    }
    
    // Validate exactly 6 digits
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Please enter a valid 6-digit verification code');
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
      // Improved error handling with clear messages
      let errorMessage = 'MFA confirmation failed. Please try again.';
      
      if (err instanceof AuthenticationError) {
        // Handle authentication errors (invalid code, expired code, etc.)
        errorMessage = err.message || 'Invalid verification code. Please try again.';
        
        // Check if code expired
        if (err.message.includes('expired') || err.message.includes('Expired')) {
          errorMessage = 'The verification code has expired. Please request a new code.';
        } else if (err.message.includes('Invalid') || err.message.includes('invalid')) {
          errorMessage = 'Invalid verification code. Please check and try again.';
        }
      } else if (err instanceof NetworkError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes('expired') || message.includes('codeexpired')) {
          errorMessage = 'The verification code has expired. Please request a new code.';
        } else if (message.includes('invalid') || message.includes('codemismatch')) {
          errorMessage = 'Invalid verification code. Please check and try again.';
        } else if (message.includes('network') || message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      console.error('[useMfaConfirmation] MFA confirmation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Resend code handler - redirects to login to restart the flow
  const handleResendCode = useCallback(async () => {
    setError(null);
    // Navigate back to login page to restart the authentication flow
    // The user will need to enter their credentials again to receive a new code
    router.navigateTo(ROUTES.LOGIN);
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
    handleResendCode,
    clearError,
  };
};
