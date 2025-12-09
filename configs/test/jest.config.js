// jest.config.js
require('dotenv').config({ path: '.env' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/configs/test/jest.setup.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
    '^packages/common/config/platform\\.ts$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@stablelib|stablelib)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@extension/(.*)$': '<rootDir>/packages/extension/$1',
    '^@common/(.*)$': '<rootDir>/packages/common/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@common/config/platform$': '<rootDir>/__mocks__/platformMock.js',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'packages/common/**/*.{ts,tsx}',
    'packages/extension/**/*.{ts,tsx}',
    'packages/shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  testTimeout: 30000,
  maxWorkers: '50%',
  verbose: false,
  cache: true,
};


