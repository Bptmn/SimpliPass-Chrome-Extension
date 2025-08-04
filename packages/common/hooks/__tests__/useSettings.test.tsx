import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { storage } from '@common/core/adapters/platform.storage.adapter';
import type { Settings } from '../useSettings';

// Mock dependencies
jest.mock('@common/core/adapters/platform.storage.adapter', () => ({
  storage: {
    getVaultFromSecureLocalStorage: jest.fn(),
    updateVaultInSecureLocalStorage: jest.fn()
  }
}));

// Get the actual mock from the module
const { storage: mockStorage } = require('@common/core/adapters/platform.storage.adapter');

const mockSettings: Settings = {
  darkMode: true,
  lockTimeout: 30,
  autoLock: false,
  biometricEnabled: true,
};

const mockVault = {
  id: 'vault-1',
  settings: mockSettings
};

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(null);
    mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);
    
    // Reset console mocks
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(null);

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        darkMode: false,
        lockTimeout: 15,
        autoLock: true,
        biometricEnabled: false,
      });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should load settings from storage', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);

      const { result } = renderHook(() => useSettings());

      // Wait for async operations to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockStorage.getVaultFromSecureLocalStorage).toHaveBeenCalled();
      expect(result.current.settings).toEqual(mockSettings);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should merge stored settings with defaults', async () => {
      const partialVault = {
        id: 'vault-1',
        settings: {
          darkMode: true,
          lockTimeout: 30
        }
      };
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(partialVault);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.settings).toEqual({
        darkMode: true,
        lockTimeout: 30,
        autoLock: true, // default
        biometricEnabled: false, // default
      });
    });

    it('should return all expected properties and methods', () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(null);

      const { result } = renderHook(() => useSettings());

      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('updateSettings');
      expect(result.current).toHaveProperty('toggleDarkMode');
      expect(result.current).toHaveProperty('setLockTimeout');
      expect(result.current).toHaveProperty('toggleAutoLock');
      expect(result.current).toHaveProperty('toggleBiometric');
      expect(result.current).toHaveProperty('clearError');
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const updates = { darkMode: false, lockTimeout: 60 };
      await act(async () => {
        await result.current.updateSettings(updates);
      });

      expect(mockStorage.updateVaultInSecureLocalStorage).toHaveBeenCalledWith({
        ...mockVault,
        settings: { ...mockSettings, ...updates }
      });
      expect(result.current.settings).toEqual({ ...mockSettings, ...updates });
      expect(result.current.error).toBe(null);
    });

    it('should handle update errors', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateSettings({ darkMode: false });
      });

      expect(result.current.error).toBe('Update failed');
      expect(result.current.settings).toEqual(mockSettings); // Should not change
    });

    it('should handle non-Error exceptions', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateSettings({ darkMode: false });
      });

      expect(result.current.error).toBe('Failed to update settings');
    });

    it('should handle storage errors during load', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Load failed');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.settings).toEqual({
        darkMode: false,
        lockTimeout: 15,
        autoLock: true,
        biometricEnabled: false,
      });
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle dark mode from false to true', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, darkMode: false }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleDarkMode();
      });

      expect(result.current.settings.darkMode).toBe(true);
    });

    it('should toggle dark mode from true to false', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, darkMode: true }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleDarkMode();
      });

      expect(result.current.settings.darkMode).toBe(false);
    });
  });

  describe('setLockTimeout', () => {
    it('should set lock timeout', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.setLockTimeout(60);
      });

      expect(result.current.settings.lockTimeout).toBe(60);
    });
  });

  describe('toggleAutoLock', () => {
    it('should toggle auto lock from true to false', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, autoLock: true }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleAutoLock();
      });

      expect(result.current.settings.autoLock).toBe(false);
    });

    it('should toggle auto lock from false to true', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, autoLock: false }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleAutoLock();
      });

      expect(result.current.settings.autoLock).toBe(true);
    });
  });

  describe('toggleBiometric', () => {
    it('should toggle biometric from false to true', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, biometricEnabled: false }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleBiometric();
      });

      expect(result.current.settings.biometricEnabled).toBe(true);
    });

    it('should toggle biometric from true to false', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue({
        ...mockVault,
        settings: { ...mockSettings, biometricEnabled: true }
      });
      mockStorage.updateVaultInSecureLocalStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.toggleBiometric();
      });

      expect(result.current.settings.biometricEnabled).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useSettings());

      // Wait for error to occur
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('loading states', () => {
    it('should set loading state during initial load', async () => {
      // Create a promise that doesn't resolve immediately
      let resolveLoad: (value: any) => void;
      const loadPromise = new Promise<any>((resolve) => {
        resolveLoad = resolve;
      });
      mockStorage.getVaultFromSecureLocalStorage.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useSettings());

      // Check that loading is true during the operation
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolveLoad!(mockVault);
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle undefined errors', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Failed to load settings');
    });

    it('should handle null errors', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(null);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Failed to load settings');
    });

    it('should handle update errors with undefined', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockRejectedValue(undefined);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateSettings({ darkMode: false });
      });

      expect(result.current.error).toBe('Failed to update settings');
    });
  });

  describe('logging', () => {
    it('should log errors during load', async () => {
      const error = new Error('Load error');
      mockStorage.getVaultFromSecureLocalStorage.mockRejectedValue(error);

      renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(console.error).toHaveBeenCalledWith('[useSettings] Failed to load settings:', error);
    });

    it('should log errors during update', async () => {
      const error = new Error('Update error');
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(mockVault);
      mockStorage.updateVaultInSecureLocalStorage.mockRejectedValue(error);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateSettings({ darkMode: false });
      });

      expect(console.error).toHaveBeenCalledWith('[useSettings] Failed to update settings:', error);
    });
  });

  describe('edge cases', () => {
    it('should handle vault without settings', async () => {
      const vaultWithoutSettings = {
        id: 'vault-1'
        // No settings property
      };
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(vaultWithoutSettings);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.settings).toEqual({
        darkMode: false,
        lockTimeout: 15,
        autoLock: true,
        biometricEnabled: false,
      });
    });

    it('should handle partial settings in vault', async () => {
      const vaultWithPartialSettings = {
        id: 'vault-1',
        settings: {
          darkMode: true
          // Missing other settings
        }
      };
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(vaultWithPartialSettings);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.settings).toEqual({
        darkMode: true,
        lockTimeout: 15, // default
        autoLock: true, // default
        biometricEnabled: false, // default
      });
    });

    it('should handle null vault', async () => {
      mockStorage.getVaultFromSecureLocalStorage.mockResolvedValue(null);

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.settings).toEqual({
        darkMode: false,
        lockTimeout: 15,
        autoLock: true,
        biometricEnabled: false,
      });
    });
  });
}); 