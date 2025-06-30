module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@app/(.*)$': '<rootDir>/packages/app/$1',
    '^@design/(.*)$': '<rootDir>/packages/app/design/$1',
    '^@components/(.*)$': '<rootDir>/packages/app/components/$1',
    '^@screens/(.*)$': '<rootDir>/packages/app/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/packages/app/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/packages/app/utils/$1',
    '^@logic/(.*)$': '<rootDir>/packages/app/logic/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@extension/(.*)$': '<rootDir>/packages/extension/$1',
    '^@mobile/(.*)$': '<rootDir>/packages/mobile/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-web)/)',
  ],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/**/*.stories.{ts,tsx}',
    '!packages/**/*.test.{ts,tsx}',
  ],
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/packages/**/*.{test,spec}.{ts,tsx}',
  ],
}; 