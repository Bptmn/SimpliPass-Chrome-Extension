module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    '@react-native', // Use official React Native config
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['react-native', '@typescript-eslint'], // Include react-native plugin
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Disable the problematic rule that causes false positives
    'react-native/no-unused-styles': 'off',
    
    // Keep other useful React Native rules
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'off', // Keep disabled as per original config
    'react-native/no-color-literals': 'off', // Keep disabled as per original config
    'react-native/no-raw-text': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', 'storybook-static/'],
}; 