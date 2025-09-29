/**
 * Tests for checkPasswordStrength utility
 */

import { checkPasswordStrength } from '../checkPasswordStrength';

// Mock zxcvbn
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn()
}));

const mockZxcvbn = require('zxcvbn').default;

describe('checkPasswordStrength', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('weak passwords', () => {
    it('should return weak for very weak passwords (score 0)', () => {
      mockZxcvbn.mockReturnValue({ score: 0 });
      
      const result = checkPasswordStrength('123');
      expect(result).toBe('weak');
    });

    it('should return weak for weak passwords (score 1)', () => {
      mockZxcvbn.mockReturnValue({ score: 1 });
      
      const result = checkPasswordStrength('password');
      expect(result).toBe('weak');
    });

    it('should return weak for passwords with score 2 (normalized to 0.5)', () => {
      mockZxcvbn.mockReturnValue({ score: 2 });
      
      const result = checkPasswordStrength('password123');
      expect(result).toBe('weak');
    });
  });

  describe('average passwords', () => {
    it('should return average for passwords with score 2.5 (normalized to 0.625)', () => {
      mockZxcvbn.mockReturnValue({ score: 2.5 });
      
      const result = checkPasswordStrength('Password123');
      expect(result).toBe('average');
    });

    it('should return average for passwords with score 3 (normalized to 0.75)', () => {
      mockZxcvbn.mockReturnValue({ score: 3 });
      
      const result = checkPasswordStrength('Password123!');
      expect(result).toBe('average');
    });
  });

  describe('strong passwords', () => {
    it('should return strong for passwords with score 3.2 (normalized to 0.8)', () => {
      mockZxcvbn.mockReturnValue({ score: 3.2 });
      
      const result = checkPasswordStrength('MyStr0ng!Pass');
      expect(result).toBe('strong');
    });

    it('should return strong for passwords with score 3.8 (normalized to 0.95)', () => {
      mockZxcvbn.mockReturnValue({ score: 3.8 });
      
      const result = checkPasswordStrength('VeryStr0ng!Pass123');
      expect(result).toBe('strong');
    });
  });

  describe('perfect passwords', () => {
    it('should return perfect for passwords with score 4 (normalized to 1.0)', () => {
      mockZxcvbn.mockReturnValue({ score: 4 });
      
      const result = checkPasswordStrength('Perfect!Pass123@#$');
      expect(result).toBe('perfect');
    });
  });

  describe('edge cases', () => {
    it('should handle empty password', () => {
      mockZxcvbn.mockReturnValue({ score: 0 });
      
      const result = checkPasswordStrength('');
      expect(result).toBe('weak');
    });

    it('should handle very long passwords', () => {
      mockZxcvbn.mockReturnValue({ score: 4 });
      
      const result = checkPasswordStrength('a'.repeat(100));
      expect(result).toBe('perfect');
    });

    it('should call zxcvbn with the correct password', () => {
      const password = 'testPassword123!';
      mockZxcvbn.mockReturnValue({ score: 3 });
      
      checkPasswordStrength(password);
      
      expect(mockZxcvbn).toHaveBeenCalledWith(password);
    });
  });
});
