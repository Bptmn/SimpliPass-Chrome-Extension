// validationService.ts
// Business logic and validation functions moved from utils/validation.utils.ts

import type { ValidationResult } from '@common/types/errors.types';

// ===== Card Validation Service =====

export const cardValidationService = {
  /**
   * Validates a credit card number using Luhn algorithm and length checks
   */
  validateCardNumber: (number: string): ValidationResult => {
    const cleaned = number.replace(/\s/g, '');
    
    // Check if it's a valid length (13-19 digits)
    if (!/^\d{13,19}$/.test(cleaned)) {
      return { isValid: false, error: 'Invalid card number' };
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const isValid = sum % 10 === 0;
    return { isValid, error: isValid ? undefined : 'Invalid card number' };
  },

  /**
   * Validates card expiration date format and ensures it's not expired
   */
  validateExpirationDate: (date: string): ValidationResult => {
    // Check format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(date)) {
      return { isValid: false, error: 'Invalid date format (MM/YY)' };
    }
    
    const [month, year] = date.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate month (1-12)
    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: 'Invalid month' };
    }
    
    // Validate year (00-99)
    if (yearNum < 0 || yearNum > 99) {
      return { isValid: false, error: 'Invalid year' };
    }
    
    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return { isValid: false, error: 'Card expired' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Validates CVV (3-4 digits)
   */
  validateCVV: (cvv: string): ValidationResult => {
    const isValid = /^\d{3,4}$/.test(cvv);
    return { isValid, error: isValid ? undefined : 'Invalid CVV' };
  },

  /**
   * Validates cardholder name (non-empty, reasonable length)
   */
  validateCardholderName: (name: string): ValidationResult => {
    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Cardholder name is required' };
    }
    
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Cardholder name too short' };
    }
    
    if (trimmed.length > 50) {
      return { isValid: false, error: 'Cardholder name too long' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Validates card title (non-empty, reasonable length)
   */
  validateCardTitle: (title: string): ValidationResult => {
    const trimmed = title.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Card title is required' };
    }
    
    if (trimmed.length > 100) {
      return { isValid: false, error: 'Card title too long' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Generic validateField method for form validation
   */
  validateField: (field: string | number, value: any): ValidationResult => {
    switch (field) {
      case 'cardNumber':
        return cardValidationService.validateCardNumber(value);
      case 'expirationDate':
        return cardValidationService.validateExpirationDate(value);
      case 'cvv':
        return cardValidationService.validateCVV(value);
      case 'cardholderName':
        return cardValidationService.validateCardholderName(value);
      case 'title':
        return cardValidationService.validateCardTitle(value);
      default:
        return { isValid: true, error: undefined };
    }
  }
};

// ===== Credential Validation Service =====

export const credentialValidationService = {
  /**
   * Validates email format
   */
  validateEmail: (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return { isValid, error: isValid ? undefined : 'Invalid email format' };
  },

  /**
   * Validates password strength
   */
  validatePassword: (password: string): ValidationResult => {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain lowercase letter' };
    }
    
    if (!/\d/.test(password)) {
      return { isValid: false, error: 'Password must contain a number' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, error: 'Password must contain a special character' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Validates URL format
   */
  validateURL: (url: string): ValidationResult => {
    if (url.length === 0) {
      return { isValid: true, error: undefined }; // URL is optional
    }
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return { isValid: true, error: undefined };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },

  /**
   * Validates username (non-empty, reasonable length)
   */
  validateUsername: (username: string): ValidationResult => {
    const trimmed = username.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Username is required' };
    }
    
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Username too short' };
    }
    
    if (trimmed.length > 50) {
      return { isValid: false, error: 'Username too long' };
    }
    
    // Allow letters, numbers, underscores, hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { isValid: false, error: 'Username contains invalid characters' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Validates credential title (non-empty, reasonable length)
   */
  validateCredentialTitle: (title: string): ValidationResult => {
    const trimmed = title.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Credential title is required' };
    }
    
    if (trimmed.length > 100) {
      return { isValid: false, error: 'Title too long' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Generic validateField method for form validation
   */
  validateField: (field: string | number, value: any): ValidationResult => {
    switch (field) {
      case 'email':
        return credentialValidationService.validateEmail(value);
      case 'password':
        return credentialValidationService.validatePassword(value);
      case 'url':
        return credentialValidationService.validateURL(value);
      case 'username':
        return credentialValidationService.validateUsername(value);
      case 'title':
        return credentialValidationService.validateCredentialTitle(value);
      default:
        return { isValid: true, error: undefined };
    }
  }
};

// ===== Secure Note Validation Service =====

export const secureNoteValidationService = {
  /**
   * Validates secure note title (non-empty, reasonable length)
   */
  validateNoteTitle: (title: string): ValidationResult => {
    const trimmed = title.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Note title is required' };
    }
    
    if (trimmed.length > 100) {
      return { isValid: false, error: 'Title too long' };
    }
    
    return { isValid: true, error: undefined };
  },

  /**
   * Validates secure note content (non-empty, reasonable length)
   */
  validateNoteContent: (content: string): ValidationResult => {
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Note content is required' };
    }
    
    if (trimmed.length > 10000) {
      return { isValid: false, error: 'Note content too long' };
    }
    
    return { isValid: true, error: undefined };
  }
};

// ===== Common Validation Utilities =====

export const commonValidationService = {
  /**
   * Validates required field
   */
  validateRequired: (value: string, fieldName: string): ValidationResult => {
    const trimmed = value.trim();
    const isValid = trimmed.length > 0;
    return { 
      isValid, 
      error: isValid ? undefined : `${fieldName} is required` 
    };
  },

  /**
   * Validates minimum length
   */
  validateMinLength: (value: string, minLength: number, fieldName: string): ValidationResult => {
    const isValid = value.length >= minLength;
    return { 
      isValid, 
      error: isValid ? undefined : `${fieldName} must be at least ${minLength} characters` 
    };
  },

  /**
   * Validates maximum length
   */
  validateMaxLength: (value: string, maxLength: number, fieldName: string): ValidationResult => {
    const isValid = value.length <= maxLength;
    return { 
      isValid, 
      error: isValid ? undefined : `${fieldName} must be no more than ${maxLength} characters` 
    };
  },

  /**
   * Validates exact length
   */
  validateExactLength: (value: string, length: number, fieldName: string): ValidationResult => {
    const isValid = value.length === length;
    return { 
      isValid, 
      error: isValid ? undefined : `${fieldName} must be exactly ${length} characters` 
    };
  }
};

// ===== Type Definitions =====

export interface ValidationService<T> {
  validateField: (field: keyof T, value: any) => ValidationResult;
}

export interface CardValidationService extends ValidationService<any> {
  validateCardNumber: (number: string) => ValidationResult;
  validateExpirationDate: (date: string) => ValidationResult;
  validateCVV: (cvv: string) => ValidationResult;
  validateCardholderName: (name: string) => ValidationResult;
  validateCardTitle: (title: string) => ValidationResult;
}

export interface CredentialValidationService extends ValidationService<any> {
  validateEmail: (email: string) => ValidationResult;
  validatePassword: (password: string) => ValidationResult;
  validateURL: (url: string) => ValidationResult;
  validateUsername: (username: string) => ValidationResult;
  validateCredentialTitle: (title: string) => ValidationResult;
}

export interface SecureNoteValidationService extends ValidationService<any> {
  validateNoteTitle: (title: string) => ValidationResult;
  validateNoteContent: (content: string) => ValidationResult;
} 