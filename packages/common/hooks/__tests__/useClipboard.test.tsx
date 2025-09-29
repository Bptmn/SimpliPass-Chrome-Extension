/**
 * Tests for useClipboard hook
 */

import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

// Mock the Toast hook
const mockShowToast = jest.fn();
jest.mock('@common/ui/components/Toast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText
  },
  writable: true
});

describe('useClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyToClipboard', () => {
    it('should copy text successfully with toast', async () => {
      const { result } = renderHook(() => useClipboard());
      const text = 'test text';
      const successMessage = 'Copied successfully';

      mockWriteText.mockResolvedValue(undefined);

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard(text, successMessage);
      });

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockShowToast).toHaveBeenCalledWith(successMessage);
      expect(copyResult).toBe(true);
    });

    it('should handle clipboard errors with toast', async () => {
      const { result } = renderHook(() => useClipboard());
      const text = 'test text';
      const errorMessage = 'Copy failed';

      mockWriteText.mockRejectedValue(new Error('Clipboard error'));

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard(text, 'Success', errorMessage);
      });

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage);
      expect(copyResult).toBe(false);
    });

    it('should show toast for empty text', async () => {
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard('');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Nothing to copy');
      expect(copyResult).toBe(false);
    });

    it('should set isCopying state correctly', async () => {
      const { result } = renderHook(() => useClipboard());
      const text = 'test text';

      mockWriteText.mockResolvedValue(undefined);

      expect(result.current.isCopying).toBe(false);

      await act(async () => {
        await result.current.copyToClipboard(text);
      });

      expect(result.current.isCopying).toBe(false);
    });
  });

  describe('copyToClipboardSilent', () => {
    it('should copy text successfully without toast', async () => {
      const { result } = renderHook(() => useClipboard());
      const text = 'test text';

      mockWriteText.mockResolvedValue(undefined);

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent(text);
      });

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(true);
    });

    it('should handle clipboard errors without toast', async () => {
      const { result } = renderHook(() => useClipboard());
      const text = 'test text';

      mockWriteText.mockRejectedValue(new Error('Clipboard error'));

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent(text);
      });

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(false);
    });

    it('should return false for empty text', async () => {
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent('');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(false);
    });
  });

  describe('isClipboardAvailable', () => {
    it('should return true when clipboard API is available', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isClipboardAvailable()).toBe(true);
    });

    it('should return false when writeText is not a function', () => {
      // Mock navigator with clipboard but no writeText
      const originalWriteText = navigator.clipboard.writeText;
      navigator.clipboard.writeText = undefined as any;

      const { result } = renderHook(() => useClipboard());

      expect(result.current.isClipboardAvailable()).toBe(false);

      // Restore writeText
      navigator.clipboard.writeText = originalWriteText;
    });
  });
});
