import zxcvbn from 'zxcvbn';
import type { PasswordStrength, PasswordGeneratorOptions } from '../types';

export function generatePassword(options: PasswordGeneratorOptions): string {
  const numbers = '0123456789';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const specialCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~';
  
  let charset = '';
  let specialCharCount = 0;
  let result = '';

  if (options.hasNumbers) charset += numbers;
  if (options.hasUppercase) charset += uppercaseLetters;
  if (options.hasLowercase) charset += lowercaseLetters;

  for (let i = 0; i < options.length; i++) {
    if (options.hasSpecialCharacters && specialCharCount < 2 && i < options.length - 2) {
      result += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
      specialCharCount++;
    } else {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }

  // Shuffle the result
  result = result
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
  return result;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const result = zxcvbn(password);
  const score = result.score / 4; // zxcvbn score: 0-4, normalize to 0-1

  if (score <= 0.5) return 'weak';
  if (score > 0.5 && score < 0.85) return 'average';
  if (score > 0.95) return 'perfect';
  return 'strong';
}