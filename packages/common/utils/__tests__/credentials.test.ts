/**
 * Tests for credentials utility functions
 */

import { handleGeneratePassword, createPasswordGenerator } from '../credentials';
import { passwordGenerator } from '../passwordGenerator';

// Mock the passwordGenerator
jest.mock('../passwordGenerator', () => ({
  passwordGenerator: jest.fn()
}));

const mockPasswordGenerator = passwordGenerator as jest.MockedFunction<typeof passwordGenerator>;

describe('handleGeneratePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call passwordGenerator with correct parameters', () => {
    const mockSetPassword = jest.fn();
    const mockPassword = 'generatedPassword123!';
    
    mockPasswordGenerator.mockReturnValue(mockPassword);

    handleGeneratePassword(mockSetPassword);

    expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 16);
    expect(mockSetPassword).toHaveBeenCalledWith(mockPassword);
  });

  it('should call setPassword with the generated password', () => {
    const mockSetPassword = jest.fn();
    const mockPassword = 'testPassword456!';
    
    mockPasswordGenerator.mockReturnValue(mockPassword);

    handleGeneratePassword(mockSetPassword);

    expect(mockSetPassword).toHaveBeenCalledWith(mockPassword);
  });

  it('should handle empty password from generator', () => {
    const mockSetPassword = jest.fn();
    const mockPassword = '';
    
    mockPasswordGenerator.mockReturnValue(mockPassword);

    handleGeneratePassword(mockSetPassword);

    expect(mockSetPassword).toHaveBeenCalledWith('');
  });
});

describe('createPasswordGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function that calls handleGeneratePassword', () => {
    const mockSetPassword = jest.fn();
    const mockPassword = 'generatedPassword789!';
    
    mockPasswordGenerator.mockReturnValue(mockPassword);

    const generator = createPasswordGenerator(mockSetPassword);
    
    expect(typeof generator).toBe('function');
    
    generator();
    
    expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 16);
    expect(mockSetPassword).toHaveBeenCalledWith(mockPassword);
  });

  it('should create multiple independent generators', () => {
    const mockSetPassword1 = jest.fn();
    const mockSetPassword2 = jest.fn();
    const mockPassword1 = 'password1';
    const mockPassword2 = 'password2';
    
    mockPasswordGenerator
      .mockReturnValueOnce(mockPassword1)
      .mockReturnValueOnce(mockPassword2);

    const generator1 = createPasswordGenerator(mockSetPassword1);
    const generator2 = createPasswordGenerator(mockSetPassword2);
    
    generator1();
    generator2();
    
    expect(mockSetPassword1).toHaveBeenCalledWith(mockPassword1);
    expect(mockSetPassword2).toHaveBeenCalledWith(mockPassword2);
  });

  it('should maintain the setPassword reference', () => {
    const mockSetPassword = jest.fn();
    const mockPassword = 'testPassword';
    
    mockPasswordGenerator.mockReturnValue(mockPassword);

    const generator = createPasswordGenerator(mockSetPassword);
    
    // Call multiple times
    generator();
    generator();
    
    expect(mockSetPassword).toHaveBeenCalledTimes(2);
    expect(mockSetPassword).toHaveBeenCalledWith(mockPassword);
  });
});
