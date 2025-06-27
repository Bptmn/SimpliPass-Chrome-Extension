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
  let specialCharCount = 0;
  let result = '';

  if (hasNumbers) charset += numbers;
  if (hasUppercase) charset += uppercaseLetters;
  if (hasLowercase) charset += lowercaseLetters;

  for (let i = 0; i < passwordWidth; i++) {
    if (hasSpecialCharacters && specialCharCount < 2 && i < passwordWidth - 2) {
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
