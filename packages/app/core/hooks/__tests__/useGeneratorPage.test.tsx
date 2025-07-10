/**
 * useGeneratorPage hook tests for SimpliPass
 * Tests state, password generation, strength, and error handling
 */

import { renderHook, act } from '@testing-library/react-native';
import { useGeneratorPage } from '../useGeneratorPage';

// Mock dependencies
jest.mock('@utils/passwordGenerator', () => ({
  passwordGenerator: jest.fn(() => 'mockPassword123!'),
}));
jest.mock('@utils/checkPasswordStrength', () => ({
  checkPasswordStrength: jest.fn(() => 'strong'),
}));

jest.mock('@app/core/hooks', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe('useGeneratorPage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeneratorPage());
    expect(result.current.length).toBeGreaterThan(0);
    expect(typeof result.current.password).toBe('string');
    expect(result.current.strength).toBeDefined();
  });

  it('should generate a new password', () => {
    const { result } = renderHook(() => useGeneratorPage());
    act(() => {
      result.current.handleRegenerate();
    });
    expect(result.current.password).toBe('mockPassword123!');
  });

  it('should update password length', () => {
    const { result } = renderHook(() => useGeneratorPage());
    act(() => {
      result.current.setLength(20);
    });
    expect(result.current.length).toBe(20);
  });

  it('should update options and regenerate password', () => {
    const { result } = renderHook(() => useGeneratorPage());
    act(() => {
      result.current.setHasUppercase(false);
      result.current.setHasNumbers(false);
      result.current.setHasSymbols(false);
      result.current.setHasLowercase(true);
      result.current.handleRegenerate();
    });
    expect(result.current.hasUppercase).toBe(false);
    expect(result.current.hasNumbers).toBe(false);
    expect(result.current.hasSymbols).toBe(false);
    expect(result.current.hasLowercase).toBe(true);
    expect(result.current.password).toBe('mockPassword123!');
  });

  it('should handle copy action', () => {
    const { result } = renderHook(() => useGeneratorPage());
    expect(() => result.current.handleCopyPassword()).not.toThrow();
  });
}); 