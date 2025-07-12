module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-js|@react-native-community|@react-native-polyfills|@react-native/js-polyfills|@stablelib|stablelib)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@app/(.*)$': '<rootDir>/packages/app/$1',
    '^@design/(.*)$': '<rootDir>/packages/app/design/$1',
    '^@components/(.*)$': '<rootDir>/packages/app/components/$1',
    '^@screens/(.*)$': '<rootDir>/packages/app/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/packages/app/core/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/packages/app/utils/$1',
    '^@logic/(.*)$': '<rootDir>/packages/app/core/logic/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@extension/(.*)$': '<rootDir>/packages/extension/$1',
    '^@mobile/(.*)$': '<rootDir>/packages/mobile/$1',
    '^@/(.*)$': '<rootDir>/packages/app/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock config files that use import.meta
    '^@app/core/auth/config$': '<rootDir>/__mocks__/configMock.js',
    '^@extension/config/config$': '<rootDir>/__mocks__/configMock.js',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'packages/app/**/*.{ts,tsx}',
    '!packages/app/**/*.d.ts',
    '!packages/app/**/__tests__/**',
    '!packages/app/**/storybook/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  // Optimize for faster test execution
  testTimeout: 10000,
  // Run tests in parallel for better performance
  maxWorkers: '50%',
  // Reduce verbosity for faster output
  verbose: false,
  // Cache for faster subsequent runs
  cache: true,
}; 