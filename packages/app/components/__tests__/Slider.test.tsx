import React from 'react';
import { render } from '@testing-library/react-native';
import { Slider } from '../Slider';

describe('Slider', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Slider
        value={50}
        onValueChange={mockOnValueChange}
        min={0}
        max={100}
        label="Test Slider"
      />
    );

    expect(getByText('Test Slider [50]')).toBeTruthy();
  });

  it('renders without label', () => {
    const { queryByText } = render(
      <Slider
        value={50}
        onValueChange={mockOnValueChange}
        min={0}
        max={100}
      />
    );

    expect(queryByText(/Test Slider/)).toBeNull();
  });

  it('displays min and max values', () => {
    const { getByText } = render(
      <Slider
        value={50}
        onValueChange={mockOnValueChange}
        min={0}
        max={100}
        label="Test Slider"
      />
    );

    expect(getByText('0')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  it('renders with custom testID', () => {
    const { getByTestId } = render(
      <Slider
        value={50}
        onValueChange={mockOnValueChange}
        min={0}
        max={100}
        testID="custom-slider"
      />
    );

    expect(getByTestId('custom-slider')).toBeTruthy();
  });

  it('renders with accessibility label', () => {
    const { getByRole } = render(
      <Slider
        value={50}
        onValueChange={mockOnValueChange}
        min={0}
        max={100}
        accessibilityLabel="Custom accessibility label"
      />
    );

    expect(getByRole('adjustable')).toBeTruthy();
  });
}); 