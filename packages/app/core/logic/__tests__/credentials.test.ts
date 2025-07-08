import { handleGeneratePassword, createPasswordGenerator } from '../credentials';

// Mock the password generator utility
jest.mock('@utils/passwordGenerator', () => ({
  passwordGenerator: jest.fn(() => 'generated-password-123'),
}));

describe('Credentials Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate password correctly', () => {
    const mockSetPassword = jest.fn();
    
    handleGeneratePassword(mockSetPassword);
    
    expect(mockSetPassword).toHaveBeenCalledWith('generated-password-123');
  });

  it('should create password generator correctly', () => {
    const mockSetPassword = jest.fn();
    const generator = createPasswordGenerator(mockSetPassword);
    
    expect(typeof generator).toBe('function');
    
    generator();
    
    expect(mockSetPassword).toHaveBeenCalledWith('generated-password-123');
  });
}); 