/**
 * Tests for useContentSize hook
 */

import { renderHook, act } from '@testing-library/react';
import { useContentSize } from '../useContentSize';

describe('useContentSize', () => {
  describe('initialization', () => {
    it('should initialize with default height for regular input', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      expect(result.current.inputHeight).toBe(48);
    });

    it('should initialize with note height for note input', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      expect(result.current.inputHeight).toBe(72);
    });

    it('should use custom minHeight when provided', () => {
      const { result } = renderHook(() => useContentSize(false, 60, 200));

      expect(result.current.inputHeight).toBe(60);
    });
  });

  describe('handleContentSizeChange', () => {
    it('should update height for note input with valid event', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 100 }
        }
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(100);
    });

    it('should clamp height to minHeight', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 30 }
        }
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(48);
    });

    it('should clamp height to maxHeight', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 250 }
        }
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(200);
    });

    it('should not update height for non-note input', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      const mockEvent = {
        nativeEvent: {
          contentSize: { height: 100 }
        }
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(48);
    });

    it('should handle invalid event structure gracefully', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      const mockEvent = {
        nativeEvent: {
          contentSize: null
        }
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(72); // Should remain unchanged
    });

    it('should handle missing contentSize property', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      const mockEvent = {
        nativeEvent: {}
      };

      act(() => {
        result.current.handleContentSizeChange(mockEvent);
      });

      expect(result.current.inputHeight).toBe(72); // Should remain unchanged
    });
  });

  describe('resetHeight', () => {
    it('should reset to default height for regular input', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      // First change the height
      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);

      // Then reset
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.inputHeight).toBe(48);
    });

    it('should reset to note height for note input', () => {
      const { result } = renderHook(() => useContentSize(true, 48, 200));

      // First change the height
      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);

      // Then reset
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.inputHeight).toBe(72);
    });
  });

  describe('setHeight', () => {
    it('should set height to specific value', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);
    });

    it('should clamp height to minHeight', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      act(() => {
        result.current.setHeight(30);
      });

      expect(result.current.inputHeight).toBe(48);
    });

    it('should clamp height to maxHeight', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      act(() => {
        result.current.setHeight(250);
      });

      expect(result.current.inputHeight).toBe(200);
    });
  });

  describe('getHeightStyle', () => {
    it('should return style object with current height', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      act(() => {
        result.current.setHeight(100);
      });

      const style = result.current.getHeightStyle();

      expect(style).toEqual({ height: 100 });
    });

    it('should return updated style when height changes', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 200));

      let style = result.current.getHeightStyle();
      expect(style).toEqual({ height: 48 });

      act(() => {
        result.current.setHeight(120);
      });

      style = result.current.getHeightStyle();
      expect(style).toEqual({ height: 120 });
    });
  });

  describe('edge cases', () => {
    it('should handle zero minHeight', () => {
      const { result } = renderHook(() => useContentSize(false, 0, 200));

      act(() => {
        result.current.setHeight(-10);
      });

      expect(result.current.inputHeight).toBe(0);
    });

    it('should handle very large maxHeight', () => {
      const { result } = renderHook(() => useContentSize(false, 48, 1000));

      act(() => {
        result.current.setHeight(500);
      });

      expect(result.current.inputHeight).toBe(500);
    });

    it('should handle minHeight equal to maxHeight', () => {
      const { result } = renderHook(() => useContentSize(false, 100, 100));

      act(() => {
        result.current.setHeight(150);
      });

      expect(result.current.inputHeight).toBe(100);
    });
  });
});
