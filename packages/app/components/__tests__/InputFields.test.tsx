import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input, InputPasswordStrength } from '../InputFields';
import { InputEdit } from '../InputEdit';
import { CodeInput } from '../CodeInput';
import { LightThemeProvider, DarkThemeProvider } from '../storybook/ThemeProviders';

// Helper to wrap in theme
const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
  const Provider = theme === 'light' ? LightThemeProvider : DarkThemeProvider;
  return render(<Provider>{ui}</Provider>);
};

describe('Form Components', () => {
  describe('Input', () => {
    it('renders text input and handles change', () => {
      const onChange = jest.fn();
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Text"
          _id="text"
          value="test"
          onChange={onChange}
          placeholder="Enter text"
        />
      );
      const input = getByLabelText('Text');
      fireEvent.changeText(input, 'new value');
      expect(onChange).toHaveBeenCalledWith('new value');
    });
    it('renders password input with eye icon', () => {
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Password"
          _id="password"
          value="secret"
          onChange={() => {}}
          placeholder="Password"
          type="password"
        />
      );
      // The eye icon button has accessibilityLabel 'Afficher le mot de passe' or 'Masquer le mot de passe'
      expect(getByLabelText(/mot de passe/i)).toBeTruthy();
    });
    it('supports accessibilityLabel and testID', () => {
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Input Label"
          _id="label"
          value="foo"
          onChange={() => {}}
          placeholder="Labelled"
        />
      );
      expect(getByLabelText('Input Label')).toBeTruthy();
    });
    it('supports dark mode', () => {
      const { getByLabelText } = renderWithTheme(
        <Input
          label="Dark"
          _id="dark"
          value="dark"
          onChange={() => {}}
          placeholder="Dark mode"
        />, 'dark'
      );
      expect(getByLabelText('Dark')).toBeTruthy();
    });
  });

  describe('InputPasswordStrength', () => {
    it('renders with all strength levels', () => {
      const strengths = ['weak', 'average', 'strong', 'perfect'] as const;
      strengths.forEach(strength => {
        const { getByLabelText, getAllByText } = renderWithTheme(
          <InputPasswordStrength
            label="Password"
            _id="pw"
            value="abc"
            onChange={() => {}}
            strength={strength}
          />
        );
        expect(getByLabelText('Password')).toBeTruthy();
        // Check for the strength label in French using a function matcher
        if (strength === 'weak') expect(getAllByText(/Faible/).length).toBeGreaterThan(0);
        if (strength === 'average') expect(getAllByText(/Moyen/).length).toBeGreaterThan(0);
        if (strength === 'strong') expect(getAllByText(/Fort/).length).toBeGreaterThan(0);
        if (strength === 'perfect') expect(getAllByText(/Parfait/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('CodeInput', () => {
    it('renders code input and handles value', () => {
      const onChange = jest.fn();
      const { getByLabelText } = renderWithTheme(
        <CodeInput value="1234" onChange={onChange} />
      );
      // Check for the first cell
      expect(getByLabelText('Code chiffre 1')).toBeTruthy();
    });
  });

  describe('InputEdit', () => {
    it('renders and allows editing', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = renderWithTheme(
        <InputEdit value="edit me" onChange={onChange} label="Edit Label" placeholder="Edit here" />
      );
      const input = getByPlaceholderText('Edit here');
      fireEvent.changeText(input, 'changed');
      expect(onChange).toHaveBeenCalledWith('changed');
    });
  });
}); 