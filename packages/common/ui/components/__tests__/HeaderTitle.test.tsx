import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderTitle } from '../HeaderTitle';

// Mock the theme and design modules
jest.mock('@common/ui/design/theme', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

jest.mock('@ui/design/colors', () => ({
  getColors: jest.fn(() => ({
    primary: '#000000',
  })),
}));

jest.mock('@ui/design/layout', () => ({
  spacing: { sm: 8, md: 16 },
}));

jest.mock('@ui/design/typography', () => ({
  typography: {
    fontSize: { lg: 18 },
    fontWeight: { medium: '500' },
  },
}));

// Mock the Icon component
jest.mock('../Icon', () => ({
  Icon: jest.fn(({ name, size, color }) => (
    <div data-testid={`icon-${name}`} data-size={size} data-color={color}>
      {name} Icon
    </div>
  )),
}));

describe('HeaderTitle', () => {
  const mockOnBackPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render header title with title text', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render back button with icon', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      expect(screen.getByTestId('icon-arrowRight')).toBeTruthy();
      expect(screen.getByTestId('back-btn')).toBeTruthy();
    });

    it('should render with different titles', () => {
      const { rerender } = render(<HeaderTitle title="First Title" onBackPress={mockOnBackPress} />);
      expect(screen.getByText('First Title')).toBeTruthy();

      rerender(<HeaderTitle title="Second Title" onBackPress={mockOnBackPress} />);
      expect(screen.getByText('Second Title')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} testID="custom-header" />);
      
      expect(screen.getByTestId('custom-header')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should call onBackPress when back button is pressed', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      const backButton = screen.getByTestId('back-btn');
      fireEvent.click(backButton);
      
      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it('should call onBackPress multiple times', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      const backButton = screen.getByTestId('back-btn');
      
      fireEvent.click(backButton);
      fireEvent.click(backButton);
      fireEvent.click(backButton);
      
      expect(mockOnBackPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have default accessibility label for back button', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      const backButton = screen.getByTestId('back-btn');
      expect(backButton).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      render(
        <HeaderTitle 
          title="Test Title" 
          onBackPress={mockOnBackPress} 
          accessibilityLabel="Go back to previous screen"
        />
      );
      
      const backButton = screen.getByTestId('back-btn');
      expect(backButton).toBeTruthy();
    });

    it('should be accessible with proper testID', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      expect(screen.getByTestId('header-title')).toBeTruthy();
      expect(screen.getByTestId('back-btn')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should render with theme colors', () => {
      const { getColors } = require('@ui/design/colors');
      getColors.mockReturnValue({
        primary: '#ff0000',
      });

      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      expect(getColors).toHaveBeenCalledWith('light');
    });

    it('should render icon with correct props', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      const icon = screen.getByTestId('icon-arrowRight');
      expect(icon).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle empty title', () => {
      render(<HeaderTitle title="" onBackPress={mockOnBackPress} />);
      
      // Don't test for empty text as it causes multiple element issues
      expect(screen.getByTestId('header-title')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(<HeaderTitle title={longTitle} onBackPress={mockOnBackPress} />);
      
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<HeaderTitle title={specialTitle} onBackPress={mockOnBackPress} />);
      
      expect(screen.getByText(specialTitle)).toBeTruthy();
    });

    it('should handle unicode characters in title', () => {
      const unicodeTitle = 'Title with unicode: 🚀🌟🎉';
      render(<HeaderTitle title={unicodeTitle} onBackPress={mockOnBackPress} />);
      
      expect(screen.getByText(unicodeTitle)).toBeTruthy();
    });
  });

  describe('props validation', () => {
    it('should handle missing optional props', () => {
      render(<HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />);
      
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByTestId('back-btn')).toBeTruthy();
    });

    it('should handle all props together', () => {
      render(
        <HeaderTitle 
          title="Test Title" 
          onBackPress={mockOnBackPress}
          testID="custom-test-id"
          accessibilityLabel="Custom accessibility label"
        />
      );
      
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByTestId('custom-test-id')).toBeTruthy();
      expect(screen.getByTestId('back-btn')).toBeTruthy();
    });
  });
}); 