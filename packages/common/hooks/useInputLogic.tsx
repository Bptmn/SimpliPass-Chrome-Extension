import { useState, useCallback } from 'react';
import { colors } from '@ui/design/colors';

/**
 * Hook for input component UI state management
 * Handles password visibility, content size, and strength calculations
 */
export const useInputLogic = (type: 'text' | 'email' | 'password' | 'note' = 'text') => {
  // Step 1: Initialize UI state
  const [showPassword, setShowPassword] = useState(false);
  const [inputHeight, setInputHeight] = useState(type === 'note' ? 96 : 48);

  // Step 2: Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Step 3: Handle content size change for note inputs
  const handleContentSizeChange = useCallback((event: { nativeEvent: { contentSize: { height: number } } }) => {
    if (type === 'note') {
      const { height } = event.nativeEvent.contentSize;
      const minHeight = 96; // 3 lines minimum
      const maxHeight = 300; // Maximum height to prevent excessive growth
      setInputHeight(Math.max(minHeight, Math.min(height, maxHeight)));
    }
  }, [type]);

  // Step 4: Calculate strength color for password strength indicator
  const getStrengthColor = useCallback((strength?: 'weak' | 'average' | 'strong' | 'perfect') => {
    switch (strength) {
      case 'weak':
        return colors.error;
      case 'average':
        return colors.warning || colors.secondary;
      case 'strong':
        return colors.primary;
      case 'perfect':
        return colors.secondary;
      default:
        return colors.secondary;
    }
  }, []);

  return {
    showPassword,
    inputHeight,
    togglePasswordVisibility,
    handleContentSizeChange,
    getStrengthColor,
  };
}; 