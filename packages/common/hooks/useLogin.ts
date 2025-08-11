/**
 * useLogin Hook - Layer 1: UI Layer
 * 
 * Provides UI state management for login functionality:
 * - Form state (email, password, validation errors)
 * - Loading states
 * - User feedback and error handling
 * - Navigation after successful login
 * - MFA challenge handling
 * 
 * Business logic is delegated to authService.
 */

import { useState, useCallback } from 'react';
import { authService } from '../core/services/authService';
import { useAppRouterContext } from '../ui/router/AppRouterProvider';
import { ROUTES } from '../ui/router/ROUTES';
import type { MfaChallenge } from '../core/types/auth.types';

export interface UseLoginReturn {
  // Form state
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  rememberEmail: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  mfaChallenge: MfaChallenge | null;
  
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberEmail: (remember: boolean) => void;
  handleLogin: () => Promise<void>;
  clearError: () => void;
  clearMfaChallenge: () => void;
  validateForm: () => boolean;
}

export const useLogin = (): UseLoginReturn => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  
  // Navigation
  const router = useAppRouterContext();

  // Form validation
  const validateForm = useCallback((): boolean => {
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  }, [email, password]);

  // Login handler
  const handleLogin = useCallback(async () => {
    // Clear previous errors and MFA challenge
    setError(null);
    setMfaChallenge(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // ✅ Hook calls service for business logic
      const loginResult = await authService.login(email, password);
      
      // ✅ Hook handles UI-specific logic
      if (typeof loginResult === 'object' && loginResult.mfaRequired) {
        // MFA required - set challenge for UI
        console.log('[useLogin] MFA required, setting challenge');
        setMfaChallenge(loginResult);
      } else {
        // No MFA required - navigate to home
        console.log('[useLogin] Login successful, navigating to home');
        router.navigateTo(ROUTES.HOME);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[useLogin] Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm, router]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear MFA challenge
  const clearMfaChallenge = useCallback(() => {
    setMfaChallenge(null);
  }, []);

  return {
    // Form state
    email,
    password,
    emailError,
    passwordError,
    rememberEmail,
    
    // UI state
    isLoading,
    error,
    mfaChallenge,
    
    // Actions
    setEmail,
    setPassword,
    setRememberEmail,
    handleLogin,
    clearError,
    clearMfaChallenge,
    validateForm,
  };
};
