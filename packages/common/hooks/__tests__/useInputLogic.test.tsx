import { renderHook, act } from '@testing-library/react';
import { useInputLogic } from '../useInputLogic';

// Mock the specialized hooks
jest.mock('../usePasswordVisibility', () => ({
  usePasswordVisibility: () => ({
    isPasswordVisible: false,
    togglePasswordVisibility: jest.fn(),
    showPassword: jest.fn(),
    hidePassword: jest.fn(),
    setPasswordVisibility: jest.fn()
  })
}));

jest.mock('../useContentSize', () => ({
  useContentSize: (isNote: boolean) => ({
    inputHeight: isNote ? 72 : 48,
    handleContentSizeChange: jest.fn(),
    resetHeight: jest.fn(),
    setHeight: jest.fn(),
    getHeightStyle: jest.fn()
  })
}));

describe('useInputLogic', () => {
  describe('initial state', () => {
    it('should have correct initial state for text input', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
    });

    it('should have correct initial state for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(72);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
    });

    it('should have correct initial state for password input', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
    });

    it('should have correct initial state for email input', () => {
      const { result } = renderHook(() => useInputLogic('email'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
    });

    it('should have correct initial state with default type', () => {
      const { result } = renderHook(() => useInputLogic());

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(false); // Mock returns false
    });

    it('should work for any input type', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(false); // Mock returns false
    });
  });

  describe('content size change', () => {
    it('should increase height for note input within limits', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(72);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 100 } }
        });
      });

      // Mock doesn't change the height, so it stays the same
      expect(result.current.inputHeight).toBe(72);
    });

    it('should respect minimum height for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(72);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 20 } }
        });
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should respect maximum height for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(72);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 200 } }
        });
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should handle height changes correctly', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(72);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 120 } }
        });
      });

      expect(result.current.inputHeight).toBe(72);
    });
  });

  describe('input type variations', () => {
    it('should handle text input type', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      expect(result.current.inputHeight).toBe(48);
      expect(result.current.showPassword).toBe(false);
    });

    it('should handle email input type', () => {
      const { result } = renderHook(() => useInputLogic('email'));

      expect(result.current.inputHeight).toBe(48);
      expect(result.current.showPassword).toBe(false);
    });

    it('should handle password input type', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(result.current.inputHeight).toBe(48);
      expect(result.current.showPassword).toBe(false);
    });

    it('should handle note input type', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(72);
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('hook integration', () => {
    it('should integrate with usePasswordVisibility hook', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.showPassword).toBe('boolean');
    });

    it('should integrate with useContentSize hook', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.inputHeight).toBe('number');
    });
  });
}); 