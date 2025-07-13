export function passwordGenerator(
  hasNumbers: boolean,
  hasUppercase: boolean,
  hasLowercase: boolean,
  hasSpecialCharacters: boolean,
  passwordWidth: number,
): string {
  const numbers = '0123456789';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const specialCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~';
  let charset = '';
  let result = '';

  // Build charset based on selected options
  if (hasNumbers) charset += numbers;
  if (hasUppercase) charset += uppercaseLetters;
  if (hasLowercase) charset += lowercaseLetters;
  if (hasSpecialCharacters) charset += specialCharacters;

  // If no character sets are selected, use a default mix
  if (!hasNumbers && !hasUppercase && !hasLowercase && !hasSpecialCharacters) {
    charset = lowercaseLetters + numbers;
  }

  // If still no charset, return empty string
  if (!charset) {
    return '';
  }

  // Ensure at least one character from each selected type
  if (hasNumbers) {
    result += numbers[Math.floor(Math.random() * numbers.length)];
  }
  if (hasUppercase) {
    result += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
  }
  if (hasLowercase) {
    result += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
  }
  if (hasSpecialCharacters) {
    result += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
  }

  // Fill the rest with random characters from the charset
  const remainingLength = passwordWidth - result.length;
  for (let i = 0; i < remainingLength; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the result
  result = result
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
  
  return result;
}
