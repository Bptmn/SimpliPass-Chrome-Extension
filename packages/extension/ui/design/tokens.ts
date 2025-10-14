/**
 * Design Tokens (Extension / DOM)
 * 
 * Purpose: Centralized design system tokens for consistent UI
 * - Colors, spacing, typography, radius
 * - Based on old React Native Web design system
 */

export const colors = {
  primary: '#4f86a2',
  secondary: '#2eae97',
  tertiary: '#74787a',
  alternate: '#bb445b',
  borderColor: '#E0E3E7',
  primaryBackground: '#ffffff',
  secondaryBackground: '#f1f4f8',
  tertiaryText: '#74787a',
  whiteText: '#ffffff',
  error: '#c4454d',
  success: '#16857b',
  warning: '#F3C344',
  info: '#ffffff',
  blackText: '#202124',
  disabled: '#bdbdbd',
  white: '#ffffff',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 35,
  // Layout-specific spacing
  pageHorizontal: 20, // Horizontal padding for all pages
  pageTop: 10, // Top padding for all pages
  // Component-specific spacing
  copyButtonWidth: 45,
  copyButtonHeight: 38,
  copyButtonIconSize: 16,
} as const;

export const radius = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
  xxl: 40,
  pill: 999,
} as const;

export const typography = {
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: 'Monaco, Menlo, Ubuntu Mono, monospace',
  },
  fontSize: {
    xxs: 11,
    xs: 13,
    sm: 15,
    md: 17,
    lg: 19,
    xl: 21,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const shadow = {
  card: '0 2px 8px rgba(0,0,0,0.04)',
  cardHover: '0 4px 16px rgba(26,115,232,0.10)',
} as const;

