// useInputLogic.tsx
// This hook manages UI state for input components.
// Responsibilities:
// - Integrate usePasswordVisibility for password fields
// - Integrate useContentSize for note fields
// - Provide unified interface for input components

import { usePasswordVisibility } from './usePasswordVisibility';
import { useContentSize } from './useContentSize';

/**
 * Hook for input component UI state management
 * Integrates password visibility and content size hooks
 */
export const useInputLogic = (type: 'text' | 'email' | 'password' | 'note' = 'text') => {
  // Step 1: Use specialized hooks for different input types
  const passwordVisibility = usePasswordVisibility();
  const contentSize = useContentSize(type === 'note');

  // Step 2: Return unified interface
  return {
    showPassword: passwordVisibility.isPasswordVisible,
    inputHeight: contentSize.inputHeight,
    togglePasswordVisibility: passwordVisibility.togglePasswordVisibility,
    handleContentSizeChange: contentSize.handleContentSizeChange,
  };
}; 