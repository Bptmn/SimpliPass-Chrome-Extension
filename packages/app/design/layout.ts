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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
  pill: 999,
} as const;
export type RadiusKey = keyof typeof radius;

// Padding tokens (from radius.ts)
export const padding = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
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
  sm: 7,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
export type SpacingKey = keyof typeof spacing; 