// packages/common/utils/__tests__/passwordGenerator.test.ts
import { passwordGenerator } from '../passwordGenerator';

describe('Password Generator', () => {
  it('should generate a password of the correct length', () => {
    const password = passwordGenerator(true, true, true, true, 12);
    expect(password.length).toBe(12);
  });

  it('should include numbers when specified', () => {
    const password = passwordGenerator(true, false, false, false, 10);
    expect(password).toMatch(/[0-9]/);
  });

  it('should include uppercase letters when specified', () => {
    const password = passwordGenerator(false, true, false, false, 10);
    expect(password).toMatch(/[A-Z]/);
  });

  it('should include lowercase letters when specified', () => {
    const password = passwordGenerator(false, false, true, false, 10);
    expect(password).toMatch(/[a-z]/);
  });

  it('should include special characters when specified', () => {
    const password = passwordGenerator(false, false, false, true, 10);
    expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/`~]/);
  });

  it('should include a mix of characters when all options are true', () => {
    const password = passwordGenerator(true, true, true, true, 16);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/`~]/);
  });

  it('should use a default charset if no options are selected', () => {
    const password = passwordGenerator(false, false, false, false, 8);
    // Default is lowercase and numbers
    expect(password).toMatch(/^[a-z0-9]+$/);
  });

  it('should return an empty string if length is 0', () => {
    const password = passwordGenerator(true, true, true, true, 0);
    expect(password).toBe('');
  });
});
