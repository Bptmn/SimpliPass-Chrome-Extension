import { StyleSheet } from 'react-native';
import { getColors } from './colors';

export const layout = {
  navbarHeight: 60,
  helperBarHeight: 60,
  primaryBackground: '#ffffff',
  secondaryBackground: '#f1f4f8',
  sectionSpacing: 15,
} as const;

export type LayoutKey = keyof typeof layout;

// Radius tokens
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
export type RadiusKey = keyof typeof radius;

// Padding tokens (from radius.ts)
export const padding = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
  xxl: 40,
  pill: 999,
} as const;
export type PaddingKey = keyof typeof padding;

// Shadow tokens
export const shadow = {
  card: '0 2px 8px rgba(0,0,0,0.04)',
  cardHover: '0 4px 16px rgba(26,115,232,0.10)',
} as const;
export type ShadowKey = keyof typeof shadow;

// Spacing tokens
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 30,
} as const;
export type SpacingKey = keyof typeof spacing;

export const getPageStyles = (mode: 'light' | 'dark') => {
  const colors = getColors(mode);
  return StyleSheet.create({
    formContainer: {
      flex: 1,
      gap: spacing.md,
    },
    pageContainer: {
      backgroundColor: colors.primaryBackground,
      flex: 1,
      gap: spacing.lg,
      padding: spacing.lg,
    },
    pageContent: {
      flex: 1,
      gap: spacing.lg,
    },
    scrollView: {
      flex: 1,
      gap: spacing.lg,
    },
  });
};

// --- DYNAMIC pageStyles PROXY ---

// This will be set by the ThemeProvider at runtime
let currentPageStylesMode: 'light' | 'dark' = 'light';

export const setPageStylesMode = (mode: 'light' | 'dark') => {
  currentPageStylesMode = mode;
};

export const pageStyles = new Proxy({} as any, {
  get(_, key: string) {
    const styles = getPageStyles(currentPageStylesMode);
    return styles[key as keyof ReturnType<typeof getPageStyles>];
  },
});