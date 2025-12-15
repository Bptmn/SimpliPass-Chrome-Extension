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
import { credentialValidationService } from '../core/services/validationService';
import { AuthenticationError, NetworkError } from '@common/types/errors.types';
import type { MfaChallenge } from '@common/types/auth.types';

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
  loginSuccess: boolean;
  
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
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Form validation using validationService
  const validateForm = useCallback((): boolean => {
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;
    
    // Validate email using validationService
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailResult = credentialValidationService.validateEmail(email);
      if (!emailResult.isValid) {
        setEmailError(emailResult.error || 'Invalid email format');
      isValid = false;
      }
    }
    
    // Validate password - only check if it's not empty (no format validation for login)
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
    setLoginSuccess(false);
    
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
        // No MFA required - mark success (navigation handled by parent)
        console.log('[useLogin] Login successful');
        setLoginSuccess(true);
      }
      
    } catch (err) {
      // Improved error handling with clear messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof AuthenticationError) {
        // Clear authentication errors (invalid credentials, user not found, etc.)
        errorMessage = err.message || 'Invalid email or password. Please check your credentials.';
      } else if (err instanceof NetworkError) {
        // Network errors
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err instanceof Error) {
        // Other errors with specific messages
        const message = err.message.toLowerCase();
        if (message.includes('user not found') || message.includes('invalid credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (message.includes('network') || message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (message.includes('too many attempts')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      console.error('[useLogin] Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm]);

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
    loginSuccess,
    
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
