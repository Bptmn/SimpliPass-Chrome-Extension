import { passwordGenerator } from '@common/utils/passwordGenerator';

export function handleGeneratePassword(setPassword: (password: string) => void) {
  const newPassword = passwordGenerator(true, true, true, true, 16);
  setPassword(newPassword);
}

export function createPasswordGenerator(setPassword: (password: string) => void) {
  return () => handleGeneratePassword(setPassword);
} 