import { passwordGenerator } from '../passwordGenerator';

describe('Password Generator', () => {
  describe('passwordGenerator', () => {
    it('should generate password with all options enabled', () => {
      const password = passwordGenerator(true, true, true, true, 16);
      
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[A-Z]/); // Has uppercase
      expect(password).toMatch(/[a-z]/); // Has lowercase
      expect(password).toMatch(/[0-9]/); // Has numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // Has symbols
    });

    it('should generate password with only uppercase and numbers', () => {
      const password = passwordGenerator(true, false, true, false, 12);
      
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Z]/); // Has uppercase
      expect(password).toMatch(/[0-9]/); // Has numbers
      expect(password).not.toMatch(/[a-z]/); // No lowercase
      expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // No symbols
    });

    it('should generate password with only lowercase and symbols', () => {
      const password = passwordGenerator(false, true, false, true, 10);
      
      expect(password).toHaveLength(10);
      expect(password).toMatch(/[a-z]/); // Has lowercase
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // Has symbols
      expect(password).not.toMatch(/[A-Z]/); // No uppercase
      expect(password).not.toMatch(/[0-9]/); // No numbers
    });

    it('should generate password with minimum length', () => {
      const password = passwordGenerator(true, true, true, true, 8);
      
      expect(password).toHaveLength(8);
    });

    it('should generate password with maximum length', () => {
      const password = passwordGenerator(true, true, true, true, 64);
      
      expect(password).toHaveLength(64);
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = passwordGenerator(true, true, true, true, 16);
      const password2 = passwordGenerator(true, true, true, true, 16);
      
      expect(password1).not.toBe(password2);
    });

    it('should handle all options disabled', () => {
      const password = passwordGenerator(false, false, false, false, 8);
      
      expect(password).toHaveLength(8);
      // Should still contain some characters even with all options disabled
      expect(password.length).toBeGreaterThan(0);
    });

    it('should handle single option enabled', () => {
      const password = passwordGenerator(true, false, false, false, 12);
      
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Z]/); // Only uppercase
    });

    it('should generate password with default parameters', () => {
      const password = passwordGenerator(true, true, true, true, 16);
      
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // symbols
    });

    it('should generate password with custom length', () => {
      const password = passwordGenerator(true, true, true, true, 20);
      
      expect(password).toHaveLength(20);
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // symbols
    });

    it('should generate password without symbols', () => {
      const password = passwordGenerator(true, true, true, false, 16);
      
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // numbers
      expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/); // no symbols
    });
  });
}); 