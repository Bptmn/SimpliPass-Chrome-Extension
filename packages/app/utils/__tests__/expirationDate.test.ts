import { 
  createExpirationDate, 
  formatExpirationDate, 
  parseExpirationDate, 
  isExpirationDateValid,
  ExpirationDate 
} from '../expirationDate';

describe('ExpirationDate Utilities', () => {
  describe('createExpirationDate', () => {
    it('should create valid expiration date', () => {
      const expDate = createExpirationDate(12, 2027);
      expect(expDate.month).toBe(12);
      expect(expDate.year).toBe(2027);
    });

    it('should clamp month to valid range', () => {
      expect(createExpirationDate(0, 2027).month).toBe(1);
      expect(createExpirationDate(13, 2027).month).toBe(12);
    });

    it('should clamp year to minimum value', () => {
      expect(createExpirationDate(1, 1999).year).toBe(2000);
    });
  });

  describe('formatExpirationDate', () => {
    it('should format date correctly', () => {
      const expDate: ExpirationDate = { month: 5, year: 2027 };
      expect(formatExpirationDate(expDate)).toBe('05/27');
    });

    it('should handle single digit months', () => {
      const expDate: ExpirationDate = { month: 1, year: 2025 };
      expect(formatExpirationDate(expDate)).toBe('01/25');
    });
  });

  describe('parseExpirationDate', () => {
    it('should parse valid date string', () => {
      const result = parseExpirationDate('12/27');
      expect(result).toEqual({ month: 12, year: 2027 });
    });

    it('should return null for invalid format', () => {
      expect(parseExpirationDate('13/27')).toBeNull();
      expect(parseExpirationDate('12/7')).toBeNull();
      expect(parseExpirationDate('invalid')).toBeNull();
    });
  });

  describe('isExpirationDateValid', () => {
    it('should return true for future dates', () => {
      const futureDate: ExpirationDate = { month: 12, year: 2030 };
      expect(isExpirationDateValid(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate: ExpirationDate = { month: 1, year: 2020 };
      expect(isExpirationDateValid(pastDate)).toBe(false);
    });

    it('should handle current month correctly', () => {
      const now = new Date();
      const currentDate: ExpirationDate = { 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      };
      expect(isExpirationDateValid(currentDate)).toBe(true);
    });
  });
}); 