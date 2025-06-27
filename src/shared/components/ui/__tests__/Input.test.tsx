/**
 * Input Component Tests
 * Tests the main Input component functionality including validation and user interactions
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Input from '../Input';

describe('Input Component', () => {
  // === BASIC RENDERING ===
  test('renders with required label prop', () => {
    render(<Input label="Test Label" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    const placeholder = 'Enter your email';
    render(<Input label="Email" placeholder={placeholder} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  test('renders with initial value', () => {
    const initialValue = 'test@example.com';
    render(<Input label="Email" initialValue={initialValue} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(initialValue);
  });

  // === PASSWORD MODE ===
  test('renders as password field when password prop is true', () => {
    render(<Input label="Password" password={true} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('toggles password visibility when eye button is clicked', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" password={true} />);

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText(/mot de passe/i);

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  // === USER INTERACTIONS ===
  test('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<Input label="Test" />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'hello world');
    expect(input).toHaveValue('hello world');
  });

  test('clears input when value is deleted', async () => {
    const user = userEvent.setup();
    render(<Input label="Test" initialValue="initial text" />);
    const input = screen.getByRole('textbox');

    await user.clear(input);
    expect(input).toHaveValue('');
  });

  // === ACCESSIBILITY ===
  test('has proper accessibility structure', () => {
    render(<Input label="Email Address" />);

    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveClass('input-label');
    expect(input).toHaveClass('input-field');
  });

  test('password toggle button has proper accessibility', () => {
    render(<Input label="Password" password={true} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('type', 'button');
  });
});
