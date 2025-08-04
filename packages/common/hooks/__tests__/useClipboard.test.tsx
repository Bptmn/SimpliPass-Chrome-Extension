import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

// Mock the Toast component
jest.mock('@common/ui/components/Toast', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
  })),
}));

// Mock navigator.clipboard
const mockWriteText = jest.fn();

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

describe('useClipboard', () => {
  let mockShowToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast = jest.fn();
    mockWriteText.mockClear();
    
    // Mock useToast
    const { useToast } = require('@common/ui/components/Toast');
    useToast.mockReturnValue({
      showToast: mockShowToast,
    });
  });

  describe('initialization', () => {
    it('should initialize with isCopying as false', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isCopying).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard('test text');
      });

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(mockShowToast).toHaveBeenCalledWith('Copied to clipboard', 'success');
      expect(copyResult).toBe(true);
    });

    it('should show custom success message', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text', 'Custom success message');
      });

      expect(mockShowToast).toHaveBeenCalledWith('Custom success message', 'success');
    });

    it('should handle clipboard error', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));
      
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard('test text');
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to copy', 'error');
      expect(copyResult).toBe(false);
    });

    it('should show custom error message', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));
      
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text', 'Success', 'Custom error message');
      });

      expect(mockShowToast).toHaveBeenCalledWith('Custom error message', 'error');
    });

    it('should handle empty text', async () => {
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboard('');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Nothing to copy', 'error');
      expect(copyResult).toBe(false);
    });

    it('should set isCopying state correctly', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isCopying).toBe(false);

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(result.current.isCopying).toBe(false);
    });
  });

  describe('copyToClipboardSilent', () => {
    it('should copy text to clipboard without toast', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent('test text');
      });

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(true);
    });

    it('should handle clipboard error silently', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));
      
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent('test text');
      });

      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(false);
    });

    it('should handle empty text silently', async () => {
      const { result } = renderHook(() => useClipboard());

      let copyResult: boolean;
      await act(async () => {
        copyResult = await result.current.copyToClipboardSilent('');
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(copyResult).toBe(false);
    });

    it('should set isCopying state correctly', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isCopying).toBe(false);

      await act(async () => {
        await result.current.copyToClipboardSilent('test text');
      });

      expect(result.current.isCopying).toBe(false);
    });
  });

  describe('isClipboardAvailable', () => {
    it('should return true when clipboard API is available', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isClipboardAvailable()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle clipboard API errors gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard not available'));
      
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to copy', 'error');
    });

    it('should handle network errors', async () => {
      mockWriteText.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to copy', 'error');
    });
  });
}); 