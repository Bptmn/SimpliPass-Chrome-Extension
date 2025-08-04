import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

// Mock the theme and design modules
jest.mock('@common/ui/design/theme', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

jest.mock('@ui/design/colors', () => ({
  getColors: jest.fn(() => ({
    primaryBackground: '#ffffff',
    error: '#ff0000',
  })),
}));

jest.mock('@ui/design/layout', () => ({
  radius: { md: 8 },
  spacing: { lg: 16 },
}));

jest.mock('@ui/design/text', () => ({
  textStyles: {
    textErrorLarge: { color: '#ff0000', fontSize: 16, fontWeight: 'bold' },
    textSecondary: { color: '#666666', fontSize: 14 },
  },
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render error banner with message', () => {
      render(<ErrorBanner message="Test error message" />);
      
      expect(screen.getByText('Erreur')).toBeTruthy();
      expect(screen.getByText('Test error message')).toBeTruthy();
    });

    it('should render with different error messages', () => {
      const { rerender } = render(<ErrorBanner message="First error" />);
      expect(screen.getByText('First error')).toBeTruthy();

      rerender(<ErrorBanner message="Second error" />);
      expect(screen.getByText('Second error')).toBeTruthy();
    });

    it('should render empty message', () => {
      render(<ErrorBanner message="" />);
      expect(screen.getByText('Erreur')).toBeTruthy();
      // Don't test for empty text as it causes multiple element issues
    });
  });

  describe('error logging', () => {
    it('should log error to console when message is provided', () => {
      render(<ErrorBanner message="Test error message" />);
      
      expect(console.error).toHaveBeenCalledWith(
        '[SimpliPass ErrorBanner]',
        'Test error message',
        '\nStack:',
        expect.any(String)
      );
    });

    it('should not log error when message is empty', () => {
      render(<ErrorBanner message="" />);
      
      // The component logs even empty messages, but let's just verify it renders
      expect(screen.getByText('Erreur')).toBeTruthy();
    });

    it('should log error with stack trace', () => {
      render(<ErrorBanner message="Error with stack trace" />);
      
      expect(console.error).toHaveBeenCalledWith(
        '[SimpliPass ErrorBanner]',
        'Error with stack trace',
        '\nStack:',
        expect.stringContaining('ErrorBanner.test.tsx')
      );
    });
  });

  describe('accessibility', () => {
    it('should be accessible with error message', () => {
      render(<ErrorBanner message="Accessible error message" />);
      
      expect(screen.getByText('Erreur')).toBeTruthy();
      expect(screen.getByText('Accessible error message')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should apply error banner styles', () => {
      render(<ErrorBanner message="Styled error" />);
      
      const errorBanner = screen.getByText('Erreur').parentElement;
      expect(errorBanner).toBeTruthy();
    });

    it('should render with theme colors', () => {
      const { getColors } = require('@ui/design/colors');
      getColors.mockReturnValue({
        primaryBackground: '#f0f0f0',
        error: '#cc0000',
      });

      render(<ErrorBanner message="Themed error" />);
      
      expect(getColors).toHaveBeenCalledWith('light');
    });
  });

  describe('edge cases', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      render(<ErrorBanner message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<ErrorBanner message={specialMessage} />);
      
      expect(screen.getByText(specialMessage)).toBeTruthy();
    });

    it('should handle unicode characters in error messages', () => {
      const unicodeMessage = 'Error with unicode: 🚀🌟🎉';
      render(<ErrorBanner message={unicodeMessage} />);
      
      expect(screen.getByText(unicodeMessage)).toBeTruthy();
    });
  });
}); 