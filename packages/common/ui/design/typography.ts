export const typography = {
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    bold: '700',
  },
} as const;

export type TypographyKey = keyof typeof typography; 