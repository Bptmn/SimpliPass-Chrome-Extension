// packages/common/utils/__tests__/cards.test.ts
import {
  formatCardNumber,
  handleCardNumberChange,
  getMonthOptions,
  getYearOptions,
  formatCardExpirationDate,
  parseCardExpirationDate,
} from '../cards';

describe('Card Utilities', () => {
  describe('formatCardNumber', () => {
    it('should format a card number with spaces', () => {
      expect(formatCardNumber('1234567812345678')).toBe('1234 5678 1234 5678');
    });

    it('should remove non-digit characters', () => {
      expect(formatCardNumber('1234-5678-1234-5678')).toBe('1234 5678 1234 5678');
    });
  });

  describe('handleCardNumberChange', () => {
    it('should call the setter with only digits', () => {
      const setCardNumber = jest.fn();
      handleCardNumberChange('1234-5678', setCardNumber);
      expect(setCardNumber).toHaveBeenCalledWith('12345678');
    });

    it('should truncate to 16 digits', () => {
      const setCardNumber = jest.fn();
      handleCardNumberChange('12345678123456789', setCardNumber);
      expect(setCardNumber).toHaveBeenCalledWith('1234567812345678');
    });
  });

  describe('getMonthOptions', () => {
    it('should return 12 months, padded', () => {
      const months = getMonthOptions();
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('01');
      expect(months[11]).toBe('12');
    });
  });

  describe('getYearOptions', () => {
    it('should return 21 years, starting from the current year', () => {
      const currentYear = new Date().getFullYear();
      const years = getYearOptions();
      expect(years).toHaveLength(21);
      expect(years[0]).toBe(String(currentYear));
      expect(years[20]).toBe(String(currentYear + 20));
    });
  });

  describe('format and parse CardExpirationDate', () => {
    it('should format a date into MM/YY format', () => {
        const date = new Date(2025, 11, 1); // December 2025
        expect(formatCardExpirationDate(date)).toBe('12/25');
    });

    it('should parse a MM/YY string into a Date object', () => {
        const dateString = '12/25';
        const expectedDate = new Date(2025, 11, 1); // Month is 0-indexed
        expect(parseCardExpirationDate(dateString)).toEqual(expectedDate);
    });

    it('should return null for an invalid date string', () => {
        expect(parseCardExpirationDate('13/25')).toBeNull();
        expect(parseCardExpirationDate('12/2')).toBeNull();
    });
  });
});
