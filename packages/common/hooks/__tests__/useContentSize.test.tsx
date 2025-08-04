import { renderHook, act } from '@testing-library/react';
import { useContentSize } from '../useContentSize';

describe('useContentSize', () => {
  describe('initialization', () => {
    it('should initialize with default height for regular input', () => {
      const { result } = renderHook(() => useContentSize(false));

      expect(result.current.inputHeight).toBe(48);
    });

    it('should initialize with note height when isNote is true', () => {
      const { result } = renderHook(() => useContentSize(true));

      expect(result.current.inputHeight).toBe(72);
    });

    it('should use custom minHeight when provided', () => {
      const { result } = renderHook(() => useContentSize(false, 60, 200));

      expect(result.current.inputHeight).toBe(60);
    });

    it('should use custom minHeight for note when provided', () => {
      const { result } = renderHook(() => useContentSize(true, 80, 200));

      expect(result.current.inputHeight).toBe(72); // Note always starts with 72
    });
  });

  describe('handleContentSizeChange', () => {
    it('should not change height for regular input (isNote = false)', () => {
      const { result } = renderHook(() => useContentSize(false));

      const initialHeight = result.current.inputHeight;

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 100 } }
        });
      });

      expect(result.current.inputHeight).toBe(initialHeight);
    });

    it('should update height for note input when content size changes', () => {
      const { result } = renderHook(() => useContentSize(true));

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 100 } }
        });
      });

      expect(result.current.inputHeight).toBe(100);
    });

    it('should clamp height to minimum value', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 50 } }
        });
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should clamp height to maximum value', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 250 } }
        });
      });

      expect(result.current.inputHeight).toBe(200);
    });

    it('should handle height within valid range', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: { height: 150 } }
        });
      });

      expect(result.current.inputHeight).toBe(150);
    });
  });

  describe('resetHeight', () => {
    it('should reset to default height for regular input', () => {
      const { result } = renderHook(() => useContentSize(false));

      // Change height first
      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);

      // Reset height
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.inputHeight).toBe(48);
    });

    it('should reset to note height for note input', () => {
      const { result } = renderHook(() => useContentSize(true));

      // Change height first
      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);

      // Reset height
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should reset to custom minHeight when provided', () => {
      const { result } = renderHook(() => useContentSize(false, 60, 200));

      // Change height first
      act(() => {
        result.current.setHeight(100);
      });

      expect(result.current.inputHeight).toBe(100);

      // Reset height
      act(() => {
        result.current.resetHeight();
      });

      expect(result.current.inputHeight).toBe(60);
    });
  });

  describe('setHeight', () => {
    it('should set height to specified value within valid range', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(150);
      });

      expect(result.current.inputHeight).toBe(150);
    });

    it('should clamp height to minimum when value is too low', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(50);
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should clamp height to maximum when value is too high', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(250);
      });

      expect(result.current.inputHeight).toBe(200);
    });

    it('should handle edge case values', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(72); // Minimum
      });

      expect(result.current.inputHeight).toBe(72);

      act(() => {
        result.current.setHeight(200); // Maximum
      });

      expect(result.current.inputHeight).toBe(200);
    });
  });

  describe('getHeightStyle', () => {
    it('should return style object with current height', () => {
      const { result } = renderHook(() => useContentSize(true));

      const style = result.current.getHeightStyle();

      expect(style).toEqual({ height: 72 });
    });

    it('should return updated style when height changes', () => {
      const { result } = renderHook(() => useContentSize(true));

      act(() => {
        result.current.setHeight(150);
      });

      const style = result.current.getHeightStyle();

      expect(style).toEqual({ height: 150 });
    });

    it('should return consistent style object', () => {
      const { result } = renderHook(() => useContentSize(true));

      const style1 = result.current.getHeightStyle();
      const style2 = result.current.getHeightStyle();

      expect(style1).toEqual(style2); // Same content due to useCallback
    });
  });

  describe('returned values', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useContentSize());

      expect(result.current).toHaveProperty('inputHeight');
      expect(result.current).toHaveProperty('handleContentSizeChange');
      expect(result.current).toHaveProperty('resetHeight');
      expect(result.current).toHaveProperty('setHeight');
      expect(result.current).toHaveProperty('getHeightStyle');
    });

    it('should return functions for all methods', () => {
      const { result } = renderHook(() => useContentSize());

      expect(typeof result.current.handleContentSizeChange).toBe('function');
      expect(typeof result.current.resetHeight).toBe('function');
      expect(typeof result.current.setHeight).toBe('function');
      expect(typeof result.current.getHeightStyle).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle negative height values', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(-10);
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should handle zero height value', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(0);
      });

      expect(result.current.inputHeight).toBe(72);
    });

    it('should handle very large height values', () => {
      const { result } = renderHook(() => useContentSize(true, 72, 200));

      act(() => {
        result.current.setHeight(10000);
      });

      expect(result.current.inputHeight).toBe(200);
    });

    it('should handle undefined contentSize in event', () => {
      const { result } = renderHook(() => useContentSize(true));

      const initialHeight = result.current.inputHeight;

      act(() => {
        result.current.handleContentSizeChange({
          nativeEvent: { contentSize: undefined }
        });
      });

      expect(result.current.inputHeight).toBe(initialHeight);
    });

    it('should handle missing nativeEvent in event', () => {
      const { result } = renderHook(() => useContentSize(true));

      const initialHeight = result.current.inputHeight;

      act(() => {
        result.current.handleContentSizeChange({});
      });

      expect(result.current.inputHeight).toBe(initialHeight);
    });
  });
}); 