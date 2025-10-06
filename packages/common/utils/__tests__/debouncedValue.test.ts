/**
 * Tests for debouncedValue utility
 */

import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../debouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Ensure clearTimeout is available in fake timers
    global.clearTimeout = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'changed', delay: 100 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by less than delay
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward to complete the delay
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('changed'); // Should now be changed
  });

  it('should handle multiple rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    // Make multiple rapid changes
    rerender({ value: 'change1', delay: 100 });
    rerender({ value: 'change2', delay: 100 });
    rerender({ value: 'change3', delay: 100 });

    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('change3'); // Should be the last change
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    );

    rerender({ value: 'changed', delay: 200 });

    // Fast-forward by less than delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial');

    // Fast-forward to complete the delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('changed');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'changed', delay: 0 });

    // With zero delay, should update immediately
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current).toBe('changed');
  });

  it('should handle different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    rerender({ value: 42, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(42);
  });

  it('should handle object values', () => {
    const initialObj = { name: 'initial' };
    const changedObj = { name: 'changed' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initialObj, delay: 100 } }
    );

    rerender({ value: changedObj, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(changedObj);
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebouncedValue('test', 100));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'changed', delay: 200 });

    // Fast-forward by original delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial'); // Should not have changed yet

    // Fast-forward by remaining delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('changed'); // Should now be changed
  });
});
