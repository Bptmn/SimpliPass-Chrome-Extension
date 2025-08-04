import { renderHook, act } from '@testing-library/react';
import { usePasswordVisibility } from '../usePasswordVisibility';

describe('usePasswordVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with password hidden', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle password visibility from false to true', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.isPasswordVisible).toBe(true);
    });

    it('should toggle password visibility from true to false', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // First toggle to show password
      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.isPasswordVisible).toBe(true);

      // Second toggle to hide password
      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.isPasswordVisible).toBe(false);
    });

    it('should maintain toggle state across multiple calls', () => {
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
  });

  describe('showPassword', () => {
    it('should show password when called', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.showPassword();
      });

      expect(result.current.isPasswordVisible).toBe(true);
    });

    it('should keep password visible when called multiple times', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.showPassword();
      });
      expect(result.current.isPasswordVisible).toBe(true);

      act(() => {
        result.current.showPassword();
      });
      expect(result.current.isPasswordVisible).toBe(true);
    });
  });

  describe('hidePassword', () => {
    it('should hide password when called', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // First show password
      act(() => {
        result.current.showPassword();
      });
      expect(result.current.isPasswordVisible).toBe(true);

      // Then hide password
      act(() => {
        result.current.hidePassword();
      });

      expect(result.current.isPasswordVisible).toBe(false);
    });

    it('should keep password hidden when called multiple times', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.hidePassword();
      });
      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.hidePassword();
      });
      expect(result.current.isPasswordVisible).toBe(false);
    });
  });

  describe('setPasswordVisibility', () => {
    it('should set password visibility to true', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.setPasswordVisibility(true);
      });

      expect(result.current.isPasswordVisible).toBe(true);
    });

    it('should set password visibility to false', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // First show password
      act(() => {
        result.current.showPassword();
      });
      expect(result.current.isPasswordVisible).toBe(true);

      // Then hide password
      act(() => {
        result.current.setPasswordVisibility(false);
      });

      expect(result.current.isPasswordVisible).toBe(false);
    });

    it('should maintain visibility when set to same value', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      expect(result.current.isPasswordVisible).toBe(false);

      act(() => {
        result.current.setPasswordVisibility(false);
      });

      expect(result.current.isPasswordVisible).toBe(false);
    });
  });

  describe('integration between methods', () => {
    it('should work correctly with all methods together', () => {
      const { result } = renderHook(() => usePasswordVisibility());

      // Start hidden
      expect(result.current.isPasswordVisible).toBe(false);

      // Show password
      act(() => {
        result.current.showPassword();
      });
      expect(result.current.isPasswordVisible).toBe(true);

      // Toggle to hide
      act(() => {
        result.current.togglePasswordVisibility();
      });
      expect(result.current.isPasswordVisible).toBe(false);

      // Set to visible
      act(() => {
        result.current.setPasswordVisibility(true);
      });
      expect(result.current.isPasswordVisible).toBe(true);

      // Hide password
      act(() => {
        result.current.hidePassword();
      });
      expect(result.current.isPasswordVisible).toBe(false);

      // Toggle to show
      act(() => {
        result.current.togglePasswordVisibility();
      });
      expect(result.current.isPasswordVisible).toBe(true);
    });
  });
}); 