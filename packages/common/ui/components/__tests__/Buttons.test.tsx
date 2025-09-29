/**
 * Tests for Buttons component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../Buttons';

// Mock the theme dependencies
jest.mock('@common/ui/design/theme', () => ({
  useThemeMode: () => ({ mode: 'light' })
}));

jest.mock('@ui/design/colors', () => ({
  getColors: () => ({
    whiteText: '#ffffff'
  })
}));

jest.mock('@ui/design/layout', () => ({
  radius: { xl: 12 },
  spacing: { lg: 16 }
}));

jest.mock('@ui/design/typography', () => ({
  typography: {
    fontSize: { sm: 14 }
  }
}));

jest.mock('@ui/design/text', () => ({
  textStyles: {
    textButton: { fontWeight: 'bold' },
    textButtonOutline: { fontWeight: 'normal' }
  }
}));

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with default props', () => {
    const { getByText, getByRole } = render(<Button text="Test Button" color="#ff0000" onPress={mockOnPress} />);
    
    expect(getByText('Test Button')).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should call onPress when clicked', () => {
    const { getByRole } = render(<Button text="Test Button" color="#ff0000" onPress={mockOnPress} />);
    
    fireEvent.click(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render outline button', () => {
    const { getByText } = render(<Button text="Outline Button" color="#ff0000" outline onPress={mockOnPress} />);
    
    expect(getByText('Outline Button')).toBeInTheDocument();
  });

  it('should render disabled button', () => {
    const { getByText } = render(<Button text="Disabled Button" color="#ff0000" disabled onPress={mockOnPress} />);
    
    expect(getByText('Disabled Button')).toBeInTheDocument();
  });

  it('should not call onPress when disabled', () => {
    const { getByRole } = render(<Button text="Disabled Button" color="#ff0000" disabled onPress={mockOnPress} />);
    
    fireEvent.click(getByRole('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
