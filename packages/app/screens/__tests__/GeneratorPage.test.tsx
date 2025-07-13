/**
 * GeneratorPage component tests for SimpliPass
 * Tests password generation, settings, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GeneratorPage } from '../GeneratorPage';
import { useThemeMode } from '@app/components';

// Mock the theme hook
jest.mock('@app/components', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

describe('GeneratorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<GeneratorPage />);
    expect(screen.getByText('Générateur de mot de passe')).toBeTruthy();
  });

  it('displays password generation options', () => {
    render(<GeneratorPage />);
    expect(screen.getByText('Longueur')).toBeTruthy();
    expect(screen.getByText('Majuscules')).toBeTruthy();
    expect(screen.getByText('Minuscules')).toBeTruthy();
    expect(screen.getByText('Chiffres')).toBeTruthy();
    expect(screen.getByText('Symboles')).toBeTruthy();
  });

  it('allows password regeneration', () => {
    render(<GeneratorPage />);
    const regenerateButton = screen.getByText('Régénérer');
    expect(regenerateButton).toBeTruthy();
  });
}); 