import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('initial', 300));

      expect(result.current).toBe('initial');
    });
  });

  describe('debouncing', () => {
    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'changed', delay: 300 });

      // Value should still be initial before delay
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Value should now be changed
      expect(result.current).toBe('changed');
    });

    it('should handle multiple rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      expect(result.current).toBe('initial');

      // Multiple rapid changes
      rerender({ value: 'change1', delay: 300 });
      rerender({ value: 'change2', delay: 300 });
      rerender({ value: 'change3', delay: 300 });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Value should be the last change
      expect(result.current).toBe('change3');
    });

    it('should handle different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'changed', delay: 100 });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Value should now be changed
      expect(result.current).toBe('changed');
    });
  });

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      rerender({ value: 'changed', delay: 300 });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'changed', delay: 0 });

      // With zero delay, should still debounce (setTimeout with 0 still delays)
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1);
      });

      // Value should now be changed
      expect(result.current).toBe('changed');
    });

    it('should handle negative delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { initialProps: { value: 'initial', delay: -100 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'changed', delay: -100 });

      // With negative delay, should still debounce (setTimeout treats negative as 0)
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1);
      });

      // Value should now be changed
      expect(result.current).toBe('changed');
    });

    it('should handle undefined value', () => {
      const { result } = renderHook(() => useDebouncedValue(undefined, 300));

      expect(result.current).toBe(undefined);
    });

    it('should handle null value', () => {
      const { result } = renderHook(() => useDebouncedValue(null, 300));

      expect(result.current).toBe(null);
    });
  });
}); 