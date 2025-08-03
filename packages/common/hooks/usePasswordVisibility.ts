// usePasswordVisibility.ts
// This hook manages UI state for password field visibility toggling.
// Responsibilities:
// - Password visibility state management
// - Toggle password visibility functionality
// - Eye icon state management

import { useState, useCallback } from 'react';

export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Shows password
   */
  const showPasswordAction = useCallback(() => {
    setShowPassword(true);
  }, []);

  /**
   * Hides password
   */
  const hidePasswordAction = useCallback(() => {
    setShowPassword(false);
  }, []);

  /**
   * Sets password visibility to a specific state
   */
  const setPasswordVisibility = useCallback((visible: boolean) => {
    setShowPassword(visible);
  }, []);

  return {
    isPasswordVisible: showPassword,
    togglePasswordVisibility,
    showPassword: showPasswordAction,
    hidePassword: hidePasswordAction,
    setPasswordVisibility
  };
}; 