export const colors = {
  primary: '#4f86a2',
  primaryDark: '#35708a',
  secondary: '#2eae97',
  secondaryDark: '#21806e',
  accent: '#74787a',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  bg: '#ffffff',
  bgAlt: '#f1f4f8',
  border: '#E0E3E7',
  text: '#202124',
  textSecondary: '#5f6368',
  disabled: '#bdbdbd',
  white: '#ffffff',
} as const;

export type ColorKey = keyof typeof colors; 