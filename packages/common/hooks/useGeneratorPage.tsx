import { useState, useEffect, useCallback } from 'react';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { useToast } from './useToast';

/**
 * Hook for GeneratorPage component business logic
 * Handles password generation, strength checking, and regeneration
 */
export const useGeneratorPage = () => {
  const { showToast } = useToast();

  // Password options
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(true);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [length, setLength] = useState(16);
  
  // Generated password and strength
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'average' | 'strong' | 'perfect'>('weak');

  // Generate password and check strength when options change
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

  // Handle password regeneration
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

  // Handle copy password
  const handleCopyPassword = useCallback(() => {
    showToast('Mot de passe copié !');
  }, [showToast]);

  return {
    // State
    hasUppercase,
    hasNumbers,
    hasSymbols,
    hasLowercase,
    length,
    password,
    strength,
    
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