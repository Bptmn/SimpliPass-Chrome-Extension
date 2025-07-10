import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderTitle } from '../HeaderTitle';
import { LightThemeProvider } from '../storybook/ThemeProviders';

// Helper to wrap components in theme provider
const renderWithTheme = (ui: React.ReactElement) => render(<LightThemeProvider>{ui}</LightThemeProvider>);

describe('HeaderTitle', () => {
  const mockOnBackPress = jest.fn();

  beforeEach(() => {
    mockOnBackPress.mockClear();
  });

  it('renders title correctly', () => {
    const { getByText } = renderWithTheme(
      <HeaderTitle
        title="Test Title"
        onBackPress={mockOnBackPress}
      />
    );

    expect(getByText('Test Title', { exact: false })).toBeTruthy();
  });

  it('calls onBackPress when back button is pressed', () => {
    const { getByLabelText } = renderWithTheme(
      <HeaderTitle
        title="Test Title"
        onBackPress={mockOnBackPress}
      />
    );

    const backButton = getByLabelText('Retour');
    fireEvent.press(backButton);

    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders with custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <HeaderTitle
        title="Test Title"
        onBackPress={mockOnBackPress}
        testID="custom-header"
      />
    );

    expect(getByTestId('custom-header')).toBeTruthy();
  });

  it('renders with custom accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <HeaderTitle 
        title="Test Title" 
        onBackPress={mockOnBackPress}
        accessibilityLabel="Custom back button"
      />
    );

    expect(getByLabelText('Custom back button')).toBeTruthy();
  });

  it('uses default accessibility label when not provided', () => {
    const { getByLabelText } = renderWithTheme(
      <HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />
    );

    expect(getByLabelText('Retour')).toBeTruthy();
  });
}); 