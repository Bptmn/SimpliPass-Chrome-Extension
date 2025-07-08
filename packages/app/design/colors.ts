export const lightColors = {
  primary: '#4f86a2',
  secondary: '#2eae97',
  tertiary: '#74787a',
  alternate: '#bb445b',
  borderColor: '#E0E3E7',
  primaryBackground: '#ffffff',
  secondaryBackground: '#f1f4f8',
  whiteText: '#ffffff',
  error: '#c4454d',
  success: '#16857b',
  warning: '#F3C344',
  info: '#ffffff',
  blackText: '#202124',
  disabled: '#bdbdbd',
  white: '#ffffff',
} as const;

export const darkColors = {
  primary: '#68aed2',
  secondary: '#23bda1',
  tertiary: '#74787a',
  alternate: '#dd516c',
  borderColor: '#46494f',
  primaryBackground: '#282c30',
  secondaryBackground: '#3c3f49',
  whiteText: '#ffffff',
  error: '#c4454d',
  success: '#16857b',
  warning: '#F3C344',
  info: '#ffffff',
  blackText: '#f1f4f8',
  disabled: '#444950',
  white: '#23272a',
} as const;

export type ColorKey = keyof typeof lightColors;

export const getColors = (mode: 'light' | 'dark') =>
  mode === 'dark' ? darkColors : lightColors;

// --- DYNAMIC colors PROXY ---

// This will be set by the ThemeProvider at runtime
let currentMode: 'light' | 'dark' = 'light';

export const setColorsMode = (mode: 'light' | 'dark') => {
  currentMode = mode;
};

export const colors: Record<ColorKey, string> = new Proxy({} as any, {
  get(_, key: string) {
    const palette = currentMode === 'dark' ? darkColors : lightColors;
    return palette[key as ColorKey];
  },
}); 