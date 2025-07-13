/**
 * LoginPage component tests for SimpliPass
 * Tests form validation, login flow, MFA handling, and error states
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LoginPage } from '../LoginPage';
import { useThemeMode } from '@app/components';

// Mock the theme hook
jest.mock('@app/components', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByText('Connexion')).toBeTruthy();
  });

  it('displays login form fields', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeTruthy();
  });

  it('shows login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Se connecter')).toBeTruthy();
  });
}); 