/**
 * Tests for expirationDate utility functions
 */

import {
  createExpirationDate,
  formatExpirationDate,
  parseExpirationDate,
  isExpirationDateValid,
  ExpirationDate
} from '../expirationDate';

describe('createExpirationDate', () => {
  it('should create valid expiration date', () => {
    const expDate = createExpirationDate(12, 2025);
    expect(expDate.month).toBe(12);
    expect(expDate.year).toBe(2025);
  });

  it('should clamp month to valid range (1-12)', () => {
    expect(createExpirationDate(0, 2025).month).toBe(1);
    expect(createExpirationDate(13, 2025).month).toBe(12);
    expect(createExpirationDate(-5, 2025).month).toBe(1);
  });

  it('should clamp year to minimum value (2000)', () => {
    expect(createExpirationDate(12, 1999).year).toBe(2000);
    expect(createExpirationDate(12, 1950).year).toBe(2000);
  });

  it('should handle edge cases', () => {
    expect(createExpirationDate(1, 2025).month).toBe(1);
    expect(createExpirationDate(12, 2025).month).toBe(12);
  });
});

describe('formatExpirationDate', () => {
  it('should format expiration date as MM/YY', () => {
    const expDate: ExpirationDate = { month: 12, year: 2025 };
    expect(formatExpirationDate(expDate)).toBe('12/25');
  });

  it('should pad single digit months', () => {
    const expDate: ExpirationDate = { month: 1, year: 2025 };
    expect(formatExpirationDate(expDate)).toBe('01/25');
  });

  it('should handle different years', () => {
    const expDate: ExpirationDate = { month: 6, year: 2030 };
    expect(formatExpirationDate(expDate)).toBe('06/30');
  });

  it('should handle year 2000', () => {
    const expDate: ExpirationDate = { month: 12, year: 2000 };
    expect(formatExpirationDate(expDate)).toBe('12/00');
  });
});

describe('parseExpirationDate', () => {
  it('should parse valid MM/YY format', () => {
    const result = parseExpirationDate('12/25');
    expect(result).toEqual({ month: 12, year: 2025 });
  });

  it('should parse single digit months', () => {
    const result = parseExpirationDate('01/25');
    expect(result).toEqual({ month: 1, year: 2025 });
  });

  it('should handle different years', () => {
    const result = parseExpirationDate('06/30');
    expect(result).toEqual({ month: 6, year: 2030 });
  });

  it('should return null for invalid format', () => {
    expect(parseExpirationDate('12-25')).toBeNull();
    expect(parseExpirationDate('13/25')).toBeNull();
    expect(parseExpirationDate('0/25')).toBeNull();
    expect(parseExpirationDate('12/5')).toBeNull();
    expect(parseExpirationDate('invalid')).toBeNull();
    expect(parseExpirationDate('')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(parseExpirationDate('01/00')).toEqual({ month: 1, year: 2000 });
    expect(parseExpirationDate('12/99')).toEqual({ month: 12, year: 2099 });
  });
});

describe('isExpirationDateValid', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Set current date to January 2024
    jest.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return true for future dates', () => {
    const futureDate: ExpirationDate = { month: 12, year: 2025 };
    expect(isExpirationDateValid(futureDate)).toBe(true);
  });

  it('should return true for current month and year', () => {
    const currentDate: ExpirationDate = { month: 1, year: 2024 };
    expect(isExpirationDateValid(currentDate)).toBe(true);
  });

  it('should return false for past dates', () => {
    const pastDate: ExpirationDate = { month: 12, year: 2023 };
    expect(isExpirationDateValid(pastDate)).toBe(false);
  });

  it('should return false for past months in current year', () => {
    const pastMonth: ExpirationDate = { month: 12, year: 2023 };
    expect(isExpirationDateValid(pastMonth)).toBe(false);
  });

  it('should handle edge cases', () => {
    // Test with different current dates
    jest.setSystemTime(new Date('2024-06-15'));
    
    const validDate: ExpirationDate = { month: 6, year: 2024 };
    const invalidDate: ExpirationDate = { month: 5, year: 2024 };
    
    expect(isExpirationDateValid(validDate)).toBe(true);
    expect(isExpirationDateValid(invalidDate)).toBe(false);
  });

  it('should handle year boundaries', () => {
    const nextYear: ExpirationDate = { month: 1, year: 2025 };
    const currentYear: ExpirationDate = { month: 12, year: 2024 };
    
    expect(isExpirationDateValid(nextYear)).toBe(true);
    expect(isExpirationDateValid(currentYear)).toBe(true);
  });
});

describe('Integration tests', () => {
  it('should handle round-trip conversion', () => {
    const originalDate: ExpirationDate = { month: 6, year: 2025 };
    const formatted = formatExpirationDate(originalDate);
    const parsed = parseExpirationDate(formatted);
    
    expect(parsed).toEqual(originalDate);
  });

  it('should handle create -> format -> parse cycle', () => {
    const created = createExpirationDate(3, 2026);
    const formatted = formatExpirationDate(created);
    const parsed = parseExpirationDate(formatted);
    
    expect(parsed).toEqual(created);
  });

  it('should handle edge cases in full cycle', () => {
    // Test with clamped values
    const created = createExpirationDate(0, 1999); // Should be clamped to 1, 2000
    const formatted = formatExpirationDate(created);
    const parsed = parseExpirationDate(formatted);
    
    expect(parsed).toEqual({ month: 1, year: 2000 });
  });
});
