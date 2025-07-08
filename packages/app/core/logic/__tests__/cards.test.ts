import { 
  formatCardNumber, 
  getMonthOptions, 
  getYearOptions, 
  formatExpirationDate, 
  parseExpirationDate 
} from '../cards';

describe('Card Logic', () => {
  describe('formatCardNumber', () => {
    it('should format card number with spaces every 4 digits', () => {
      expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('123456789012345')).toBe('1234 5678 9012 345');
      expect(formatCardNumber('12345678901234')).toBe('1234 5678 9012 34');
    });

    it('should remove non-digit characters', () => {
      expect(formatCardNumber('1234-5678-9012-3456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('1234.5678.9012.3456')).toBe('1234 5678 9012 3456');
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('');
    });

    it('should handle string with only non-digits', () => {
      expect(formatCardNumber('abc-def-ghi-jkl')).toBe('');
    });
  });

  describe('getMonthOptions', () => {
    it('should return array of 12 months with leading zeros', () => {
      const months = getMonthOptions();
      
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('01');
      expect(months[11]).toBe('12');
      expect(months).toEqual([
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'
      ]);
    });
  });

  describe('getYearOptions', () => {
    it('should return array of 21 years starting from current year', () => {
      const currentYear = new Date().getFullYear();
      const years = getYearOptions();
      
      expect(years).toHaveLength(21);
      expect(years[0]).toBe(String(currentYear));
      expect(years[20]).toBe(String(currentYear + 20));
    });

    it('should accept custom start year', () => {
      const customYear = 2020;
      const years = getYearOptions(customYear);
      
      expect(years).toHaveLength(21);
      expect(years[0]).toBe('2020');
      expect(years[20]).toBe('2040');
    });
  });

  describe('formatExpirationDate', () => {
    it('should format date as MM/YY', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      expect(formatExpirationDate(date)).toBe('12/25');
    });

    it('should handle single digit months', () => {
      const date = new Date(2023, 0, 1); // January 1, 2023
      expect(formatExpirationDate(date)).toBe('01/23');
    });

    it('should handle years in different centuries', () => {
      const date = new Date(2030, 5, 15); // June 15, 2030
      expect(formatExpirationDate(date)).toBe('06/30');
    });
  });

  describe('parseExpirationDate', () => {
    it('should parse valid MM/YY format', () => {
      const result = parseExpirationDate('12/25');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(11); // December is month 11 (0-indexed)
    });

    it('should parse single digit months', () => {
      const result = parseExpirationDate('01/23');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(0); // January is month 0
    });

    it('should return null for invalid format', () => {
      expect(parseExpirationDate('invalid')).toBeNull();
      expect(parseExpirationDate('13/25')).toBeNull(); // Invalid month
      expect(parseExpirationDate('00/25')).toBeNull(); // Invalid month
      expect(parseExpirationDate('12/99')).toBeNull(); // Invalid year
      expect(parseExpirationDate('12')).toBeNull(); // Missing year
      expect(parseExpirationDate('/25')).toBeNull(); // Missing month
    });

    it('should handle edge cases', () => {
      expect(parseExpirationDate('')).toBeNull();
      expect(parseExpirationDate('12/25/')).toBeNull();
      expect(parseExpirationDate('/12/25')).toBeNull();
    });
  });
}); 