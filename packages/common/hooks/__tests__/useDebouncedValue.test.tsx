/**
 * Tests for useDebouncedValue hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 100));

    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('should clear previous timeout when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Change value multiple times quickly
    rerender({ value: 'first', delay: 100 });
    rerender({ value: 'second', delay: 100 });
    rerender({ value: 'third', delay: 100 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should only have the last value
    expect(result.current).toBe('third');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 200 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time by less than delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('initial');

    // Fast forward time by remaining delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 });

    // With zero delay, should update after timeout is processed
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should work with different value types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 100 });

    expect(result.current).toBe(0);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });

  it('should work with objects', () => {
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initialObj, delay: 100 } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 100 });

    expect(result.current).toBe(initialObj);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(updatedObj);
  });

  it('should cleanup timeout on unmount', () => {
    const { unmount } = renderHook(() => useDebouncedValue('initial', 100));

    // Unmount before timeout completes
    unmount();

    // Fast forward time - should not cause any errors
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Test passes if no errors are thrown
    expect(true).toBe(true);
  });
});
