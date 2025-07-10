/**
 * useLazyCredentialIcon hook tests for SimpliPass
 * Tests favicon URL generation, fallback, placeholder, and handlers
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLazyCredentialIcon } from '../useLazyCredentialIcon';

describe('useLazyCredentialIcon Hook', () => {
  it('should initialize with null favicon and not loaded', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('', 'Test'));
    expect(result.current.faviconUrl).toBe(null);
    expect(result.current.isFaviconLoaded).toBe(false);
    expect(result.current.showFavicon).toBe(false);
    expect(result.current.placeholderLetter).toBe('T');
  });

  it('should generate favicon URL for valid domain', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('example.com', 'Example'));
    expect(result.current.faviconUrl).toContain('https://www.google.com/s2/favicons?domain=example.com');
    expect(result.current.showFavicon).toBe(true);
    expect(result.current.placeholderLetter).toBe('E');
  });

  it('should handle invalid URL gracefully', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('not a url', 'Broken'));
    expect(result.current.faviconUrl).toBe(null);
    expect(result.current.showFavicon).toBe(false);
    expect(result.current.placeholderLetter).toBe('B');
  });

  it('should use ? as placeholder if title is empty', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('example.com', ''));
    expect(result.current.placeholderLetter).toBe('?');
  });

  it('should set isFaviconLoaded to true on load', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('example.com', 'Example'));
    act(() => {
      result.current.handleFaviconLoad();
    });
    expect(result.current.isFaviconLoaded).toBe(true);
  });

  it('should set isFaviconLoaded to false and hide favicon on error', () => {
    const { result } = renderHook(() => useLazyCredentialIcon('example.com', 'Example'));
    act(() => {
      result.current.handleFaviconError();
    });
    expect(result.current.isFaviconLoaded).toBe(false);
    expect(result.current.showFavicon).toBe(false);
  });

  it('should update favicon when url changes', () => {
    const { result, rerender } = renderHook(({ url, title }) => useLazyCredentialIcon(url, title), {
      initialProps: { url: 'example.com', title: 'Example' }
    });
    expect(result.current.faviconUrl).toContain('example.com');
    rerender({ url: 'test.com', title: 'Test' });
    expect(result.current.faviconUrl).toContain('test.com');
    expect(result.current.placeholderLetter).toBe('T');
  });
}); 