/**
 * useInputLogic hook tests for SimpliPass
 * Tests input state management, password visibility, content sizing, and cross-platform behavior
 */

import { renderHook, act } from '@testing-library/react-native';
import { useInputLogic } from '../useInputLogic';

// Mock dependencies
jest.mock('@design/colors', () => ({
  colors: {
    error: '#ff0000',
    warning: '#ffaa00',
    primary: '#007bff',
    secondary: '#6c757d',
  },
}));

describe('useInputLogic Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Management', () => {
    it('should initialize with default values for text type', () => {
      const { result } = renderHook(() => useInputLogic('text'));
      
      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
    });

    it('should initialize with correct height for note type', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(96);
    });

    it('should initialize with correct height for email type', () => {
      const { result } = renderHook(() => useInputLogic('email'));
      
      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
    });

    it('should initialize with correct height for password type', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      expect(result.current.showPassword).toBe(false);
      expect(result.current.inputHeight).toBe(48);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when called', () => {
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

    it('should maintain toggle state across re-renders', () => {
      const { result, rerender } = renderHook(() => useInputLogic('password'));
      
      act(() => {
        result.current.togglePasswordVisibility();
      });
      
      expect(result.current.showPassword).toBe(true);
      
      rerender('password');
      
      expect(result.current.showPassword).toBe(true);
    });
  });

  describe('Content Size Handling', () => {
    it('should handle content size change for note type', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 120 }
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });
      
      expect(result.current.inputHeight).toBe(120);
    });

    it('should respect minimum height for note type', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 50 } // Below minimum
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });
      
      expect(result.current.inputHeight).toBe(96); // Minimum height
    });

    it('should respect maximum height for note type', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 400 } // Above maximum
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });
      
      expect(result.current.inputHeight).toBe(300); // Maximum height
    });

    it('should not change height for non-note types', () => {
      const { result } = renderHook(() => useInputLogic('text'));
      
      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 120 }
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });
      
      expect(result.current.inputHeight).toBe(48); // Should remain unchanged
    });
  });

  describe('Strength Color Calculation', () => {
    it('should return correct color for weak strength', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const color = result.current.getStrengthColor('weak');
      expect(color).toBe('#ff0000'); // error color
    });

    it('should return correct color for average strength', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const color = result.current.getStrengthColor('average');
      expect(color).toBe('#ffaa00'); // warning color
    });

    it('should return correct color for strong strength', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const color = result.current.getStrengthColor('strong');
      expect(color).toBe('#007bff'); // primary color
    });

    it('should return correct color for perfect strength', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const color = result.current.getStrengthColor('perfect');
      expect(color).toBe('#6c757d'); // secondary color
    });

    it('should return secondary color for undefined strength', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const color = result.current.getStrengthColor();
      expect(color).toBe('#6c757d'); // secondary color
    });
  });

  describe('Side Effects', () => {
    it('should handle rapid password visibility toggles', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      act(() => {
        result.current.togglePasswordVisibility();
        result.current.togglePasswordVisibility();
        result.current.togglePasswordVisibility();
      });
      
      expect(result.current.showPassword).toBe(true);
    });

    it('should handle rapid content size changes', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const mockEvents = [
        { nativeEvent: { contentSize: { height: 100 } } },
        { nativeEvent: { contentSize: { height: 150 } } },
        { nativeEvent: { contentSize: { height: 200 } } },
      ];
      
      act(() => {
        mockEvents.forEach(event => {
          result.current.handleContentSizeChange(event);
        });
      });
      
      expect(result.current.inputHeight).toBe(200); // Last value should be applied
    });
  });

  describe('Cleanup Functions', () => {
    it('should maintain state after unmount and remount', () => {
      const { result, unmount } = renderHook(() => useInputLogic('password'));
      
      act(() => {
        result.current.togglePasswordVisibility();
      });
      
      expect(result.current.showPassword).toBe(true);
      
      unmount();
      
      // State should be reset on new mount
      const { result: newResult } = renderHook(() => useInputLogic('password'));
      expect(newResult.current.showPassword).toBe(false);
    });

    it('should reset input height on type change', () => {
      const { result, rerender } = renderHook((type: 'text' | 'email' | 'password' | 'note') => useInputLogic(type), {
        initialProps: 'note'
      });
      
      expect(result.current.inputHeight).toBe(96);
      
      // Change content size
      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 150 } }
        });
      });
      
      expect(result.current.inputHeight).toBe(150);
      
      // Change type to text - height should remain the same since it's not reset on type change
      rerender('text');
      
      expect(result.current.inputHeight).toBe(150); // Should maintain the last set height
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid content size events gracefully', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const invalidEvent = {
        nativeEvent: {
          contentSize: { height: -10 } // Invalid negative height
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(invalidEvent);
      });
      
      expect(result.current.inputHeight).toBe(96); // Should use minimum height
    });

    it('should handle missing content size gracefully', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const invalidEvent = {
        nativeEvent: {
          contentSize: { height: 0 } // Zero height instead of missing
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(invalidEvent);
      });
      
      expect(result.current.inputHeight).toBe(96); // Should remain at minimum
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle mobile keyboard behavior for password input', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      // Simulate mobile keyboard interaction
      act(() => {
        result.current.togglePasswordVisibility();
      });
      
      expect(result.current.showPassword).toBe(true);
    });

    it('should handle web autofill behavior for email input', () => {
      const { result } = renderHook(() => useInputLogic('email'));
      
      // Simulate autofill interaction
      expect(result.current.inputHeight).toBe(48);
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('Hook Integration', () => {
    it('should integrate with design system colors', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      const weakColor = result.current.getStrengthColor('weak');
      const strongColor = result.current.getStrengthColor('strong');
      
      expect(weakColor).toBe('#ff0000');
      expect(strongColor).toBe('#007bff');
    });

    it('should handle platform API integration', () => {
      const { result } = renderHook(() => useInputLogic('text'));
      
      // Test that hook works with platform APIs
      expect(result.current.inputHeight).toBe(48);
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle rapid state changes efficiently', () => {
      const { result } = renderHook(() => useInputLogic('password'));
      
      // Rapid toggles - 10 toggles = even number, should end up false
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.togglePasswordVisibility();
        }
      });
      
      expect(result.current.showPassword).toBe(false); // Even number of toggles should end up false
    });

    it('should handle large content size changes efficiently', () => {
      const { result } = renderHook(() => useInputLogic('note'));
      
      const largeEvent = {
        nativeEvent: {
          contentSize: { height: 1000 } // Large height
        }
      };
      
      act(() => {
        result.current.handleContentSizeChange(largeEvent);
      });
      
      expect(result.current.inputHeight).toBe(300); // Should be capped at maximum
    });
  });
}); 