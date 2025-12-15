// packages/common/utils/__tests__/validation.utils.test.ts
import {
  isValidEmail,
  validateEmail,
  checkPasswordStrengthRules,
  validatePassword,
  isValidUrl,
  validateUrl,
  isValidCreditCard,
  isValidCVV,
  isValidExpiryDate,
  validateField,
  validateForm,
  isFormValid,
  validateStringLength,
  validateRequired,
  validateNumberRange,
  validateInteger,
  validateDate,
  validateDateRange,
  validateArrayLength,
  validateRequiredProperties,
} from '../validation.utils';
import { checkPasswordStrength } from '../checkPasswordStrength';

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate a correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should invalidate an incorrect email', () => {
      expect(isValidEmail('test@example')).toBe(false);
    });

    it('should return null for a valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('should return an error for an invalid email', () => {
      expect(validateEmail('test@example')).toBe('Please enter a valid email address');
    });

    it('should return an error for an empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });
  });

  describe('Password Validation', () => {
    it('should identify a strong password', () => {
      const result = checkPasswordStrengthRules('Abcdef1!');
      expect(result.strength).toBe('very-strong');
      
      // Also test checkPasswordStrength from separate module (uses zxcvbn)
      const strength = checkPasswordStrength('Abcdef1!');
      expect(['weak', 'average', 'strong', 'perfect']).toContain(strength);
    });

    it('should return no errors for a valid password', () => {
      const result = validatePassword('Abcdef1!');
      expect(result.isValid).toBe(true);
    });

    it('should return errors for a weak password', () => {
      const result = validatePassword('abc');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('URL Validation', () => {
    it('should validate a correct URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should invalidate an incorrect URL', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('should return null for a valid URL', () => {
      expect(validateUrl('https://example.com')).toBeNull();
    });

    it('should return an error for an invalid URL', () => {
      expect(validateUrl('example.com')).toBe('Please enter a valid URL');
    });
  });

  describe('Credit Card Validation', () => {
    it('should validate a correct credit card number', () => {
      expect(isValidCreditCard('4111111111111111')).toBe(true);
    });

    it('should invalidate an incorrect credit card number', () => {
      expect(isValidCreditCard('1234567890123456')).toBe(false);
    });

    it('should validate a correct CVV', () => {
      expect(isValidCVV('123')).toBe(true);
    });

    it('should invalidate an incorrect CVV', () => {
      expect(isValidCVV('12')).toBe(false);
    });

    it('should validate a future expiry date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidExpiryDate(futureDate.getMonth() + 1, futureDate.getFullYear())).toBe(true);
    });

    it('should invalidate a past expiry date', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(isValidExpiryDate(pastDate.getMonth() + 1, pastDate.getFullYear())).toBe(false);
    });
  });

  describe('Generic Validation', () => {
    it('should validate a field with multiple rules', () => {
      const rules = [{ required: true }, { minLength: 5 }];
      const { isValid } = validateField('hello', rules);
      expect(isValid).toBe(true);
    });

    it('should return an error for a field that fails validation', () => {
      const rules = [{ required: true }, { minLength: 5 }];
      const { errors } = validateField('hi', rules);
      expect(errors).toContain('Minimum length is 5 characters');
    });

    it('should validate a form', () => {
      const values = { name: 'test', email: 'test@example.com' };
      const fields = [
        { name: 'name', validation: [{ required: true }] },
        { name: 'email', validation: [{ custom: validateEmail }] },
      ];
      const results = validateForm(values, fields);
      expect(isFormValid(results)).toBe(true);
    });
  });

  describe('String Validation', () => {
    it('should return null for a string of valid length', () => {
      expect(validateStringLength('hello', 3, 10)).toBeNull();
    });

    it('should return an error for a string that is too short', () => {
      expect(validateStringLength('hi', 3, 10)).toBe('Minimum length is 3 characters');
    });
    
    it('should return an error for a required field that is empty', () => {
        expect(validateRequired('', 'Username')).toBe('Username is required');
    });
  });

  describe('Number Validation', () => {
    it('should return null for a number in range', () => {
      expect(validateNumberRange(5, 1, 10)).toBeNull();
    });

    it('should return an error for a number out of range', () => {
      expect(validateNumberRange(11, 1, 10)).toBe('Value must be at most 10');
    });

    it('should return null for a valid integer', () => {
      expect(validateInteger(5)).toBeNull();
    });

    it('should return an error for a non-integer', () => {
      expect(validateInteger(5.5)).toBe('Value must be a whole number');
    });
  });

  describe('Date Validation', () => {
    it('should return null for a valid date', () => {
      expect(validateDate('2022-01-01')).toBeNull();
    });

    it('should return an error for an invalid date', () => {
      expect(validateDate('not a date')).toBe('Please enter a valid date');
    });

    it('should return null for a date in range', () => {
      const date = new Date('2022-01-01');
      const minDate = new Date('2021-01-01');
      const maxDate = new Date('2023-01-01');
      expect(validateDateRange(date, minDate, maxDate)).toBeNull();
    });
  });

  describe('Array Validation', () => {
    it('should return null for an array of valid length', () => {
      expect(validateArrayLength([1, 2, 3], 1, 5)).toBeNull();
    });

    it('should return an error for an array that is too short', () => {
      expect(validateArrayLength([1], 2, 5)).toBe('Must have at least 2 items');
    });
  });

  describe('Object Validation', () => {
    it('should return null for an object with required properties', () => {
      expect(validateRequiredProperties({ name: 'test', age: 25 }, ['name', 'age'])).toBeNull();
    });

    it('should return an error for an object missing required properties', () => {
      expect(validateRequiredProperties({ name: 'test' }, ['name', 'age'])).toBe('Missing required property: age');
    });
  });
});
