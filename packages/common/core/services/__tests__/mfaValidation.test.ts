/**
 * Tests for MFA code validation
 * 
 * Tests that MFA codes are validated correctly (6 digits)
 */

describe('MFA Code Validation', () => {
  const validateMfaCode = (code: string): { isValid: boolean; error?: string } => {
    const trimmedCode = code.trim();
    
    if (!trimmedCode) {
      return { isValid: false, error: 'Please enter the verification code' };
    }
    
    // Validate exactly 6 digits
    if (!/^\d{6}$/.test(trimmedCode)) {
      return { isValid: false, error: 'Please enter a valid 6-digit verification code' };
    }
    
    return { isValid: true };
  };

  describe('validateMfaCode', () => {
    it('should validate correct 6-digit codes', () => {
      const validCodes = [
        '123456',
        '000000',
        '999999',
        '012345',
      ];

      validCodes.forEach((code) => {
        const result = validateMfaCode(code);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject codes with wrong length', () => {
      const invalidCodes = [
        { code: '12345', expectedError: '6-digit' },   // 5 digits
        { code: '1234567', expectedError: '6-digit' }, // 7 digits
        { code: '123', expectedError: '6-digit' },     // 3 digits
        { code: '12', expectedError: '6-digit' },     // 2 digits
        { code: '1', expectedError: '6-digit' },      // 1 digit
        { code: '', expectedError: 'verification code' }, // empty - different error
      ];

      invalidCodes.forEach(({ code, expectedError }) => {
        const result = validateMfaCode(code);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(expectedError);
      });
    });

    it('should reject codes with non-numeric characters', () => {
      const invalidCodes = [
        '12345a',
        'abc123',
        '12-456',
        '123 456',
        '123.456',
        'abcdef',
      ];

      invalidCodes.forEach((code) => {
        const result = validateMfaCode(code);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('6-digit');
      });
    });

    it('should handle whitespace correctly', () => {
      // Should trim whitespace
      const result1 = validateMfaCode('  123456  ');
      expect(result1.isValid).toBe(true);
      
      // Should reject if only whitespace
      const result2 = validateMfaCode('      ');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('enter the verification code');
    });
  });
});
