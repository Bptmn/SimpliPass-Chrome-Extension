import { renderHook } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('should throw error when used outside ToastProvider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');
  });

  it('should return context when used within ToastProvider', async () => {
    const mockContext = {
      showToast: jest.fn(),
      hideToast: jest.fn(),
    };

    // Mock the ToastContext to return our mock context
    jest.doMock('@ui/components/Toast', () => ({
      ToastContext: mockContext,
    }));

    // Re-import the hook to get the mocked version
    const { useToast: useToastMocked } = await import('../useToast');
    
    const { result } = renderHook(() => useToastMocked());

    expect(result.current).toBe(mockContext);
  });
}); 