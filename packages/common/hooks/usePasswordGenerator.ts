import { useState, useEffect, useCallback } from 'react';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { passwordGenerator } from '@common/utils/passwordGenerator';

/**
 * Hook for password generator UI state management
 * Handles password generation, strength checking, and regeneration
 * Note: Toast notifications should be handled by the UI layer
 */
export const usePasswordGenerator = () => {
  const [lastMessage, setLastMessage] = useState<string>('');

  // Step 1: Initialize password options state
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(true);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [length, setLength] = useState(16);
  
  // Step 2: Initialize password and strength state
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'average' | 'strong' | 'perfect'>('weak');

  // Step 3: Generate password and check strength when options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSymbols,
      length
    );
    setPassword(pwd);
    setStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSymbols, length]);

  // Step 4: Handle password regeneration
  const handleRegenerate = useCallback(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSymbols,
      length
    );
    setPassword(pwd);
    setStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSymbols, length]);

  // Step 5: Handle copy password
  const handleCopyPassword = useCallback(() => {
    setLastMessage('Mot de passe copié !');
  }, []);

  return {
    // State
    hasUppercase,
    hasNumbers,
    hasSymbols,
    hasLowercase,
    length,
    password,
    strength,
    lastMessage,
    
    // Actions
    setHasUppercase,
    setHasNumbers,
    setHasSymbols,
    setHasLowercase,
    setLength,
    
    // Event handlers
    handleRegenerate,
    handleCopyPassword,
  };
}; 