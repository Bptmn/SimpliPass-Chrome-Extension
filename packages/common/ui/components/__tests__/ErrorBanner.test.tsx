/**
 * Tests for ErrorBanner component
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBanner } from '../ErrorBanner';

// Mock the theme dependencies
jest.mock('@common/ui/design/theme', () => ({
  useThemeMode: () => ({ mode: 'light' })
}));

jest.mock('@ui/design/colors', () => ({
  getColors: () => ({
    primaryBackground: '#ffffff',
    error: '#ff0000'
  })
}));

jest.mock('@ui/design/layout', () => ({
  radius: { md: 8 },
  spacing: { lg: 16 }
}));

jest.mock('@ui/design/text', () => ({
  textStyles: {
    textErrorLarge: { fontSize: 16, fontWeight: 'bold' },
    textSecondary: { fontSize: 14, color: '#666' }
  }
}));

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should render error message', () => {
    const { getByText } = render(<ErrorBanner message="Test error message" />);
    
    expect(getByText('Erreur')).toBeInTheDocument();
    expect(getByText('Test error message')).toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(<ErrorBanner message="Test error message" />);
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[SimpliPass ErrorBanner]',
      'Test error message',
      '\nStack:',
      expect.any(String)
    );
  });

  it('should handle empty message', () => {
    const { getByText } = render(<ErrorBanner message="" />);
    
    expect(getByText('Erreur')).toBeInTheDocument();
  });
});
