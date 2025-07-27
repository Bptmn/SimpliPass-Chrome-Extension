import { renderHook, act } from '@testing-library/react';
import { useInputLogic } from '../useInputLogic';
import { colors } from '@ui/design/colors';

// Mock colors
jest.mock('@ui/design/colors', () => ({
  colors: {
    error: '#ff0000',
    warning: '#ffaa00',
    primary: '#007bff',
    secondary: '#6c757d'
  }
}));

describe('useInputLogic', () => {
  describe('initial state', () => {
    it('should have correct initial state for text input', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.getStrengthColor).toBe('function');
    });

    it('should have correct initial state for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(96);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.getStrengthColor).toBe('function');
    });

    it('should have correct initial state for password input', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.getStrengthColor).toBe('function');
    });

    it('should have correct initial state for email input', () => {
      const { result } = renderHook(() => useInputLogic('email'));

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.getStrengthColor).toBe('function');
    });

    it('should have correct initial state with default type', () => {
      const { result } = renderHook(() => useInputLogic());

      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
      expect(typeof result.current.togglePasswordVisibility).toBe('function');
      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.getStrengthColor).toBe('function');
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', () => {
      const { result } = renderHook(() => useInputLogic('password'));

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(true);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(false);
    });

    it('should work for any input type', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(true);
    });
  });

  describe('content size change', () => {
    it('should not change height for non-note inputs', () => {
      const { result } = renderHook(() => useInputLogic('text'));

      const initialHeight = result.current.inputHeight;

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 120 } }
        });
      });

      expect(result.current.inputHeight).toBe(initialHeight);
    });

    it('should increase height for note input within limits', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(96);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 120 } }
        });
      });

      expect(result.current.inputHeight).toBe(120);
    });

    it('should respect minimum height for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(96);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 50 } }
        });
      });

      expect(result.current.inputHeight).toBe(96); // Minimum height
    });

    it('should respect maximum height for note input', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(96);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 400 } }
        });
      });

      expect(result.current.inputHeight).toBe(300); // Maximum height
    });

    it('should handle height changes correctly', () => {
      const { result } = renderHook(() => useInputLogic('note'));

      expect(result.current.inputHeight).toBe(96);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 150 } }
        });
      });

      expect(result.current.inputHeight).toBe(150);

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 200 } }
        });
      });

      expect(result.current.inputHeight).toBe(200);
    });
  });

  describe('strength color calculation', () => {
    it('should return error color for weak password', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor('weak');

      expect(color).toBe(colors.error);
    });

    it('should return warning color for average password', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor('average');

      expect(color).toBe(colors.warning);
    });

    it('should return primary color for strong password', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor('strong');

      expect(color).toBe(colors.primary);
    });

    it('should return secondary color for perfect password', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor('perfect');

      expect(color).toBe(colors.secondary);
    });

    it('should return secondary color for undefined strength', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor();

      expect(color).toBe(colors.secondary);
    });

    it('should return secondary color for unknown strength', () => {
      const { result } = renderHook(() => useInputLogic());

      const color = result.current.getStrengthColor('unknown' as any);

      expect(color).toBe(colors.secondary);
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

      expect(result.current.inputHeight).toBe(96);
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useInputLogic('text'));

      const initialToggleFn = result.current.togglePasswordVisibility;
      const initialHandleContentSizeFn = result.current.handleContentSizeChange;
      const initialGetStrengthColorFn = result.current.getStrengthColor;

      rerender();

      expect(result.current.togglePasswordVisibility).toBe(initialToggleFn);
      expect(result.current.handleContentSizeChange).toBe(initialHandleContentSizeFn);
      expect(result.current.getStrengthColor).toBe(initialGetStrengthColorFn);
    });
  });
}); 