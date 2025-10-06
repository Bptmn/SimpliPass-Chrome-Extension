import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InitializationErrorBoundary } from '../InitializationErrorBoundary';

// Mock console.error to avoid test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('InitializationErrorBoundary', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('normal rendering', () => {
    it('should render children when no error', () => {
      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    it('should render children when initialization error is null', () => {
      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('initialization error handling', () => {
    it('should display initialization error when provided', () => {
      const errorMessage = 'Failed to initialize Firebase';
      render(
        <InitializationErrorBoundary initializationError={errorMessage} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Initialization Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const errorMessage = 'Failed to initialize';
      mockOnRetry.mockResolvedValue(undefined);

      render(
        <InitializationErrorBoundary initializationError={errorMessage} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle retry failure gracefully', async () => {
      const errorMessage = 'Failed to initialize';
      mockOnRetry.mockRejectedValue(new Error('Retry failed'));

      render(
        <InitializationErrorBoundary initializationError={errorMessage} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Ext/ErrorBoundary] Retry failed:',
        expect.any(Error)
      );
    });

    it('should reset error state when initialization error is cleared', () => {
      const { rerender } = render(
        <InitializationErrorBoundary initializationError="Initial error" onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Initialization Error')).toBeInTheDocument();

      rerender(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.queryByText('Initialization Error')).not.toBeInTheDocument();
    });
  });

  describe('runtime error handling', () => {
    it('should catch and display runtime errors', () => {
      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <ThrowError shouldThrow={true} />
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByText('Reload')).toBeInTheDocument();
    });

    it('should log runtime errors to console', () => {
      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <ThrowError shouldThrow={true} />
        </InitializationErrorBoundary>
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Ext/ErrorBoundary] Caught error:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle errors without message', () => {
      // Create a component that throws an error without a message
      const ThrowErrorNoMessage = () => {
        throw new Error();
      };

      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <ThrowErrorNoMessage />
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('should call onRetry when reload button is clicked for runtime errors', async () => {
      mockOnRetry.mockResolvedValue(undefined);

      render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <ThrowError shouldThrow={true} />
        </InitializationErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload');
      fireEvent.click(reloadButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('error boundary behavior', () => {
    it('should reset error state after successful retry', async () => {
      const { rerender } = render(
        <InitializationErrorBoundary initializationError="Initial error" onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Initialization Error')).toBeInTheDocument();

      mockOnRetry.mockResolvedValue(undefined);
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });

      // Simulate successful retry by clearing initialization error
      rerender(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should handle multiple error states correctly', () => {
      const { rerender } = render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <ThrowError shouldThrow={true} />
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();

      // Clear runtime error and show initialization error
      rerender(
        <InitializationErrorBoundary initializationError="Init error" onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Initialization Error')).toBeInTheDocument();
      expect(screen.getByText('Init error')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should handle component updates correctly', () => {
      const { rerender } = render(
        <InitializationErrorBoundary initializationError={null} onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();

      // Update with initialization error
      rerender(
        <InitializationErrorBoundary initializationError="New error" onRetry={mockOnRetry}>
          <div data-testid="child">Child component</div>
        </InitializationErrorBoundary>
      );

      expect(screen.getByText('Initialization Error')).toBeInTheDocument();
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });
  });
});
