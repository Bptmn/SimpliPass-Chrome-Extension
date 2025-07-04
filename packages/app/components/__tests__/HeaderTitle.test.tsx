import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderTitle } from '../HeaderTitle';

describe('HeaderTitle', () => {
  const mockOnBackPress = jest.fn();

  beforeEach(() => {
    mockOnBackPress.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(
      <HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('←')).toBeTruthy();
    expect(getByTestId('header-title')).toBeTruthy();
    expect(getByTestId('back-btn')).toBeTruthy();
  });

  it('renders with custom back button text', () => {
    const { getByText } = render(
      <HeaderTitle 
        title="Test Title" 
        onBackPress={mockOnBackPress}
        backButtonText="‹"
      />
    );

    expect(getByText('‹')).toBeTruthy();
  });

  it('calls onBackPress when back button is pressed', () => {
    const { getByTestId } = render(
      <HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />
    );

    fireEvent.press(getByTestId('back-btn'));
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders with custom testID', () => {
    const { getByTestId } = render(
      <HeaderTitle 
        title="Test Title" 
        onBackPress={mockOnBackPress}
        testID="custom-header"
      />
    );

    expect(getByTestId('custom-header')).toBeTruthy();
  });

  it('renders with custom accessibility label', () => {
    const { getByLabelText } = render(
      <HeaderTitle 
        title="Test Title" 
        onBackPress={mockOnBackPress}
        accessibilityLabel="Custom back button"
      />
    );

    expect(getByLabelText('Custom back button')).toBeTruthy();
  });

  it('uses default accessibility label when not provided', () => {
    const { getByLabelText } = render(
      <HeaderTitle title="Test Title" onBackPress={mockOnBackPress} />
    );

    expect(getByLabelText('Retour')).toBeTruthy();
  });
}); 