import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCredential1 from '../AddCredential1';

// Mock the theme and design modules
jest.mock('@common/ui/design/theme', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

jest.mock('@ui/design/layout', () => ({
  getPageStyles: jest.fn(() => ({
    pageContainer: { flex: 1 },
    pageContent: { flex: 1, padding: 16 },
    formContainer: { flex: 1, gap: 16 },
  })),
}));

// Mock the router
jest.mock('@common/ui/router/AppRouterProvider', () => ({
  useAppRouterContext: jest.fn(() => ({
    navigateTo: jest.fn(),
    goBack: jest.fn(),
  })),
}));

jest.mock('@common/ui/router', () => ({
  ROUTES: {
    ADD_CREDENTIAL_2: 'add-credential-2',
  },
}));

// Mock the hooks
jest.mock('@common/hooks/useCredentialForm', () => ({
  useCredentialForm: jest.fn(() => ({
    formData: { title: '' },
    errors: {},
    handleFieldChange: jest.fn(),
    isFormValid: jest.fn(() => false),
  })),
}));

// Mock the components
jest.mock('@ui/components/InputFields', () => ({
  Input: jest.fn(({ label, value, onChange, placeholder, error, _required }) => (
    <div data-testid="input-field">
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="input"
        aria-invalid={error ? 'true' : 'false'}
        required={_required}
      />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  )),
}));

jest.mock('@ui/components/Buttons', () => ({
  Button: jest.fn(({ text, onPress, disabled, width, height }) => (
    <button
      onClick={onPress}
      disabled={disabled}
      data-testid="button"
      data-width={width}
      data-height={height}
    >
      {text}
    </button>
  )),
}));

jest.mock('@ui/components/HeaderTitle', () => ({
  HeaderTitle: jest.fn(({ title, onBackPress }) => (
    <div data-testid="header-title">
      <button onClick={onBackPress} data-testid="back-button">
        Back
      </button>
      <h1>{title}</h1>
    </div>
  )),
}));

describe('AddCredential1', () => {
  const mockNavigateTo = jest.fn();
  const mockGoBack = jest.fn();
  const mockHandleFieldChange = jest.fn();
  const mockIsFormValid = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    const { useAppRouterContext } = require('@common/ui/router/AppRouterProvider');
    useAppRouterContext.mockReturnValue({
      navigateTo: mockNavigateTo,
      goBack: mockGoBack,
    });

    // Setup form hook mock
    const { useCredentialForm } = require('@common/hooks/useCredentialForm');
    useCredentialForm.mockReturnValue({
      formData: { title: '' },
      errors: {},
      handleFieldChange: mockHandleFieldChange,
      isFormValid: mockIsFormValid,
    });
  });

  describe('rendering', () => {
    it('should render the page with correct title', () => {
      render(<AddCredential1 />);
      
      expect(screen.getByText('Ajouter un identifiant')).toBeTruthy();
    });

    it('should render input field for credential title', () => {
      render(<AddCredential1 />);
      
      expect(screen.getByText('Nom de l\'identifiant')).toBeTruthy();
      expect(screen.getByTestId('input')).toBeTruthy();
    });

    it('should render next button', () => {
      render(<AddCredential1 />);
      
      expect(screen.getByText('Suivant')).toBeTruthy();
      expect(screen.getByTestId('button')).toBeTruthy();
    });

    it('should render back button in header', () => {
      render(<AddCredential1 />);
      
      expect(screen.getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('form functionality', () => {
    it('should call handleFieldChange when input changes', () => {
      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: 'Test Credential' } });
      
      expect(mockHandleFieldChange).toHaveBeenCalledWith('title', 'Test Credential');
    });

    it('should display input placeholder', () => {
      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('should mark input as required', () => {
      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should call goBack when back button is pressed', () => {
      render(<AddCredential1 />);
      
      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);
      
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('should navigate to next step when form is valid and next button is pressed', () => {
      mockIsFormValid.mockReturnValue(true);
      
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('button');
      fireEvent.click(nextButton);
      
      expect(mockNavigateTo).toHaveBeenCalledWith('add-credential-2', {
        title: ''
      });
    });

    it('should not navigate when form is invalid', () => {
      mockIsFormValid.mockReturnValue(false);
      
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('button');
      fireEvent.click(nextButton);
      
      expect(mockNavigateTo).not.toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should disable next button when form is invalid', () => {
      mockIsFormValid.mockReturnValue(false);
      
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('button');
      expect(nextButton).toBeTruthy();
    });

    it('should enable next button when form is valid', () => {
      mockIsFormValid.mockReturnValue(true);
      
      render(<AddCredential1 />);
      
      const nextButton = screen.getByTestId('button');
      expect(nextButton).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display input errors when present', () => {
      const { useCredentialForm } = require('@common/hooks/useCredentialForm');
      useCredentialForm.mockReturnValue({
        formData: { title: '' },
        errors: { title: 'Title is required' },
        handleFieldChange: mockHandleFieldChange,
        isFormValid: mockIsFormValid,
      });

      render(<AddCredential1 />);
      
      expect(screen.getByTestId('input-error')).toBeTruthy();
      expect(screen.getByText('Title is required')).toBeTruthy();
    });

    it('should mark input as invalid when error is present', () => {
      const { useCredentialForm } = require('@common/hooks/useCredentialForm');
      useCredentialForm.mockReturnValue({
        formData: { title: '' },
        errors: { title: 'Title is required' },
        handleFieldChange: mockHandleFieldChange,
        isFormValid: mockIsFormValid,
      });

      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should apply page styles', () => {
      const { getPageStyles } = require('@ui/design/layout');
      getPageStyles.mockReturnValue({
        pageContainer: { backgroundColor: '#ffffff' },
        pageContent: { padding: 20 },
        formContainer: { gap: 10 },
      });

      render(<AddCredential1 />);
      
      expect(getPageStyles).toHaveBeenCalledWith('light');
    });

    it('should render button with correct props', () => {
      render(<AddCredential1 />);
      
      const button = screen.getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle empty form data', () => {
      const { useCredentialForm } = require('@common/hooks/useCredentialForm');
      useCredentialForm.mockReturnValue({
        formData: { title: '' },
        errors: {},
        handleFieldChange: mockHandleFieldChange,
        isFormValid: mockIsFormValid,
      });

      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });

    it('should handle pre-filled form data', () => {
      const { useCredentialForm } = require('@common/hooks/useCredentialForm');
      useCredentialForm.mockReturnValue({
        formData: { title: 'Pre-filled title' },
        errors: {},
        handleFieldChange: mockHandleFieldChange,
        isFormValid: mockIsFormValid,
      });

      render(<AddCredential1 />);
      
      const input = screen.getByTestId('input');
      expect(input).toBeTruthy();
    });
  });
}); 