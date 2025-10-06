import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

// Mock console.error to avoid test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('rendering', () => {
    it('should render error banner with message', () => {
      const errorMessage = 'Something went wrong';
      render(<ErrorBanner message={errorMessage} />);

      const errorBanner = screen.getByTestId('error-banner');
      expect(errorBanner).toBeInTheDocument();

      const title = screen.getByText('Erreur');
      expect(title).toBeInTheDocument();

      const message = screen.getByText(errorMessage);
      expect(message).toBeInTheDocument();
    });

    it('should render with empty message', () => {
      render(<ErrorBanner message="" />);

      const errorBanner = screen.getByTestId('error-banner');
      expect(errorBanner).toBeInTheDocument();

      const title = screen.getByText('Erreur');
      expect(title).toBeInTheDocument();
    });

    it('should render with long error message', () => {
      const longMessage = 'This is a very long error message that should be displayed properly in the error banner component without any issues or truncation';
      render(<ErrorBanner message={longMessage} />);

      const message = screen.getByText(longMessage);
      expect(message).toBeInTheDocument();
    });
  });

  describe('error logging', () => {
    it('should log error to console when message is provided', () => {
      const errorMessage = 'Test error message';
      render(<ErrorBanner message={errorMessage} />);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[SimpliPass ErrorBanner]',
        errorMessage,
        '\nStack:',
        expect.any(String)
      );
    });

    it('should not log error when message is empty', () => {
      render(<ErrorBanner message="" />);

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should log error with stack trace', () => {
      const errorMessage = 'Error with stack trace';
      render(<ErrorBanner message={errorMessage} />);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[SimpliPass ErrorBanner]',
        errorMessage,
        '\nStack:',
        expect.stringContaining('Error:')
      );
    });
  });

  describe('styling', () => {
    it('should have correct test id', () => {
      render(<ErrorBanner message="Test error" />);

      const errorBanner = screen.getByTestId('error-banner');
      expect(errorBanner).toBeInTheDocument();
    });

    it('should display error title', () => {
      render(<ErrorBanner message="Test error" />);

      const title = screen.getByText('Erreur');
      expect(title).toBeInTheDocument();
    });

    it('should display error message', () => {
      const errorMessage = 'Test error message';
      render(<ErrorBanner message={errorMessage} />);

      const message = screen.getByText(errorMessage);
      expect(message).toBeInTheDocument();
    });
  });

  describe('error message content', () => {
    it('should handle special characters in error message', () => {
      const specialMessage = 'Error with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      render(<ErrorBanner message={specialMessage} />);

      const message = screen.getByText(specialMessage);
      expect(message).toBeInTheDocument();
    });

    it('should handle unicode characters in error message', () => {
      const unicodeMessage = 'Error with unicode: 🚨 ⚠️ ❌ ✅';
      render(<ErrorBanner message={unicodeMessage} />);

      const message = screen.getByText(unicodeMessage);
      expect(message).toBeInTheDocument();
    });

    it('should handle multiline error message', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      render(<ErrorBanner message={multilineMessage} />);

      // Check that the multiline message is displayed (newlines are preserved in DOM)
      const message = screen.getByText((content, element) => {
        return element?.textContent === multilineMessage;
      });
      expect(message).toBeInTheDocument();
    });
  });

  describe('component behavior', () => {
    it('should re-render when message changes', () => {
      const { rerender } = render(<ErrorBanner message="Initial error" />);
      
      expect(screen.getByText('Initial error')).toBeInTheDocument();

      rerender(<ErrorBanner message="Updated error" />);
      
      expect(screen.getByText('Updated error')).toBeInTheDocument();
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });

    it('should handle null-like messages gracefully', () => {
      render(<ErrorBanner message={null as any} />);

      const errorBanner = screen.getByTestId('error-banner');
      expect(errorBanner).toBeInTheDocument();
    });

    it('should handle undefined messages gracefully', () => {
      render(<ErrorBanner message={undefined as any} />);

      const errorBanner = screen.getByTestId('error-banner');
      expect(errorBanner).toBeInTheDocument();
    });
  });
});
