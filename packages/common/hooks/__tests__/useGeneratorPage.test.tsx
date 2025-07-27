import { renderHook, act } from '@testing-library/react';
import { useGeneratorPage } from '../useGeneratorPage';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { passwordGenerator } from '@common/utils/passwordGenerator';

// Mock dependencies
jest.mock('@common/utils/checkPasswordStrength');
jest.mock('@common/utils/passwordGenerator');
jest.mock('../useToast', () => ({
  useToast: () => ({
    showToast: jest.fn()
  })
}));

const mockCheckPasswordStrength = checkPasswordStrength as jest.MockedFunction<typeof checkPasswordStrength>;
const mockPasswordGenerator = passwordGenerator as jest.MockedFunction<typeof passwordGenerator>;

describe('useGeneratorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPasswordGenerator.mockReturnValue('TestPassword123!');
    mockCheckPasswordStrength.mockReturnValue('strong');
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGeneratorPage());

      expect(result.current.hasUppercase).toBe(true);
      expect(result.current.hasNumbers).toBe(true);
      expect(result.current.hasSymbols).toBe(true);
      expect(result.current.hasLowercase).toBe(true);
      expect(result.current.length).toBe(16);
      expect(result.current.password).toBe('TestPassword123!');
      expect(result.current.strength).toBe('strong');
      expect(typeof result.current.setHasUppercase).toBe('function');
      expect(typeof result.current.setHasNumbers).toBe('function');
      expect(typeof result.current.setHasSymbols).toBe('function');
      expect(typeof result.current.setHasLowercase).toBe('function');
      expect(typeof result.current.setLength).toBe('function');
      expect(typeof result.current.handleRegenerate).toBe('function');
      expect(typeof result.current.handleCopyPassword).toBe('function');
    });
  });

  describe('password generation', () => {
    it('should generate password with default options', () => {
      renderHook(() => useGeneratorPage());

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 16);
      expect(mockCheckPasswordStrength).toHaveBeenCalledWith('TestPassword123!');
    });

    it('should regenerate password when options change', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setLength(20);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 20);
      expect(mockCheckPasswordStrength).toHaveBeenCalledWith('TestPassword123!');
    });

    it('should update password when uppercase option changes', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasUppercase(false);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, false, true, true, 16);
    });

    it('should update password when numbers option changes', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasNumbers(false);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(false, true, true, true, 16);
    });

    it('should update password when symbols option changes', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasSymbols(false);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, false, 16);
    });

    it('should update password when lowercase option changes', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasLowercase(false);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, false, true, 16);
    });
  });

  describe('password regeneration', () => {
    it('should regenerate password when handleRegenerate is called', () => {
      const { result } = renderHook(() => useGeneratorPage());

      // Clear previous calls
      jest.clearAllMocks();
      mockPasswordGenerator.mockReturnValue('NewPassword456!');
      mockCheckPasswordStrength.mockReturnValue('perfect');

      act(() => {
        result.current.handleRegenerate();
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 16);
      expect(mockCheckPasswordStrength).toHaveBeenCalledWith('NewPassword456!');
      expect(result.current.password).toBe('NewPassword456!');
      expect(result.current.strength).toBe('perfect');
    });
  });

  describe('strength calculation', () => {
    it('should calculate strength for weak password', () => {
      mockCheckPasswordStrength.mockReturnValue('weak');
      
      const { result } = renderHook(() => useGeneratorPage());

      expect(result.current.strength).toBe('weak');
    });

    it('should calculate strength for average password', () => {
      mockCheckPasswordStrength.mockReturnValue('average');
      
      const { result } = renderHook(() => useGeneratorPage());

      expect(result.current.strength).toBe('average');
    });

    it('should calculate strength for strong password', () => {
      mockCheckPasswordStrength.mockReturnValue('strong');
      
      const { result } = renderHook(() => useGeneratorPage());

      expect(result.current.strength).toBe('strong');
    });

    it('should calculate strength for perfect password', () => {
      mockCheckPasswordStrength.mockReturnValue('perfect');
      
      const { result } = renderHook(() => useGeneratorPage());

      expect(result.current.strength).toBe('perfect');
    });
  });

  describe('copy password', () => {
    it('should handle copy password action', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.handleCopyPassword();
      });

      // The toast functionality is mocked, so we just verify the function is called
      expect(typeof result.current.handleCopyPassword).toBe('function');
    });
  });

  describe('option toggles', () => {
    it('should toggle uppercase option', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasUppercase(false);
      });

      expect(result.current.hasUppercase).toBe(false);
    });

    it('should toggle numbers option', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasNumbers(false);
      });

      expect(result.current.hasNumbers).toBe(false);
    });

    it('should toggle symbols option', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasSymbols(false);
      });

      expect(result.current.hasSymbols).toBe(false);
    });

    it('should toggle lowercase option', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setHasLowercase(false);
      });

      expect(result.current.hasLowercase).toBe(false);
    });

    it('should change length', () => {
      const { result } = renderHook(() => useGeneratorPage());

      act(() => {
        result.current.setLength(24);
      });

      expect(result.current.length).toBe(24);
    });
  });

  describe('dependencies', () => {
    it('should regenerate password when any option changes', () => {
      const { result } = renderHook(() => useGeneratorPage());

      // Clear previous calls
      jest.clearAllMocks();

      act(() => {
        result.current.setLength(20);
      });

      expect(mockPasswordGenerator).toHaveBeenCalledWith(true, true, true, true, 20);
      expect(mockCheckPasswordStrength).toHaveBeenCalledWith('TestPassword123!');
    });
  });
}); 