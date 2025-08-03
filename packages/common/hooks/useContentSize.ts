// useContentSize.ts
// This hook manages UI state for dynamic input height based on content size.
// Responsibilities:
// - Input height state management
// - Content size change handling
// - Dynamic height calculation

import { useState, useCallback } from 'react';

export const useContentSize = (isNote: boolean = false, minHeight: number = 48, maxHeight: number = 200) => {
  const [inputHeight, setInputHeight] = useState(isNote ? 72 : minHeight);

  /**
   * Handles content size change for dynamic height adjustment
   */
  const handleContentSizeChange = useCallback((event: any) => {
    if (isNote) {
      const { height } = event.nativeEvent.contentSize;
      const newHeight = Math.max(minHeight, Math.min(height, maxHeight));
      setInputHeight(newHeight);
    }
  }, [isNote, minHeight, maxHeight]);

  /**
   * Resets input height to default
   */
  const resetHeight = useCallback(() => {
    setInputHeight(isNote ? 72 : minHeight);
  }, [isNote, minHeight]);

  /**
   * Sets input height to a specific value
   */
  const setHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(minHeight, Math.min(height, maxHeight));
    setInputHeight(clampedHeight);
  }, [minHeight, maxHeight]);

  /**
   * Gets the current height as a style object
   */
  const getHeightStyle = useCallback(() => {
    return { height: inputHeight };
  }, [inputHeight]);

  return {
    inputHeight,
    handleContentSizeChange,
    resetHeight,
    setHeight,
    getHeightStyle
  };
}; 