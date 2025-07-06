import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Slider } from '../Slider';

describe('Slider', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Slider
        value={10}
        onValueChange={mockOnValueChange}
        min={0}
        max={20}
        label="Test Slider"
      />
    );

    expect(getByText('Test Slider')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('Test Slider: 10')).toBeTruthy();
  });

  it('renders without label when not provided', () => {
    const { queryByText, getByText } = render(
      <Slider
        value={5}
        onValueChange={mockOnValueChange}
        min={0}
        max={10}
      />
    );

    expect(queryByText('Test Slider')).toBeFalsy();
    expect(getByText('5')).toBeTruthy();
  });

  it('renders without value display when showValue is false', () => {
    const { queryByText } = render(
      <Slider
        value={15}
        onValueChange={mockOnValueChange}
        min={0}
        max={30}
        label="Test"
        showValue={false}
      />
    );

    expect(queryByText('Test: 15')).toBeFalsy();
  });

  it('handles disabled state correctly', () => {
    const { getByRole } = render(
      <Slider
        value={10}
        onValueChange={mockOnValueChange}
        min={0}
        max={20}
        disabled={true}
        label="Disabled Slider"
      />
    );

    const slider = getByRole('adjustable');
    expect(slider.props.accessibilityState.disabled).toBe(true);
  });

  it('calls onValueChange when value changes on web', () => {
    const { getByRole } = render(
      <Slider
        value={10}
        onValueChange={mockOnValueChange}
        min={0}
        max={20}
        label="Test Slider"
      />
    );

    const slider = getByRole('slider');
    fireEvent(slider, 'change', { target: { value: '15' } });

    expect(mockOnValueChange).toHaveBeenCalledWith(15);
  });

  it('respects step value when provided', () => {
    const { getByRole } = render(
      <Slider
        value={10}
        onValueChange={mockOnValueChange}
        min={0}
        max={20}
        step={5}
        label="Stepped Slider"
      />
    );

    const slider = getByRole('slider');
    expect(slider.props.step).toBe(5);
  });
}); 