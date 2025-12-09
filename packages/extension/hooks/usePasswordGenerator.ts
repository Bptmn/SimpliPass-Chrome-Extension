/**
 * usePasswordGenerator (Extension / DOM)
 *
 * Purpose: UI hook to manage password generation options and state in the extension.
 * - Uses shared utils for strength and generation
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';

export type PasswordStrength = 'weak' | 'average' | 'strong' | 'perfect';

export interface UsePasswordGeneratorReturn {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  length: number;
  password: string;
  strength: PasswordStrength;
  setHasUppercase: (value: boolean) => void;
  setHasLowercase: (value: boolean) => void;
  setHasNumbers: (value: boolean) => void;
  setHasSymbols: (value: boolean) => void;
  setLength: (value: number) => void;
  handleRegenerate: () => void;
}

export function usePasswordGenerator(): UsePasswordGeneratorReturn {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');

  const strength: PasswordStrength = useMemo(() => {
    return checkPasswordStrength(password);
  }, [password]);

  const generate = useCallback(() => {
    const newPassword = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSymbols,
      length
    );
    setPassword(newPassword);
  }, [length, hasUppercase, hasLowercase, hasNumbers, hasSymbols]);

  const handleRegenerate = useCallback(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    generate();
  }, [generate]);

  return {
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    length,
    password,
    strength,
    setHasUppercase,
    setHasLowercase,
    setHasNumbers,
    setHasSymbols,
    setLength,
    handleRegenerate,
  };
}


