/**
 * Tests for useTextFormatting hook
 */

import { renderHook } from '@testing-library/react';
import { useTextFormatting } from '../useTextFormatting';

// Mock the formatting utilities
jest.mock('@common/utils/formatting', () => ({
  formatURL: jest.fn((url: string) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }),
  truncateText: jest.fn((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  })
}));

describe('useTextFormatting', () => {
  it('should return formatting functions', () => {
    const { result } = renderHook(() => useTextFormatting());

    expect(typeof result.current.formatURL).toBe('function');
    expect(typeof result.current.truncateText).toBe('function');
  });

  it('should format URLs correctly', () => {
    const { result } = renderHook(() => useTextFormatting());

    const formattedURL = result.current.formatURL('https://www.example.com/path');
    expect(formattedURL).toBe('www.example.com');
  });

  it('should handle invalid URLs', () => {
    const { result } = renderHook(() => useTextFormatting());

    const formattedURL = result.current.formatURL('not-a-url');
    expect(formattedURL).toBe('not-a-url');
  });

  it('should handle empty URLs', () => {
    const { result } = renderHook(() => useTextFormatting());

    const formattedURL = result.current.formatURL('');
    expect(formattedURL).toBe('');
  });

  it('should truncate text correctly', () => {
    const { result } = renderHook(() => useTextFormatting());

    const longText = 'This is a very long text that should be truncated';
    const truncated = result.current.truncateText(longText, 20);
    expect(truncated).toBe('This is a very long ...');
  });

  it('should not truncate short text', () => {
    const { result } = renderHook(() => useTextFormatting());

    const shortText = 'Short text';
    const truncated = result.current.truncateText(shortText, 20);
    expect(truncated).toBe('Short text');
  });

  it('should handle empty text', () => {
    const { result } = renderHook(() => useTextFormatting());

    const truncated = result.current.truncateText('', 10);
    expect(truncated).toBe('');
  });

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useTextFormatting());

    const firstRender = result.current;
    rerender();

    expect(result.current.formatURL).toBe(firstRender.formatURL);
    expect(result.current.truncateText).toBe(firstRender.truncateText);
  });

  it('should handle edge cases for truncation', () => {
    const { result } = renderHook(() => useTextFormatting());

    // Text exactly at max length
    const exactText = 'Exactly twenty chars';
    const truncated = result.current.truncateText(exactText, 20);
    expect(truncated).toBe('Exactly twenty chars');

    // Text one character longer
    const longerText = 'Exactly twenty one chars';
    const truncatedLonger = result.current.truncateText(longerText, 20);
    expect(truncatedLonger).toBe('Exactly twenty one c...');
  });

  it('should handle special characters in URLs', () => {
    const { result } = renderHook(() => useTextFormatting());

    const specialURL = 'https://example.com/path?param=value&other=123';
    const formatted = result.current.formatURL(specialURL);
    expect(formatted).toBe('example.com');
  });

  it('should handle unicode characters in text', () => {
    const { result } = renderHook(() => useTextFormatting());

    const unicodeText = 'Hello 世界 🌍';
    const truncated = result.current.truncateText(unicodeText, 10);
    expect(truncated).toContain('Hello 世界');
    expect(truncated).toContain('...');
  });
});
