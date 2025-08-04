/**
 * useDebouncedValue Hook - Layer 1: UI Layer
 * 
 * Provides a debounced value that updates after a delay.
 * Useful for search inputs and other real-time input scenarios.
 */

import { useState, useEffect } from 'react';

export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}; 