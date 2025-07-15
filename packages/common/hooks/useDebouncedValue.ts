import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce a value by a given delay.
 * Used for search input to avoid filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
} 