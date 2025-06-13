// Design tokens
export const colors = {
  primary: '#4f86a2',
  secondary: '#2eae97',
  tertiary: '#74787a',
  primaryText: '#4f86a2',
  primaryBackground: '#ffffff',
  secondaryBackground: '#f1f4f8',
  borderColor: '#e0e3e7',
  whiteText: '#ffffff',
  tertiaryText: '#74787a',
} as const;

export const typography = {
  fontFamily: {
    primary: 'Inter',
    secondary: 'Inter',
  },
} as const;

export const spacing = {
  navbarHeight: '60px',
} as const;

// CSS Variables for use in styles
export const cssVariables = {
  colors: {
    '--primary': colors.primary,
    '--secondary': colors.secondary,
    '--tertiary': colors.tertiary,
    '--primary-text': colors.primaryText,
    '--primary-background': colors.primaryBackground,
    '--secondary-background': colors.secondaryBackground,
    '--border-color': colors.borderColor,
    '--white-text': colors.whiteText,
    '--tertiary-text': colors.tertiaryText,
  },
  typography: {
    '--font-family-primary': `'${typography.fontFamily.primary}', sans-serif`,
    '--font-family-secondary': `'${typography.fontFamily.secondary}', sans-serif`,
  },
  spacing: {
    '--navbar-height': spacing.navbarHeight,
  },
} as const;

// Function to generate CSS variables string
export function generateCSSVariables(): string {
  const variables = {
    ...cssVariables.colors,
    ...cssVariables.typography,
    ...cssVariables.spacing,
  };

  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');
} 