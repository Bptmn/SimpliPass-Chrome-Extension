/**
 * Tests for formatting utility functions
 */

import {
  formatCardNumber,
  maskCardNumber,
  formatExpirationDate,
  formatCardholderName,
  formatCVV,
  getCardType,
  formatDate,
  formatShortDate,
  formatRelativeTime,
  capitalizeWords,
  truncateText,
  normalizeWhitespace,
  formatURL,
  maskSensitiveData,
  formatPhoneNumber,
  formatFileSize,
  formatCurrency,
  formatPercentage,
  formatNumber,
  getPasswordStrengthColor,
  sanitizeInput,
  normalizeEmail,
  normalizeURL
} from '../formatting';

describe('Card Formatting', () => {
  describe('formatCardNumber', () => {
    it('should format card number with spaces every 4 digits', () => {
      expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
    });

    it('should handle already formatted numbers', () => {
      expect(formatCardNumber('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
    });

    it('should handle short numbers', () => {
      expect(formatCardNumber('1234')).toBe('1234');
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('maskCardNumber', () => {
    it('should mask card number showing only last 4 digits', () => {
      expect(maskCardNumber('1234567890123456')).toBe('**** **** **** 3456');
    });

    it('should handle short numbers', () => {
      expect(maskCardNumber('1234')).toBe('**** **** **** 1234');
    });

    it('should handle empty string', () => {
      expect(maskCardNumber('')).toBe('**** **** **** ****');
    });

    it('should handle very short numbers', () => {
      expect(maskCardNumber('12')).toBe('**** **** **** ****');
    });
  });

  describe('formatExpirationDate', () => {
    it('should format expiration date as MM/YY', () => {
      expect(formatExpirationDate('1225')).toBe('12/25');
    });

    it('should handle partial input', () => {
      expect(formatExpirationDate('12')).toBe('12/');
    });

    it('should remove non-digits', () => {
      expect(formatExpirationDate('12-25')).toBe('12/25');
    });

    it('should handle empty string', () => {
      expect(formatExpirationDate('')).toBe('');
    });
  });

  describe('formatCardholderName', () => {
    it('should capitalize first letters of each word', () => {
      expect(formatCardholderName('john doe')).toBe('John Doe');
    });

    it('should handle single word', () => {
      expect(formatCardholderName('john')).toBe('John');
    });

    it('should handle already capitalized names', () => {
      expect(formatCardholderName('JOHN DOE')).toBe('John Doe');
    });

    it('should handle empty string', () => {
      expect(formatCardholderName('')).toBe('');
    });
  });

  describe('formatCVV', () => {
    it('should remove non-digits', () => {
      expect(formatCVV('123a')).toBe('123');
    });

    it('should handle only digits', () => {
      expect(formatCVV('123')).toBe('123');
    });

    it('should handle empty string', () => {
      expect(formatCVV('')).toBe('');
    });
  });

  describe('getCardType', () => {
    it('should identify Visa cards', () => {
      expect(getCardType('4111111111111111')).toBe('visa');
    });

    it('should identify Mastercard cards', () => {
      expect(getCardType('5555555555554444')).toBe('mastercard');
    });

    it('should identify American Express cards', () => {
      expect(getCardType('378282246310005')).toBe('amex');
    });

    it('should identify Discover cards', () => {
      expect(getCardType('6011111111111117')).toBe('discover');
    });

    it('should return unknown for unrecognized cards', () => {
      expect(getCardType('1234567890123456')).toBe('unknown');
    });

    it('should handle formatted card numbers', () => {
      expect(getCardType('4111 1111 1111 1111')).toBe('visa');
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format date as MM/DD/YYYY', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('12/25/2023');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2023-01-05');
      expect(formatDate(date)).toBe('01/05/2023');
    });
  });

  describe('formatShortDate', () => {
    it('should format date as MM/YY', () => {
      const date = new Date('2023-12-25');
      expect(formatShortDate(date)).toBe('12/23');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-12-25T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for very recent dates', () => {
      const date = new Date('2023-12-25T11:59:59Z');
      expect(formatRelativeTime(date)).toBe('Just now');
    });

    it('should format minutes ago', () => {
      const date = new Date('2023-12-25T11:30:00Z');
      expect(formatRelativeTime(date)).toBe('30 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date('2023-12-25T10:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 hours ago');
    });

    it('should format days ago', () => {
      const date = new Date('2023-12-23T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should format date for older dates', () => {
      const date = new Date('2023-12-01T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('12/01/2023');
    });
  });
});

describe('Text Formatting', () => {
  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });

    it('should handle already capitalized text', () => {
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text with ellipsis', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...');
    });

    it('should return original text if shorter than max length', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncateText('1234567890', 10)).toBe('1234567890');
    });
  });

  describe('normalizeWhitespace', () => {
    it('should remove extra whitespace', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
    });

    it('should handle tabs and newlines', () => {
      expect(normalizeWhitespace('hello\t\nworld')).toBe('hello world');
    });
  });

  describe('formatURL', () => {
    it('should extract hostname from URL', () => {
      expect(formatURL('https://www.example.com/path')).toBe('www.example.com');
    });

    it('should add protocol if missing', () => {
      expect(formatURL('example.com')).toBe('example.com');
    });

    it('should handle invalid URLs', () => {
      expect(formatURL('invalid-url')).toBe('invalid-url');
    });

    it('should handle empty string', () => {
      expect(formatURL('')).toBe('');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask sensitive data with asterisks', () => {
      expect(maskSensitiveData('password123')).toBe('***********');
    });

    it('should use custom mask character', () => {
      expect(maskSensitiveData('password123', '#')).toBe('###########');
    });

    it('should handle empty string', () => {
      expect(maskSensitiveData('')).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit US phone number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should format 11-digit US phone number', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should handle non-US numbers', () => {
      expect(formatPhoneNumber('123456789')).toBe('123456789');
    });

    it('should remove non-digits', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });
  });
});

describe('Display Formatting', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format with custom currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      expect(formatPercentage(0.1234)).toBe('12.3%');
    });

    it('should format with custom decimals', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
    });
  });

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('getPasswordStrengthColor', () => {
    const themeColors = {
      error: '#ff0000',
      warning: '#ffaa00',
      primary: '#0000ff',
      secondary: '#00ff00'
    };

    it('should return error color for weak passwords', () => {
      expect(getPasswordStrengthColor('weak', themeColors)).toBe('#ff0000');
    });

    it('should return warning color for average passwords', () => {
      expect(getPasswordStrengthColor('average', themeColors)).toBe('#ffaa00');
    });

    it('should return primary color for strong passwords', () => {
      expect(getPasswordStrengthColor('strong', themeColors)).toBe('#0000ff');
    });

    it('should return secondary color for perfect passwords', () => {
      expect(getPasswordStrengthColor('perfect', themeColors)).toBe('#00ff00');
    });
  });
});

describe('Validation Formatting', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('normalizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(normalizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com');
    });
  });

  describe('normalizeURL', () => {
    it('should add https protocol if missing', () => {
      expect(normalizeURL('example.com')).toBe('https://example.com');
    });

    it('should not modify URLs with protocol', () => {
      expect(normalizeURL('https://example.com')).toBe('https://example.com');
    });

    it('should handle empty string', () => {
      expect(normalizeURL('')).toBe('');
    });
  });
});
