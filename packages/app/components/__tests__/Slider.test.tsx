import React from 'react';
import { render } from '@testing-library/react-native';
import { Slider } from '../Slider';
import { ThemeProvider } from '@app/core/logic/theme';

// Helper to wrap components in theme provider
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Slider', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders with label', () => {
    const { getByText } = renderWithTheme(
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
    const { queryByText } = renderWithTheme(
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
    const { getByText } = renderWithTheme(
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
    const { getByLabelText } = renderWithTheme(
      <Slider value={50} onValueChange={() => {}} min={0} max={100} testID="custom-slider" />
    );
    expect(getByLabelText('Slider')).toBeTruthy();
  });

  it('renders with accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <Slider value={50} onValueChange={() => {}} min={0} max={100} accessibilityLabel="Custom accessibility label" />
    );
    expect(getByLabelText('Custom accessibility label')).toBeTruthy();
  });
}); 