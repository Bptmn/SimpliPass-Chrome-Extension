import { checkPasswordStrength } from '../checkPasswordStrength';

describe('Password Strength Checker', () => {
  describe('checkPasswordStrength', () => {
    it('should identify weak passwords', () => {
      expect(checkPasswordStrength('123')).toBe('weak');
      expect(checkPasswordStrength('abc')).toBe('weak');
      expect(checkPasswordStrength('password')).toBe('weak');
      expect(checkPasswordStrength('qwerty')).toBe('weak');
      expect(checkPasswordStrength('123456')).toBe('weak');
    });

    it('should identify average passwords', () => {
      expect(checkPasswordStrength('password123')).toBe('average');
      expect(checkPasswordStrength('mypassword')).toBe('average');
      expect(checkPasswordStrength('123456789')).toBe('average');
      expect(checkPasswordStrength('abcdefgh')).toBe('average');
    });

    it('should identify strong passwords', () => {
      expect(checkPasswordStrength('Password123')).toBe('strong');
      expect(checkPasswordStrength('MySecurePass1')).toBe('strong');
      expect(checkPasswordStrength('Complex123!')).toBe('strong');
      expect(checkPasswordStrength('SecurePass2023')).toBe('strong');
    });

    it('should identify perfect passwords', () => {
      expect(checkPasswordStrength('P@ssw0rd!')).toBe('perfect');
      expect(checkPasswordStrength('MyS3cur3P@ss!')).toBe('perfect');
      expect(checkPasswordStrength('C0mpl3x!P@ss')).toBe('perfect');
      expect(checkPasswordStrength('S3cur3!P@ssw0rd')).toBe('perfect');
    });

    it('should handle empty password', () => {
      expect(checkPasswordStrength('')).toBe('weak');
    });

    it('should handle very short passwords', () => {
      expect(checkPasswordStrength('a')).toBe('weak');
      expect(checkPasswordStrength('1')).toBe('weak');
      expect(checkPasswordStrength('!')).toBe('weak');
    });

    it('should handle passwords with only one character type', () => {
      expect(checkPasswordStrength('aaaaaaaa')).toBe('weak');
      expect(checkPasswordStrength('11111111')).toBe('weak');
      expect(checkPasswordStrength('!!!!!!!!')).toBe('weak');
      expect(checkPasswordStrength('AAAAAAAA')).toBe('weak');
    });

    it('should handle passwords with two character types', () => {
      expect(checkPasswordStrength('aaaa1111')).toBe('weak');
      expect(checkPasswordStrength('AAAA!!!!')).toBe('weak');
      expect(checkPasswordStrength('aaaa!!!!')).toBe('weak');
      expect(checkPasswordStrength('1111!!!!')).toBe('weak');
    });

    it('should handle passwords with three character types', () => {
      expect(checkPasswordStrength('aaaa1111!')).toBe('weak');
      expect(checkPasswordStrength('AAAA1111!')).toBe('weak');
      expect(checkPasswordStrength('aaaaAAAA1')).toBe('weak');
      expect(checkPasswordStrength('aaaaAAAA!')).toBe('weak');
    });

    it('should handle passwords with all character types', () => {
      expect(checkPasswordStrength('aaaa1111!')).toBe('weak');
      expect(checkPasswordStrength('AAAA1111!')).toBe('weak');
      expect(checkPasswordStrength('aaaaAAAA1!')).toBe('weak');
      expect(checkPasswordStrength('AAAAaaaa1!')).toBe('weak');
    });

    it('should handle long passwords appropriately', () => {
      expect(checkPasswordStrength('a'.repeat(20))).toBe('weak');
      expect(checkPasswordStrength('a1'.repeat(10))).toBe('weak');
      expect(checkPasswordStrength('aA1'.repeat(7))).toBe('weak');
      expect(checkPasswordStrength('aA1!'.repeat(5))).toBe('weak');
    });
  });
}); 