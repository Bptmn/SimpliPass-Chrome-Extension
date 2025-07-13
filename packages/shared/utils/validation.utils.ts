/**
 * Validation Utilities
 * 
 * Pure utility functions for validation that can be shared
 * across all packages without platform dependencies.
 */

import { ValidationRule, ValidationResult, FieldValidation } from '../types/base.types';

// ===== Email Validation =====

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean - Whether email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email with detailed error message
 * @param email - Email to validate
 * @returns string | null - Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

// ===== Password Validation =====

/**
 * Check password strength
 * @param password - Password to check
 * @returns object - Password strength details
 */
export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'medium';
  else if (score <= 5) strength = 'strong';
  else strength = 'very-strong';
  
  return {
    score,
    strength,
    checks,
    isValid: score >= 3 && password.length >= 8,
  };
}

/**
 * Validate password with detailed feedback
 * @param password - Password to validate
 * @returns ValidationResult
 */
export function validatePassword(password: string): ValidationResult {
  const strength = checkPasswordStrength(password);
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (!strength.checks.length) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!strength.checks.lowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!strength.checks.uppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!strength.checks.numbers) {
      errors.push('Password must contain at least one number');
    }
    
    if (!strength.checks.symbols) {
      warnings.push('Consider adding special characters for better security');
    }
    
    if (strength.score <= 2) {
      warnings.push('Password strength is weak');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ===== URL Validation =====

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns boolean - Whether URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate URL with detailed error message
 * @param url - URL to validate
 * @returns string | null - Error message or null if valid
 */
export function validateUrl(url: string): string | null {
  if (!url) {
    return 'URL is required';
  }
  
  if (!isValidUrl(url)) {
    return 'Please enter a valid URL';
  }
  
  return null;
}

// ===== Credit Card Validation =====

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber - Credit card number to validate
 * @returns boolean - Whether card number is valid
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate CVV
 * @param cvv - CVV to validate
 * @returns boolean - Whether CVV is valid
 */
export function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Validate expiry date
 * @param month - Expiry month (1-12)
 * @param year - Expiry year (4 digits)
 * @returns boolean - Whether expiry date is valid
 */
export function isValidExpiryDate(month: number, year: number): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < currentYear) {
    return false;
  }
  
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  
  return true;
}

// ===== Generic Validation =====

/**
 * Validate field value against rules
 * @param value - Value to validate
 * @param rules - Validation rules
 * @returns ValidationResult
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const rule of rules) {
    // Required check
    if (rule.required && !value) {
      errors.push('This field is required');
      continue;
    }
    
    if (!value) continue; // Skip other validations if no value
    
    // Length checks
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`Minimum length is ${rule.minLength} characters`);
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`Maximum length is ${rule.maxLength} characters`);
    }
    
    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push('Invalid format');
    }
    
    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate form values against field configurations
 * @param values - Form values
 * @param fields - Field configurations
 * @returns Record<string, ValidationResult>
 */
export function validateForm(
  values: Record<string, any>,
  fields: Array<{ name: string; validation?: ValidationRule[] }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const field of fields) {
    const value = values[field.name];
    const rules = field.validation || [];
    
    results[field.name] = validateField(value, rules);
  }
  
  return results;
}

/**
 * Check if form is valid
 * @param validationResults - Validation results for all fields
 * @returns boolean
 */
export function isFormValid(validationResults: Record<string, ValidationResult>): boolean {
  return Object.values(validationResults).every(result => result.isValid);
}

// ===== String Validation =====

/**
 * Validate string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns string | null - Error message or null if valid
 */
export function validateStringLength(
  value: string,
  minLength?: number,
  maxLength?: number
): string | null {
  if (minLength && value.length < minLength) {
    return `Minimum length is ${minLength} characters`;
  }
  
  if (maxLength && value.length > maxLength) {
    return `Maximum length is ${maxLength} characters`;
  }
  
  return null;
}

/**
 * Validate required field
 * @param value - Value to check
 * @param fieldName - Name of the field for error message
 * @returns string | null - Error message or null if valid
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  
  return null;
}

// ===== Number Validation =====

/**
 * Validate number range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns string | null - Error message or null if valid
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number
): string | null {
  if (min !== undefined && value < min) {
    return `Value must be at least ${min}`;
  }
  
  if (max !== undefined && value > max) {
    return `Value must be at most ${max}`;
  }
  
  return null;
}

/**
 * Validate integer
 * @param value - Value to validate
 * @returns string | null - Error message or null if valid
 */
export function validateInteger(value: any): string | null {
  if (!Number.isInteger(Number(value))) {
    return 'Value must be a whole number';
  }
  
  return null;
}

// ===== Date Validation =====

/**
 * Validate date
 * @param value - Date to validate
 * @returns string | null - Error message or null if valid
 */
export function validateDate(value: any): string | null {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  
  return null;
}

/**
 * Validate date range
 * @param value - Date to validate
 * @param minDate - Minimum date
 * @param maxDate - Maximum date
 * @returns string | null - Error message or null if valid
 */
export function validateDateRange(
  value: any,
  minDate?: Date,
  maxDate?: Date
): string | null {
  const dateError = validateDate(value);
  if (dateError) return dateError;
  
  const date = new Date(value);
  
  if (minDate && date < minDate) {
    return `Date must be after ${minDate.toLocaleDateString()}`;
  }
  
  if (maxDate && date > maxDate) {
    return `Date must be before ${maxDate.toLocaleDateString()}`;
  }
  
  return null;
}

// ===== Array Validation =====

/**
 * Validate array length
 * @param value - Array to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns string | null - Error message or null if valid
 */
export function validateArrayLength(
  value: any[],
  minLength?: number,
  maxLength?: number
): string | null {
  if (!Array.isArray(value)) {
    return 'Value must be an array';
  }
  
  if (minLength && value.length < minLength) {
    return `Must have at least ${minLength} items`;
  }
  
  if (maxLength && value.length > maxLength) {
    return `Must have at most ${maxLength} items`;
  }
  
  return null;
}

// ===== Object Validation =====

/**
 * Validate object has required properties
 * @param value - Object to validate
 * @param requiredProps - Array of required property names
 * @returns string | null - Error message or null if valid
 */
export function validateRequiredProperties(
  value: any,
  requiredProps: string[]
): string | null {
  if (typeof value !== 'object' || value === null) {
    return 'Value must be an object';
  }
  
  for (const prop of requiredProps) {
    if (!(prop in value)) {
      return `Missing required property: ${prop}`;
    }
  }
  
  return null;
} 