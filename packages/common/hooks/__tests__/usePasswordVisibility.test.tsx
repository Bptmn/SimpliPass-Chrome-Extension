/**
 * Tests for usePasswordVisibility hook
 */

import { renderHook, act } from '@testing-library/react';
import { usePasswordVisibility } from '../usePasswordVisibility';

describe('usePasswordVisibility', () => {
  it('should initialize with password hidden', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);
  });

  it('should toggle password visibility', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.isPasswordVisible).toBe(true);

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.isPasswordVisible).toBe(false);
  });

  it('should show password', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);

    act(() => {
      result.current.showPassword();
    });

    expect(result.current.isPasswordVisible).toBe(true);
  });

  it('should hide password', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    // First show password
    act(() => {
      result.current.showPassword();
    });

    expect(result.current.isPasswordVisible).toBe(true);

    // Then hide it
    act(() => {
      result.current.hidePassword();
    });

    expect(result.current.isPasswordVisible).toBe(false);
  });

  it('should set password visibility to specific state', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);

    act(() => {
      result.current.setPasswordVisibility(true);
    });

    expect(result.current.isPasswordVisible).toBe(true);

    act(() => {
      result.current.setPasswordVisibility(false);
    });

    expect(result.current.isPasswordVisible).toBe(false);
  });

  it('should maintain state across multiple toggles', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);

    // Toggle multiple times
    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.isPasswordVisible).toBe(true);

    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.isPasswordVisible).toBe(false);

    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.isPasswordVisible).toBe(true);
  });

  it('should work with mixed actions', () => {
    const { result } = renderHook(() => usePasswordVisibility());

    expect(result.current.isPasswordVisible).toBe(false);

    // Use showPassword
    act(() => {
      result.current.showPassword();
    });
    expect(result.current.isPasswordVisible).toBe(true);

    // Use toggle
    act(() => {
      result.current.togglePasswordVisibility();
    });
    expect(result.current.isPasswordVisible).toBe(false);

    // Use setPasswordVisibility
    act(() => {
      result.current.setPasswordVisibility(true);
    });
    expect(result.current.isPasswordVisible).toBe(true);

    // Use hidePassword
    act(() => {
      result.current.hidePassword();
    });
    expect(result.current.isPasswordVisible).toBe(false);
  });
});
