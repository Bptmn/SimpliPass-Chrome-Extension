import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderTitle } from '../HeaderTitle';

describe('HeaderTitle', () => {
  const mockOnBackPress = jest.fn();

  beforeEach(() => {
    mockOnBackPress.mockClear();
  });

  it('renders title correctly', () => {
    const { getByText } = render(
      <HeaderTitle
        title="Test Title"
        onBackPress={mockOnBackPress}
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
  });

  it('calls onBackPress when back button is pressed', () => {
    const { getByTestId } = render(
      <HeaderTitle
        title="Test Title"
        onBackPress={mockOnBackPress}
      />
    );

    const backButton = getByTestId('back-btn');
    fireEvent.press(backButton);

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