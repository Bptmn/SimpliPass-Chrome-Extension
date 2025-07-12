/**
 * GeneratorPage component tests for SimpliPass
 * Tests password generation, settings, and user interactions
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GeneratorPage } from '../GeneratorPage';
import { ThemeProvider } from '@app/core/logic/theme';

// Mock dependencies
jest.mock('@app/core/hooks', () => ({
  useGeneratorPage: jest.fn(() => ({
    password: 'generatedPassword123',
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    strength: 'strong',
    isLoading: false,
    setLength: jest.fn(),
    setIncludeUppercase: jest.fn(),
    setIncludeLowercase: jest.fn(),
    setIncludeNumbers: jest.fn(),
    setIncludeSymbols: jest.fn(),
    setExcludeSimilar: jest.fn(),
    setExcludeAmbiguous: jest.fn(),
    generatePassword: jest.fn(),
    copyPassword: jest.fn(),
    savePassword: jest.fn(),
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('GeneratorPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders generator page with all controls', () => {
    const { getByText, getByLabelText } = renderWithTheme(<GeneratorPage />);

    expect(getByText('Password Generator')).toBeTruthy();
    expect(getByText('Length')).toBeTruthy();
    expect(getByText('Include Uppercase')).toBeTruthy();
    expect(getByText('Include Lowercase')).toBeTruthy();
    expect(getByText('Include Numbers')).toBeTruthy();
    expect(getByText('Include Symbols')).toBeTruthy();
    expect(getByText('Exclude Similar Characters')).toBeTruthy();
    expect(getByText('Exclude Ambiguous Characters')).toBeTruthy();
    expect(getByText('Generate')).toBeTruthy();
    expect(getByText('Copy')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  it('displays generated password', () => {
    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('generatedPassword123')).toBeTruthy();
  });

  it('displays password strength', () => {
    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('strong')).toBeTruthy();
  });

  it('handles length slider change', () => {
    const mockSetLength = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: mockSetLength,
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByLabelText } = renderWithTheme(<GeneratorPage />);
    const lengthSlider = getByLabelText('Password length slider');
    
    fireEvent.changeText(lengthSlider, '20');
    expect(mockSetLength).toHaveBeenCalledWith(20);
  });

  it('handles include uppercase toggle', () => {
    const mockSetIncludeUppercase = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: mockSetIncludeUppercase,
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const uppercaseToggle = getByText('Include Uppercase');
    
    fireEvent.press(uppercaseToggle);
    expect(mockSetIncludeUppercase).toHaveBeenCalledWith(false);
  });

  it('handles include lowercase toggle', () => {
    const mockSetIncludeLowercase = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: mockSetIncludeLowercase,
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const lowercaseToggle = getByText('Include Lowercase');
    
    fireEvent.press(lowercaseToggle);
    expect(mockSetIncludeLowercase).toHaveBeenCalledWith(false);
  });

  it('handles include numbers toggle', () => {
    const mockSetIncludeNumbers = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: mockSetIncludeNumbers,
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const numbersToggle = getByText('Include Numbers');
    
    fireEvent.press(numbersToggle);
    expect(mockSetIncludeNumbers).toHaveBeenCalledWith(false);
  });

  it('handles include symbols toggle', () => {
    const mockSetIncludeSymbols = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: mockSetIncludeSymbols,
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const symbolsToggle = getByText('Include Symbols');
    
    fireEvent.press(symbolsToggle);
    expect(mockSetIncludeSymbols).toHaveBeenCalledWith(false);
  });

  it('handles exclude similar toggle', () => {
    const mockSetExcludeSimilar = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: mockSetExcludeSimilar,
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const excludeSimilarToggle = getByText('Exclude Similar Characters');
    
    fireEvent.press(excludeSimilarToggle);
    expect(mockSetExcludeSimilar).toHaveBeenCalledWith(true);
  });

  it('handles exclude ambiguous toggle', () => {
    const mockSetExcludeAmbiguous = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: mockSetExcludeAmbiguous,
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const excludeAmbiguousToggle = getByText('Exclude Ambiguous Characters');
    
    fireEvent.press(excludeAmbiguousToggle);
    expect(mockSetExcludeAmbiguous).toHaveBeenCalledWith(true);
  });

  it('handles generate password button', () => {
    const mockGeneratePassword = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: mockGeneratePassword,
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const generateButton = getByText('Generate');
    
    fireEvent.press(generateButton);
    expect(mockGeneratePassword).toHaveBeenCalled();
  });

  it('handles copy password button', () => {
    const mockCopyPassword = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: mockCopyPassword,
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const copyButton = getByText('Copy');
    
    fireEvent.press(copyButton);
    expect(mockCopyPassword).toHaveBeenCalled();
  });

  it('handles save password button', () => {
    const mockSavePassword = jest.fn();
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: mockSavePassword,
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    const saveButton = getByText('Save');
    
    fireEvent.press(saveButton);
    expect(mockSavePassword).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'generatedPassword123',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'strong',
      isLoading: true,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('Generating...')).toBeTruthy();
  });

  it('displays different strength levels', () => {
    const mockUseGeneratorPage = require('@app/core/hooks').useGeneratorPage;
    mockUseGeneratorPage.mockReturnValue({
      password: 'weak',
      length: 8,
      includeUppercase: false,
      includeLowercase: true,
      includeNumbers: false,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false,
      strength: 'weak',
      isLoading: false,
      setLength: jest.fn(),
      setIncludeUppercase: jest.fn(),
      setIncludeLowercase: jest.fn(),
      setIncludeNumbers: jest.fn(),
      setIncludeSymbols: jest.fn(),
      setExcludeSimilar: jest.fn(),
      setExcludeAmbiguous: jest.fn(),
      generatePassword: jest.fn(),
      copyPassword: jest.fn(),
      savePassword: jest.fn(),
    });

    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('weak')).toBeTruthy();
  });

  it('displays password length', () => {
    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('16')).toBeTruthy();
  });

  it('displays current settings', () => {
    const { getByText } = renderWithTheme(<GeneratorPage />);
    expect(getByText('Include Uppercase')).toBeTruthy();
    expect(getByText('Include Lowercase')).toBeTruthy();
    expect(getByText('Include Numbers')).toBeTruthy();
    expect(getByText('Include Symbols')).toBeTruthy();
  });
}); 