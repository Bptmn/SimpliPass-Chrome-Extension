import zxcvbn from 'zxcvbn';

export function checkPasswordStrength(password: string): 'weak' | 'average' | 'strong' | 'perfect' {
  const result = zxcvbn(password);
  const score = result.score / 4; // zxcvbn score: 0-4, normalize to 0-1

  if (score <= 0.5) return 'weak';
  if (score > 0.5 && score < 0.85) return 'average';
  if (score > 0.95) return 'perfect';
  return 'strong';
}
