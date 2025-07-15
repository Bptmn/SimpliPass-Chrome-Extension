import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@common/core/services/auth';
import { auth } from '@common/core/adapters/auth.adapter';
import { useUserStore } from '@common/core/states/user';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';

/**
 * Hook for LoginPage component business logic
 * Handles authentication, email remembering, and MFA
 */
export const useLoginPage = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, _setMfaStep] = useState(false);
  const [mfaUser, _setMfaUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberEmail(true);
    }
  }, []);

  // Persist or remove remembered email
  useEffect(() => {
    if (rememberEmail && email) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else if (!rememberEmail) {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  }, [rememberEmail, email]);

  // Handle login submission
  const handleLogin = useCallback(async () => {
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);
    setError(null);
    
    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      await loginUser(email, password);
      // After successful login, set user in Zustand store
      const currentUser = useUserStore.getState().user;
      setUser(currentUser);
      navigate('/home');
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Erreur lors de la connexion.');
      setIsLoading(false);
    }
  }, [email, password, navigate, setUser]);

  // Handle MFA confirmation
  const handleMfaConfirm = useCallback(async (code: string) => {
    if (!mfaUser) return;
    setIsLoading(true);
    try {
      await auth.confirmMfa(code);
      navigate('/home');
    } catch (mfaError: unknown) {
      setError(mfaError instanceof Error ? mfaError.message : 'Code invalide ou expiré.');
      setIsLoading(false);
    }
  }, [mfaUser, navigate]);

  return {
    // State
    email,
    password,
    emailError,
    passwordError,
    rememberEmail,
    isLoading,
    mfaStep,
    mfaUser,
    error,
    
    // Actions
    setEmail,
    setPassword,
    setRememberEmail,
    setError,
    
    // Event handlers
    handleLogin,
    handleMfaConfirm,
  };
}; 